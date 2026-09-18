import { query, transaction } from "../db/client.ts";
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

/** What actually moves the money. Injectable so the rest can be tested offline. */
export type CreateRefund = (input: {
  paymentIntent: string;
  amountCents: number;
  orderId: string;
  idempotencyKey: string;
}) => Promise<void>;

const createStripeRefund: CreateRefund = async (input) => {
  await stripe().refunds.create(
    {
      payment_intent: input.paymentIntent,
      amount: input.amountCents,
      reason: "requested_by_customer",
      metadata: { order_id: input.orderId },
    },
    { idempotencyKey: input.idempotencyKey },
  );
};

export type RefundOptions = {
  /**
   * What the portal page showed as already refunded when the form was
   * rendered. If the order has moved on since — a double-click, a second tab, a
   * refund made in the Stripe dashboard — the request is refused rather than
   * applied to a figure the owner was not looking at.
   */
  expectedRefundedCents?: number;
  createRefund?: CreateRefund;
};

export async function refundOrder(
  orderId: string,
  amountCents?: number,
  options: RefundOptions = {},
): Promise<RefundResult> {
  if (!options.createRefund && !isStripeConfigured()) {
    return { ok: false, reason: "Stripe is not configured, so nothing can be refunded." };
  }

  if (amountCents !== undefined && (!Number.isSafeInteger(amountCents) || amountCents <= 0)) {
    return { ok: false, reason: "Enter an amount greater than zero." };
  }

  const createRefund = options.createRefund ?? createStripeRefund;

  // One transaction, with the order row locked for the whole of it. It used to
  // be read, call Stripe, write — with nothing held in between, so two requests
  // both read "nothing refunded yet" and the second write overwrote the first.
  // The lock is held across the Stripe call on purpose: the `charge.refunded`
  // webhook for this very refund queues behind it and then agrees with it.
  // Everything inside uses `client`; the pool has one connection and asking it
  // for another from in here would wait for ever.
  return transaction<RefundResult>(async (client) => {
    const found = await client.query<{
      stripe_payment_intent: string | null;
      total_cents: number;
      refunded_cents: number;
    }>(
      `select stripe_payment_intent, total_cents, refunded_cents
         from "order" where id = $1 for update`,
      [orderId],
    );

    const order = found.rows[0];

    if (!order) {
      return { ok: false, reason: "That order no longer exists." };
    }

    if (!order.stripe_payment_intent) {
      return {
        ok: false,
        reason: "This order has no payment on it, so there is nothing to refund.",
      };
    }

    if (
      options.expectedRefundedCents !== undefined &&
      options.expectedRefundedCents !== order.refunded_cents
    ) {
      return {
        ok: false,
        reason:
          "The refunded amount on this order changed after this page loaded, so nothing was refunded. Reload and check the figures first.",
      };
    }

    const remaining = order.total_cents - order.refunded_cents;

    if (remaining <= 0) {
      return { ok: false, reason: "This order has already been refunded in full." };
    }

    const amount = amountCents === undefined ? remaining : amountCents;

    if (amount > remaining) {
      // Stripe would refuse this too. Catching it here is a sentence rather
      // than an API error, and it stops a typo becoming a support conversation.
      return { ok: false, reason: "That is more than is left to refund on this order." };
    }

    try {
      await createRefund({
        paymentIntent: order.stripe_payment_intent,
        amountCents: amount,
        orderId,
        // Keyed on the order and the running total, so a genuine second
        // partial refund is still allowed and a replay of this one is not.
        idempotencyKey: `refund:${orderId}:${order.refunded_cents}:${amount}`,
      });
    } catch (error) {
      console.error(
        "[guard-theory] refund failed:",
        error instanceof Error ? error.message : error,
      );
      return {
        ok: false,
        reason:
          "Stripe refused that refund. Nothing has been refunded — check the Stripe dashboard. " +
          "Stripe remembers a refused request for a day, so the same amount will be refused again " +
          "until then; a different amount, or the dashboard, is not affected.",
      };
    }

    const refundedCents = order.refunded_cents + amount;
    const status = refundedCents >= order.total_cents ? "full" : "partial";

    await client.query(
      `update "order"
          set refunded_cents = $2,
              refund_status = $3,
              flagged_reason = coalesce(flagged_reason, 'refunded')
        where id = $1`,
      [orderId, refundedCents, status],
    );

    return { ok: true, refundedCents, status };
  });
}

/**
 * Brings our copy back in line with Stripe's.
 *
 * Called from the `charge.refunded` webhook, so a refund issued in the Stripe
 * dashboard rather than the portal still shows up on the order.
 *
 * `amount_refunded` on a charge only ever grows, but webhooks are not delivered
 * in order: the event for a first partial refund can arrive after the event for
 * the second. Written absolutely, the late one LOWERED the figure. greatest()
 * makes the update monotonic, so the order it arrives in stops mattering.
 * least() caps it at the order total: 0007 has a CHECK saying a refund cannot
 * exceed what was paid, and a webhook that violated it would be retried for
 * three days rather than recorded.
 */
export async function syncRefundFromCharge(
  paymentIntentId: string,
  amountRefundedCents: number,
): Promise<void> {
  if (!Number.isSafeInteger(amountRefundedCents) || amountRefundedCents < 0) {
    throw new Error(`charge.refunded carried an unusable amount_refunded: ${amountRefundedCents}`);
  }

  await query(
    `update "order"
        set refunded_cents = least(greatest(refunded_cents, $2::integer), total_cents),
            refund_status = case
              when greatest(refunded_cents, $2::integer) >= total_cents then 'full'
              when greatest(refunded_cents, $2::integer) > 0 then 'partial'
              else 'none'
            end,
            flagged_reason = case
              when $2::integer > 0 then coalesce(flagged_reason, 'refunded')
              else flagged_reason
            end
      where stripe_payment_intent = $1`,
    [paymentIntentId, amountRefundedCents],
  );
}
