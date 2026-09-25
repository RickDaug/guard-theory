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
 *     connection half-open. That used to wedge the server for the NEXT run; the
 *     reaper below now clears it. Close the pool anyway — real Postgres would
 *     hold that connection open until it timed out.
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
 * as well as --workers=1. It never cured the wedge — that was seen once at 8
 * too, because a leaked slot is leaked at any limit. The reaper below does.
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

/**
 * THE WEDGE, AND WHY THIS REACHES INTO THE LIBRARY
 *
 * pglite-socket 0.2.11 leaks a connection slot whenever a client dies without
 * saying goodbye. Its handler's error path calls `detach()`, which strips the
 * socket's 'close' listener before 'close' can fire; the server only frees a
 * slot on the handler's 'close' event, so that slot is never freed. With the
 * default of one slot, every later client is told "Too many connections" and
 * hung up on — which `pg` reports as "Connection terminated unexpectedly" once
 * and "read ECONNRESET" for ever after. Nothing recovers until a restart.
 *
 * It is reproducible on demand: open a connection, `taskkill /F` the process,
 * run `db:status`. And it is what Playwright does to `next start` at the end
 * of every run on Windows. If the pool's one connection was still inside its
 * 10s idle window, the NEXT command gets a dead database — a full e2e run that
 * falls back to content-only, or a unit run with a handful of ECONNRESET
 * failures in whichever database tests happen to go first.
 *
 * So before the library decides whether there is room, drop the handlers whose
 * socket is already gone. The library defers its own admission check with
 * `setImmediate`; this listener is synchronous, so it always runs first.
 * `handlers` and `server` are private in the package's types and plain
 * properties at runtime. If an upgrade renames them, say so loudly rather than
 * quietly going back to wedging.
 */
const netServer = server.server;
const handlers = server.handlers;

if (netServer && typeof netServer.prependListener === "function" && handlers instanceof Set) {
  netServer.prependListener("connection", () => {
    for (const handler of handlers) {
      if (!handler.isAttached) handlers.delete(handler);
    }
  });
} else {
  console.warn(
    "  WARNING: pglite-socket's internals have moved, so dead connections cannot be reaped.\n" +
      "  A client killed mid-connection will wedge this server until it is restarted.\n" +
      "  See the comment above this warning in scripts/db/local-postgres.mjs.\n",
  );
}

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
