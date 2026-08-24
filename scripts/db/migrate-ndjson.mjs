#!/usr/bin/env node
/**
 * Imports the pre-database waitlist into Postgres.
 *
 * WHAT IS RECOVERABLE, AND WHAT IS NOT
 *
 * `.data/waitlist.ndjson` is gitignored and exists only on the machine that ran
 * the site in development. The production copy lived under the serverless temp
 * directory and is already gone — a cold start took it, exactly as the old
 * store's own comments warned. So this file is the entire recoverable set, and
 * it is recoverable only from the machine holding it.
 *
 * Run it once, from that machine, after `scripts/db/migrate.mjs`.
 *
 *   node scripts/db/migrate-ndjson.mjs [--file .data/waitlist.ndjson] [--dry-run]
 *
 * Safe to run twice: existing addresses are left exactly as they are. A signup
 * that arrived through the live form after the cutover outranks a stale copy of
 * the same address from the file.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, randomUUID } from "node:crypto";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileArg = args.indexOf("--file");
const file = path.resolve(
  ROOT,
  fileArg !== -1 && args[fileArg + 1] ? args[fileArg + 1] : ".data/waitlist.ndjson",
);

const url = process.env.DATABASE_URL_UNPOOLED?.trim() || process.env.DATABASE_URL?.trim();

if (!url && !dryRun) {
  console.error("[guard-theory] no DATABASE_URL_UNPOOLED or DATABASE_URL set.");
  process.exit(1);
}

const SLEEVE = new Set(["no-preference", "short", "long"]);
const EXPERIENCE = new Set([
  "not-training-yet",
  "under-a-year",
  "one-to-three-years",
  "three-plus-years",
]);
const INTEREST = new Set(["rash-guards", "spats", "shorts", "accessories"]);

/** Keeps only values the current domain recognises. A stale enum becomes null. */
function member(set, value) {
  return typeof value === "string" && set.has(value) ? value : null;
}

function parse(line, lineNumber) {
  let record;

  try {
    record = JSON.parse(line);
  } catch {
    return { error: `line ${lineNumber}: not valid JSON` };
  }

  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const firstName = typeof record.firstName === "string" ? record.firstName.trim() : "";

  if (!email || !email.includes("@")) {
    return { error: `line ${lineNumber}: no usable email` };
  }

  if (record.consent !== true) {
    // Consent is the whole basis for holding the address. A record without it
    // is not imported, and the count is reported rather than hidden.
    return { error: `line ${lineNumber}: no recorded consent (${email})` };
  }

  const submittedAt =
    typeof record.submittedAt === "string" && !Number.isNaN(Date.parse(record.submittedAt))
      ? record.submittedAt
      : null;

  if (!submittedAt) {
    return { error: `line ${lineNumber}: no usable submittedAt (${email})` };
  }

  const interests = Array.isArray(record.productInterest)
    ? record.productInterest.filter((i) => INTEREST.has(i))
    : [];

  return {
    row: [
      randomUUID(),
      email,
      firstName || "there",
      member(EXPERIENCE, record.trainingExperience),
      member(SLEEVE, record.sleevePreference),
      interests,
      true,
      submittedAt,
      randomBytes(32).toString("base64url"),
      "ndjson-migration",
    ],
  };
}

async function main() {
  let contents;

  try {
    contents = await readFile(file, "utf8");
  } catch {
    console.error(`[guard-theory] cannot read ${file}`);
    console.error("  Nothing to import. If the file is elsewhere, pass --file.");
    process.exit(1);
  }

  const lines = contents.split("\n").filter((l) => l.trim() !== "");
  const rows = [];
  const problems = [];

  lines.forEach((line, index) => {
    const result = parse(line, index + 1);
    if (result.error) {
      problems.push(result.error);
    } else {
      rows.push(result.row);
    }
  });

  const unique = new Map();
  for (const row of rows) {
    // Last write wins within the file itself, matching how the append-only log
    // was read: a later line for the same address is the newer answer.
    unique.set(row[1], row);
  }

  console.log(`  ${lines.length} line(s) read from ${path.relative(ROOT, file)}`);
  console.log(`  ${unique.size} importable, ${problems.length} skipped`);
  for (const problem of problems) {
    console.log(`    skipped: ${problem}`);
  }

  if (dryRun) {
    console.log("  --dry-run: nothing written");
    return;
  }

  const client = new pg.Client({
    connectionString: url,
    ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
  });

  await client.connect();

  let inserted = 0;

  try {
    await client.query("BEGIN");

    for (const row of unique.values()) {
      const result = await client.query(
        `
        insert into waitlist_signup (
          id, email, first_name, training_experience, sleeve_preference,
          product_interest, consent, submitted_at, unsubscribe_token, source
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        on conflict (email) do nothing
        returning id
        `,
        row,
      );
      inserted += result.rowCount ?? 0;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[guard-theory] import failed and was rolled back:", error.message);
    process.exitCode = 1;
    return;
  } finally {
    await client.end();
  }

  console.log(`  ${inserted} inserted, ${unique.size - inserted} already present`);
}

main().catch((error) => {
  console.error("[guard-theory] import failed:", error.message);
  process.exitCode = 1;
});
