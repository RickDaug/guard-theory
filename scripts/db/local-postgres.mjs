#!/usr/bin/env node
/**
 * A real Postgres on this machine, with nothing to install.
 *
 * WHY THIS EXISTS
 *
 * The checkout suite needs a priced, in-stock product, which means it needs a
 * database. CI has one — a Postgres service container — but "it passes in CI"
 * is not the same as having watched it pass, and AGENTS.md is explicit that a
 * guard which has only ever been green has not been tested. Without this, the
 * two tests that actually exercise buying would be shipped unverified.
 *
 * PGlite is Postgres itself compiled to WebAssembly, not a mock and not a
 * different engine, so the SQL under test is the SQL that runs in production.
 * `pglite-socket` puts it behind a TCP socket, so `pg` connects to it exactly
 * as it connects to Neon — same driver, same code path, no test-only branch in
 * the application.
 *
 * WHAT IT IS GOOD FOR, AND WHAT IT IS NOT
 *
 * Good for: migrations, seeds, the NDJSON import, and running a focused test
 * file. All of those were verified against it rather than against CI's word.
 *
 * Not good for: a long-running `next start` under a full test suite. The socket
 * server serves one connection at a time and resets under the churn, which
 * shows up as ECONNRESET in the logs and as the storefront falling back to
 * content-only. That fallback is the application behaving correctly, but it
 * makes the full suite unreliable here. Run the whole suite against the
 * Postgres service container in CI, or against a Neon branch.
 *
 * Both packages are devDependencies. Nothing here ships.
 *
 *   node scripts/db/local-postgres.mjs            in-memory, dies with the process
 *   node scripts/db/local-postgres.mjs --dir .pgdata   persists between runs
 *
 * Then, in another terminal:
 *   DATABASE_URL="postgresql://postgres@127.0.0.1:5433/postgres?sslmode=disable" npm run db:migrate
 */

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const args = process.argv.slice(2);
const dirArg = args.indexOf("--dir");
const dataDir = dirArg !== -1 && args[dirArg + 1] ? args[dirArg + 1] : undefined;
const portArg = args.indexOf("--port");
const port = Number(portArg !== -1 && args[portArg + 1] ? args[portArg + 1] : 5433);

const db = await PGlite.create(dataDir ? { dataDir } : {});

const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1" });

await server.start();

const url = `postgresql://postgres@127.0.0.1:${port}/postgres?sslmode=disable`;

console.log(`  Postgres listening on 127.0.0.1:${port}`);
console.log(`  ${dataDir ? `persisting to ${dataDir}` : "in memory — this dies with the process"}`);
console.log("");
console.log(`  DATABASE_URL="${url}"`);
console.log("");
console.log("  Ctrl-C to stop.");

async function stop() {
  await server.stop();
  await db.close();
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
