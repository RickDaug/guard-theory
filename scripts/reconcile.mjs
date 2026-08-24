#!/usr/bin/env node
/**
 * Recovers paid orders the webhook never delivered.
 *
 * The same thing the button in the portal does, as a command — because the
 * moment you most need it is the moment the portal is the thing that is broken.
 * Run it from a laptop with the production DATABASE_URL and STRIPE_SECRET_KEY
 * in the environment and it will find anything missing.
 *
 *   node scripts/reconcile.mjs [--hours 72]
 *
 * Safe to run repeatedly. Orders are keyed on the Stripe session id, which is
 * unique, so a second run creates nothing and says so.
 */

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!process.env.DATABASE_URL?.trim()) {
  console.error("[guard-theory] DATABASE_URL is not set. Nothing to reconcile against.");
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY?.trim()) {
  console.error("[guard-theory] STRIPE_SECRET_KEY is not set. Stripe cannot be asked.");
  process.exit(1);
}

const args = process.argv.slice(2);
const hoursArg = args.indexOf("--hours");
const hours = Number(hoursArg !== -1 && args[hoursArg + 1] ? args[hoursArg + 1] : 72);

if (!Number.isFinite(hours) || hours <= 0) {
  console.error("[guard-theory] --hours must be a positive number.");
  process.exit(1);
}

const { reconcileStripeSessions, recordReconcileRun } = await import(
  pathToFileURL(path.join(ROOT, "src/lib/orders/reconcile.ts")).href
);

console.log(`  Checking Stripe for paid orders in the last ${hours} hours…`);

const report = await reconcileStripeSessions(hours);

await recordReconcileRun(report).catch(() => {});

console.log(`  scanned:         ${report.scanned}`);
console.log(`  already present: ${report.alreadyRecorded}`);
console.log(`  recovered:       ${report.created}`);

for (const skipped of report.skipped) {
  console.log(`  skipped ${skipped.sessionId}: ${skipped.reason}`);
}

if (report.created > 0) {
  console.log("");
  console.log("  Recovered orders are flagged in the portal. Check the items and the");
  console.log("  address on each before shipping — they never went through the webhook.");
}

// The pool holds the process open otherwise.
const { closePool } = await import(
  pathToFileURL(path.join(ROOT, "src/lib/db/client.ts")).href
);
await closePool();
