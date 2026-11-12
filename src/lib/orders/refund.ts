import type { PoolClient } from "pg";
import { query, transaction } from "../db/client.ts";
import { stripe, isStripeConfigured } from "../stripe/client.ts";
import { restockOrderLines, type RestockOutcome } from "./restock.ts";

/**
 * Refunds.
 *
 * WHY WE KEEP OUR OWN COPY OF THE STATE
 *
 * Stripe is the source of truth for money moving. Our row is the source of
 * truth for what we told the customer, and for what the portal can render when
 * Stripe is slow or unreachable — an order list that makes an API call per row
 * is an order list that stops working on someone else's bad day.
 *
 * The two are reconciled by the `charge.refunded` webhook, so a refund issued
 * from the Stripe dashboard still lands here. Where they disagree, that is
 * information worth seeing rather than an error to paper over.
 */

export type RefundResult =
  | { ok: true; refundedCents: number; status: "partial" | "full" }
  | { ok: false; reason: string };

/**
 * A refund from the portal, and what it put back on the shelf.
 *
 * `restock` is null when nothing was asked of the shelf. `restockFailed` is
 * set when the money moved and the stock write then failed: the refund stands
 * (it is recorded, and it cannot be un-made), and the owner is told to set the
 * stock by hand rather than being shown an error for a refund that happened.
 */
export type PortalRefundResult =
  | {
      ok: true;
      refundedCents: number;
      status: "partial" | "full";
      restock: RestockOutcome | null;
      restockFailed: boolean;
    }
  | { ok: false; reason: string };

/** What actually moves the money. Injectable so the rest can be tested offline. */
export type CreateRefund = (input: {
  paymentIntent: string;
  amountCents: number;
  orderId: string;
  idempotencyKey: string;
}) => Promise<void>;

const createStripeRefund: CreateRefund = async (input) => {
  await stripe().refunds.create(
    {
      payment_intent: input.paymentIntent,
      amount: input.amountCents,
      reason: "requested_by_customer",
      metadata: { order_id: input.orderId },
    },
    { idempotencyKey: input.idempotencyKey },
  );
};

/**
 * What the owner is told when the request to Stripe did not come back with an
 * answer. It is the truth: we do not know. The retry advice is safe because
 * the idempotency key is derived from the order, the refunded figure on our
 * row (which an unknown outcome does not change) and the amount — so the same
 * amount from the portal is the same request, and Stripe answers it with the
 * refund it already made rather than making a second one. Stripe keeps a key
 * for 24 hours, which is why the advice says so.
 */
export const REFUND_OUTCOME_UNKNOWN =
  "Stripe did not answer in time, so the refund may or may not have gone through — " +
  "check the payment in the Stripe dashboard before trying again. Retrying the same amount " +
  "from here within 24 hours is safe: it repeats the same request and cannot refund twice. " +
  "Do not refund it again from the dashboard until you have checked.";

/**
 * Stripe's errors that mean the request was refused before any money moved.
 * Everything else — StripeConnectionError (timeouts included), StripeAPIError
 * (a 5xx), or something that is not a Stripe error at all — leaves the outcome
 * unknown, and is reported as unknown. Guessing "refused" is the direction
 * that causes a double refund.
 *
 * StripeIdempotencyError is deliberately NOT a refusal: the SDK retries a
 * timed-out request with the same key, and if the first attempt is still being
 * processed Stripe answers the retry with a 409 idempotency error — while the
 * refund it is holding may well succeed.
 */
const DEFINITE_REFUSALS = new Set([
  "StripeCardError",
  "StripeInvalidRequestError",
  "StripeAuthenticationError",
  "StripePermissionError",
  "StripeRateLimitError",
]);

export function refundOutcomeUnknown(error: unknown): boolean {
  const type =
    typeof error === "object" && error !== null && "type" in error
      ? (error as { type: unknown }).type
      : undefined;

  return !(typeof type === "string" && DEFINITE_REFUSALS.has(type));
}

export type RefundOptions = {
  /**
   * What the portal page showed as already refunded when the form was
   * rendered. If the order has moved on since — a double-click, a second tab, a
   * refund made in the Stripe dashboard — the request is refused rather than
   * applied to a figure the owner was not looking at.
   */
  expectedRefundedCents?: number;
  createRefund?: CreateRefund;
  /**
   * For an order that has SHIPPED: which lines go back in stock, by order_item
   * id, and how many. The owner ticks these after the return has arrived and
   * been checked; nothing is restocked that was not ticked (owner decision 6).
   * Refused on an order that has not shipped — there, a full refund puts
   * everything back on its own and a part refund puts nothing back.
   */
  restock?: ReadonlyMap<string, number>;
};

/**
 * Statuses in which the parcel has not left: stock is still on the shelf.
 * `cancelled` is here for orders cancelled before cancel.ts existed, which
 * kept both the money and the stock; a full refund of one of those puts the
 * stock back too. An order cancelled since has had its stock put back
 * already, and restocked_quantity stops it going back twice.
 */
const UNSHIPPED = new Set(["new", "in_process", "cancelled"]);
/** Why a disputed payment cannot be refunded from here. */
export const REFUND_REFUSED_DISPUTE = {
  open:
    "The buyer's bank has disputed this payment, and Stripe will not refund a payment while it is disputed. Nothing was refunded. Answer the dispute in the Stripe dashboard; once it is decided you can refund or cancel here.",
  lost:
    "The buyer's bank already returned this payment to them through a chargeback that was lost, so there is nothing left to refund. Nothing was refunded. If the order has not shipped, cancel it to put the stock back.",
} as const;

/** Statuses in which the parcel has gone: stock comes back only by hand. */
const SHIPPED = new Set(["shipped", "delivered"]);

export async function refundOrder(
  orderId: string,
  amountCents?: number,
  options: RefundOptions = {},
): Promise<PortalRefundResult> {
  const wantsRestock = options.restock !== undefined && [...options.restock.values()].some((n) => n > 0);

  // One transaction, with the order row locked for the whole of it. It used to
  // be read, call Stripe, write — with nothing held in between, so two requests
  // both read "nothing refunded yet" and the second write overwrote the first.
  // The lock is held across the Stripe call on purpose: the `charge.refunded`
  // webhook for this very refund queues behind it and then agrees with it.
  // Everything inside uses `client`; the pool has one connection and asking it
  // for another from in here would wait for ever.
  return transaction<PortalRefundResult>(async (client) => {
    // Locked before anything is decided, so the status the restock rule reads
    // is the status the refund is made against.
    const locked = await client.query<{
      status: string;
      dispute_status: string | null;
      label_in_flight: boolean;
    }>(
      `select status, dispute_status,
              (label_claimed_at is not null and tracking_number is null) as label_in_flight
         from "order" where id = $1 for update`,
      [orderId],
    );
    const status = locked.rows[0]?.status;

    // A full refund of an unshipped order puts its stock back. While a label
    // is being bought nobody knows whether the parcel is about to go, so the
    // stock cannot be put back yet — the same rule a cancel has (cancel.ts).
    if (status !== undefined && UNSHIPPED.has(status) && locked.rows[0]!.label_in_flight) {
      return {
        ok: false,
        reason:
          "A label is being bought for this order, or a purchase was started and never finished. " +
          "Nothing was refunded. Reload in a moment; if the page asks you to look in Shippo, do that first.",
      };
    }

    // Stripe refuses to refund a charge that has been charged back
    // (charge_disputed). Said plainly, before asking it.
    const dispute = locked.rows[0]?.dispute_status;
    if (dispute === "open" || dispute === "lost") {
      return { ok: false, reason: REFUND_REFUSED_DISPUTE[dispute] };
    }

    if (wantsRestock && status !== undefined && !SHIPPED.has(status)) {
      return {
        ok: false,
        reason:
          "This order has not shipped, so its stock is still on the shelf. Nothing was refunded. " +
          "Refund it in full, or cancel it, and the stock goes back on its own.",
      };
    }

    const money = await refundWithin(client, orderId, amountCents, options);

    if (!money.ok) {
      return money;
    }

    // Money has moved and is recorded. What follows must not undo that record
    // if it fails, so it runs behind a savepoint.
    let restock: RestockOutcome | null = null;
    let restockFailed = false;
    const request =
      status !== undefined && UNSHIPPED.has(status) && money.status === "full"
        ? ("taken" as const)
        : wantsRestock
          ? options.restock!
          : null;

    if (request) {
      await client.query("savepoint restock");
      try {
        restock = await restockOrderLines(client, orderId, request);
        await client.query("release savepoint restock");
      } catch (error) {
        await client.query("rollback to savepoint restock");
        restockFailed = true;
        console.error(
          "[guard-theory] refund recorded but restock failed:",
          error instanceof Error ? error.message : error,
        );
      }
    }

    return { ...money, restock, restockFailed };
  });
}

/**
 * The money half of a refund, inside a transaction the caller owns.
 *
 * The order row is locked here (again, if the caller already has it — a
 * second `for update` in the same transaction is free). Shared by refundOrder
 * and by cancelOrder, so a cancel refunds by exactly the same rules, with the
 * same idempotency key and the same truthful answer when Stripe goes quiet.
 */
export async function refundWithin(
  client: PoolClient,
  orderId: string,
  amountCents: number | undefined,
  options: Pick<RefundOptions, "expectedRefundedCents" | "createRefund"> = {},
): Promise<RefundResult> {
  if (!options.createRefund && !isStripeConfigured()) {
    return { ok: false, reason: "Stripe is not configured, so nothing can be refunded." };
  }

  if (amountCents !== undefined && (!Number.isSafeInteger(amountCents) || amountCents <= 0)) {
    return { ok: false, reason: "Enter an amount greater than zero." };
  }

  const createRefund = options.createRefund ?? createStripeRefund;

  const found = await client.query<{
    stripe_payment_intent: string | null;
    total_cents: number;
    refunded_cents: number;
  }>(
    `select stripe_payment_intent, total_cents, refunded_cents
       from "order" where id = $1 for update`,
    [orderId],
  );

  const order = found.rows[0];

  if (!order) {
    return { ok: false, reason: "That order no longer exists." };
  }

  if (!order.stripe_payment_intent) {
    return {
      ok: false,
      reason: "This order has no payment on it, so there is nothing to refund.",
    };
  }

  if (
    options.expectedRefundedCents !== undefined &&
    options.expectedRefundedCents !== order.refunded_cents
  ) {
    return {
      ok: false,
      reason:
        "The refunded amount on this order changed after this page loaded, so nothing was refunded. Reload and check the figures first.",
    };
  }

  const remaining = order.total_cents - order.refunded_cents;

  if (remaining <= 0) {
    return { ok: false, reason: "This order has already been refunded in full." };
  }

  const amount = amountCents === undefined ? remaining : amountCents;

  if (amount > remaining) {
    // Stripe would refuse this too. Catching it here is a sentence rather
    // than an API error, and it stops a typo becoming a support conversation.
    return { ok: false, reason: "That is more than is left to refund on this order." };
  }

  try {
    await createRefund({
      paymentIntent: order.stripe_payment_intent,
      amountCents: amount,
      orderId,
      // Keyed on the order and the running total, so a genuine second
      // partial refund is still allowed and a replay of this one is not.
      idempotencyKey: `refund:${orderId}:${order.refunded_cents}:${amount}`,
    });
  } catch (error) {
    console.error(
      "[guard-theory] refund failed:",
      error instanceof Error ? error.message : error,
    );

    if (refundOutcomeUnknown(error)) {
      // A timeout, a dropped connection or a 5xx: Stripe may have accepted
      // the refund before the answer was lost. The row is left alone — the
      // charge.refunded webhook and reconcileRefunds() bring it in line if
      // the money did move — and the owner is told exactly that, because
      // "nothing has been refunded" here invited a second refund from the
      // dashboard.
      return { ok: false, reason: REFUND_OUTCOME_UNKNOWN };
    }

    return {
      ok: false,
      reason:
        "Stripe refused that refund. Nothing has been refunded — check the Stripe dashboard. " +
        "Stripe remembers a refused request for a day, so the same amount will be refused again " +
        "until then; a different amount, or the dashboard, is not affected.",
    };
  }

  const refundedCents = order.refunded_cents + amount;
  const status = refundedCents >= order.total_cents ? "full" : "partial";

  await client.query(
    `update "order"
        set refunded_cents = $2,
            refund_status = $3,
            refunded_at = now(),
            flagged_reason = coalesce(flagged_reason, 'refunded')
      where id = $1`,
    [orderId, refundedCents, status],
  );

  return { ok: true, refundedCents, status };
}

/** What a refund sync found to bring in line. */
export type RefundSyncOutcome =
  /** An order carries that payment intent, and now agrees with Stripe. */
  | "order"
  /** No order, but an unfulfilled payment does: its reason now says so. */
  | "unfulfilled"
  /** Neither. Nothing was written. */
  | "no-match";

/**
 * Brings our copy back in line with Stripe's.
 *
 * Called from the `charge.refunded` webhook and from reconcileRefunds, so a
 * refund issued in the Stripe dashboard rather than the portal still shows up
 * on the order — including one whose webhook was missed.
 *
 * `amount_refunded` on a charge only ever grows, but webhooks are not delivered
 * in order: the event for a first partial refund can arrive after the event for
 * the second. Written absolutely, the late one LOWERED the figure. greatest()
 * makes the update monotonic, so the order it arrives in stops mattering.
 * least() caps it at the order total: 0007 has a CHECK saying a refund cannot
 * exceed what was paid, and a webhook that violated it would be retried for
 * three days rather than recorded.
 *
 * Zero matching orders used to be silent success. It is not: the order may
 * simply not exist YET — its webhook failed, the reconciler creates it later
 * with refunded_cents = 0, and the portal shows an unrefunded order that the
 * owner then ships. So this says what it found, and the caller decides:
 * syncRefundFromCharge (the webhook) throws so Stripe retries;
 * reconcileRefunds counts it and tries again on its next run.
 */
export async function applyRefundFromCharge(
  paymentIntentId: string,
  amountRefundedCents: number,
): Promise<RefundSyncOutcome> {
  if (!Number.isSafeInteger(amountRefundedCents) || amountRefundedCents < 0) {
    throw new Error(`charge.refunded carried an unusable amount_refunded: ${amountRefundedCents}`);
  }

  const orders = await query<{ id: string }>(
    `update "order"
        set refunded_cents = least(greatest(refunded_cents, $2::integer), total_cents),
            refund_status = case
              when greatest(refunded_cents, $2::integer) >= total_cents then 'full'
              when greatest(refunded_cents, $2::integer) > 0 then 'partial'
              else 'none'
            end,
            -- Stamped only when the figure actually rises: a replayed or
            -- out-of-order event must not move the date of a refund it did
            -- not make. Every SET expression reads the row as it was.
            refunded_at = case
              when least(greatest(refunded_cents, $2::integer), total_cents) > refunded_cents then now()
              else refunded_at
            end,
            flagged_reason = case
              when $2::integer > 0 then coalesce(flagged_reason, 'refunded')
              else flagged_reason
            end
      where stripe_payment_intent = $1
      returning id`,
    [paymentIntentId, amountRefundedCents],
  );

  if (orders.length > 0) {
    return "order";
  }

  // Money taken with no order: the portal lists it under "Needs you", and the
  // owner deciding what to do about it needs to know Stripe has already
  // refunded some or all of it. There is no column for that, so it goes on the
  // reason the portal already prints. The note is replaced, not appended, so
  // repeats do not stack. recordUnfulfilledPayment rewrites the reason when
  // the reconciler sees the session again; reconcileRefunds runs after it in
  // the same pass and puts the note back.
  const payments = await query<{ id: string }>(
    `update unfulfilled_payment
        set reason = case
              when $2::integer > 0 then
                regexp_replace(reason, $3, '') || $4 || to_char($2::integer / 100.0, 'FM999999990.00')
                  || coalesce(' ' || currency, '')
              else reason
            end
      where stripe_payment_intent = $1
      returning id`,
    [paymentIntentId, amountRefundedCents, REFUNDED_NOTE_PATTERN, REFUNDED_NOTE],
  );

  return payments.length > 0 ? "unfulfilled" : "no-match";
}

const REFUNDED_NOTE = " — Stripe shows refunded: ";
/** Matches a note written above, so the next one replaces it. */
const REFUNDED_NOTE_PATTERN = " — Stripe shows refunded: .*$";

/**
 * The webhook's entry point. A refund for a payment we have no record of at
 * all THROWS, so the webhook releases its claim, answers 500, and Stripe
 * retries — by which time the reconciler has usually created the order, and
 * the retry lands on it. Marking it processed lost the refund for good.
 * (reconcileRefunds covers the case where Stripe's retries run out.)
 */
export async function syncRefundFromCharge(
  paymentIntentId: string,
  amountRefundedCents: number,
): Promise<void> {
  const outcome = await applyRefundFromCharge(paymentIntentId, amountRefundedCents);

  if (outcome === "no-match") {
    throw new Error(
      `refund for ${paymentIntentId} matches no order or unfulfilled payment yet; leaving it for a retry`,
    );
  }
}
