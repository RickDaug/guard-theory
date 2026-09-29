import { query } from "../db/client.ts";
import { getMailProvider } from "../mail/index.ts";
import { ensureOrderConfirmationSent } from "../orders/confirmation.ts";

/**
 * The cron's housekeeping and its two mail catch-ups.
 */

/**
 * `webhook_event` is the ledger that stops an event being handled twice.
 * Stripe retries for three days and Shippo for less, so a processed row older
 * than that guards against nothing; ninety days keeps a generous trail for
 * reading back what happened. Unprocessed rows are never swept — those are
 * exactly the ones someone may need to look at.
 */
export const WEBHOOK_EVENT_RETENTION_DAYS = 90;

export async function sweepWebhookEvents(
  days: number = WEBHOOK_EVENT_RETENTION_DAYS,
): Promise<number> {
  const rows = await query<{ id: string }>(
    `delete from webhook_event
      where processed_at is not null
        and processed_at < now() - make_interval(days => $1::int)
      returning id`,
    [days],
  );
  return rows.length;
}

/**
 * How old a paid order must be before the cron decides its confirmation is
 * missing rather than still on its way. The webhook sends it after answering
 * Stripe; ten minutes is far past any send that is going to happen.
 */
export const MISSING_CONFIRMATION_MINUTES = 10;

/** Orders older than this are never mailed a surprise confirmation. */
export const CONFIRMATION_CATCH_UP_DAYS = 14;

/**
 * Orders that should have a confirmation and have NO record of one being tried.
 *
 * The retry sweep for undelivered confirmations reads email_log, so it cannot
 * see an order whose send never started — the function was killed after the
 * order committed and before the mail was attempted. Such an order has no
 * email_log row of any status. This is the query for those.
 *
 * Cancelled and fully refunded orders are left alone: a receipt for an order
 * that has already been undone is not a confirmation of anything.
 */
const MISSING_CONFIRMATIONS_SQL = `
  select o.id
    from "order" o
   where o.placed_at < now() - make_interval(mins => $1::int)
     and o.placed_at > now() - make_interval(days => $2::int)
     and o.status <> 'cancelled'
     and o.refund_status <> 'full'
     and not exists (
       select 1 from email_log l
        where l.order_id = o.id and l.template = 'order-confirmation'
     )
   order by o.placed_at
   limit $3`;

export async function listMissingConfirmations(limit = 50): Promise<string[]> {
  const rows = await query<{ id: string }>(MISSING_CONFIRMATIONS_SQL, [
    MISSING_CONFIRMATION_MINUTES,
    CONFIRMATION_CATCH_UP_DAYS,
    limit,
  ]);
  return rows.map((row) => row.id);
}

/**
 * Sends the confirmation for every order in listMissingConfirmations.
 *
 * Only while a provider actually delivers. Sending through the log-only
 * provider would write a row that says the confirmation was handled, and the
 * order would drop out of this query without the buyer ever hearing a thing.
 *
 * Goes through ensureOrderConfirmationSent — the one path every confirmation
 * takes, which checks for a sent row first and carries the provider's
 * idempotency key for the order — so a send that raced this one still
 * produces one email.
 *
 * Returns how many orders it tried.
 */
export async function sendMissingConfirmations(
  { limit = 50, delivers = () => getMailProvider().delivers }: {
    limit?: number;
    delivers?: () => boolean;
  } = {},
): Promise<number> {
  if (!delivers()) {
    return 0;
  }

  const ids = await listMissingConfirmations(limit);

  for (const id of ids) {
    await ensureOrderConfirmationSent(id);
  }

  return ids.length;
}

/**
 * Re-sends confirmations that were attempted and never went.
 *
 * `retryUndeliveredConfirmations` lives in src/lib/orders/confirmation.ts and
 * arrives with the change that records log-only mail as `not-delivered` (PR
 * #26). It is looked up rather than imported so this file builds on either
 * side of that merge: before it, there is nothing to call and this reports
 * null; after it, the cron calls it with no further change here.
 */
export async function retryUndeliveredConfirmations(): Promise<number | null> {
  const confirmation: Record<string, unknown> = await import("../orders/confirmation.ts");
  const retry = confirmation.retryUndeliveredConfirmations;

  if (typeof retry !== "function") {
    return null;
  }

  return (await retry()) as number;
}
