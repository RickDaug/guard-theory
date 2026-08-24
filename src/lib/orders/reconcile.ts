import { query } from "../db/client.ts";
import { stripe, isStripeConfigured } from "../stripe/client.ts";
import { fulfilCheckoutSession } from "./fulfil.ts";
import { sendEmail } from "../mail/index.ts";
import { orderConfirmation } from "../mail/templates.ts";
import { getOrder, getOrderItems, toEmailShape } from "./manage.ts";

/**
 * Catching what the webhook missed.
 *
 * A webhook endpoint that was down, a deploy that took the route out for
 * ninety seconds, an event Stripe gave up retrying after three days — any of
 * those leaves a customer who paid and an order that does not exist. This walks
 * recent paid Checkout Sessions and creates whatever is missing.
 *
 * WHY IT LISTS SESSIONS RATHER THAN EVENTS
 *
 * Stripe's events can be filtered by delivery failure, which is the tidier
 * query, but it needs you to know when the outage started, and events are only
 * kept for thirty days. Listing completed sessions and left-joining against our
 * own table needs no bookkeeping at all and finds gaps nobody noticed. It is
 * cheap enough to run nightly.
 *
 * It goes through `fulfilCheckoutSession`, the same function the webhook uses,
 * so a reconciled order is indistinguishable from a normal one except for the
 * flag that says a human should glance at it. Safe to run repeatedly: the
 * unique constraint on stripe_session_id is the guard.
 */

export type ReconcileReport = {
  scanned: number;
  created: number;
  alreadyRecorded: number;
  skipped: { sessionId: string; reason: string }[];
};

export async function reconcileStripeSessions(
  lookbackHours = 72,
): Promise<ReconcileReport> {
  const report: ReconcileReport = { scanned: 0, created: 0, alreadyRecorded: 0, skipped: [] };

  if (!isStripeConfigured()) {
    report.skipped.push({ sessionId: "-", reason: "Stripe is not configured" });
    return report;
  }

  const since = Math.floor(Date.now() / 1000) - lookbackHours * 60 * 60;

  for await (const session of stripe().checkout.sessions.list({
    status: "complete",
    created: { gte: since },
    limit: 100,
  })) {
    report.scanned += 1;

    if (session.payment_status === "unpaid") {
      continue;
    }

    try {
      const result = await fulfilCheckoutSession(session, { flagAs: "reconciled" });

      if (result.outcome === "created") {
        report.created += 1;

        // The customer never got a confirmation, because the webhook that
        // would have sent it never ran. Send it now.
        const order = await getOrder(result.orderId);

        if (order) {
          const items = await getOrderItems(order.id);
          await sendEmail(
            "order-confirmation",
            orderConfirmation(toEmailShape(order, items)),
            order.id,
          );
        }

        console.log(
          `[guard-theory] reconciled order ${result.orderNumber} from ${session.id}` +
            (result.oversold ? " (FLAGGED: oversold)" : ""),
        );
      } else if (result.outcome === "already-recorded") {
        report.alreadyRecorded += 1;
      } else {
        report.skipped.push({ sessionId: session.id, reason: result.reason });
      }
    } catch (error) {
      report.skipped.push({
        sessionId: session.id,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return report;
}

/** When reconciliation last ran, so the portal can say rather than imply. */
export async function recordReconcileRun(report: ReconcileReport): Promise<void> {
  await query(
    `insert into setting (key, value, updated_at) values ('last_reconcile', $1, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [JSON.stringify({ at: new Date().toISOString(), ...report })],
  );
}
