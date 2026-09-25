import { query } from "../db/client.ts";
import { CHECKOUT_INTENT_TTL_MINUTES } from "../cart/types.ts";
import type { CheckoutStart, PricedLine } from "../cart/types.ts";
import { snapshotDrift } from "../cart/price.ts";
import { createCheckoutSession } from "./checkout.ts";
import { isStripeConfigured } from "./client.ts";

/**
 * The one hop from our origin to Stripe, as a value rather than a redirect.
 *
 * WHY THIS RETURNS A URL INSTEAD OF REDIRECTING
 *
 * `form-action 'self'` blocks the redirect that follows a form submission in
 * Chrome (docs/commerce-plan.md §0.1). Stripe's own quickstart — a form that
 * POSTs and 303s to checkout.stripe.com — is that shape, and under our policy
 * it fails silently for most traffic. A server action that calls `redirect()`
 * off-site is close enough to the same shape that it is not relied on either.
 *
 * So nothing on our side redirects off-site. The cart calls
 * `startCheckoutAction`, which calls this, gets the Stripe URL back as data,
 * and the browser goes there with `window.location.assign`. That is an
 * ordinary script navigation: `form-action` does not govern it, no shipped
 * directive does, and the Content-Security-Policy does not move a byte.
 *
 * It also takes the side effect off a GET. The first build of this was a route
 * handler reached by a plain link, which meant browser and antivirus link
 * prefetching could mint Checkout Sessions for people who never clicked.
 *
 * Nothing the caller sends decides an amount. The intent was priced and
 * recorded server-side when the cart rendered; this reads an id and looks the
 * figures up.
 */
export async function startCheckout(intentId: string): Promise<CheckoutStart> {
  const id = typeof intentId === "string" ? intentId.trim() : "";

  if (!id) {
    return { ok: false, problem: "no-intent" };
  }

  if (!isStripeConfigured()) {
    console.error("[guard-theory] checkout attempted with no STRIPE_SECRET_KEY set");
    return { ok: false, problem: "unavailable" };
  }

  try {
    const rows = await query<{
      lines_json: PricedLine[];
      shipping_cents: number;
      consumed_at: Date | null;
      stale: boolean;
    }>(
      // Age is judged by the database's clock, the one that stamped created_at.
      `select lines_json, shipping_cents, consumed_at,
              created_at < now() - make_interval(mins => $2) as stale
         from checkout_intent where id = $1`,
      [id, CHECKOUT_INTENT_TTL_MINUTES],
    );

    const intent = rows[0];

    if (!intent) {
      return { ok: false, problem: "expired" };
    }

    if (intent.consumed_at) {
      // Already paid for. Sending them to a second session would be an
      // invitation to pay twice.
      return { ok: false, problem: "already-paid" };
    }

    if (intent.stale) {
      // A snapshot this old is not re-verified and let through — it is simply
      // over. The cart re-prices on the spot and hands back a fresh intent.
      return { ok: false, problem: "expired" };
    }

    const lines = intent.lines_json;

    if (!Array.isArray(lines) || lines.length === 0) {
      return { ok: false, problem: "empty" };
    }

    // Inside the TTL the figures can still have moved. Checked here, at the
    // last moment before money, rather than trusted from the render.
    const drift = await snapshotDrift(lines, intent.shipping_cents);

    if (drift) {
      console.warn(`[guard-theory] checkout intent ${id} no longer matches the shop: ${drift}`);
      return { ok: false, problem: "cart-changed" };
    }

    const session = await createCheckoutSession({
      intentId: id,
      lines,
      shippingCents: intent.shipping_cents,
      // USD only at launch, stated once rather than threaded through the
      // snapshot. When a second currency exists it becomes a column on the
      // intent, not a guess made here.
      currency: "USD",
    });

    // The browser will navigate to whatever this is, so it is checked rather
    // than trusted: an https URL, or nothing.
    if (!session.url || !session.url.startsWith("https://")) {
      console.error(`[guard-theory] Stripe returned a session with no usable url: ${session.id}`);
      return { ok: false, problem: "unavailable" };
    }

    return { ok: true, url: session.url };
  } catch (error) {
    console.error(
      "[guard-theory] could not start checkout:",
      error instanceof Error ? error.message : error,
    );
    return { ok: false, problem: "unavailable" };
  }
}
