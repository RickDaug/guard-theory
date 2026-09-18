import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import type { PoolClient } from "pg";
import { query, transaction } from "../db/client.ts";
import type { PricedLine } from "../cart/types.ts";
import { orderStripeMode, stripeMode } from "../stripe/client.ts";

/**
 * Turning a paid Checkout Session into an order.
 *
 * Called from two places — the webhook, and the reconciler that catches what
 * the webhook missed — and it must behave identically in both. Everything here
 * is written to be run more than once with the same session and produce one
 * order, once.
 *
 * See docs/commerce-plan.md §7 for why each guard is shaped the way it is.
 */

export type FulfilResult =
  | { outcome: "created"; orderId: string; orderNumber: number; oversold: boolean }
  | { outcome: "already-recorded"; orderId: string }
  /** Not paid. Nothing is owed to anyone, so nothing is recorded. */
  | { outcome: "ignored"; reason: string }
  /**
   * PAID, and no order could be made. Recorded in `unfulfilled_payment` before
   * this is returned, so the portal shows it; if that write fails this throws
   * instead, and the webhook answers 500 so Stripe tries again.
   */
  | { outcome: "unfulfilled"; reason: string };

type ShippingAddress = {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

/**
 * Pulls the shipping address out of a session.
 *
 * On current API versions this lives at `collected_information.shipping_details`.
 * Older versions put it at the top level, and a webhook endpoint pinned to an
 * older version than the SDK will silently yield undefined here — which does
 * not fail at checkout, it fails days later when a label cannot be bought. The
 * top-level path is read as a fallback so a version mismatch degrades instead
 * of losing the address, and it is logged loudly when that happens.
 */
type LegacyShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

export function readShippingAddress(session: Stripe.Checkout.Session): ShippingAddress | null {
  const collected: Stripe.Checkout.Session.CollectedInformation.ShippingDetails | null | undefined =
    session.collected_information?.shipping_details;

  // Not on the Session type at all in this SDK version — which is the point.
  // If it is present at runtime, the endpoint is pinned to an older API version
  // than the SDK and that is worth saying out loud rather than silently
  // returning null and failing at label time.
  const legacy = (session as unknown as { shipping_details?: LegacyShippingDetails })
    .shipping_details;

  if (!collected && legacy) {
    console.error(
      "[guard-theory] shipping address found only at the legacy top-level path. " +
        "Pin the Stripe webhook endpoint's API version to the SDK's — see src/lib/stripe/client.ts.",
    );
  }

  const details = collected ?? legacy;
  const address = details?.address;

  if (!details?.name || !address?.line1 || !address.city || !address.postal_code) {
    return null;
  }

  return {
    name: details.name,
    line1: address.line1,
    line2: address.line2 ?? null,
    city: address.city,
    state: address.state ?? "",
    postalCode: address.postal_code,
    country: address.country ?? "US",
  };
}

/**
 * How long an unprocessed claim is honoured before a retry may take it over.
 *
 * Longer than the webhook route's `maxDuration` (15s) with room to spare, so a
 * handler that is merely slow is never raced — and short enough that Stripe's
 * own retries, which back off over hours, will land after it.
 */
export const STALE_CLAIM_SECONDS = 60;

export type ClaimResult =
  /** This delivery owns the event and must handle it. */
  | "claimed"
  /** Already handled to completion. Answer 200 and do nothing. */
  | "processed"
  /** Another delivery claimed it recently and has not finished. Ask for a retry. */
  | "in-flight";

/**
 * Claims a webhook event.
 *
 * The primary key is the lock. Two concurrent deliveries of the same event
 * serialise on the unique index; the loser sees the conflict and does not get
 * the row. A read-then-write check has a race in the middle of it and this
 * does not.
 *
 * WHAT IT USED TO GET WRONG: the claim row is written BEFORE the work. If the
 * function then died — timeout, crash, a release that itself failed — the row
 * stayed with `processed_at` null for ever and every one of Stripe's retries
 * was answered "duplicate, 200". Charged, no order, no email, and nothing left
 * to retry. So an unprocessed claim older than STALE_CLAIM_SECONDS is taken
 * over in the same atomic statement, and a fresh unprocessed one is reported
 * as in-flight so the caller can ask Stripe to come back, rather than telling
 * it the event was handled when nobody knows that yet.
 */
export async function claimEvent(
  id: string,
  type: string,
  source = "stripe",
): Promise<ClaimResult> {
  const rows = await query<{ id: string }>(
    `insert into webhook_event (id, source, type) values ($1, $2, $3)
     on conflict (id) do update set received_at = now()
       where webhook_event.processed_at is null
         and webhook_event.received_at < now() - make_interval(secs => $4)
     returning id`,
    [id, source, type, STALE_CLAIM_SECONDS],
  );

  if (rows.length > 0) return "claimed";

  const existing = await query<{ processed: boolean }>(
    "select processed_at is not null as processed from webhook_event where id = $1",
    [id],
  );

  // No row at all means it was released between the two statements: the next
  // delivery will claim it cleanly, so ask for one.
  return existing[0]?.processed ? "processed" : "in-flight";
}

export async function markEventProcessed(id: string): Promise<void> {
  await query("update webhook_event set processed_at = now() where id = $1", [id]);
}

/** Releases a claim so Stripe's retry can have another go. */
export async function releaseEvent(id: string): Promise<void> {
  await query("delete from webhook_event where id = $1 and processed_at is null", [id]);
}

/**
 * Decrements stock for one line, atomically.
 *
 * One statement, so two racing webhooks serialise on the row lock and there is
 * no read-then-write window to lose. Zero rows back means the unit is gone.
 */
async function decrementStock(
  client: PoolClient,
  variantId: string,
  quantity: number,
): Promise<boolean> {
  const result = await client.query(
    `update variant set stock = stock - $2
      where id = $1 and stock >= $2
      returning stock`,
    [variantId, quantity],
  );
  return (result.rowCount ?? 0) > 0;
}

/**
 * Writes down a payment that could not become an order.
 *
 * Money was taken. Whatever went wrong on our side, the one outcome that is
 * never acceptable is that nobody finds out — so this row exists before the
 * caller is allowed to tell Stripe the event was handled. Upserts on the
 * session id: the webhook and the reconciler will both find the same session.
 */
export async function recordUnfulfilledPayment(
  session: Stripe.Checkout.Session,
  reason: string,
): Promise<void> {
  await query(
    `insert into unfulfilled_payment (
       id, stripe_session_id, stripe_payment_intent, stripe_mode, reason,
       amount_total_cents, currency, email
     )
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     on conflict (stripe_session_id) do update set
       last_seen_at = now(),
       reason = excluded.reason`,
    [
      randomUUID(),
      session.id,
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
      stripeMode(),
      reason,
      session.amount_total ?? null,
      session.currency ? session.currency.toUpperCase() : null,
      (session.customer_details?.email ?? session.customer_email ?? null)?.toLowerCase() ?? null,
    ],
  );

  console.error(
    `[guard-theory] PAID session ${session.id} could not become an order (${reason}). ` +
      "Recorded for the portal under Needs you.",
  );
}

async function unfulfilled(
  session: Stripe.Checkout.Session,
  reason: string,
): Promise<FulfilResult> {
  // An order may already exist for this session — a replay of an event whose
  // intent has since been cleaned up, say. That is not an unfulfilled payment.
  const existing = await query<{ id: string }>(
    `select id from "order" where stripe_session_id = $1`,
    [session.id],
  );

  if (existing[0]) {
    return { outcome: "already-recorded", orderId: existing[0].id };
  }

  await recordUnfulfilledPayment(session, reason);
  return { outcome: "unfulfilled", reason };
}

export async function fulfilCheckoutSession(
  session: Stripe.Checkout.Session,
  options: { flagAs?: "reconciled" } = {},
): Promise<FulfilResult> {
  if (session.payment_status === "unpaid") {
    // Stripe's own guard. A completed session is not necessarily a paid one.
    return { outcome: "ignored", reason: "payment_status is unpaid" };
  }

  const intentId = session.client_reference_id ?? session.metadata?.intent_id ?? null;

  if (!intentId) {
    return unfulfilled(session, "no intent reference");
  }

  const address = readShippingAddress(session);

  if (!address) {
    return unfulfilled(session, "no shipping address");
  }

  const email = session.customer_details?.email ?? session.customer_email ?? null;

  if (!email) {
    return unfulfilled(session, "no email");
  }

  const mode = orderStripeMode();

  const result = await transaction<FulfilResult | { outcome: "intent-missing" }>(async (client) => {
    // The unique constraint on stripe_session_id is what makes running this
    // twice — webhook and reconciler, or two deliveries — safe.
    const existing = await client.query<{ id: string }>(
      `select id from "order" where stripe_session_id = $1`,
      [session.id],
    );

    if (existing.rows.length > 0) {
      return { outcome: "already-recorded" as const, orderId: existing.rows[0]!.id };
    }

    const intent = await client.query<{
      lines_json: PricedLine[];
      shipping_cents: number;
      subtotal_cents: number;
    }>("select lines_json, shipping_cents, subtotal_cents from checkout_intent where id = $1", [
      intentId,
    ]);

    const snapshot = intent.rows[0];

    if (!snapshot) {
      // Decided outside the transaction: the record of it must not be rolled
      // back with anything, and there is nothing here to roll back.
      return { outcome: "intent-missing" as const };
    }

    const lines = snapshot.lines_json;
    const orderId = randomUUID();

    // Stripe's totals are authoritative — they include the tax it calculated,
    // which we deliberately do not compute ourselves.
    const totalCents = session.amount_total ?? 0;
    const taxCents = session.total_details?.amount_tax ?? 0;
    const shippingCents = session.total_details?.amount_shipping ?? snapshot.shipping_cents;
    const subtotalCents = session.amount_subtotal ?? snapshot.subtotal_cents;

    const inserted = await client.query<{ id: string; number: string }>(
      `
      insert into "order" (
        id, status, email,
        ship_name, ship_line1, ship_line2, ship_city, ship_state, ship_postal, ship_country,
        phone, subtotal_cents, shipping_cents, tax_cents, total_cents, currency,
        stripe_session_id, stripe_payment_intent, stripe_mode, flagged_reason
      )
      values ($1, 'new', $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19)
      returning id, number
      `,
      [
        orderId,
        email.toLowerCase(),
        address.name,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
        session.customer_details?.phone ?? null,
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents,
        (session.currency ?? "usd").toUpperCase(),
        session.id,
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
        mode,
        options.flagAs ?? null,
      ],
    );

    let oversold = false;

    for (const line of lines) {
      await client.query(
        `
        insert into order_item (
          id, order_id, variant_id, product_name, product_kind,
          size_label, sku, unit_cents, quantity
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          randomUUID(),
          orderId,
          line.variantId,
          line.productName,
          line.productKind,
          line.sizeLabel,
          line.sku,
          line.unitCents,
          line.quantity,
        ],
      );

      const decremented = await decrementStock(client, line.variantId, line.quantity);

      if (!decremented) {
        // Payment succeeded after stock hit zero. The order still exists,
        // because money was taken and the buyer is owed either the goods or a
        // refund — and which of those is the owner's judgement, not the code's.
        oversold = true;
      }
    }

    if (oversold) {
      await client.query(`update "order" set flagged_reason = 'oversell' where id = $1`, [orderId]);
      console.error(
        `[guard-theory] order ${inserted.rows[0]!.number} oversold: paid after stock reached zero. ` +
          "Flagged for manual resolution in the portal.",
      );
    }

    await client.query("update checkout_intent set consumed_at = now() where id = $1", [intentId]);

    // If this session was earlier written down as paid-with-no-order, it has
    // one now.
    await client.query(
      `update unfulfilled_payment set resolved_at = now()
        where stripe_session_id = $1 and resolved_at is null`,
      [session.id],
    );

    return {
      outcome: "created" as const,
      orderId,
      orderNumber: Number(inserted.rows[0]!.number),
      oversold,
    };
  });

  if (result.outcome === "intent-missing") {
    return unfulfilled(session, "intent not found");
  }

  return result;
}
