import { createHash } from "node:crypto";
import { databaseUrl, isDatabaseConfigured, query } from "./db/client.ts";
import type { RateLimitBucket } from "./rate-limit-db.ts";

/**
 * The limits on the site's public, unauthenticated actions, all kept in
 * Postgres through src/lib/rate-limit-db.ts.
 *
 * They live here rather than beside PRICE_BUCKET and CHECKOUT_BUCKET so that
 * the limiter stays a mechanism and this file stays the policy. Each bucket
 * says what one hit costs, because that cost is what the numbers are sized
 * against: a Neon compute cap, a Resend daily quota, a table filling with junk.
 *
 * Every per-caller key is src/lib/rate-limit-db.ts `callerKey`, a keyed hash
 * of the address. No bucket here stores an address or an email.
 */

/** Effectively unlimited: a bucket that only means one of its two limits. */
const NO_LIMIT = Number.MAX_SAFE_INTEGER;

/**
 * Every call to price a cart, counted before the first query.
 *
 * Only a NEW intent used to be counted (PRICE_BUCKET), so re-pricing with a
 * made-up `previousIntentId` ran the variant query, the shipping read and the
 * reuse lookup without limit. A person editing a cart re-prices on every
 * change; 120 in ten minutes is one every five seconds for the whole window.
 *
 * No all-callers limit worth the name: refusing everyone the ability to see
 * their total is a worse outage than the one it would prevent, and the
 * per-caller limit plus PRICE_BUCKET on new intents already bound the writes.
 */
export const PRICE_CALL_BUCKET: RateLimitBucket = {
  name: "cart-price-call",
  windowSeconds: 600,
  perCaller: 120,
  allCallers: NO_LIMIT,
};

/**
 * Starting a checkout, per caller. Strict: each call can create a Stripe
 * Checkout Session, and no buyer needs ten in ten minutes.
 */
export const CHECKOUT_CALLER_BUCKET: RateLimitBucket = {
  name: "checkout-caller",
  windowSeconds: 600,
  perCaller: 10,
  allCallers: NO_LIMIT,
};

/**
 * Starting a checkout, across every caller: a circuit breaker, not a gate.
 *
 * It used to refuse. About thirty addresses making ten calls each filled it,
 * and after that every real buyer was told "busy" until the window turned — a
 * shop that takes no orders, with nothing to say so except a warning in logs
 * that Vercel keeps for a day. Now crossing it is recorded for the owner
 * (recordCheckoutSurge) and the buyer is let through; the per-caller limit is
 * what stays strict.
 */
export const CHECKOUT_SURGE_BUCKET: RateLimitBucket = {
  name: "checkout-surge",
  windowSeconds: 600,
  perCaller: NO_LIMIT,
  allCallers: 300,
};

/**
 * The surge bucket's only key. Counting it under each caller's key would keep a
 * useless row per caller; the all-callers row is the one that means anything.
 */
export const SURGE_KEY = "surge";

/** The contact form. Each accepted message is a row the owner reads. */
export const CONTACT_BUCKET: RateLimitBucket = {
  name: "contact",
  windowSeconds: 600,
  perCaller: 3,
  allCallers: 100,
};

/** The waitlist form. Each accepted signup can send a confirmation email. */
export const WAITLIST_BUCKET: RateLimitBucket = {
  name: "waitlist",
  windowSeconds: 600,
  perCaller: 5,
  allCallers: 200,
};

/**
 * Confirmation emails, per ADDRESS rather than per caller, over a day.
 *
 * The caller limit stops one client signing up a thousand addresses; this one
 * stops a thousand clients mailing one address. Across every address it is
 * sized under a small mail plan's daily quota, so a flood cannot spend the
 * quota the order confirmations need.
 */
export const CONFIRMATION_MAIL_BUCKET: RateLimitBucket = {
  name: "waitlist-confirm-mail",
  windowSeconds: 86_400,
  perCaller: 3,
  allCallers: 80,
};

/** Pressing "Confirm" on the confirmation page. One indexed read and one update. */
export const CONFIRM_BUCKET: RateLimitBucket = {
  name: "waitlist-confirm",
  windowSeconds: 600,
  perCaller: 20,
  allCallers: 1_000,
};

/**
 * The per-address key for CONFIRMATION_MAIL_BUCKET: a keyed hash of the
 * lower-cased address, in the same shape as callerKey, so the rate_limit table
 * holds no email either.
 */
export function addressMailKey(email: string): string {
  return createHash("sha256")
    .update(`waitlist-mail|${databaseUrl() ?? ""}|${email.trim().toLowerCase()}`)
    .digest("hex");
}

/** The `setting` row the owner alert reads. */
export const CHECKOUT_SURGE_SETTING = "checkout_surge";

/** A surge more than this long after the last one is a new episode. */
export const SURGE_EPISODE_MINUTES = 60;

export type CheckoutSurge = {
  /** When this episode started: the first call past the cap. */
  since: string;
  /** The most recent call past the cap. */
  last: string;
  /** How many calls past the cap in this episode. Each was let through. */
  calls: number;
};

/**
 * Writes down that the all-callers checkout cap was crossed, for the owner.
 *
 * One `setting` row, `checkout_surge`, holding `{ since, last, calls }` as
 * JSON. A call more than SURGE_EPISODE_MINUTES after the previous one starts a
 * new episode. The owner alert (src/lib/ops/alert.ts, on its own branch) reads
 * it: a `last` newer than its previous digest is news. Nothing here clears it;
 * an old episode is simply old.
 *
 * Never throws. A failure to record is logged, and the buyer is not the one
 * who pays for it.
 */
export async function recordCheckoutSurge(): Promise<void> {
  console.error(
    "[guard-theory] checkout: the all-callers limit was crossed. Letting buyers through " +
      "and recording it for the owner; per-caller limits still apply.",
  );

  if (!isDatabaseConfigured()) {
    return;
  }

  try {
    await query(
      `insert into setting (key, value, updated_at)
       values ($1, jsonb_build_object('since', now(), 'last', now(), 'calls', 1)::text, now())
       on conflict (key) do update set
         value = case
           when (setting.value::jsonb ->> 'last')::timestamptz > now() - make_interval(mins => $2)
             then jsonb_build_object(
                    'since', setting.value::jsonb -> 'since',
                    'last', now(),
                    'calls', coalesce((setting.value::jsonb ->> 'calls')::int, 0) + 1
                  )::text
           else jsonb_build_object('since', now(), 'last', now(), 'calls', 1)::text
         end,
         updated_at = now()`,
      [CHECKOUT_SURGE_SETTING, SURGE_EPISODE_MINUTES],
    );
  } catch (error) {
    console.error(
      "[guard-theory] could not record the checkout surge:",
      error instanceof Error ? error.message : error,
    );
  }
}

/** The recorded surge, or null. For the owner's screens and for tests. */
export async function readCheckoutSurge(): Promise<CheckoutSurge | null> {
  const rows = await query<{ value: string }>("select value from setting where key = $1", [
    CHECKOUT_SURGE_SETTING,
  ]);
  const value = rows[0]?.value;
  if (!value) return null;
  try {
    return JSON.parse(value) as CheckoutSurge;
  } catch {
    return null;
  }
}
