import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { after, before, describe, it, mock } from "node:test";
import { Client } from "pg";

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

// The races below need more than one connection at once, which PGlite (one
// socket, see AGENTS.md) cannot give. CI runs a real Postgres; there the pool
// is widened so two fulfilments in this process genuinely overlap instead of
// queueing on a single client and passing by accident.
const REAL_PG = HAS_DB && process.env.CI === "true";

if (REAL_PG) {
  process.env.DATABASE_POOL_MAX ??= "4";
}

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
/** A second size, for orders with more than one line. */
let otherVariantId: string;

/** An intent over any lines, leaving stock alone. */
async function makeIntentWith(
  lines: Array<{ variantId: string; quantity: number }>,
): Promise<string> {
  const intentId = randomUUID();

  await query(
    `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
     values ($1, $2::jsonb, 8900, 700)`,
    [
      intentId,
      JSON.stringify(
        lines.map((line, index) => ({
          variantId: line.variantId,
          quantity: line.quantity,
          slug: "fulfil-test",
          productName: "Fulfil Test",
          productKind: "Fixture",
          sizeLabel: index === 0 ? "M" : "L",
          sku: `FULFIL-${intentId.slice(0, 8)}-${index}`,
          unitCents: 8900,
          lineCents: 8900 * line.quantity,
          stock: 5,
        })),
      ),
    ],
  );

  return intentId;
}

const stockOf = async (id: string) =>
  (await query<{ stock: number }>("select stock from variant where id = $1", [id]))[0]!.stock;

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

    otherVariantId = randomUUID();
    await query(
      `insert into variant (id, product_id, size_label, sku, stock)
       values ($1, $2, 'L', $3, 5)`,
      [otherVariantId, productId, `FULFIL-${productId.slice(0, 8)}-L`],
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

  it("stamps the order's mode from the event's livemode, not from the key", async () => {
    // During a key swap the webhook secret and the secret key are changed by
    // hand, one after the other. A live payment verified while the key is still
    // sk_test_ was recorded as a test order: hidden from real totals, treated
    // as a rehearsal. The event says which it is; believe the event.
    const quiet = mock.method(console, "error", () => {});

    try {
      const live = session({ client_reference_id: await makeIntent(1, 5), livemode: true });
      assert.equal((await fulfilCheckoutSession(live)).outcome, "created");

      const liveRow = await query<{ stripe_mode: string }>(
        `select stripe_mode from "order" where stripe_session_id = $1`,
        [live.id],
      );
      assert.equal(liveRow[0]!.stripe_mode, "live", "a live payment is a live order, whatever the key says");
      assert.ok(
        quiet.mock.calls.some((call) => String(call.arguments[0]).includes("mode-mismatch")),
        "the disagreement is said out loud",
      );

      // And the other way round: a test event arriving after the key went live.
      const savedKey = process.env.STRIPE_SECRET_KEY;
      // Assembled, so push protection does not read a fixture as a leaked key.
      process.env.STRIPE_SECRET_KEY = ["sk", "live", "fixtureNoNetworkCallsAreMadeWithThis"].join("_");

      try {
        const rehearsal = session({ client_reference_id: await makeIntent(1, 5), livemode: false });
        assert.equal((await fulfilCheckoutSession(rehearsal)).outcome, "created");

        const testRow = await query<{ stripe_mode: string }>(
          `select stripe_mode from "order" where stripe_session_id = $1`,
          [rehearsal.id],
        );
        assert.equal(testRow[0]!.stripe_mode, "test", "a test event must never be counted as revenue");
      } finally {
        process.env.STRIPE_SECRET_KEY = savedKey;
      }

      // A payment that cannot become an order carries the event's mode too.
      const orphan = session({
        client_reference_id: await makeIntent(1, 5),
        livemode: true,
        collected_information: null,
      });
      assert.equal((await fulfilCheckoutSession(orphan)).outcome, "unfulfilled");

      const orphanRow = await query<{ stripe_mode: string }>(
        "select stripe_mode from unfulfilled_payment where stripe_session_id = $1",
        [orphan.id],
      );
      assert.equal(orphanRow[0]!.stripe_mode, "live");
      await query("delete from unfulfilled_payment where stripe_session_id = $1", [orphan.id]);
    } finally {
      quiet.mock.restore();
    }
  });

  it("an intent paid twice is written down for a refund, not made into a second order", async () => {
    // Two tabs, two Checkout Sessions a minute apart, one cart. Both can be
    // paid. The second used to become a second, unflagged order that took the
    // stock again; nothing told the owner the buyer had been charged twice.
    const quiet = mock.method(console, "error", () => {});

    try {
      const intentId = await makeIntent(1, 5);
      const first = session({ client_reference_id: intentId });
      const second = session({ client_reference_id: intentId });

      assert.equal((await fulfilCheckoutSession(first)).outcome, "created");
      const again = await fulfilCheckoutSession(second);

      assert.equal(again.outcome, "unfulfilled");
      assert.equal(
        (await query(`select id from "order" where stripe_session_id = $1`, [second.id])).length,
        0,
      );
      assert.equal(await stockOf(variantId), 4, "the cart's stock is taken once");

      const recorded = await query<{ reason: string; stripe_payment_intent: string }>(
        "select reason, stripe_payment_intent from unfulfilled_payment where stripe_session_id = $1",
        [second.id],
      );
      assert.equal(recorded.length, 1, "the portal lists it under Needs you");
      assert.match(recorded[0]!.reason, /^duplicate payment/);
      assert.equal(recorded[0]!.stripe_payment_intent, second.payment_intent);

      // A replay of the FIRST session is still just a replay.
      assert.equal((await fulfilCheckoutSession(first)).outcome, "already-recorded");

      await query("delete from unfulfilled_payment where stripe_session_id = $1", [second.id]);
    } finally {
      quiet.mock.restore();
    }
  });

  it(
    "two sessions for one intent, paid at once, make one order and one refund",
    { skip: !REAL_PG && "needs a real Postgres (CI)" },
    async () => {
      const quiet = mock.method(console, "error", () => {});

      try {
        const intentId = await makeIntent(1, 5);
        const a = session({ client_reference_id: intentId });
        const b = session({ client_reference_id: intentId });

        const outcomes = (await Promise.all([fulfilCheckoutSession(a), fulfilCheckoutSession(b)]))
          .map((r) => r.outcome)
          .sort();

        assert.deepEqual(outcomes, ["created", "unfulfilled"]);
        assert.equal(await stockOf(variantId), 4);
        await query("delete from unfulfilled_payment where stripe_session_id in ($1, $2)", [
          a.id,
          b.id,
        ]);
      } finally {
        quiet.mock.restore();
      }
    },
  );

  it(
    "the webhook and the reconciler racing on one session make one order and no error",
    { skip: !REAL_PG && "needs a real Postgres (CI)" },
    async () => {
      // All pass the "is there an order yet" read; the losers used to hit the
      // unique index on stripe_session_id and surface as a 500.
      const intentId = await makeIntent(1, 5);
      const paid = session({ client_reference_id: intentId });

      const results = await Promise.all([
        fulfilCheckoutSession(paid),
        fulfilCheckoutSession(paid, { flagAs: "reconciled" }),
        fulfilCheckoutSession(paid),
      ]);

      assert.deepEqual(results.map((r) => r.outcome).sort(), [
        "already-recorded",
        "already-recorded",
        "created",
      ]);
      assert.equal(await stockOf(variantId), 4);
    },
  );

  it(
    "takes stock locks in one order, so two carts with the same sizes cannot deadlock",
    { skip: !REAL_PG && "needs a real Postgres (CI)" },
    async () => {
      // Two multi-line orders naming the same sizes in opposite orders used to
      // lock the rows in cart order: each held one and waited on the other, and
      // Postgres killed one with a deadlock (a 500, and a retry). Reproduced
      // deterministically: another transaction holds the lower id, the order is
      // written high-then-low, and the other transaction then asks for the high.
      const [low, high] = [variantId, otherVariantId].sort() as [string, string];
      await query("update variant set stock = 5 where id = any($1)", [[low, high]]);

      const intentId = await makeIntentWith([
        { variantId: high, quantity: 1 },
        { variantId: low, quantity: 1 },
      ]);

      const other = new Client({ connectionString: process.env.DATABASE_URL });
      await other.connect();

      try {
        await other.query("begin");
        await other.query("update variant set stock = stock where id = $1", [low]);

        let settled: string | null = null;
        const fulfilment = fulfilCheckoutSession(session({ client_reference_id: intentId })).then(
          (result) => {
            settled = `resolved ${result.outcome}`;
            return result;
          },
          (error: unknown) => {
            settled = `rejected: ${error instanceof Error ? error.message : String(error)}`;
            throw error;
          },
        );

        // Wait until the fulfilment is parked behind the row this connection holds.
        for (let tries = 0; ; tries += 1) {
          const blocked = await other.query<{ n: number; queries: string | null }>(
            `select count(*)::int as n, string_agg(query, ' | ') as queries
               from pg_stat_activity
              where pg_backend_pid() = any(pg_blocking_pids(pid))`,
          );
          if (blocked.rows[0]!.n > 0) break;
          assert.ok(
            tries < 200 && settled === null,
            `the fulfilment never queued behind the held row (${settled ?? "still running"})`,
          );
          await new Promise((resolve) => setTimeout(resolve, 25));
        }

        // Sorted: the fulfilment holds nothing yet, so this is granted at once.
        // Unsorted: it already holds `high`, and this is the deadlock.
        await other.query("update variant set stock = stock where id = $1", [high]);
        await other.query("commit");

        const result = await fulfilment;
        assert.equal(result.outcome, "created");
        assert.equal(await stockOf(low), 4);
        assert.equal(await stockOf(high), 4);
      } finally {
        await other.query("rollback").catch(() => {});
        await other.end();
      }
    },
  );

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
