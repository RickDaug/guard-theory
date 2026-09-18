import { createHash } from "node:crypto";
import { query } from "../db/client.ts";

/**
 * Sign-in attempt limiting, kept in Postgres.
 *
 * It used to be a Map in the function's memory. On Vercel every instance has
 * its own, a cold start empties it, and an attacker who spreads requests across
 * instances never meets the limit at all — while each guess still costs ~100ms
 * of CPU and 32MB for scrypt. Postgres is the one thing every instance shares,
 * and it is already a hard requirement for signing in, so this adds no vendor.
 *
 * TWO LIMITS
 *
 * Per address, to stop one client guessing. And across ALL addresses, because a
 * per-address limit alone is no limit against a botnet. The global one can be
 * used to lock the owner out for a quarter of an hour by someone willing to
 * keep failing on purpose; that is accepted, deliberately. It costs the owner a
 * wait. The alternative costs the order book.
 *
 * No address is stored. The key is a SHA-256 of the address and a server-side
 * secret, which is enough to count by and useless to read.
 */

export const LOGIN_WINDOW_MINUTES = 15;
export const LOGIN_MAX_FAILURES_PER_ADDRESS = 5;
export const LOGIN_MAX_FAILURES_GLOBAL = 60;
/** Rows older than this are deleted on the way past. */
export const LOGIN_ATTEMPT_RETENTION_HOURS = 24;

export type AttemptGate =
  | { allowed: true; attemptId: string }
  | { allowed: false; retryAfterSeconds: number };

export function addressKey(address: string | null | undefined, secret: string): string {
  return createHash("sha256")
    .update(`${secret}|${(address ?? "").trim().toLowerCase() || "unknown"}`)
    .digest("hex");
}

/**
 * Records the attempt as a failure and decides, in one statement.
 *
 * Recorded BEFORE the password is looked at: a check-then-record sequence lets
 * a burst of parallel guesses all pass the check before any of them is counted.
 * A success is marked afterwards (markAttemptSucceeded) and stops counting. A
 * refused attempt is not kept, so waiting out a lockout actually ends it.
 */
export async function beginLoginAttempt(key: string): Promise<AttemptGate> {
  const rows = await query<{
    id: string;
    by_address: number;
    overall: number;
    oldest_seconds: number | null;
  }>(
    `with recent as (
       select key_hash, attempted_at from login_attempt
        where not succeeded
          and attempted_at > now() - make_interval(mins => $2)
     ),
     added as (
       insert into login_attempt (key_hash) values ($1) returning id
     )
     select (select id::text from added) as id,
            (select count(*)::int from recent where key_hash = $1) as by_address,
            (select count(*)::int from recent) as overall,
            (select extract(epoch from now() - min(attempted_at))::int from recent) as oldest_seconds`,
    [key, LOGIN_WINDOW_MINUTES],
  );

  const row = rows[0]!;
  const blocked =
    row.by_address >= LOGIN_MAX_FAILURES_PER_ADDRESS || row.overall >= LOGIN_MAX_FAILURES_GLOBAL;

  if (!blocked) {
    return { allowed: true, attemptId: row.id };
  }

  await query("delete from login_attempt where id = $1::bigint", [row.id]);

  const windowSeconds = LOGIN_WINDOW_MINUTES * 60;
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, windowSeconds - (row.oldest_seconds ?? 0)),
  };
}

export async function markAttemptSucceeded(attemptId: string): Promise<void> {
  await query("update login_attempt set succeeded = true where id = $1::bigint", [attemptId]);
}

/** Housekeeping. Never worth failing a sign-in over. */
export async function sweepLoginAttempts(): Promise<void> {
  try {
    await query(
      "delete from login_attempt where attempted_at < now() - make_interval(hours => $1)",
      [LOGIN_ATTEMPT_RETENTION_HOURS],
    );
  } catch {
    // Deliberately quiet.
  }
}
