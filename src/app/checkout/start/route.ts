import type { NextRequest } from "next/server";
import { query } from "@/lib/db/client";
import { isStripeConfigured } from "@/lib/stripe/client";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import type { PricedLine } from "@/lib/cart/types";

/**
 * The one hop from our origin to Stripe.
 *
 * WHY THIS IS A GET REACHED BY A PLAIN LINK, AND NOT A FORM POST
 *
 * `form-action 'self'` blocks the redirect that follows a form submission —
 * verified in this repository against Chrome before any of this was written
 * (docs/commerce-plan.md §0.1). Stripe's own documented quickstart is a form
 * that POSTs and 303s to checkout.stripe.com, and under our policy it fails
 * silently for most traffic.
 *
 * A link navigation and the redirect that follows it are not governed by
 * form-action, and no shipped directive covers them — `navigate-to` was dropped
 * from CSP3 and implemented nowhere. So the cart renders a plain <a> to here,
 * and the Content-Security-Policy does not move a byte.
 *
 * A plain <a>, not next/link: route handlers are not RSC-prefetched, but an
 * anchor removes the question rather than relying on that staying true.
 *
 * The side effect on a GET is the price of that, and it is bounded: the only
 * thing this creates is a Stripe Checkout Session, which expires in 24 hours
 * and costs nothing. The cart it is built from was priced and recorded server-
 * side before the link was rendered, so nothing the caller sends decides an
 * amount — this reads an id and looks the figures up.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function back(reason: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      Location: `/cart?problem=${encodeURIComponent(reason)}`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  const intentId = request.nextUrl.searchParams.get("i")?.trim();

  if (!intentId) {
    return back("no-intent");
  }

  if (!isStripeConfigured()) {
    console.error("[guard-theory] checkout attempted with no STRIPE_SECRET_KEY set");
    return back("unavailable");
  }

  try {
    const rows = await query<{
      lines_json: PricedLine[];
      shipping_cents: number;
      consumed_at: Date | null;
    }>("select lines_json, shipping_cents, consumed_at from checkout_intent where id = $1", [
      intentId,
    ]);

    const intent = rows[0];

    if (!intent) {
      return back("expired");
    }

    if (intent.consumed_at) {
      // Already paid for. Sending them to a second session would be an
      // invitation to pay twice.
      return back("already-paid");
    }

    const lines = intent.lines_json;

    if (!Array.isArray(lines) || lines.length === 0) {
      return back("empty");
    }

    const session = await createCheckoutSession({
      intentId,
      lines,
      shippingCents: intent.shipping_cents,
      // USD only at launch, stated once rather than threaded through the
      // snapshot. When a second currency exists it becomes a column on the
      // intent, not a guess made here.
      currency: "USD",
    });

    if (!session.url) {
      console.error(`[guard-theory] Stripe returned a session with no url: ${session.id}`);
      return back("unavailable");
    }

    return new Response(null, {
      status: 303,
      headers: { Location: session.url, "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error(
      "[guard-theory] could not start checkout:",
      error instanceof Error ? error.message : error,
    );
    return back("unavailable");
  }
}
