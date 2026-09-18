import { query, queryOne } from "../db/client.ts";
import { stripe, isStripeConfigured } from "../stripe/client.ts";

/**
 * Refunds.
 *
 * WHY WE KEEP OUR OWN COPY OF THE STATE
 *
 * Stripe is the source of truth for money moving. Our row is the source of
 * truth for what we told the customer, and for what the portal can render when
 * Stripe is slow or unreachable — an order list that makes an API call per row
 * is an order list that stops working on someone else's bad day.
 *
 * The two are reconciled by the `charge.refunded` webhook, so a refund issued
 * from the Stripe dashboard still lands here. Where they disagree, that is
 * information worth seeing rather than an error to paper over.
 */

export type RefundResult =
  | { ok: true; refundedCents: number; status: "partial" | "full" }
  | { ok: false; reason: string };

export async function refundOrder(orderId: string, amountCents?: number): Promise<RefundResult> {
  if (!isStripeConfigured()) {
    return { ok: false, reason: "Stripe is not configured, so nothing can be refunded." };
  }

  const order = await queryOne<{
    stripe_payment_intent: string | null;
    total_cents: number;
    refunded_cents: number;
  }>(
    `select stripe_payment_intent, total_cents, refunded_cents from "order" where id = $1`,
    [orderId],
  );

  if (!order) {
    return { ok: false, reason: "That order no longer exists." };
  }

  if (!order.stripe_payment_intent) {
    return {
      ok: false,
      reason: "This order has no payment on it, so there is nothing to refund.",
    };
  }

  const remaining = order.total_cents - order.refunded_cents;

  if (remaining <= 0) {
    return { ok: false, reason: "This order has already been refunded in full." };
  }

  const amount = amountCents === undefined ? remaining : Math.trunc(amountCents);

  if (amount <= 0) {
    return { ok: false, reason: "Enter an amount greater than zero." };
  }

  if (amount > remaining) {
    // Stripe would refuse this too. Catching it here is a sentence rather than
    // an API error, and it stops a typo becoming a support conversation.
    return {
      ok: false,
      reason: `That is more than is left to refund on this order.`,
    };
  }

  try {
    await stripe().refunds.create(
      {
        payment_intent: order.stripe_payment_intent,
        amount,
        reason: "requested_by_customer",
        metadata: { order_id: orderId },
      },
      {
        // A double-click must not refund twice. Keyed on the order and the
        // running total, so a genuine second partial refund is still allowed.
        idempotencyKey: `refund:${orderId}:${order.refunded_cents}:${amount}`,
      },
    );
  } catch (error) {
    console.error(
      "[guard-theory] refund failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      reason: "Stripe refused that refund. Nothing has been refunded — check the Stripe dashboard.",
    };
  }

  const refundedCents = order.refunded_cents + amount;
  const status = refundedCents >= order.total_cents ? "full" : "partial";

  await query(
    `update "order"
        set refunded_cents = $2,
            refund_status = $3,
            flagged_reason = coalesce(flagged_reason, 'refunded')
      where id = $1`,
    [orderId, refundedCents, status],
  );

  return { ok: true, refundedCents, status };
}

/**
 * Brings our copy back in line with Stripe's.
 *
 * Called from the `charge.refunded` webhook, so a refund issued in the Stripe
 * dashboard rather than the portal still shows up on the order.
 */
export async function syncRefundFromCharge(
  paymentIntentId: string,
  amountRefundedCents: number,
): Promise<void> {
  await query(
    `update "order"
        set refunded_cents = $2,
            refund_status = case
              when $2 >= total_cents then 'full'
              when $2 > 0 then 'partial'
              else 'none'
            end,
            flagged_reason = case
              when $2 > 0 then coalesce(flagged_reason, 'refunded')
              else flagged_reason
            end
      where stripe_payment_intent = $1`,
    [paymentIntentId, amountRefundedCents],
  );
}
