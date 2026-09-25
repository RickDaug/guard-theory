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
 * cookies policy opens "This site sets no cookies for readers", and a
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

/** Why a checkout could not be started. Each has its own sentence in the cart. */
export type CheckoutProblem =
  | "no-intent"
  | "unavailable"
  | "expired"
  | "already-paid"
  | "empty"
  /** A price, a status, the stock or the shipping rate moved since the cart was priced. */
  | "cart-changed";

/**
 * What `startCheckoutAction` returns: the Stripe URL for the browser to go to,
 * or the reason there is not one. A URL, never a redirect — see
 * src/lib/stripe/start.ts.
 */
export type CheckoutStart = { ok: true; url: string } | { ok: false; problem: CheckoutProblem };

export const CART_STORAGE_KEY = "guard-theory:cart:v1";
export const MAX_QUANTITY_PER_LINE = 10;

/**
 * The most distinct sizes one cart may hold. The catalogue is two garments in
 * six sizes; this is a ceiling on what an unauthenticated caller can make the
 * server price and store, not a limit any buyer will meet.
 */
export const MAX_CART_LINES = 20;

/**
 * How long a priced cart may be turned into a Checkout Session.
 *
 * The intent is a snapshot of prices and stock. Without an age limit a tab left
 * open over a price change could still check out at the old figure — and after
 * Stripe forgets the idempotency key (about a day) it would mint a brand-new
 * session from that stale snapshot. The cart re-prices itself on every render,
 * so an expired intent costs the buyer one click.
 */
export const CHECKOUT_INTENT_TTL_MINUTES = 30;

/**
 * How long a Stripe Checkout Session stays payable. Stock is not reserved, so
 * this is the oversell window; Stripe's default is 24 hours and its minimum is
 * 30 minutes.
 */
export const CHECKOUT_SESSION_MINUTES = 30;

/**
 * Unpaid intents older than this are deleted. Far longer than the TTL on
 * purpose: a session started in the intent's last minute can be paid half an
 * hour later, Stripe retries a failed webhook for three days, and the
 * reconciler looks back 72 hours — and every one of those needs the snapshot to
 * still be there. Paid intents are never deleted; they are the audit trail.
 */
export const CHECKOUT_INTENT_RETENTION_DAYS = 7;

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
