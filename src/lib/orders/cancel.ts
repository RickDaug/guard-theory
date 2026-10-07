import { transaction } from "../db/client.ts";
import { sendEmail } from "../mail/index.ts";
import { orderCancelled } from "../mail/templates.ts";
import { getOrderItems, toEmailShape, type OrderRow } from "./manage.ts";
import { refundWithin, type CreateRefund } from "./refund.ts";
import { restockOrderLines, type RestockOutcome } from "./restock.ts";

/**
 * Cancelling an order: one action, three consequences.
 *
 * A cancel used to change the status and nothing else. The buyer kept being
 * charged until somebody remembered to press Refund as well, the units stayed
 * off the shelf, and nobody told the buyer. Under the FTC Mail Order Rule a
 * cancelled order is owed a prompt refund, so a cancel that can forget the
 * refund is a cancel that can break the rule (owner decisions 6 and 7).
 *
 * Now, in one transaction with the order row locked:
 *
 * 1. Whatever has not been refunded is refunded, through the same code as the
 *    Refund button (refund.ts): the same idempotency key, and the same
 *    truthful answer when Stripe does not reply. If the refund does not go
 *    through — refused, or unknown — the order is NOT cancelled and the owner
 *    is told why. A cancelled order that still holds the buyer's money is the
 *    state this exists to make impossible.
 * 2. The status moves to cancelled, compare-and-set against the status read.
 * 3. Everything fulfilment took off the shelf goes back (restock.ts), in
 *    variant-id order, behind a savepoint so a stock failure cannot undo the
 *    record of money that has already moved.
 *
 * Then, after the commit, the buyer is emailed. The email is last for the same
 * reason as in transitionOrder: a mail outage must not leave an order
 * half-cancelled. It is logged like every other message, `not-delivered` when
 * no provider is connected, and can be sent again from the order page.
 *
 * WHAT IS REFUSED
 *
 * - Shipped or delivered: the parcel has gone. That is a return, handled by a
 *   refund once it comes back, with the owner choosing what goes back in stock.
 * - A label purchase in flight (claimed, no tracking yet): its outcome is not
 *   known, so neither is whether the parcel is about to go. The claim and this
 *   cancel both take the order row, so whichever is second sees the first:
 *   a claim after a cancel finds `status = 'cancelled'` and buys nothing.
 * - Already cancelled: the second click of a double click. Nothing is refunded
 *   twice, because the first click holds the row lock until it has committed
 *   and the second then reads `cancelled`.
 *
 * A label that HAS been bought does not block a cancel: the parcel has not
 * been marked shipped, the buyer is owed their money either way, and the owner
 * is told to void the label in Shippo to get the postage back.
 */

export type CancelResult =
  | {
      ok: true;
      /** What this cancel refunded. 0 when it had all been refunded already. */
      refundedCents: number;
      restock: RestockOutcome | null;
      /** The money moved but the stock write failed: set stock by hand. */
      restockFailed: boolean;
      /** True when a bought label is now on a cancelled order. */
      hasLabel: boolean;
      emailed: boolean;
    }
  | { ok: false; reason: string };

export type CancelOptions = {
  /** Injectable so tests never call Stripe. Defaults to the real refund. */
  createRefund?: CreateRefund;
};

type Locked = Pick<
  OrderRow,
  "status" | "tracking_number" | "label_claimed_at" | "total_cents" | "refunded_cents"
>;

type Committed =
  | { ok: false; reason: string }
  | {
      ok: true;
      order: OrderRow;
      refundedCents: number;
      earlierRefundCents: number;
      restock: RestockOutcome | null;
      restockFailed: boolean;
    };

export const CANCEL_REFUSED_SHIPPED =
  "This order has shipped, so it cannot be cancelled. If the buyer sends it back, refund it as a return, and tick what goes back in stock once you have checked it.";

export async function cancelOrder(
  orderId: string,
  options: CancelOptions = {},
): Promise<CancelResult> {
  const committed = await transaction<Committed>(async (client) => {
    const found = await client.query<Locked>(
      `select status, tracking_number, label_claimed_at, total_cents, refunded_cents
         from "order" where id = $1 for update`,
      [orderId],
    );
    const order = found.rows[0];

    if (!order) {
      return { ok: false, reason: "That order no longer exists." };
    }

    if (order.status === "cancelled") {
      return {
        ok: false,
        reason: "This order is already cancelled. Nothing more was refunded. Reload to see it.",
      };
    }

    if (order.status === "shipped" || order.status === "delivered") {
      return { ok: false, reason: CANCEL_REFUSED_SHIPPED };
    }

    if (order.label_claimed_at && !order.tracking_number) {
      return {
        ok: false,
        reason:
          "A label is being bought for this order, or a purchase was started and never finished. " +
          "Nothing was cancelled or refunded. Reload in a moment; if the page asks you to look in " +
          "Shippo, do that first.",
      };
    }

    const earlierRefundCents = order.refunded_cents;
    let refundedCents = 0;

    if (order.total_cents - order.refunded_cents > 0) {
      const money = await refundWithin(client, orderId, undefined, {
        createRefund: options.createRefund,
      });

      if (!money.ok) {
        // Nothing has been written: refundWithin writes only after Stripe says
        // yes. The order stays as it was, and the reason says why.
        return { ok: false, reason: `Not cancelled. ${money.reason}` };
      }

      refundedCents = money.refundedCents - earlierRefundCents;
    }

    const moved = await client.query<OrderRow>(
      `update "order" set status = 'cancelled', cancelled_at = now()
        where id = $1 and status = $2
        returning *`,
      [orderId, order.status],
    );

    if (!moved.rows[0]) {
      // Unreachable while the row lock is held above; if it ever is reached,
      // throwing rolls the refund record back, and the charge.refunded webhook
      // restores it from Stripe. Better than a cancel that half-happened.
      throw new Error(`order ${orderId} changed status while locked for a cancel`);
    }

    let restock: RestockOutcome | null = null;
    let restockFailed = false;

    await client.query("savepoint restock");
    try {
      restock = await restockOrderLines(client, orderId, "taken");
      await client.query("release savepoint restock");
    } catch (error) {
      await client.query("rollback to savepoint restock");
      restockFailed = true;
      console.error(
        "[guard-theory] order cancelled and refunded, but restock failed:",
        error instanceof Error ? error.message : error,
      );
    }

    return {
      ok: true,
      order: moved.rows[0],
      refundedCents,
      earlierRefundCents,
      restock,
      restockFailed,
    };
  });

  if (!committed.ok) {
    return committed;
  }

  const items = await getOrderItems(orderId);
  const emailed = await sendEmail(
    "order-cancelled",
    orderCancelled(toEmailShape(committed.order, items), {
      refundedCents: committed.refundedCents,
      earlierRefundCents: committed.earlierRefundCents,
    }),
    orderId,
  );

  return {
    ok: true,
    refundedCents: committed.refundedCents,
    restock: committed.restock,
    restockFailed: committed.restockFailed,
    hasLabel: committed.order.tracking_number !== null,
    emailed,
  };
}
