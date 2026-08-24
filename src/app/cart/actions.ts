"use server";

import { getProduct } from "@/content/products";
import { priceCart } from "@/lib/cart/price";
import type { CartLine, PricedCart } from "@/lib/cart/types";

/**
 * Prices the cart the browser is holding.
 *
 * Every export from a "use server" file must be an async function — a constant
 * exported here is stripped and arrives undefined on the client with no error
 * until something reads a property off it. So the types live in
 * @/lib/cart/types and only this function is exported.
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
