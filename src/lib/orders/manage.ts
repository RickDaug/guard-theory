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
  tracking_carrier: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  label_url: string | null;
  placed_at: Date;
  shipped_at: Date | null;
};

export type OrderItemRow = {
  order_id: string;
  product_name: string;
  product_kind: string;
  size_label: string;
  sku: string;
  unit_cents: number;
  quantity: number;
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

export async function statusCounts(): Promise<Record<string, number>> {
  const rows = await query<{ status: string; n: number }>(
    `select status, count(*)::int as n from "order" group by status`,
  );

  const flagged = await queryOne<{ n: number }>(
    `select count(*)::int as n from "order" where flagged_reason is not null`,
  );

  const counts: Record<string, number> = { flagged: flagged?.n ?? 0 };

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
 */
export async function transitionOrder(
  orderId: string,
  to: OrderStatus,
): Promise<TransitionResult> {
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

  const stamp =
    to === "in_process"
      ? "in_process_at"
      : to === "shipped"
        ? "shipped_at"
        : to === "delivered"
          ? "delivered_at"
          : null;

  await query(
    `update "order" set status = $2${stamp ? `, ${stamp} = now()` : ""} where id = $1`,
    [orderId, to],
  );

  let emailed = false;
  const items = await getOrderItems(orderId);
  const shape = toEmailShape(order, items);

  if (to === "in_process") {
    emailed = await sendEmail("order-in-process", orderInProcess(shape), orderId);
  } else if (to === "shipped") {
    emailed = await sendEmail(
      "order-shipped",
      orderShipped(shape, {
        number: order.tracking_number!,
        url: order.tracking_url,
        carrier: order.tracking_carrier,
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
