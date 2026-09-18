#!/usr/bin/env node
/**
 * Applies every unapplied migration in ./migrations, in filename order.
 *
 * Runs against DATABASE_URL_UNPOOLED when it exists, because PgBouncer in
 * transaction mode cannot carry the session state DDL sometimes wants. Falling
 * back to DATABASE_URL works for a local Postgres, which has no pooler.
 *
 * Each file runs inside one transaction together with the row that records it,
 * so a migration cannot be half-applied and marked done. Postgres does
 * transactional DDL; this is the payoff.
 *
 * A database that is not on this machine is refused unless `--production` is
 * passed, and the host is printed before anything else happens. `.env.local`
 * points at Neon, so without this a bare `npm run db:migrate` meant for a local
 * database migrates production.
 *
 *   node scripts/db/migrate.mjs                         apply everything outstanding
 *   node scripts/db/migrate.mjs --status                list applied and pending, change nothing
 *   node scripts/db/migrate.mjs --production [--status] the same, against a remote host
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { checkTarget, checksumMatches, checksumOf } from "./guard.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
// Overridable so the runner's own behaviour can be tested against throwaway
// files (tests/unit/migrate-runner.test.ts) instead of the real migrations.
const DIR = process.env.GT_MIGRATIONS_DIR?.trim() || path.join(ROOT, "migrations");

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    "[guard-theory] no DATABASE_URL_UNPOOLED or DATABASE_URL set.\n" +
      "Both are printed by the Neon integration; see docs/commerce-plan.md §14.",
  );
  process.exit(1);
}

const statusOnly = process.argv.includes("--status");

// Host first, before a connection exists. Never the user or the password.
const guard = checkTarget(url, process.argv.slice(2));
console.log(`[guard-theory] database: ${guard.target.label}`);
if (!guard.ok) {
  console.error(`[guard-theory] ${guard.reason}`);
  process.exit(1);
}

// How long a migration waits for a lock before giving up. Without it an ALTER
// queues behind any long transaction and every query on that table queues
// behind the ALTER — the site stops, and the migration looks merely slow.
const LOCK_TIMEOUT = "5s";

const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
});

async function main() {
  await client.connect();

  // --status changes nothing, and that includes not creating the ledger.
  const ledger = await client.query("select to_regclass('_migration') as t");
  const hasLedger = ledger.rows[0].t !== null;

  if (!hasLedger && !statusOnly) {
    await client.query(`
      create table _migration (
        name        text primary key,
        checksum    text        not null,
        applied_at  timestamptz not null default now()
      )
    `);
  }

  const files = (await readdir(DIR)).filter((f) => f.endsWith(".sql")).sort();
  const rows = hasLedger
    ? (await client.query("select name, checksum from _migration")).rows
    : [];
  const applied = new Map(rows.map((r) => [r.name, r.checksum]));

  let ran = 0;

  for (const name of files) {
    const sql = await readFile(path.join(DIR, name), "utf8");
    const checksum = checksumOf(sql);
    const previous = applied.get(name);

    if (previous !== undefined) {
      // An edited migration that has already run is a silent divergence between
      // this database and every other one. STOP: a later migration was written
      // against the file as it now reads, not against what this database
      // actually holds, so applying it on top is how a divergence becomes
      // damage. (checksumMatches explains why two checksums are accepted.)
      if (!checksumMatches(previous, sql)) {
        console.error(
          `[guard-theory] ${name} has changed since it was applied ` +
            `(${previous} -> ${checksum}). Write a new migration instead of editing this one.` +
            (statusOnly ? "" : "\n  Stopped: nothing after it has been applied."),
        );
        process.exitCode = 1;
        // --status keeps listing, since it changes nothing either way.
        if (!statusOnly) return;
        console.log(`  CHANGED  ${name}`);
        continue;
      }
      if (statusOnly) console.log(`  applied  ${name}`);
      continue;
    }

    if (statusOnly) {
      console.log(`  PENDING  ${name}`);
      continue;
    }

    process.stdout.write(`  applying ${name} ... `);

    try {
      await client.query("BEGIN");
      // LOCAL: scoped to this transaction, so it cannot leak into a pooled
      // session. A timeout fails the migration cleanly; it is safe to re-run.
      await client.query(`set local lock_timeout = '${LOCK_TIMEOUT}'`);
      await client.query(sql);
      await client.query("insert into _migration (name, checksum) values ($1, $2)", [
        name,
        checksum,
      ]);
      await client.query("COMMIT");
      console.log("done");
      ran += 1;
    } catch (error) {
      await client.query("ROLLBACK");
      console.log("failed");
      console.error(`\n[guard-theory] ${name} failed and was rolled back:\n`, error.message);
      process.exitCode = 1;
      return;
    }
  }

  if (!statusOnly) {
    console.log(ran === 0 ? "  nothing to apply" : `  ${ran} migration(s) applied`);
  }
}

main()
  .catch((error) => {
    console.error("[guard-theory] migration run failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
