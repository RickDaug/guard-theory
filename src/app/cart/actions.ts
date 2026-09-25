"use server";

import { getProduct } from "@/content/products";
import { priceCart } from "@/lib/cart/price";
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
 */
export async function priceCartAction(lines: CartLine[]): Promise<PricedCart> {
  const safe = Array.isArray(lines)
    ? lines.filter(
        (line): line is CartLine =>
          typeof line?.variantId === "string" && Number.isFinite(line?.quantity),
      )
    : [];

  return priceCart(safe, (slug) => {
    const product = getProduct(slug);
    return product ? { name: product.name, kind: product.kind } : undefined;
  });
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
  return startCheckout(intentId);
}
