import type Stripe from "stripe";
import { stripe, isStripeConfigured } from "../stripe/client.ts";
import {
  type ClaimResult,
  claimEvent,
  fulfilCheckoutSession,
  markEventProcessed,
  releaseEvent,
} from "./fulfil.ts";
import { ensureOrderConfirmationSent } from "./confirmation.ts";
import { syncRefundFromCharge } from "./refund.ts";
import { syncDispute } from "./dispute.ts";
import { STRIPE_WEBHOOK_EVENTS } from "../stripe/webhook-events.ts";

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
 *
 * This lives in src/lib rather than in the route file so that it can be called
 * with a real, correctly signed Request from tests/unit/stripe-webhook.test.ts.
 * The route file is three lines; everything that can be wrong is here.
 */

/** What the handler acts on. The list, and why each is on it, is in webhook-events.ts. */
const HANDLED = new Set<string>(STRIPE_WEBHOOK_EVENTS);

/**
 * Schedules work to run after the response has gone.
 *
 * Tests pass their own, so they can see what was deferred and run it.
 */
export type Defer = (task: () => Promise<void>) => void | Promise<void>;

/**
 * Next's after(), from the one place it can be reached.
 *
 * Imported lazily: `next/server` has no ESM export map, so a static import
 * makes this file unloadable by `node --test`, and the webhook's tests are the
 * reason it lives in src/lib at all. Outside a request scope — a test, a
 * script — after() throws, and the work runs inline instead, which is what
 * this handler did before it was deferred.
 */
async function afterResponse(task: () => Promise<void>): Promise<void> {
  try {
    const { after } = await import("next/server");
    after(task);
    return;
  } catch {
    // Not inside a Next request. Fall through and do it now.
  }

  await task();
}

/**
 * The confirmation, as a deferred task: it never rejects, because nothing is
 * left to hear it once the response has gone. A failure is logged here;
 * sendEmail records its own failures in email_log, resendable from the portal.
 */
function confirmationTask(orderId: string): () => Promise<void> {
  return async () => {
    try {
      await ensureOrderConfirmationSent(orderId);
    } catch (error) {
      console.error(
        `[guard-theory] order confirmation for ${orderId} failed after the webhook answered; ` +
          "resend it from the portal:",
        error instanceof Error ? error.message : error,
      );
    }
  };
}

export async function handleStripeWebhook(
  request: Request,
  options: { defer?: Defer } = {},
): Promise<Response> {
  const defer = options.defer ?? afterResponse;

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
  let claim: ClaimResult;

  try {
    claim = await claimEvent(event.id, event.type);
  } catch (error) {
    console.error(
      "[guard-theory] could not claim webhook event:",
      error instanceof Error ? error.message : error,
    );
    return new Response("claim failed", { status: 500 });
  }

  if (claim === "processed") {
    return new Response("duplicate", { status: 200 });
  }

  if (claim === "in-flight") {
    // Another delivery holds the claim and has not finished. A 200 here would
    // tell Stripe the event is done when nobody knows that: if the other
    // delivery dies, there would be no retry left to rescue it. A non-2xx keeps
    // the retry alive; by the time it lands the event is either processed
    // (200) or the claim has gone stale and is taken over.
    return new Response("in progress", { status: 409, headers: { "Retry-After": "60" } });
  }

  try {
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntent =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntent) {
        await syncRefundFromCharge(paymentIntent, charge.amount_refunded);
      }

      await markEventProcessed(event.id);
      return new Response("ok", { status: 200 });
    }

    if (event.type === "charge.dispute.created" || event.type === "charge.dispute.closed") {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntent =
        typeof dispute.payment_intent === "string"
          ? dispute.payment_intent
          : dispute.payment_intent?.id;

      if (paymentIntent) {
        await syncDispute(
          paymentIntent,
          event.type === "charge.dispute.created" ? "created" : "closed",
          dispute.status,
        );
      } else {
        // Charges made through Checkout always have one. Said out loud rather
        // than retried: no retry can supply it.
        console.error(`[guard-theory] dispute ${dispute.id} has no payment intent; check Stripe`);
      }

      await markEventProcessed(event.id);
      return new Response("ok", { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const result = await fulfilCheckoutSession(session);

    if (result.outcome === "created") {
      console.log(
        `[guard-theory] order ${result.orderNumber} created from ${session.id}` +
          (result.oversold ? " (FLAGGED: oversold)" : ""),
      );
    }

    // "unfulfilled" reaches here too, and is marked processed on purpose: the
    // payment has been written to unfulfilled_payment (or fulfilCheckoutSession
    // threw, and this line is never reached). Retrying cannot conjure a missing
    // address; a human can, and the portal is now showing them the row.
    await markEventProcessed(event.id);

    // The confirmation goes AFTER the response, not before it. Awaited here it
    // shared the route's 15s with Resend's 8s timeout: a slow send could run
    // the function out of time after the mail went but before the event was
    // marked processed, the stale claim was taken over, and the buyer got it
    // twice. The order is committed and the event is done; the mail is not
    // Stripe's business. "already-recorded" is a retry of an event whose first
    // handler wrote the order and died before the email — sent now, unless
    // email_log shows it already went.
    if (result.outcome === "created" || result.outcome === "already-recorded") {
      await defer(confirmationTask(result.orderId));
    }

    return new Response(result.outcome === "unfulfilled" ? "recorded for review" : "ok", {
      status: 200,
    });
  } catch (error) {
    // Let Stripe retry: release the claim, or the retry would be swallowed as
    // a duplicate and the order would never exist.
    // If the release itself fails the claim is left behind — say so, because
    // that is the state that used to swallow every retry. It no longer does:
    // claimEvent takes over an unprocessed claim after STALE_CLAIM_SECONDS.
    await releaseEvent(event.id).catch((releaseError: unknown) => {
      console.error(
        `[guard-theory] could not release the claim on ${event.id}; ` +
          "the next retry after it goes stale will take it over:",
        releaseError instanceof Error ? releaseError.message : releaseError,
      );
    });
    console.error(
      `[guard-theory] failed to handle ${event.type} ${event.id}:`,
      error instanceof Error ? error.message : error,
    );
    return new Response("handler error", { status: 500 });
  }
}
