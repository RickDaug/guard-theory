import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { after, before, describe, it } from "node:test";

import {
  claimEvent,
  fulfilCheckoutSession,
  markEventProcessed,
  releaseEvent,
  STALE_CLAIM_SECONDS,
} from "../../src/lib/orders/fulfil.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The three guarantees the shop's correctness rests on, exercised against a
 * real Postgres rather than reasoned about.
 *
 *   1. The same Stripe event twice produces one order, once.
 *   2. Stock decrements atomically, so two buyers racing for the last unit
 *      resolve to one order and one honest sold-out.
 *   3. An oversell creates the order anyway and flags it, because the money
 *      was taken and the buyer is owed something.
 *
 * Runs where a database exists — CI, or `npm run db:local`. It SKIPS rather
 * than silently passing without one, because a test of idempotency that never
 * inserted anything is the guard that has only ever been green.
 */

const HAS_DB = isDatabaseConfigured();

// Stripe's own key prefixes decide the mode an order is recorded under, and
// fulfilCheckoutSession refuses to guess. A test-shaped key is enough.
process.env.STRIPE_SECRET_KEY ??= "sk_test_forTheOrderModeColumnOnly";

function session(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: `cs_test_${randomUUID()}`,
    payment_status: "paid",
    amount_total: 9600,
    amount_subtotal: 8900,
    currency: "usd",
    payment_intent: `pi_${randomUUID()}`,
    total_details: { amount_tax: 0, amount_shipping: 700 },
    customer_details: { email: "Buyer@Example.com", phone: null },
    collected_information: {
      shipping_details: {
        name: "Sam Fadda",
        address: {
          line1: "1 Test Street",
          line2: null,
          city: "Los Angeles",
          state: "CA",
          postal_code: "90015",
          country: "US",
        },
      },
    },
    ...overrides,
    // The fixture carries the fields fulfilCheckoutSession actually reads.
    // Casting through unknown rather than building a whole Session keeps the
    // test about behaviour instead of about Stripe's type surface.
  } as unknown as Stripe.Checkout.Session;
}

let productId: string;
let variantId: string;

async function makeIntent(quantity: number, stock: number): Promise<string> {
  await query("update variant set stock = $2 where id = $1", [variantId, stock]);

  const intentId = randomUUID();

  await query(
    `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
     values ($1, $2::jsonb, 8900, 700)`,
    [
      intentId,
      JSON.stringify([
        {
          variantId,
          quantity,
          slug: "fulfil-test",
          productName: "Fulfil Test",
          productKind: "Fixture",
          sizeLabel: "M",
          sku: `FULFIL-${intentId.slice(0, 8)}`,
          unitCents: 8900,
          lineCents: 8900 * quantity,
          stock,
        },
      ]),
    ],
  );

  return intentId;
}

describe("turning a paid session into an order", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  before(async () => {
    productId = randomUUID();
    variantId = randomUUID();

    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 8900, 'Fulfil Test', 'Fixture')`,
      [productId, `fulfil-test-${productId.slice(0, 8)}`],
    );

    await query(
      `insert into variant (id, product_id, size_label, sku, stock)
       values ($1, $2, 'M', $3, 5)`,
      [variantId, productId, `FULFIL-${productId.slice(0, 8)}`],
    );
  });

  after(async () => {
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  it("creates one order, and decrements stock by the quantity bought", async () => {
    const intentId = await makeIntent(2, 5);
    const paid = session({ client_reference_id: intentId });

    const result = await fulfilCheckoutSession(paid);

    assert.equal(result.outcome, "created");

    const stock = await query<{ stock: number }>("select stock from variant where id = $1", [
      variantId,
    ]);
    assert.equal(stock[0]!.stock, 3, "five minus two");

    const items = await query<{ quantity: number; unit_cents: number }>(
      "select quantity, unit_cents from order_item where order_id = $1",
      [result.outcome === "created" ? result.orderId : ""],
    );
    assert.equal(items[0]!.quantity, 2);
    assert.equal(items[0]!.unit_cents, 8900, "the price comes from our snapshot, not the client");
  });

  it("is idempotent: the same session twice is one order", async () => {
    const intentId = await makeIntent(1, 5);
    const paid = session({ client_reference_id: intentId });

    const first = await fulfilCheckoutSession(paid);
    const second = await fulfilCheckoutSession(paid);

    assert.equal(first.outcome, "created");
    assert.equal(second.outcome, "already-recorded", "a replay must not create a second order");

    const rows = await query<{ n: number }>(
      `select count(*)::int as n from "order" where stripe_session_id = $1`,
      [paid.id],
    );
    assert.equal(rows[0]!.n, 1);

    const stock = await query<{ stock: number }>("select stock from variant where id = $1", [
      variantId,
    ]);
    assert.equal(stock[0]!.stock, 4, "a replay must not decrement stock twice");
  });

  it("the webhook event ledger claims an id exactly once", async () => {
    const eventId = `evt_${randomUUID()}`;

    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "claimed");
    assert.equal(
      await claimEvent(eventId, "checkout.session.completed"),
      "in-flight",
      "the primary key is the lock; a second claim must lose while the first is fresh",
    );

    await markEventProcessed(eventId);
    assert.equal(
      await claimEvent(eventId, "checkout.session.completed"),
      "processed",
      "a processed event is a duplicate, however old",
    );

    await query("delete from webhook_event where id = $1", [eventId]);
  });

  it("a claim abandoned by a dead handler is taken over once it is stale", async () => {
    // The handler claimed the event and then died: no processed_at, no release.
    // This used to answer every one of Stripe's retries with "duplicate, 200".
    const eventId = `evt_${randomUUID()}`;
    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "claimed");

    const age = async (seconds: number) =>
      query("update webhook_event set received_at = now() - make_interval(secs => $2) where id = $1", [
        eventId,
        seconds,
      ]);

    await age(STALE_CLAIM_SECONDS - 5);
    assert.equal(
      await claimEvent(eventId, "checkout.session.completed"),
      "in-flight",
      "a slow handler inside the window must not be raced",
    );

    await age(STALE_CLAIM_SECONDS + 5);
    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "claimed");
    assert.equal(
      await claimEvent(eventId, "checkout.session.completed"),
      "in-flight",
      "taking a claim over refreshes it, so two retries cannot both take it",
    );

    // Age is no licence once the work is done.
    await markEventProcessed(eventId);
    await age(STALE_CLAIM_SECONDS * 100);
    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "processed");

    await query("delete from webhook_event where id = $1", [eventId]);
  });

  it("a released claim can be claimed again", async () => {
    const eventId = `evt_${randomUUID()}`;
    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "claimed");
    await releaseEvent(eventId);
    assert.equal(await claimEvent(eventId, "checkout.session.completed"), "claimed");
    await query("delete from webhook_event where id = $1", [eventId]);
  });

  it("oversell creates the order anyway, and flags it", async () => {
    // Money was taken. The buyer is owed either the garment or a refund, and
    // which of those is the owner's judgement rather than the code's.
    const intentId = await makeIntent(3, 1);
    const paid = session({ client_reference_id: intentId });

    const result = await fulfilCheckoutSession(paid);

    assert.equal(result.outcome, "created");
    assert.equal(result.outcome === "created" && result.oversold, true);

    const row = await query<{ flagged_reason: string | null }>(
      `select flagged_reason from "order" where stripe_session_id = $1`,
      [paid.id],
    );
    assert.equal(row[0]!.flagged_reason, "oversell");

    const stock = await query<{ stock: number }>("select stock from variant where id = $1", [
      variantId,
    ]);
    assert.equal(stock[0]!.stock, 1, "a failed decrement must leave stock untouched, never negative");
  });

  it("two buyers racing for the last unit resolve to one winner", async () => {
    const a = await makeIntent(1, 1);
    // makeIntent resets stock, so the second intent is written without touching it.
    const b = randomUUID();
    await query(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
       select $1, lines_json, subtotal_cents, shipping_cents from checkout_intent where id = $2`,
      [b, a],
    );

    const [first, second] = await Promise.all([
      fulfilCheckoutSession(session({ client_reference_id: a })),
      fulfilCheckoutSession(session({ client_reference_id: b })),
    ]);

    const oversold = [first, second].filter(
      (r) => r.outcome === "created" && r.oversold,
    ).length;

    assert.equal(oversold, 1, "exactly one of the two must lose the race");

    const stock = await query<{ stock: number }>("select stock from variant where id = $1", [
      variantId,
    ]);
    assert.equal(stock[0]!.stock, 0, "and stock lands honestly at zero, not at minus one");
  });

  it("refuses a session that was never paid", async () => {
    const intentId = await makeIntent(1, 5);
    const result = await fulfilCheckoutSession(
      session({ client_reference_id: intentId, payment_status: "unpaid" }),
    );

    assert.equal(result.outcome, "ignored");
  });

  it("refuses a session with no shipping address rather than inventing one", async () => {
    const intentId = await makeIntent(1, 5);
    const paid = session({ client_reference_id: intentId, collected_information: null });
    const result = await fulfilCheckoutSession(paid);

    // Still no order and still no invented address — but the payment is no
    // longer dropped on the floor: it was "ignored", and is now written down.
    assert.equal(result.outcome, "unfulfilled");

    const orders = await query(`select id from "order" where stripe_session_id = $1`, [paid.id]);
    assert.equal(orders.length, 0);

    const recorded = await query<{ reason: string }>(
      "select reason from unfulfilled_payment where stripe_session_id = $1",
      [paid.id],
    );
    assert.deepEqual(recorded.map((row) => row.reason), ["no shipping address"]);

    await query("delete from unfulfilled_payment where stripe_session_id = $1", [paid.id]);
  });
});
