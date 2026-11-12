import type { PoolClient } from "pg";
import { transaction } from "../db/client.ts";

/**
 * Putting an order's units back on the shelf.
 *
 * Three things do it, and all three come through here:
 *
 * - a cancel, before the parcel has gone: everything fulfilment took;
 * - a full refund of an order that has not shipped: the same;
 * - the owner, after a return has arrived and been looked at: only the lines
 *   and counts they ticked. A refund after shipping never restocks on its own,
 *   because the garment is in a post office, or worn, or damaged, and only a
 *   person holding it can say it is sellable again (owner decision 6).
 *
 * `order_item.restocked_quantity` (0016) records what has gone back per line,
 * so nothing is put back twice: a second cancel, a refund after a cancel, a
 * double-clicked return form. Every request is capped at what is left, and the
 * database refuses a count past the quantity bought even if this cap were
 * wrong.
 *
 * LOCK ORDER. Callers hold the order row already (`for update`). The variant
 * rows are then written in variant-id order — the order fulfilment decrements
 * them in (fulfil.ts) and the stock editor writes them in — so a cancel racing
 * a checkout or a stock edit on the same sizes queues instead of deadlocking.
 */

export type RestockLine = {
  itemId: string;
  productName: string;
  sizeLabel: string;
  quantity: number;
};

export type RestockOutcome = {
  /** What went back, line by line. Empty if nothing did. */
  restocked: RestockLine[];
  /**
   * Lines that could not go back because their catalogue size has since been
   * deleted (`variant_id` is set null when a variant goes). Said, so the owner
   * can put the units wherever that product lives now.
   */
  orphaned: RestockLine[];
};

type ItemRow = {
  id: string;
  variant_id: string | null;
  product_name: string;
  size_label: string;
  quantity: number;
  stock_taken: number | null;
  restocked_quantity: number;
};

/**
 * `"taken"`: everything fulfilment took off the shelf and has not gone back.
 * A line from an oversold payment took nothing, so nothing returns for it.
 *
 * A map of item id to count: what the owner ticked on a return. Capped at the
 * quantity bought less what has gone back — the owner is holding the garment,
 * so even an oversold line can be restocked once it has physically come back.
 */
export type RestockRequest = "taken" | ReadonlyMap<string, number>;

export async function restockOrderLines(
  client: PoolClient,
  orderId: string,
  request: RestockRequest,
): Promise<RestockOutcome> {
  const found = await client.query<ItemRow>(
    `select id, variant_id, product_name, size_label, quantity, stock_taken, restocked_quantity
       from order_item where order_id = $1
      order by variant_id nulls last, id
        for update`,
    [orderId],
  );

  const outcome: RestockOutcome = { restocked: [], orphaned: [] };

  for (const item of found.rows) {
    const ceiling = request === "taken" ? (item.stock_taken ?? item.quantity) : item.quantity;
    const left = Math.max(0, ceiling - item.restocked_quantity);
    const asked = request === "taken" ? left : (request.get(item.id) ?? 0);
    const count = Math.min(left, Math.max(0, Math.trunc(asked)));

    if (count <= 0) continue;

    const line: RestockLine = {
      itemId: item.id,
      productName: item.product_name,
      sizeLabel: item.size_label,
      quantity: count,
    };

    if (!item.variant_id) {
      outcome.orphaned.push(line);
      continue;
    }

    await client.query(`update variant set stock = stock + $2 where id = $1`, [
      item.variant_id,
      count,
    ]);
    await client.query(
      `update order_item set restocked_quantity = restocked_quantity + $2 where id = $1`,
      [item.id, count],
    );

    outcome.restocked.push(line);
  }

  return outcome;
}

/** "2 × Theory 01, size M" — for the portal's confirmation sentence. */
export function describeRestock(lines: readonly RestockLine[]): string {
  return lines
    .map((line) => `${line.quantity} × ${line.productName}, size ${line.sizeLabel}`)
    .join("; ");
}

/**
 * A return has arrived after the refund was already made in full, so there is
 * no refund form left to tick the lines on. Same rules as the ticks on the
 * refund form: shipped or delivered orders only, only what was ticked, capped
 * at what has not gone back yet.
 */
export async function restockReturn(
  orderId: string,
  request: ReadonlyMap<string, number>,
): Promise<{ ok: true; restock: RestockOutcome } | { ok: false; reason: string }> {
  return transaction(async (client) => {
    const locked = await client.query<{ status: string }>(
      `select status from "order" where id = $1 for update`,
      [orderId],
    );
    const status = locked.rows[0]?.status;

    if (!status) {
      return { ok: false as const, reason: "That order no longer exists." };
    }

    if (status !== "shipped" && status !== "delivered") {
      return {
        ok: false as const,
        reason:
          "Only a returned parcel is put back by hand. This order has not shipped: cancelling it, or refunding it in full, puts its stock back on its own.",
      };
    }

    return { ok: true as const, restock: await restockOrderLines(client, orderId, request) };
  });
}
