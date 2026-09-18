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
 * Good for: migrations, seeds, and running a focused test file. Also — found
 * 2026-09, correcting what this comment used to say — the WHOLE Playwright
 * suite, provided it runs `--workers=1`:
 *
 *   npx playwright test tests/e2e --workers=1      # 92/92 against PGlite
 *
 * The socket server serves ONE connection at a time. Parallel workers are what
 * reset it, which showed up as ECONNRESET and as the storefront falling back to
 * content-only, and that got written down here as "not good for a full suite".
 * The limit is concurrency, not duration: one worker matches the server's model
 * exactly. CI still uses a real Postgres service container, because that is the
 * thing production resembles.
 *
 * Two failure modes that are NOT this, and should not be misread as it:
 *   - ERR_INSUFFICIENT_RESOURCES on `/_next/static/*` is the host machine out
 *     of headroom under parallel Chromium workers. Nothing to do with Postgres.
 *   - A script that calls `process.exit()` without `closePool()` leaves the one
 *     connection half-open and wedges the server for the NEXT run. Close it.
 *
 * Both packages are devDependencies. Nothing here ships.
 *
 *   node scripts/db/local-postgres.mjs            in-memory, dies with the process
 *   node scripts/db/local-postgres.mjs --dir .pgdata   persists between runs
 *   node scripts/db/local-postgres.mjs --max-connections 8
 *
 * The last one raises pglite-socket's limit of one connection, which is that
 * package's default rather than a property of PGlite. With 8,
 * tests/e2e/checkout.spec.ts passed under Playwright's default parallel workers
 * as well as --workers=1. It does not cure the wedge described above — that was
 * seen once at 8 too — and restarting this script is still the fix.
 *
 * Then, in another terminal:
 *   export DATABASE_URL="postgresql://postgres@127.0.0.1:5433/postgres?sslmode=disable"
 *   export DATABASE_URL_UNPOOLED="$DATABASE_URL"
 *   npm run db:migrate
 *
 * BOTH, always. The db scripts prefer DATABASE_URL_UNPOOLED, and .env.local
 * supplies Neon's for any variable the shell has not set — so overriding only
 * DATABASE_URL runs the migration against Neon.
 */

import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

const args = process.argv.slice(2);
const dirArg = args.indexOf("--dir");
const dataDir = dirArg !== -1 && args[dirArg + 1] ? args[dirArg + 1] : undefined;
const portArg = args.indexOf("--port");
const port = Number(portArg !== -1 && args[portArg + 1] ? args[portArg + 1] : 5433);

const db = await PGlite.create(dataDir ? { dataDir } : {});

const connectionsArg = args.indexOf("--max-connections");
const maxConnections = Number(
  connectionsArg !== -1 && args[connectionsArg + 1] ? args[connectionsArg + 1] : 1,
);

const server = new PGLiteSocketServer({ db, port, host: "127.0.0.1", maxConnections });

await server.start();

const url = `postgresql://postgres@127.0.0.1:${port}/postgres?sslmode=disable`;

console.log(`  Postgres listening on 127.0.0.1:${port}`);
console.log(`  ${dataDir ? `persisting to ${dataDir}` : "in memory — this dies with the process"}`);
console.log("");
console.log(`  DATABASE_URL="${url}"`);
console.log(`  DATABASE_URL_UNPOOLED="${url}"`);
console.log("  Set both: the db scripts prefer the second, and .env.local fills in whichever is missing.");
console.log("");
console.log("  Ctrl-C to stop.");

async function stop() {
  await server.stop();
  await db.close();
  process.exit(0);
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);
