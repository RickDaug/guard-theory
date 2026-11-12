import { query } from "../db/client.ts";

/**
 * Needs to ship: every paid order that is still owed a parcel.
 *
 * Paid is every row in "order" — an order only exists once Stripe has taken
 * the money. Still owed a parcel is: not cancelled, not already on its way
 * (shipped or delivered, or a tracking number is on it), and not refunded in
 * full. Oldest first, because the order that has waited longest is the one a
 * buyer is about to email about.
 *
 * A partly refunded order stays: part of the money was returned, and the rest
 * still bought something.
 */
const WHERE = `
  where status in ('new', 'in_process')
    and tracking_number is null
    and refund_status <> 'full'`;

export type ShipQueueRow = {
  id: string;
  number: string;
  status: "new" | "in_process";
  flagged_reason: string | null;
  dispute_status: string | null;
  ship_name: string;
  ship_city: string;
  ship_state: string;
  stripe_mode: string;
  label_claimed_at: Date | null;
  placed_at: Date;
  /** Computed by the database, so the page does not read a clock while rendering. */
  minutes_waiting: number;
};

export async function listShipQueue(limit = 200): Promise<ShipQueueRow[]> {
  return query<ShipQueueRow>(
    `select id, number, status, flagged_reason, dispute_status, ship_name, ship_city, ship_state,
            stripe_mode, label_claimed_at, placed_at,
            greatest(0, floor(extract(epoch from now() - placed_at) / 60))::int as minutes_waiting
       from "order" ${WHERE}
      order by placed_at asc
      limit $1`,
    [limit],
  );
}

export async function countShipQueue(): Promise<number> {
  const rows = await query<{ n: number }>(`select count(*)::int as n from "order" ${WHERE}`);
  return rows[0]?.n ?? 0;
}
