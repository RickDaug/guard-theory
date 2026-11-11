import { query } from "../db/client.ts";
import type { BoughtLabel, ShippoMode } from "../shipping/shippo.ts";
import { SHIPPABLE_SQL } from "./manage.ts";

/**
 * Who is buying the label for this order, right now.
 *
 * buyLabel used to read the order, see no tracking number, call Shippo, and
 * write the result — with nothing held in between. Two clicks, or two tabs,
 * both saw "no tracking number" and both bought postage: real money, two
 * barcodes, one box. Shippo's transaction endpoint has no idempotency key to
 * lean on, so the claim is ours: one atomic UPDATE before Shippo is called,
 * and only the request that gets a row back may spend money.
 */

/**
 * How long a claim stands if nothing comes back. Longer than the two Shippo
 * calls can take (15s timeout each). After it, the claim is treated as
 * abandoned — but NOT as safe: see claimLabelPurchase.
 */
export const LABEL_CLAIM_MINUTES = 2;

/** The parts of an order that decide whether a label may be bought for it at all. */
export type LabelEligibility = {
  status: string;
  refund_status: string;
  stripe_mode: string;
  /** Where a chargeback stands (0011). An open or lost one refuses a label. */
  dispute_status?: string | null;
};

/**
 * Why no label may be bought for this order, or null if one may.
 *
 * Checked before the claim, and again inside it (the status and refund parts),
 * because a label is the one thing in the portal that spends money nobody gets
 * back.
 *
 * - The order's Stripe mode must match the Shippo token's. A test-mode order
 *   (a production rehearsal with a test Stripe key, allowed by design) with a
 *   live Shippo token buys real postage for a parcel that will never exist.
 *   The reverse prints a test label for a real customer, which USPS will not
 *   carry. A token whose mode cannot be read is refused for the same reason
 *   the Stripe side refuses an unknown key.
 * - A cancelled order, or one refunded in full, is not going anywhere.
 * - A chargeback, open or lost: the bank has pulled the money back. Postage
 *   for goods that may never be paid for — or, once lost, certainly will not
 *   be — is money nobody gets back. It used to be only a warning on the page.
 */
export function labelRefusal(order: LabelEligibility, mode: ShippoMode): string | null {
  if (mode === "unknown") {
    return "The Shippo token is neither a test nor a live token, so there is no telling what a label would cost. Check SHIPPO_API_TOKEN.";
  }

  if (order.stripe_mode !== mode) {
    return order.stripe_mode === "test"
      ? "This is a test order and Shippo is connected with a live token: the label would be real postage for a parcel that does not exist. No label was bought."
      : `This is a ${order.stripe_mode} order and Shippo is connected with a ${mode} token, so the label would not be valid postage. No label was bought.`;
  }

  if (order.status === "cancelled") {
    return "This order is cancelled. No label was bought.";
  }

  if (order.refund_status === "full") {
    return "This order has been refunded in full. No label was bought.";
  }

  if (order.dispute_status === "lost") {
    return "The buyer's bank took this payment back and the dispute was lost, so this order must not ship. No label was bought. Cancel it to put the stock back.";
  }

  if (order.dispute_status === "open") {
    return "The buyer's bank has disputed this payment, and Stripe is holding the money until it is decided. No label was bought. Answer the dispute in the Stripe dashboard and wait for the outcome.";
  }

  return null;
}

export type LabelClaim =
  | { claimed: true }
  | {
      claimed: false;
      why: "has-tracking" | "in-progress" | "abandoned" | "gone" | "not-shippable";
    };

export async function claimLabelPurchase(orderId: string): Promise<LabelClaim> {
  const rows = await query<{ id: string }>(
    `update "order" set label_claimed_at = now()
      where id = $1 and tracking_number is null and label_claimed_at is null
        and status <> 'cancelled' and ${SHIPPABLE_SQL}
        and dispute_status is distinct from 'open'
      returning id`,
    [orderId],
  );

  if (rows.length > 0) {
    return { claimed: true };
  }

  const state = await query<{ has_tracking: boolean; abandoned: boolean; shippable: boolean }>(
    `select tracking_number is not null as has_tracking,
            label_claimed_at < now() - make_interval(mins => $2) as abandoned,
            status <> 'cancelled' and ${SHIPPABLE_SQL}
              and dispute_status is distinct from 'open' as shippable
       from "order" where id = $1`,
    [orderId, LABEL_CLAIM_MINUTES],
  );

  if (!state[0]) return { claimed: false, why: "gone" };
  if (state[0].has_tracking) return { claimed: false, why: "has-tracking" };
  if (!state[0].shippable) return { claimed: false, why: "not-shippable" };

  // A claim that was never released and never completed means a purchase was
  // started and its outcome is unknown: the function may have died after Shippo
  // took the money. That is not taken over automatically. A person looks at
  // Shippo first, then releases it by hand (releaseLabelClaim via the portal).
  return { claimed: false, why: state[0].abandoned ? "abandoned" : "in-progress" };
}

/** Shippo said no, or a person has checked: the order may be tried again. */
export async function releaseLabelClaim(orderId: string): Promise<void> {
  await query(
    `update "order" set label_claimed_at = null where id = $1 and tracking_number is null`,
    [orderId],
  );
}

export type RecordLabelResult = { ok: true } | { ok: false; message: string };

/**
 * Writes a label that has been PAID FOR onto its order.
 *
 * By the time this runs the money is spent, so a failure here must not lose
 * the label. It used to be a bare UPDATE after the purchase: if it threw, the
 * transaction id was gone, the claim sat there looking "abandoned", and the
 * only record of the postage was in Shippo. Now a failure keeps the claim (so
 * nobody can buy a second label), logs the transaction id and tracking number
 * — Shippo identifiers, not personal data — and hands the owner both, so the
 * tracking number can be pasted in and the label printed from Shippo.
 */
export async function recordBoughtLabel(
  orderId: string,
  label: BoughtLabel,
  write: typeof query = query,
): Promise<RecordLabelResult> {
  try {
    const rows = await write<{ id: string }>(
      `update "order"
          set tracking_number = $2, tracking_carrier = $3, tracking_url = $4,
              label_url = $5, shippo_transaction_id = $6
        where id = $1 and tracking_number is null
        returning id`,
      [
        orderId,
        label.trackingNumber,
        label.carrier,
        label.trackingUrl,
        label.labelUrl,
        label.transactionId,
      ],
    );

    if (rows.length > 0) {
      return { ok: true };
    }

    // Someone pasted a tracking number while the label was being bought, or
    // the order vanished. Either way this label is paid for and unattached.
    console.error(
      `[guard-theory] label ${label.transactionId} (tracking ${label.trackingNumber}) was bought for order ${orderId} but the order already had tracking or no longer exists`,
    );
  } catch (error) {
    console.error(
      `[guard-theory] label ${label.transactionId} (tracking ${label.trackingNumber}) was bought for order ${orderId} but could not be saved:`,
      error instanceof Error ? error.message : error,
    );
  }

  return {
    ok: false,
    message:
      `The label WAS bought (Shippo transaction ${label.transactionId}, tracking ${label.trackingNumber}), ` +
      "but it could not be saved on this order. Do not buy another. Paste that tracking number into the " +
      "order and print the label from Shippo — or, if it is not wanted, void it in Shippo for a refund.",
  };
}
