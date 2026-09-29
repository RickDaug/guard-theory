import { query, queryOne } from "../db/client.ts";
import { sendEmail } from "../mail/index.ts";
import { orderInProcess, orderShipped, type OrderForEmail } from "../mail/templates.ts";

/**
 * Moving an order along, and telling the customer.
 *
 * The transitions are deliberately a small, explicit table rather than "set
 * status to whatever the form said". An order that can jump from New to
 * Delivered without ever being Shipped is an order nobody printed a label for.
 */

export type OrderStatus = "new" | "in_process" | "shipped" | "delivered" | "cancelled";

/** What may follow what. Everything not listed here is refused. */
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ["in_process", "cancelled"],
  in_process: ["shipped", "cancelled"],
  shipped: ["delivered"],
  // Terminal. An order that arrived does not un-arrive, and a cancelled one is
  // reopened by taking a new order, not by editing this row.
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  in_process: "In process",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type OrderRow = {
  id: string;
  number: string;
  status: OrderStatus;
  flagged_reason: string | null;
  email: string;
  ship_name: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_postal: string;
  ship_country: string;
  phone: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  stripe_mode: string;
  refund_status: string;
  refunded_cents: number;
  /** Where a chargeback stands; null if there has never been one. 0011. */
  dispute_status: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  label_url: string | null;
  shippo_transaction_id: string | null;
  /** Set while a label is being bought; see src/lib/orders/label.ts. */
  label_claimed_at: Date | null;
  /** When it was cancelled (0016); see src/lib/orders/cancel.ts. */
  cancelled_at: Date | null;
  placed_at: Date;
  shipped_at: Date | null;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_name: string;
  product_kind: string;
  size_label: string;
  sku: string;
  unit_cents: number;
  quantity: number;
  /** Units fulfilment took from stock; null on lines from before 0016. */
  stock_taken: number | null;
  /** Units put back in stock since, by a cancel or a checked return. */
  restocked_quantity: number;
};

export async function listOrders(status?: OrderStatus | "flagged"): Promise<OrderRow[]> {
  if (status === "flagged") {
    return query<OrderRow>(
      `select * from "order" where flagged_reason is not null order by placed_at desc limit 200`,
    );
  }

  if (status) {
    return query<OrderRow>(
      `select * from "order" where status = $1 order by placed_at desc limit 200`,
      [status],
    );
  }

  return query<OrderRow>(`select * from "order" order by placed_at desc limit 200`);
}

export async function getOrder(id: string): Promise<OrderRow | undefined> {
  return queryOne<OrderRow>(`select * from "order" where id = $1`, [id]);
}

export async function getOrderItems(orderId: string): Promise<OrderItemRow[]> {
  return query<OrderItemRow>("select * from order_item where order_id = $1 order by id", [orderId]);
}

/** A paid Checkout Session that could not be turned into an order. */
export type UnfulfilledPaymentRow = {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent: string | null;
  stripe_mode: string;
  reason: string;
  amount_total_cents: number | null;
  currency: string | null;
  email: string | null;
  first_seen_at: Date;
};

export async function listUnfulfilledPayments(): Promise<UnfulfilledPaymentRow[]> {
  return query<UnfulfilledPaymentRow>(
    `select id, stripe_session_id, stripe_payment_intent, stripe_mode, reason,
            amount_total_cents, currency, email, first_seen_at
       from unfulfilled_payment
      where resolved_at is null
      order by first_seen_at desc`,
  );
}

/** The owner has refunded it or fulfilled it by hand. Returns false if there was nothing open. */
export async function resolveUnfulfilledPayment(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update unfulfilled_payment set resolved_at = now()
      where id = $1 and resolved_at is null
      returning id`,
    [id],
  );
  return rows.length > 0;
}

export async function statusCounts(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: number }>(
    `select status, count(*)::int as n from "order" group by status`,
  );

  const flagged = await queryOne<{ n: number }>(
    `select count(*)::int as n from "order" where flagged_reason is not null`,
  );

  const unfulfilled = await queryOne<{ n: number }>(
    `select count(*)::int as n from unfulfilled_payment where resolved_at is null`,
  );

  // "Needs you" counts both: an order that wants judgement, and money with no
  // order at all — which wants it more.
  const counts: Record<string, number> = { flagged: (flagged?.n ?? 0) + (unfulfilled?.n ?? 0) };

  for (const row of rows) {
    counts[row.status] = row.n;
  }

  return counts;
}

export function toEmailShape(order: OrderRow, items: OrderItemRow[]): OrderForEmail {
  return {
    number: order.number,
    email: order.email,
    shipName: order.ship_name,
    currency: order.currency,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    totalCents: order.total_cents,
    items: items.map((item) => ({
      productName: item.product_name,
      productKind: item.product_kind,
      sizeLabel: item.size_label,
      quantity: item.quantity,
      unitCents: item.unit_cents,
    })),
  };
}

/**
 * WHAT MAY NOT MOVE TOWARD THE DOOR
 *
 * Three things mean an unshipped order must not be packed, given tracking or
 * marked shipped, whatever the transition table says:
 *
 * - A full refund. On an unshipped order it also put the stock back
 *   (refund.ts), so shipping it anyway sells the same unit twice: the shelf
 *   says it is there, the parcel says it is gone, and the next buyer of that
 *   size pays for nothing. The owner who refunded as a goodwill gesture and
 *   still means to send it is told how to do that without phantom stock.
 * - Any line put back in stock before shipping. Only a full refund or a cancel
 *   does that today; the check is on the stock itself so a future path that
 *   restocks early is caught too.
 * - A lost chargeback. The bank has given the buyer the money back; shipping
 *   sends the goods as well. The way out is Cancel, which no longer tries to
 *   refund a payment the bank already returned (cancel.ts).
 *
 * The SQL twin is ANDed into every write that moves an order toward shipping,
 * so a refund landing between the read and the write still wins.
 */
export type ShipGuardFacts = {
  refund_status: string;
  dispute_status: string | null;
  /** True if any line has had units put back in stock. */
  restocked: boolean;
};

export const SHIP_REFUSED_CHARGEBACK =
  "The buyer's bank took this payment back through a chargeback, and the dispute was lost, so this order must not ship. Cancel it instead: nothing is refunded a second time, and the stock goes back on the shelf.";

export const SHIP_REFUSED_RESTOCKED =
  "This order was refunded in full and its stock is already back on the shelf, so the portal will not move it toward shipping: that would sell the same units twice. If the refund was a goodwill gesture and you are still sending the parcel, take the units back out of stock on the product page first, then send it outside the portal. Otherwise cancel it.";

export const SHIP_REFUSED_REFUNDED =
  "This order has been refunded in full, so the portal will not move it toward shipping. Cancel it to put its stock back on the shelf.";

export function shipRefusal(order: ShipGuardFacts): string | null {
  if (order.dispute_status === "lost") return SHIP_REFUSED_CHARGEBACK;
  if (order.restocked) return SHIP_REFUSED_RESTOCKED;
  if (order.refund_status === "full") return SHIP_REFUSED_REFUNDED;
  return null;
}

/** The same rule, for a `where` on the "order" table. */
export const SHIPPABLE_SQL = `(refund_status <> 'full'
  and dispute_status is distinct from 'lost'
  and not exists (select 1 from order_item i
                   where i.order_id = "order".id and i.restocked_quantity > 0))`;

/** Reads the facts shipRefusal needs. Undefined if the order does not exist. */
export async function shipGuardFacts(orderId: string): Promise<ShipGuardFacts | undefined> {
  return queryOne<ShipGuardFacts>(
    `select refund_status, dispute_status,
            exists (select 1 from order_item i
                     where i.order_id = "order".id and i.restocked_quantity > 0) as restocked
       from "order" where id = $1`,
    [orderId],
  );
}

export type TrackingResult = { ok: true } | { ok: false; reason: string };

/**
 * Tracking typed in by hand, for a label bought outside the portal. Only on an
 * order that is still owed a parcel, and compare-and-set against the ship
 * guard: a tracking number is the one thing Mark shipped needs.
 */
export async function saveTracking(
  orderId: string,
  tracking: { number: string; carrier: string; url: string | null },
): Promise<TrackingResult> {
  const facts = await shipGuardFacts(orderId);

  if (!facts) {
    return { ok: false, reason: "That order no longer exists." };
  }

  const refusal = shipRefusal(facts);

  if (refusal) {
    return { ok: false, reason: `Tracking not saved. ${refusal}` };
  }

  const rows = await query<{ id: string }>(
    `update "order" set tracking_number = $2, tracking_carrier = $3, tracking_url = $4
      where id = $1 and status in ('new', 'in_process') and ${SHIPPABLE_SQL}
      returning id`,
    [orderId, tracking.number, tracking.carrier, tracking.url],
  );

  if (rows.length === 0) {
    return {
      ok: false,
      reason:
        "Tracking not saved. This order is no longer waiting to ship — it was cancelled, shipped or refunded while you were looking at it. Reload to see where it is now.",
    };
  }

  return { ok: true };
}

export type TransitionResult =
  | { ok: true; emailed: boolean }
  | { ok: false; reason: string };

/**
 * Moves an order and sends the message that goes with it.
 *
 * The status is written first and the email is sent second, deliberately. If
 * the send fails the order has still moved — the customer can be told again
 * from the portal, but an order stuck in the wrong state because a mail server
 * was down is a worse problem, and a harder one to notice.
 *
 * The write is a compare-and-set: it only lands if the order is still in the
 * status that was read and checked against the table. It used to be a plain
 * `where id = $1`, so a double-click on "Mark shipped" passed the check twice,
 * wrote twice and emailed the customer twice; and a Shippo DELIVERED landing
 * between the read and the write had `shipped` written straight over it — a
 * transition the table forbids and the SQL did not. Now exactly one request
 * gets a row back, and only that request sends the email.
 */
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
): Promise<TransitionResult> {
  if (!Object.hasOwn(STATUS_LABEL, to)) {
    return { ok: false, reason: "That is not a status an order can have." };
  }

  if (to === "cancelled") {
    // A cancel is not a status change on its own: it refunds the buyer, puts
    // the stock back and tells them (cancel.ts). Reaching it from here would
    // be the old cancel that kept the money.
    return {
      ok: false,
      reason: "Use Cancel and refund on the order page. A cancel always refunds the buyer.",
    };
  }

  const order = await getOrder(orderId);

  if (!order) {
    return { ok: false, reason: "That order no longer exists." };
  }

  if (!canTransition(order.status, to)) {
    return {
      ok: false,
      reason: `An order that is ${STATUS_LABEL[order.status].toLowerCase()} cannot become ${STATUS_LABEL[to].toLowerCase()}.`,
    };
  }

  if (to === "shipped" && !order.tracking_number) {
    // The shipped email's whole content is a tracking number. Sending it
    // without one is a message that says nothing.
    return {
      ok: false,
      reason: "Add a tracking number before marking this shipped — buy a label, or paste one in.",
    };
  }

  const headingOut = to === "in_process" || to === "shipped";

  if (headingOut) {
    const facts = await shipGuardFacts(orderId);
    const refusal = facts ? shipRefusal(facts) : null;

    if (refusal) {
      return { ok: false, reason: refusal };
    }
  }

  const stamp =
    to === "in_process"
      ? "in_process_at"
      : to === "shipped"
        ? "shipped_at"
        : to === "delivered"
          ? "delivered_at"
          : null;

  // `returning *` so the email is built from the row as it now is, not as it
  // was read: the tracking number in particular can change in between.
  const moved = await queryOne<OrderRow>(
    `update "order" set status = $2${stamp ? `, ${stamp} = now()` : ""}
      where id = $1 and status = $3
        and ($2 <> 'shipped' or tracking_number is not null)
        and ($2 not in ('in_process', 'shipped') or ${SHIPPABLE_SQL})
      returning *`,
    [orderId, to, order.status],
  );

  if (!moved) {
    return {
      ok: false,
      reason:
        "This order changed while you were looking at it — someone else moved it, or it was clicked twice. " +
        "Reload to see where it is now. Nothing was sent.",
    };
  }

  let emailed = false;
  const items = await getOrderItems(orderId);
  const shape = toEmailShape(moved, items);

  if (to === "in_process") {
    emailed = await sendEmail("order-in-process", orderInProcess(shape), orderId);
  } else if (to === "shipped") {
    emailed = await sendEmail(
      "order-shipped",
      orderShipped(shape, {
        number: moved.tracking_number!,
        url: moved.tracking_url,
        carrier: moved.tracking_carrier,
      }),
      orderId,
    );
  }

  return { ok: true, emailed };
}

export type EmailLogRow = {
  id: string;
  template: string;
  to_email: string;
  status: string;
  error: string | null;
  created_at: Date;
};

export async function orderEmails(orderId: string): Promise<EmailLogRow[]> {
  return query<EmailLogRow>(
    "select id, template, to_email, status, error, created_at from email_log where order_id = $1 order by created_at desc",
    [orderId],
  );
}
