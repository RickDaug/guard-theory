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
 *   node scripts/db/migrate.mjs           apply everything outstanding
 *   node scripts/db/migrate.mjs --status  list applied and pending, change nothing
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const DIR = path.join(ROOT, "migrations");

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    "[guard-theory] no DATABASE_URL_UNPOOLED or DATABASE_URL set.\n" +
      "Both are printed by the Neon integration; see docs/commerce-plan.md §14.",
  );
  process.exit(1);
}

const statusOnly = process.argv.includes("--status");

const client = new pg.Client({
  connectionString: url,
  ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
});

function digest(sql) {
  return createHash("sha256").update(sql).digest("hex").slice(0, 16);
}

async function main() {
  await client.connect();

  await client.query(`
    create table if not exists _migration (
      name        text primary key,
      checksum    text        not null,
      applied_at  timestamptz not null default now()
    )
  `);

  const files = (await readdir(DIR)).filter((f) => f.endsWith(".sql")).sort();
  const { rows } = await client.query("select name, checksum from _migration");
  const applied = new Map(rows.map((r) => [r.name, r.checksum]));

  let ran = 0;

  for (const name of files) {
    const sql = await readFile(path.join(DIR, name), "utf8");
    const checksum = digest(sql);
    const previous = applied.get(name);

    if (previous !== undefined) {
      // An edited migration that has already run is a silent divergence between
      // this database and every other one. Say so rather than skipping quietly.
      if (previous !== checksum) {
        console.error(
          `[guard-theory] ${name} has changed since it was applied ` +
            `(${previous} -> ${checksum}). Write a new migration instead of editing this one.`,
        );
        process.exitCode = 1;
      } else if (statusOnly) {
        console.log(`  applied  ${name}`);
      }
      continue;
    }

    if (statusOnly) {
      console.log(`  PENDING  ${name}`);
      continue;
    }

    process.stdout.write(`  applying ${name} ... `);

    try {
      await client.query("BEGIN");
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
