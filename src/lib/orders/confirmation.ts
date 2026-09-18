import { query } from "../db/client.ts";
import { sendEmail } from "../mail/index.ts";
import { orderConfirmation } from "../mail/templates.ts";
import { getOrder, getOrderItems, toEmailShape } from "./manage.ts";

/**
 * Sends the order confirmation unless one has already gone.
 *
 * The confirmation is sent after the order commits. If the function died in
 * between — or reading the order back failed — Stripe retried, the retry found
 * the order "already recorded", and nothing was ever sent: a paid customer with
 * no email. So the retry path calls this too, and what decides is the record of
 * a successful send, not which branch the code happened to arrive by.
 *
 * Returns whether a message went out on THIS call. Never throws for mail
 * reasons (sendEmail does not); a database error does propagate, which is what
 * lets the webhook answer 500 and be retried.
 */
export async function ensureOrderConfirmationSent(orderId: string): Promise<boolean> {
  const sent = await query<{ id: string }>(
    `select id from email_log
      where order_id = $1 and template = 'order-confirmation' and status = 'sent'
      limit 1`,
    [orderId],
  );

  if (sent.length > 0) {
    return false;
  }

  const order = await getOrder(orderId);

  if (!order) {
    return false;
  }

  const items = await getOrderItems(order.id);
  return sendEmail("order-confirmation", orderConfirmation(toEmailShape(order, items)), order.id);
}
