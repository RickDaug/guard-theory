import { query } from "../db/client.ts";

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

export type LabelClaim =
  | { claimed: true }
  | { claimed: false; why: "has-tracking" | "in-progress" | "abandoned" | "gone" };

export async function claimLabelPurchase(orderId: string): Promise<LabelClaim> {
  const rows = await query<{ id: string }>(
    `update "order" set label_claimed_at = now()
      where id = $1 and tracking_number is null and label_claimed_at is null
      returning id`,
    [orderId],
  );

  if (rows.length > 0) {
    return { claimed: true };
  }

  const state = await query<{ has_tracking: boolean; abandoned: boolean }>(
    `select tracking_number is not null as has_tracking,
            label_claimed_at < now() - make_interval(mins => $2) as abandoned
       from "order" where id = $1`,
    [orderId, LABEL_CLAIM_MINUTES],
  );

  if (!state[0]) return { claimed: false, why: "gone" };
  if (state[0].has_tracking) return { claimed: false, why: "has-tracking" };

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
