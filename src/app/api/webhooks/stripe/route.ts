import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "@/lib/stripe/client";
import {
  claimEvent,
  fulfilCheckoutSession,
  markEventProcessed,
  releaseEvent,
} from "@/lib/orders/fulfil";

/**
 * Stripe's webhook.
 *
 * The only route on this site that sits outside portal authentication, because
 * Stripe has to reach it. It earns that by verifying the signature on every
 * request and rejecting everything else.
 *
 * THINGS THAT WILL BREAK THIS IF FORGOTTEN
 *
 * - The raw body. Signature verification is over the exact bytes; anything that
 *   re-encodes them makes every event fail. `await request.text()` is the way,
 *   and no bodyParser opt-out is needed in the App Router.
 *
 * - `src/proxy.ts` must never match /api/webhooks. If it does, Next buffers the
 *   request body in memory and a truncated body fails verification with a
 *   warning rather than an error, which is the worst kind of failure to debug.
 *
 * - The endpoint's API version in the Stripe dashboard must match the SDK's.
 *   See readShippingAddress() in src/lib/orders/fulfil.ts.
 *
 * - Return 2xx quickly. Checkout waits up to ten seconds for this before
 *   redirecting the buyer, so the handler writes the order and returns; email
 *   and labels are somebody else's turn.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const HANDLED = new Set<string>([
  "checkout.session.completed",
  // Not reachable for US card-only checkout, where the PaymentIntent succeeds
  // immediately. Handled anyway because it costs three lines, and the day a
  // delayed method is enabled in the dashboard a completed-only integration
  // starts fulfilling unpaid orders.
  "checkout.session.async_payment_succeeded",
]);

export async function POST(request: Request): Promise<Response> {
  if (!isStripeConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[guard-theory] webhook received but Stripe is not configured");
    return new Response("not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("missing signature", { status: 400 });
  }

  const raw = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe().webhooks.constructEvent(
      raw,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    // Not an error worth a 500: an unverified body is exactly what this
    // endpoint exists to refuse.
    console.error(
      "[guard-theory] rejected an unverified webhook:",
      error instanceof Error ? error.message : error,
    );
    return new Response("invalid signature", { status: 400 });
  }

  if (!HANDLED.has(event.type)) {
    // A 200 so Stripe stops resending something we have decided not to act on.
    return new Response("ignored", { status: 200 });
  }

  // The idempotency ledger. A duplicate returns 200 — a non-200 would make
  // Stripe retry something that already worked.
  let claimed: boolean;

  try {
    claimed = await claimEvent(event.id, event.type);
  } catch (error) {
    console.error(
      "[guard-theory] could not claim webhook event:",
      error instanceof Error ? error.message : error,
    );
    return new Response("claim failed", { status: 500 });
  }

  if (!claimed) {
    return new Response("duplicate", { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await fulfilCheckoutSession(session);

    if (result.outcome === "created") {
      console.log(
        `[guard-theory] order ${result.orderNumber} created from ${session.id}` +
          (result.oversold ? " (FLAGGED: oversold)" : ""),
      );
    }

    await markEventProcessed(event.id);
    return new Response("ok", { status: 200 });
  } catch (error) {
    // Let Stripe retry: release the claim, or the retry would be swallowed as
    // a duplicate and the order would never exist.
    await releaseEvent(event.id).catch(() => {});
    console.error(
      `[guard-theory] failed to handle ${event.type} ${event.id}:`,
      error instanceof Error ? error.message : error,
    );
    return new Response("handler error", { status: 500 });
  }
}
