import { query } from "../db/client.ts";
import { getMailProvider, sendEmail } from "../mail/index.ts";
import { orderConfirmation } from "../mail/templates.ts";
import { getOrder, getOrderItems, toEmailShape } from "./manage.ts";

/**
 * Resend's `Idempotency-Key` for an order's confirmation: one per order, and
 * the same on every attempt. Resend keeps it 24 hours; a second send with the
 * same key and body returns the first send's id and emails nobody.
 */
export function confirmationIdempotencyKey(orderId: string): string {
  return `order-confirmation/${orderId}`;
}

/**
 * Sends the order confirmation unless one has already gone.
 *
 * The confirmation is sent after the order commits. If the function died in
 * between — or reading the order back failed — Stripe retried, the retry found
 * the order "already recorded", and nothing was ever sent: a paid customer with
 * no email. So the retry path calls this too, and what decides is the record of
 * a successful send, not which branch the code happened to arrive by.
 *
 * Only a `sent` row is a successful send. A `not-delivered` row is the log-only
 * provider — it counts as unsent, so the message goes once a provider is
 * connected. While none is, one such row is enough: asking again would only
 * write the same non-delivery to the log again.
 *
 * Every attempt carries the same idempotency key, so the webhook, a retry of it
 * and the cron reconcile arriving together send one email between them.
 *
 * Returns whether a message went out on THIS call. Never throws for mail
 * reasons (sendEmail does not); a database error does propagate, which is what
 * lets the webhook answer 500 and be retried.
 */
export async function ensureOrderConfirmationSent(orderId: string): Promise<boolean> {
  const logged = await query<{ status: string }>(
    `select status from email_log
      where order_id = $1 and template = 'order-confirmation'
        and status in ('sent', 'not-delivered')`,
    [orderId],
  );

  if (logged.some((row) => row.status === "sent")) {
    return false;
  }

  const mail = getMailProvider();

  if (!mail.delivers && logged.length > 0) {
    return false;
  }

  const order = await getOrder(orderId);

  if (!order) {
    return false;
  }

  const items = await getOrderItems(order.id);
  const email = {
    ...orderConfirmation(toEmailShape(order, items)),
    idempotencyKey: confirmationIdempotencyKey(order.id),
  };
  return sendEmail("order-confirmation", email, order.id);
}

/**
 * Sends every recent confirmation that has been attempted and never gone:
 * logged while no provider was connected, or failed at the provider.
 *
 * For the cron (wired separately), so orders taken while mail was down get
 * their confirmation once it is back without anyone pressing Resend on each.
 * Does nothing while mail only logs. The window keeps a years-old order from
 * getting a surprise confirmation when mail is first switched on.
 *
 * Cancelled orders and orders refunded in full are left alone: a receipt for
 * an order that has already been undone confirms nothing, and would only tell
 * the buyer they had been charged again. The cron's sweep for confirmations
 * that were never attempted (src/lib/ops/sweep.ts) skips the same two.
 *
 * Returns how many orders it tried.
 */
export async function retryUndeliveredConfirmations(
  { days = 14, limit = 50 }: { days?: number; limit?: number } = {},
): Promise<number> {
  if (!getMailProvider().delivers) {
    return 0;
  }

  const pending = await query<{ order_id: string }>(
    `select l.order_id
       from email_log l
       join "order" o on o.id = l.order_id
      where l.template = 'order-confirmation'
        and l.status in ('not-delivered', 'failed')
        and o.placed_at > now() - make_interval(days => $1::int)
        and o.status <> 'cancelled'
        and o.refund_status <> 'full'
        and not exists (
          select 1 from email_log s
           where s.order_id = l.order_id
             and s.template = 'order-confirmation'
             and s.status = 'sent'
        )
      group by l.order_id
      order by min(l.created_at)
      limit $2`,
    [days, limit],
  );

  for (const row of pending) {
    await ensureOrderConfirmationSent(row.order_id);
  }

  return pending.length;
}
