#!/usr/bin/env node
/**
 * Takes an off-platform backup.
 *
 * WHY THIS EXISTS AT ALL
 *
 * Neon's Instant Restore covers a rolling window — six hours on the Free plan,
 * seven days on Launch. That is a good answer to "I ran the wrong UPDATE ten
 * minutes ago" and no answer at all to "we noticed on Monday that Friday's
 * migration corrupted something", or to losing access to the account. So there
 * has to be a copy that Neon does not hold.
 *
 * WHAT A RESTORE NEEDS
 *
 *   1. `migrations/` — in git, so the schema is reproducible from source.
 *   2. The file this script writes — the data.
 *
 * Those two together are a whole database. That is why a JSON export is
 * sufficient here rather than a lesser option: the schema is already versioned,
 * so the backup only has to carry rows.
 *
 * `pg_dump` is used when it is on PATH, because it is the higher-fidelity tool.
 * When it is not, the JSON export runs instead rather than the backup silently
 * not happening — which is the failure this whole file is about.
 *
 *   node scripts/db/backup.mjs [--out backups] [--json]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const args = process.argv.slice(2);
const forceJson = args.includes("--json");
const outArg = args.indexOf("--out");
const outDir = path.resolve(ROOT, outArg !== -1 && args[outArg + 1] ? args[outArg + 1] : "backups");

// pg_dump cannot run through PgBouncer in transaction mode, so the direct URL
// is not a preference here — it is the only one that works.
const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("[guard-theory] no DATABASE_URL_UNPOOLED or DATABASE_URL set.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

function hasPgDump() {
  return new Promise((resolve) => {
    const probe = spawn("pg_dump", ["--version"], { stdio: "ignore", shell: false });
    probe.on("error", () => resolve(false));
    probe.on("close", (code) => resolve(code === 0));
  });
}

async function dumpWithPgDump() {
  const target = path.join(outDir, `guard-theory-${stamp}.dump`);

  await new Promise((resolve, reject) => {
    const child = spawn("pg_dump", ["--format=custom", "--no-owner", "--file", target, url], {
      stdio: ["ignore", "inherit", "inherit"],
      shell: false,
    });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve() : reject(new Error(`pg_dump exited ${code}`)),
    );
  });

  console.log(`  wrote ${path.relative(ROOT, target)}`);
  console.log("  restore with: pg_restore --no-owner --dbname \"$DATABASE_URL_UNPOOLED\" <file>");
}

async function dumpAsJson() {
  const client = new pg.Client({
    connectionString: url,
    ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
  });

  await client.connect();

  try {
    const { rows: tables } = await client.query(`
      select tablename
        from pg_tables
       where schemaname = 'public'
       order by tablename
    `);

    const data = {};

    for (const { tablename } of tables) {
      // Identifier, not a value — parameters cannot be used for a table name.
      // The list came from pg_tables, so it is not attacker-controlled, and it
      // is quoted rather than interpolated bare.
      const { rows } = await client.query(`select * from "${tablename.replace(/"/g, '""')}"`);
      data[tablename] = rows;
    }

    const target = path.join(outDir, `guard-theory-${stamp}.json`);
    await writeFile(
      target,
      JSON.stringify({ takenAt: new Date().toISOString(), tables: data }, null, 2),
      "utf8",
    );

    const total = Object.values(data).reduce((n, rows) => n + rows.length, 0);
    console.log(`  wrote ${path.relative(ROOT, target)} — ${tables.length} table(s), ${total} row(s)`);
    console.log("  restore with: npm run db:migrate, then replay the rows from this file");
  } finally {
    await client.end();
  }
}

async function main() {
  await mkdir(outDir, { recursive: true });

  if (!forceJson && (await hasPgDump())) {
    await dumpWithPgDump();
    return;
  }

  if (!forceJson) {
    console.log("  pg_dump is not on PATH — writing a JSON export instead.");
    console.log("  The schema lives in migrations/, so this is a complete backup.");
  }

  await dumpAsJson();
}

main().catch((error) => {
  console.error("[guard-theory] backup failed:", error.message);
  process.exitCode = 1;
});
