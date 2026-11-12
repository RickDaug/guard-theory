import { query } from "../db/client.ts";
import { type DisputeStatus, raiseFlagSql } from "./flags.ts";

/**
 * Chargebacks.
 *
 * `charge.dispute.created` means the buyer's bank has pulled the money back
 * and Stripe has added its fee. Nothing on the order said so, so an order being
 * charged back could still be packed and shipped. The order is now flagged
 * `disputed`, its `dispute_status` says where the dispute stands, and the
 * owner's alert digest counts it.
 *
 * THE SAME RULES AS A REFUND (src/lib/orders/refund.ts)
 *
 * - Matched by payment intent, the one reference a dispute and an order share.
 * - An event that matches no order yet throws, so the webhook answers 500 and
 *   Stripe retries: the dispute may have arrived before the order was written.
 *   A payment that became an unfulfilled_payment instead is matched too, and
 *   only logged — it is already under Needs you, and nothing is going to ship.
 * - Monotonic. A late or replayed `created` never reopens a dispute that a
 *   `closed` has already decided. Replaying either changes nothing.
 */

export type DisputeStage = "created" | "closed";

/**
 * Stripe's dispute status, reduced to what the owner needs. `won` and `lost`
 * are the outcomes; `warning_closed` (an inquiry that never became a
 * chargeback) and `prevented` are closed with the money kept. Anything Stripe
 * adds later reads as closed rather than being refused by the column's check.
 */
export function closedDisputeStatus(stripeStatus: string | null | undefined): DisputeStatus {
  if (stripeStatus === "won") return "won";
  if (stripeStatus === "lost") return "lost";
  return "closed";
}

export type DisputeOutcome = "order" | "unfulfilled" | "no-match";

export async function applyDispute(
  paymentIntentId: string,
  stage: DisputeStage,
  stripeStatus?: string | null,
): Promise<DisputeOutcome> {
  const status: DisputeStatus = stage === "created" ? "open" : closedDisputeStatus(stripeStatus);

  // `created` only opens a dispute that has not been decided; `closed` always
  // writes its outcome. Either raises the flag again: the outcome of a
  // chargeback is news even after the owner cleared the flag for the opening.
  const rows = await query<{ id: string }>(
    `update "order"
        set dispute_status = case
              when $2::text = 'open' and dispute_status in ('won', 'lost', 'closed')
                then dispute_status
              else $2::text
            end,
            ${raiseFlagSql("$3")}
      where stripe_payment_intent = $1
      returning id`,
    [paymentIntentId, status, "disputed"],
  );

  if (rows.length > 0) {
    console.error(
      `[guard-theory] dispute ${stage} on ${paymentIntentId} (${status}); ` +
        "the order is flagged. Answer it in the Stripe dashboard.",
    );
    return "order";
  }

  const unfulfilled = await query<{ id: string }>(
    "select id from unfulfilled_payment where stripe_payment_intent = $1",
    [paymentIntentId],
  );

  if (unfulfilled.length > 0) {
    console.error(
      `[guard-theory] dispute ${stage} on ${paymentIntentId} (${status}), a payment that never ` +
        "became an order. It is under Needs you; answer the dispute in the Stripe dashboard.",
    );
    return "unfulfilled";
  }

  return "no-match";
}

/** For the webhook: a dispute with nothing to attach to yet is retried. */
export async function syncDispute(
  paymentIntentId: string,
  stage: DisputeStage,
  stripeStatus?: string | null,
): Promise<void> {
  const outcome = await applyDispute(paymentIntentId, stage, stripeStatus);

  if (outcome === "no-match") {
    throw new Error(
      `dispute for ${paymentIntentId} matches no order or unfulfilled payment yet; leaving it for a retry`,
    );
  }
}
