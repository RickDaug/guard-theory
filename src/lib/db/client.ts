import { Pool, type PoolClient, type QueryResultRow } from "pg";

/**
 * The database connection, and the only place one is made.
 *
 * WHY `pg` AND NOT A SERVERLESS-SPECIFIC DRIVER
 *
 * Neon's pooled endpoint speaks the ordinary Postgres wire protocol, so `pg`
 * talks to production, to a local Postgres, and to the service container in CI
 * through one code path. A driver that only speaks to Neon would mean the tests
 * exercise something the production code does not, which is the failure mode
 * `docs/technical-architecture.md` cares about most. One driver, one path.
 *
 * WHY THE POOL IS LAZY
 *
 * Constructing it at module scope would run during `next build`, and CI builds
 * with no database at all. A module that throws on import is a build failure
 * with a confusing message; this one simply has no pool until something asks.
 *
 * POOLED VERSUS DIRECT
 *
 * `DATABASE_URL` is the pooled connection and is what the application uses.
 * `DATABASE_URL_UNPOOLED` is the direct one, and is only for migrations and
 * `pg_dump` — PgBouncer runs in transaction mode, which breaks `SET`, session
 * state, and temporary tables. Do not point the app at the unpooled URL to
 * "avoid the pooler"; the pooler is the thing making serverless connections
 * survivable.
 */

let pool: Pool | null = null;

export function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url ? url : undefined;
}

export function isDatabaseConfigured(): boolean {
  return databaseUrl() !== undefined;
}

function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = databaseUrl();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Nothing should reach the database without it — " +
        "check isDatabaseConfigured() before calling query().",
    );
  }

  pool = new Pool({
    connectionString,
    // One connection per serverless invocation. The pooler does the pooling;
    // holding several here would multiply connections by instance count for no
    // gain on a store this size.
    max: Number(process.env.DATABASE_POOL_MAX ?? 1),
    // Zero disables the idle timeout entirely. Only useful against a local
    // single-connection server; against Neon the default stands, because the
    // pooler is what connections are supposed to be handed back to.
    idleTimeoutMillis: Number(process.env.DATABASE_POOL_IDLE_MS ?? 10_000),
    connectionTimeoutMillis: 10_000,
    // Neon and Vercel Postgres require TLS. A local Postgres in CI does not
    // offer it, and `sslmode=disable` in the URL is how that is said.
    ssl: /sslmode=(disable|allow)/.test(connectionString)
      ? undefined
      : { rejectUnauthorized: true },
  });

  pool.on("error", (error) => {
    // An idle client erroring out is not attached to any request, so this is
    // the only place it can be heard. Never swallow it.
    console.error("[guard-theory] idle database client error:", error.message);
  });

  return pool;
}

export async function query<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params as unknown[]);
  return result.rows;
}

/** The first row, or undefined. For lookups that expect at most one. */
export async function queryOne<T extends QueryResultRow>(
  text: string,
  params: readonly unknown[] = [],
): Promise<T | undefined> {
  const rows = await query<T>(text, params);
  return rows[0];
}

/**
 * Run several statements in one transaction.
 *
 * Rolls back on any throw, and always releases the client — a leaked client on
 * a `max: 1` pool deadlocks the next request rather than erroring, which is a
 * much worse way to find out.
 */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "[guard-theory] rollback failed:",
        rollbackError instanceof Error ? rollbackError.message : rollbackError,
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Closes the pool. For scripts and tests; a request handler never needs it. */
export async function closePool(): Promise<void> {
  if (pool) {
    const closing = pool;
    pool = null;
    await closing.end();
  }
}
