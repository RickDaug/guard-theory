import { addressKey } from "./portal/attempts.ts";
import { databaseUrl, isDatabaseConfigured, query } from "./db/client.ts";

/**
 * A fixed-window rate limiter kept in Postgres, for the public cart actions.
 *
 * src/lib/rate-limit.ts is a Map in one instance's memory: on Vercel a second
 * instance or a cold start never sees it. Postgres is shared by every instance
 * and is already required by anything this guards, so it adds no vendor. The
 * shape is login_attempt's (src/lib/portal/attempts.ts): a keyed hash of the
 * address, never the address, and two limits — per caller, and across every
 * caller, because a per-address limit alone is no limit against a botnet.
 *
 * The all-callers limit can be used to make checkout wait for a few minutes by
 * someone willing to spend a botnet on it. Accepted: the alternative is the
 * database's monthly compute cap suspending the whole shop.
 *
 * One upsert per call, not one insert: a caller holds one row per window
 * however hard it pushes, so the table is sized by distinct callers, and rows
 * are swept a day after their window opened.
 *
 * It fails OPEN. If the counter cannot be written, the database is in trouble
 * and the action it guards is about to fail on its own; refusing a buyer on top
 * of that protects nothing.
 */

export type RateLimitBucket = {
  /** Stored as the row's bucket; keeps the actions' counts apart. */
  name: string;
  windowSeconds: number;
  perCaller: number;
  allCallers: number;
};

/** A new checkout_intent row. Re-pricing an unchanged cart reuses its intent and is not counted. */
export const PRICE_BUCKET: RateLimitBucket = {
  name: "cart-price",
  windowSeconds: 600,
  perCaller: 60,
  allCallers: 1_000,
};

/** A request to Stripe for a Checkout Session. */
export const CHECKOUT_BUCKET: RateLimitBucket = {
  name: "cart-checkout",
  windowSeconds: 600,
  perCaller: 10,
  allCallers: 300,
};

export const RATE_LIMIT_RETENTION_HOURS = 24;

/** The key_hash of the all-callers row. Never a SHA-256, so never a caller. */
const EVERYONE = "*";

/** One call in this many also sweeps old windows. */
const SWEEP_ONE_IN = 50;

export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * The caller's key: SHA-256 of the address and a server-side secret.
 *
 * The secret is the database URL, which carries the database password: it is
 * always set wherever this runs, never leaves the server, and is the same on
 * every instance — which a per-process random salt would not be. Hashing an
 * IPv4 address without a secret is no protection at all; there are only four
 * billion of them.
 *
 * It is the caller's NETWORK that is hashed (addressNetwork): an IPv4 address
 * as itself, an IPv6 address by its /64. A single IPv6 host is handed a whole
 * /64 and can rotate through it, so the full address would be no per-caller
 * limit at all.
 */
export function callerKey(address: string | null | undefined): string {
  return addressKey(address, `rate-limit|${databaseUrl() ?? ""}`);
}

async function hit(
  bucket: RateLimitBucket,
  keyHash: string,
): Promise<{ hits: number; retryAfterSeconds: number }> {
  const rows = await query<{ hits: number; retry_after: number }>(
    // The window is computed by the database's clock, so every instance agrees
    // on where it starts.
    `with w as (
       select to_timestamp(floor(extract(epoch from now()) / $3::int) * $3::int) as start
     )
     insert into rate_limit (bucket, key_hash, window_start, hits)
     select $1, $2, w.start, 1 from w
     on conflict (bucket, key_hash, window_start)
       do update set hits = rate_limit.hits + 1
     returning hits,
       greatest(1, ceil(extract(epoch from window_start + make_interval(secs => $3::int) - now())))::int
         as retry_after`,
    [bucket.name, keyHash, bucket.windowSeconds],
  );
  const row = rows[0]!;
  return { hits: row.hits, retryAfterSeconds: row.retry_after };
}

/**
 * Counts one call against the caller and, if the caller is within its limit,
 * against everyone. A caller already refused is not added to the all-callers
 * count, so one address hammering away cannot use up everyone else's share.
 */
export async function takeRateLimit(
  bucket: RateLimitBucket,
  key: string,
): Promise<RateLimitDecision> {
  if (!isDatabaseConfigured()) {
    return { allowed: true };
  }

  try {
    const mine = await hit(bucket, key);

    if (mine.hits > bucket.perCaller) {
      return { allowed: false, retryAfterSeconds: mine.retryAfterSeconds };
    }

    const all = await hit(bucket, EVERYONE);

    if (Math.random() * SWEEP_ONE_IN < 1) {
      await sweepRateLimits();
    }

    if (all.hits > bucket.allCallers) {
      console.warn(`[guard-theory] ${bucket.name}: the all-callers limit was reached`);
      return { allowed: false, retryAfterSeconds: all.retryAfterSeconds };
    }

    return { allowed: true };
  } catch (error) {
    console.error(
      `[guard-theory] ${bucket.name}: could not count the request, letting it through:`,
      error instanceof Error ? error.message : error,
    );
    return { allowed: true };
  }
}

/** Housekeeping. Never worth failing a request over. Returns how many went. */
export async function sweepRateLimits(): Promise<number> {
  try {
    const rows = await query<{ n: number }>(
      `with gone as (
         delete from rate_limit
          where window_start < now() - make_interval(hours => $1)
         returning 1
       )
       select count(*)::int as n from gone`,
      [RATE_LIMIT_RETENTION_HOURS],
    );
    return rows[0]?.n ?? 0;
  } catch {
    // Deliberately quiet.
    return 0;
  }
}
