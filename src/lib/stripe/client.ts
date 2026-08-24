import Stripe from "stripe";

/**
 * The Stripe client, and the mode indicator.
 *
 * WHY IT IS LAZY
 *
 * Since v17 the SDK throws on a missing key at construction. A module-scope
 * `new Stripe(process.env.STRIPE_SECRET_KEY!)` therefore fails during
 * `next build`, and CI builds with no Stripe key at all. The error it produces
 * is about a missing key in a file nobody was looking at, which is a bad way to
 * spend an afternoon. So the client is built on first use.
 *
 * WHY THE API VERSION IS NOT SET HERE
 *
 * The SDK pins its own — 2026-07-29.dahlia in v22.5.0 — and its TypeScript
 * types describe exactly that version. Overriding `apiVersion` here would make
 * the types lie. The pinning that does matter is on the webhook endpoint in the
 * Stripe dashboard, which must be set to the same version: on older versions
 * the shipping address is not at `collected_information.shipping_details`, and
 * reading `undefined` for the address does not fail at checkout — it fails days
 * later when a label cannot be bought.
 */

/** The version the installed SDK is built against. Pin the webhook to this. */
export const STRIPE_API_VERSION = "2026-07-29.dahlia";

let client: Stripe | null = null;

export function stripeSecretKey(): string | undefined {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  return key ? key : undefined;
}

export function isStripeConfigured(): boolean {
  return stripeSecretKey() !== undefined;
}

export function stripe(): Stripe {
  if (client) {
    return client;
  }

  const key = stripeSecretKey();

  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Check isStripeConfigured() before reaching for the client.",
    );
  }

  client = new Stripe(key, {
    // The SDK default is 80 seconds, which outlives every serverless function
    // that could be waiting on it. Checkout also waits up to 10 seconds for the
    // webhook before redirecting the buyer, so nothing here may be slow.
    timeout: 8_000,
    maxNetworkRetries: 2,
  });

  return client;
}

export type StripeMode = "test" | "live" | "unknown";

/**
 * Which mode we are in, read from the key rather than from a flag.
 *
 * An env flag can be set wrongly and then believed. The key prefix cannot
 * disagree with the key. `rk_` is a restricted key, which is the recommended
 * kind and carries the same prefix convention.
 *
 * `unknown` is deliberately not treated as "probably fine": the portal renders
 * a loud banner for it, because a mode we cannot determine is a mode we cannot
 * safely take money in.
 */
export function stripeMode(env: NodeJS.ProcessEnv = process.env): StripeMode {
  const key = env.STRIPE_SECRET_KEY?.trim() ?? "";

  if (/^(sk|rk)_live_/.test(key)) {
    return "live";
  }

  if (/^(sk|rk)_test_/.test(key)) {
    return "test";
  }

  return "unknown";
}

/**
 * The mode to record on an order.
 *
 * Orders carry the mode they were taken in so a test order can never be counted
 * as revenue. An unknown key cannot produce an order at all — the column is
 * constrained to test or live, and guessing which one would defeat the point.
 */
export function orderStripeMode(): "test" | "live" {
  const mode = stripeMode();

  if (mode === "unknown") {
    throw new Error(
      "STRIPE_SECRET_KEY is neither a test nor a live key. Refusing to record an order " +
        "against a mode that cannot be determined.",
    );
  }

  return mode;
}
