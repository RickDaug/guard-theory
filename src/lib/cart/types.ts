/**
 * The cart.
 *
 * WHAT IT HOLDS: variant ids and quantities. Nothing else.
 *
 * Not a name, not a size label, and above all not a price. Everything a buyer
 * is shown and everything Stripe is told is read from Postgres on the server,
 * at the moment it is needed. That is what makes "nothing the client sends
 * about price is ever trusted" true by construction rather than by vigilance —
 * there is no price in the cart to tamper with.
 *
 * WHERE IT LIVES: localStorage, not a cookie.
 *
 * Deliberate, and it is a policy decision as much as a technical one. The
 * cookies policy opens "This site sets no cookies of its own", and a
 * cookie-backed cart would have cost that sentence. With localStorage the only
 * first-party cookie in the finished system is the admin session, which no
 * reader ever receives.
 */

export type CartLine = {
  variantId: string;
  quantity: number;
};

/** A line priced on the server, for display and for the Stripe session. */
export type PricedLine = {
  variantId: string;
  quantity: number;
  slug: string;
  productName: string;
  productKind: string;
  sizeLabel: string;
  sku: string;
  unitCents: number;
  lineCents: number;
  /** How many are actually available, so the cart can say so honestly. */
  stock: number;
};

export type PricedCart = {
  /** The checkout_intent row this pricing was recorded as. */
  intentId: string | null;
  lines: PricedLine[];
  /** Lines that were in the cart but can no longer be bought, with the reason. */
  dropped: { variantId: string; reason: "gone" | "sold-out" | "not-for-sale" }[];
  subtotalCents: number;
  shippingCents: number;
  currency: string;
};

export const CART_STORAGE_KEY = "guard-theory:cart:v1";
export const MAX_QUANTITY_PER_LINE = 10;

/** Narrowing for whatever is in localStorage, which is not to be trusted. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) {
        return [];
      }

      const { variantId, quantity } = entry as Record<string, unknown>;

      if (typeof variantId !== "string" || variantId === "") {
        return [];
      }

      const n = typeof quantity === "number" ? Math.trunc(quantity) : 0;

      if (n < 1) {
        return [];
      }

      return [{ variantId, quantity: Math.min(n, MAX_QUANTITY_PER_LINE) }];
    });
  } catch {
    // Corrupt storage is an empty cart, not an exception in a render.
    return [];
  }
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
