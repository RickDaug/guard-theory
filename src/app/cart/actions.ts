"use server";

import { headers } from "next/headers";
import { getProduct } from "@/content/products";
import { priceCart } from "@/lib/cart/price";
import { callerKey, takeRateLimit } from "@/lib/rate-limit-db";
import {
  CHECKOUT_CALLER_BUCKET,
  CHECKOUT_SURGE_BUCKET,
  SURGE_KEY,
  recordCheckoutSurge,
} from "@/lib/public-limits";
import { startCheckout } from "@/lib/stripe/start";
import type { CartLine, CheckoutStart, PricedCart } from "@/lib/cart/types";

/**
 * Prices the cart the browser is holding.
 *
 * Every export from a "use server" file must be an async function — a constant
 * exported here is stripped and arrives undefined on the client with no error
 * until something reads a property off it. So the types live in
 * @/lib/cart/types and only async functions are exported.
 *
 * The client sends variant ids and quantities. It gets back figures. At no
 * point does an amount travel in the other direction.
 *
 * `previousIntentId` is the intent the browser was last given. Re-pricing an
 * unchanged cart hands it back rather than writing another row. Every call is
 * counted against the caller before the first query (PRICE_CALL_BUCKET), and a
 * new intent is counted again against PRICE_BUCKET.
 */
/** Variant ids are ours and short; a longer one is not a variant. */
const MAX_VARIANT_ID = 64;

export async function priceCartAction(
  lines: CartLine[],
  previousIntentId?: string | null,
): Promise<PricedCart> {
  const safe = Array.isArray(lines)
    ? lines.filter(
        (line): line is CartLine =>
          typeof line?.variantId === "string" &&
          line.variantId.length <= MAX_VARIANT_ID &&
          Number.isFinite(line?.quantity),
      )
    : [];

  return priceCart(
    safe,
    (slug) => {
      const product = getProduct(slug);
      return product ? { name: product.name, kind: product.kind } : undefined;
    },
    {
      previousIntentId: typeof previousIntentId === "string" ? previousIntentId : null,
      callerKey: await currentCallerKey(),
    },
  );
}

/** A keyed hash of the caller's address. The address itself goes no further. */
async function currentCallerKey(): Promise<string> {
  const list = await headers();
  return callerKey(list.get("x-forwarded-for")?.split(",")[0]?.trim());
}

/**
 * Starts a Stripe Checkout Session for an intent the cart already recorded,
 * and returns its URL for the browser to navigate to.
 *
 * Returns rather than redirects, and the client calls `window.location.assign`
 * with the result: that is the whole of the CSP decision, and it is explained
 * in src/lib/stripe/start.ts. `form-action` stays `'self'`.
 */
export async function startCheckoutAction(intentId: string): Promise<CheckoutStart> {
  // Each call can create a Stripe Checkout Session, so each call is counted —
  // strictly, per caller.
  const key = await currentCallerKey();
  const gate = await takeRateLimit(CHECKOUT_CALLER_BUCKET, key);

  if (!gate.allowed) {
    return { ok: false, problem: "busy" };
  }

  // Across every caller the limit is a circuit breaker, not a gate. Refusing
  // everyone once a botnet has filled it stops every sale; instead the crossing
  // is recorded for the owner and this buyer goes on to Stripe.
  const surge = await takeRateLimit(CHECKOUT_SURGE_BUCKET, SURGE_KEY);

  if (!surge.allowed) {
    await recordCheckoutSurge();
  }

  return startCheckout(intentId);
}
