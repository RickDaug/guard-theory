import type Stripe from "stripe";
import { query } from "../db/client.ts";
import { stripe, isStripeConfigured } from "../stripe/client.ts";
import { fulfilCheckoutSession } from "./fulfil.ts";
import { ensureOrderConfirmationSent } from "./confirmation.ts";
import { applyRefundFromCharge } from "./refund.ts";

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
 * cheap enough to run every fifteen minutes, which vercel.json does.
 *
 * It goes through `fulfilCheckoutSession`, the same function the webhook uses,
 * so a reconciled order is indistinguishable from a normal one except for the
 * flag that says a human should glance at it. Safe to run repeatedly: the
 * unique constraint on stripe_session_id is the guard.
 */

export type ReconcileReport = {
  scanned: number;
  /**
   * Sessions left for a later run because they are younger than
   * RECONCILE_MIN_SESSION_AGE_MINUTES: the webhook is still expected.
   */
  deferred?: number;
  created: number;
  alreadyRecorded: number;
  skipped: { sessionId: string; reason: string }[];
  /** True when a bound stopped the walk early. The next run starts again from the top. */
  truncated?: boolean;
  /** The refund pass that follows the session walk. See reconcileRefunds. */
  refunds?: RefundReconcileReport;
};

export type RefundReconcileReport = {
  /** Refunds listed from Stripe. */
  scanned: number;
  /** Payments whose running refunded total was applied to an order or an unfulfilled payment. */
  synced: number;
  /** Payments with a refund and no row of ours yet. Tried again on the next run. */
  unmatched: number;
  /** The error's name when listing refunds failed. The session walk's results still stand. */
  failed?: string;
  truncated?: boolean;
};

/**
 * Bounds, for a caller with a clock running against it.
 *
 * The portal button and the script walk everything. The scheduled run
 * (src/lib/orders/cron.ts) is inside a serverless function with a maxDuration,
 * and a function killed mid-walk reports nothing at all — so it stops itself
 * first and says so. Stopping early loses nothing: every session is
 * independent, newest first, and the next run starts from the top.
 *
 * `client` exists so a test can hand in a list of sessions instead of Stripe.
 */
export type ReconcileOptions = {
  /** Epoch milliseconds after which no further session or refund is started. */
  deadlineMs?: number;
  maxSessions?: number;
  maxRefunds?: number;
  client?: ReconcileClient;
  /** Defaults to RECONCILE_MIN_SESSION_AGE_MINUTES. Tests pass 0. */
  minSessionAgeMinutes?: number;
};

/**
 * How old a session must be before the reconciler will fulfil it.
 *
 * The reconciler and the webhook race for every session paid while a run is
 * going. The reconciler winning by a few seconds used to flag a perfectly
 * normal order `reconciled` — "recovered because the webhook never delivered
 * it" — which was false, and trained the owner to ignore the flag. A Checkout
 * Session expires about 32 minutes after it is created (sessionExpiresAt in
 * src/lib/stripe/checkout.ts), so one older than this is either paid or never
 * will be, and a webhook for it has had minutes to arrive. Nothing waits longer
 * than one extra fifteen-minute run for it.
 */
export const RECONCILE_MIN_SESSION_AGE_MINUTES = 35;

/** The two list calls the reconciler makes: all of Stripe it touches. */
export type ReconcileClient = {
  checkout: { sessions: Pick<Stripe["checkout"]["sessions"], "list"> };
  refunds: Pick<Stripe["refunds"], "list">;
};

const pastBound = (options: { deadlineMs?: number }, count: number, max?: number) =>
  (options.deadlineMs !== undefined && Date.now() >= options.deadlineMs) ||
  (max !== undefined && count >= max);

export async function reconcileStripeSessions(
  lookbackHours = 72,
  options: ReconcileOptions = {},
): Promise<ReconcileReport> {
  const report: ReconcileReport = { scanned: 0, created: 0, alreadyRecorded: 0, skipped: [] };

  if (!isStripeConfigured()) {
    report.skipped.push({ sessionId: "-", reason: "Stripe is not configured" });
    return report;
  }

  const since = Math.floor(Date.now() / 1000) - lookbackHours * 60 * 60;
  const minAge = options.minSessionAgeMinutes ?? RECONCILE_MIN_SESSION_AGE_MINUTES;
  const youngest = Math.floor(Date.now() / 1000) - minAge * 60;

  const client = options.client ?? stripe();

  for await (const session of client.checkout.sessions.list({
    status: "complete",
    created: { gte: since, lte: youngest },
    limit: 100,
  })) {
    if (pastBound(options, report.scanned, options.maxSessions)) {
      report.truncated = true;
      break;
    }

    report.scanned += 1;

    // Stripe filters on `lte` already; checked here too so the rule holds for
    // any client, and so the report can say what was left for later.
    if (typeof session.created === "number" && session.created > youngest) {
      report.deferred = (report.deferred ?? 0) + 1;
      continue;
    }

    if (session.payment_status === "unpaid") {
      continue;
    }

    try {
      const result = await fulfilCheckoutSession(session, { flagAs: "reconciled" });

      if (result.outcome === "created") {
        report.created += 1;

        // The customer never got a confirmation, because the webhook that
        // would have sent it never ran. Send it now.
        await ensureOrderConfirmationSent(result.orderId);

        console.log(
          `[guard-theory] reconciled order ${result.orderNumber} from ${session.id}` +
            (result.oversold ? " (FLAGGED: oversold)" : ""),
        );
      } else if (result.outcome === "already-recorded") {
        report.alreadyRecorded += 1;
      } else if (result.outcome === "unfulfilled") {
        // Paid, and still no order. Already written to unfulfilled_payment by
        // fulfilCheckoutSession; said again here so the report cannot be read
        // as "nothing to do".
        report.skipped.push({
          sessionId: session.id,
          reason: `PAID with no order (${result.reason}) — listed under Needs you`,
        });
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

  // After the sessions, on purpose: an order this walk has just created is one
  // a refund may already be waiting for.
  report.refunds = await reconcileRefunds(lookbackHours, { ...options, client });

  if (report.refunds.truncated) {
    report.truncated = true;
  }

  return report;
}

/**
 * Catching the refunds the webhook missed.
 *
 * `charge.refunded` is the only thing that tells us about a refund made in the
 * Stripe dashboard, and it can be missed the way any webhook can — or arrive
 * before its order exists, be retried for three days, and run out. The order
 * then says "not refunded" and the owner ships it. This lists recent refunds,
 * reads each charge's running `amount_refunded` (expanded, so it is one list
 * call rather than one per refund), and applies it through the same monotonic
 * update the webhook uses. Applying a figure the row already has changes
 * nothing, so it is safe every fifteen minutes.
 *
 * "Recent" is when the REFUND was made, not the payment, so a refund of an old
 * order is caught as long as it happened inside the lookback.
 */
export async function reconcileRefunds(
  lookbackHours = 72,
  options: ReconcileOptions = {},
): Promise<RefundReconcileReport> {
  const report: RefundReconcileReport = { scanned: 0, synced: 0, unmatched: 0 };

  if (!options.client && !isStripeConfigured()) {
    return report;
  }

  const client = options.client ?? stripe();
  const since = Math.floor(Date.now() / 1000) - lookbackHours * 60 * 60;

  // Payment intent → the largest running total seen. Several refunds of one
  // charge all carry the same charge, so they collapse to one write.
  const totals = new Map<string, number>();

  try {
    for await (const refund of client.refunds.list({
      created: { gte: since },
      limit: 100,
      expand: ["data.charge"],
    })) {
      if (pastBound(options, report.scanned, options.maxRefunds)) {
        report.truncated = true;
        break;
      }

      report.scanned += 1;

      const charge = typeof refund.charge === "object" ? refund.charge : null;
      const intent = refund.payment_intent ?? charge?.payment_intent ?? null;
      const paymentIntent = typeof intent === "string" ? intent : intent?.id;

      if (!charge || !paymentIntent) {
        continue;
      }

      totals.set(paymentIntent, Math.max(totals.get(paymentIntent) ?? 0, charge.amount_refunded));
    }
  } catch (error) {
    // The name only: Stripe's messages quote request parameters.
    report.failed = error instanceof Error ? error.name : "unknown error";
    console.error(`[guard-theory] refund reconcile could not list refunds: ${report.failed}`);
  }

  for (const [paymentIntent, amountRefunded] of totals) {
    try {
      const outcome = await applyRefundFromCharge(paymentIntent, amountRefunded);

      if (outcome === "no-match") {
        report.unmatched += 1;
        console.warn(
          `[guard-theory] refund on ${paymentIntent} matches no order yet; will try again next run`,
        );
      } else {
        report.synced += 1;
      }
    } catch (error) {
      report.unmatched += 1;
      console.error(
        `[guard-theory] could not apply the refund on ${paymentIntent}: ` +
          (error instanceof Error ? error.name : "unknown error"),
      );
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
