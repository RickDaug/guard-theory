import { query } from "../db/client.ts";
import type { Actor } from "../portal/roles.ts";

/**
 * Who did what to an order, from the portal.
 *
 * Written by the order actions after the thing they did has happened, never
 * before: a row here means it happened. A failure to write one is logged and
 * swallowed — a refund that went through must not be reported as failed
 * because its history line did not save.
 *
 * `actor_name` is copied at the time, so the history still reads "by Maria"
 * after Maria's account is removed.
 */

export type OrderEventKind =
  | "label_bought"
  | "label_released"
  | "label_printed"
  | "tracking_set"
  | "status_changed"
  | "refunded"
  | "cancelled"
  | "restocked"
  | "flag_cleared"
  | "email_resent";

export const EVENT_LABEL: Record<OrderEventKind, string> = {
  label_bought: "Label bought",
  label_released: "Label purchase released",
  label_printed: "Label opened to print",
  tracking_set: "Tracking saved",
  status_changed: "Status changed",
  refunded: "Refunded",
  cancelled: "Cancelled",
  restocked: "Put back in stock",
  flag_cleared: "Flag cleared",
  email_resent: "Email sent again",
};

export type OrderEvent = {
  id: string;
  kind: OrderEventKind;
  detail: string | null;
  actor_name: string;
  created_at: Date;
};

export async function recordOrderEvent(
  orderId: string,
  kind: OrderEventKind,
  actor: Pick<Actor, "userId" | "name">,
  detail: string | null = null,
): Promise<void> {
  try {
    await query(
      `insert into order_event (order_id, kind, detail, actor_user_id, actor_name)
       values ($1, $2, $3, $4, $5)`,
      [orderId, kind, detail?.slice(0, 300) ?? null, actor.userId, actor.name.slice(0, 80) || "Unknown"],
    );
  } catch (error) {
    console.error(
      `[guard-theory] could not record ${kind} on order ${orderId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function listOrderEvents(orderId: string): Promise<OrderEvent[]> {
  return query<OrderEvent>(
    `select id::text as id, kind, detail, actor_name, created_at
       from order_event where order_id = $1 order by created_at, id`,
    [orderId],
  );
}
