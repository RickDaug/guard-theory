import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { after, before, beforeEach, describe, it } from "node:test";

import {
  CRON_SECRET_MIN_LENGTH,
  type CronDeps,
  handleReconcileCron,
  isAuthorisedCron,
} from "../../src/lib/orders/cron.ts";
import {
  type ReconcileOptions,
  reconcileRefunds,
  reconcileStripeSessions,
} from "../../src/lib/orders/reconcile.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The scheduled reconciler: who may call it, what it does when nothing is set
 * up yet, and that it really is the same reconciler.
 *
 * Stripe is never asked. The walk is given a stand-in client that yields
 * fixture sessions, which is the only part of Stripe `reconcileStripeSessions`
 * touches. No mail provider is configured, so a confirmation is logged, not
 * sent.
 */

const HAS_DB = isDatabaseConfigured();
const SECRET = "cron-test-secret-that-is-long-enough-0123456789";

process.env.STRIPE_SECRET_KEY ??= "sk_test_forTheOrderModeColumnOnly";
delete process.env.RESEND_API_KEY;

function call(authorization?: string): Request {
  return new Request("https://guardtheory.test/api/cron/reconcile", {
    headers: authorization ? { authorization } : {},
  });
}

/** Every dependency is a trap unless a test says otherwise. */
function traps(calls: string[]): CronDeps {
  const note =
    <T>(name: string, value: T) =>
    async () => {
      calls.push(name);
      return value;
    };

  return {
    reconcile: note("reconcile", { scanned: 0, created: 0, alreadyRecorded: 0, skipped: [] }),
    record: note("record", undefined),
    purgeIntents: note("purgeIntents", 0),
    sweepAttempts: note("sweepAttempts", 0),
    sweepSessions: note("sweepSessions", 0),
    stripeConfigured: () => true,
    databaseConfigured: () => true,
  };
}

describe("who may run the scheduled reconciler", () => {
  beforeEach(() => {
    process.env.CRON_SECRET = SECRET;
  });

  after(() => {
    delete process.env.CRON_SECRET;
  });

  it("refuses a request with no Authorization header, and does nothing", async () => {
    const calls: string[] = [];
    const response = await handleReconcileCron(call(), traps(calls));

    assert.equal(response.status, 401);
    assert.deepEqual(calls, []);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  });

  it("refuses the wrong secret, a near miss, and the secret without 'Bearer'", async () => {
    for (const header of [
      "Bearer wrong",
      `Bearer ${SECRET}x`,
      `Bearer ${SECRET.slice(0, -1)}`,
      SECRET,
      `bearer ${SECRET}`,
    ]) {
      const calls: string[] = [];
      const response = await handleReconcileCron(call(header), traps(calls));

      assert.equal(response.status, 401, header);
      assert.deepEqual(calls, [], header);
    }
  });

  it("refuses EVERYONE when CRON_SECRET is unset — 'Bearer undefined' included", async () => {
    delete process.env.CRON_SECRET;

    for (const header of [undefined, "Bearer ", "Bearer undefined", "Bearer null"]) {
      const calls: string[] = [];
      const response = await handleReconcileCron(call(header), traps(calls));

      assert.equal(response.status, 401, String(header));
      assert.deepEqual(calls, []);
    }
  });

  it("refuses a secret that is too short even when the caller knows it", async () => {
    const short = "x".repeat(CRON_SECRET_MIN_LENGTH - 1);
    process.env.CRON_SECRET = short;

    assert.equal(isAuthorisedCron(`Bearer ${short}`), false);

    const calls: string[] = [];
    const response = await handleReconcileCron(call(`Bearer ${short}`), traps(calls));
    assert.equal(response.status, 401);
    assert.deepEqual(calls, []);
  });

  it("accepts the right secret", () => {
    assert.equal(isAuthorisedCron(`Bearer ${SECRET}`), true);
  });
});

describe("what an authorised run does", () => {
  before(() => {
    process.env.CRON_SECRET = SECRET;
  });

  after(() => {
    delete process.env.CRON_SECRET;
  });

  it("sweeps, reconciles with a deadline, records the run, and answers in counts", async () => {
    const calls: string[] = [];
    let options: ReconcileOptions | undefined;

    const response = await handleReconcileCron(call(`Bearer ${SECRET}`), {
      ...traps(calls),
      purgeIntents: async () => 4,
      reconcile: async (_hours, given) => {
        calls.push("reconcile");
        options = given;
        return {
          scanned: 3,
          created: 1,
          alreadyRecorded: 1,
          skipped: [{ sessionId: "cs_test_x", reason: "buyer@example.com could not be charged" }],
        };
      },
    });

    assert.equal(response.status, 200);
    assert.deepEqual(calls, ["sweepAttempts", "sweepSessions", "reconcile", "record"]);

    const before = Date.now();
    assert.ok(options?.deadlineMs && options.deadlineMs > before, "a deadline was set");
    assert.ok(options.deadlineMs - before < 60_000, "and it is inside maxDuration");

    const text = await response.text();
    assert.deepEqual(JSON.parse(text), {
      ok: true,
      ran: true,
      scanned: 3,
      recovered: 1,
      alreadyRecorded: 1,
      skipped: 1,
      truncated: false,
      swept: { checkoutIntents: 4, loginAttempts: 0, portalSessions: 0 },
    });
    assert.doesNotMatch(text, /@|cs_test_/, "counts only: no reason, no id");
  });

  it("is a quiet no-op while Stripe has no keys: 200, nothing asked, nothing recorded", async () => {
    const calls: string[] = [];
    const response = await handleReconcileCron(call(`Bearer ${SECRET}`), {
      ...traps(calls),
      stripeConfigured: () => false,
    });

    assert.equal(response.status, 200);
    assert.equal((await response.json()).why, "stripe-not-configured");
    assert.ok(!calls.includes("reconcile") && !calls.includes("record"));
    assert.ok(calls.includes("purgeIntents"), "the sweeps do not need Stripe");
  });

  it("is a no-op without a database", async () => {
    const calls: string[] = [];
    const response = await handleReconcileCron(call(`Bearer ${SECRET}`), {
      ...traps(calls),
      databaseConfigured: () => false,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(calls, []);
  });

  it("a failed sweep does not stop the reconcile", async () => {
    const calls: string[] = [];
    const response = await handleReconcileCron(call(`Bearer ${SECRET}`), {
      ...traps(calls),
      purgeIntents: async () => {
        throw new Error("relation does not exist");
      },
    });

    assert.equal(response.status, 200);
    assert.ok(calls.includes("reconcile"));
    assert.equal((await response.json()).swept.checkoutIntents, null);
  });

  it("reports a Stripe failure as a 500 without repeating Stripe's message", async () => {
    const response = await handleReconcileCron(call(`Bearer ${SECRET}`), {
      ...traps([]),
      reconcile: async () => {
        throw new Error("No such customer: buyer@example.com");
      },
    });

    assert.equal(response.status, 500);
    assert.doesNotMatch(await response.text(), /@/);
  });
});

function session(overrides: Record<string, unknown> = {}): Stripe.Checkout.Session {
  return {
    id: `cs_test_${randomUUID()}`,
    payment_status: "paid",
    amount_total: 9600,
    amount_subtotal: 8900,
    currency: "usd",
    payment_intent: `pi_${randomUUID()}`,
    total_details: { amount_tax: 0, amount_shipping: 700 },
    customer_details: { email: "Cron.Buyer@Example.com", phone: null },
    collected_information: {
      shipping_details: {
        name: "Cron Buyer",
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
  } as unknown as Stripe.Checkout.Session;
}

/**
 * A refund as `refunds.list({ expand: ["data.charge"] })` returns it: the
 * charge inlined, carrying its running `amount_refunded`.
 */
function refund(paymentIntent: string, amountRefunded: number): Stripe.Refund {
  return {
    id: `re_${randomUUID()}`,
    object: "refund",
    status: "succeeded",
    payment_intent: paymentIntent,
    charge: {
      id: `ch_${randomUUID()}`,
      object: "charge",
      payment_intent: paymentIntent,
      amount_refunded: amountRefunded,
    },
  } as unknown as Stripe.Refund;
}

function iterate<T>(items: T[]) {
  return () => ({
    async *[Symbol.asyncIterator]() {
      yield* items;
    },
  });
}

/** The two methods of Stripe's the reconciler calls, yielding fixtures. */
function fakeStripe(
  sessions: Stripe.Checkout.Session[],
  refunds: Stripe.Refund[] = [],
): NonNullable<ReconcileOptions["client"]> {
  return {
    checkout: {
      sessions: {
        list: iterate(sessions) as unknown as Stripe["checkout"]["sessions"]["list"],
      },
    },
    refunds: {
      list: iterate(refunds) as unknown as Stripe["refunds"]["list"],
    },
  };
}

describe(
  "the scheduled run is the real reconciler",
  { skip: !HAS_DB && "no DATABASE_URL" },
  () => {
    const productId = randomUUID();
    const variantId = randomUUID();

    before(async () => {
      process.env.CRON_SECRET = SECRET;

      await query(
        `insert into product (id, slug, status, price_cents, name, kind)
         values ($1, $2, 'active', 8900, 'Cron Test', 'Fixture')`,
        [productId, `cron-test-${productId.slice(0, 8)}`],
      );
      await query(
        `insert into variant (id, product_id, size_label, sku, stock)
         values ($1, $2, 'M', $3, 5)`,
        [variantId, productId, `CRON-${productId.slice(0, 8)}`],
      );
    });

    after(async () => {
      delete process.env.CRON_SECRET;
      await query("delete from product where id = $1", [productId]).catch(() => {});
      await closePool();
    });

    it("recovers a paid session the webhook never delivered, once, and flags it", async () => {
      const intentId = randomUUID();

      await query(
        `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
         values ($1, $2::jsonb, 8900, 700)`,
        [
          intentId,
          JSON.stringify([
            {
              variantId,
              quantity: 1,
              slug: "cron-test",
              productName: "Cron Test",
              productKind: "Fixture",
              sizeLabel: "M",
              sku: `CRON-${intentId.slice(0, 8)}`,
              unitCents: 8900,
              lineCents: 8900,
              stock: 5,
            },
          ]),
        ],
      );

      const paid = session({ client_reference_id: intentId });
      const client = fakeStripe([paid, session({ payment_status: "unpaid" })]);

      const run = () =>
        handleReconcileCron(call(`Bearer ${SECRET}`), {
          reconcile: (hours, options) => reconcileStripeSessions(hours, { ...options, client }),
          sweepSessions: async () => 0,
        });

      const first = await run();
      const firstText = await first.text();
      const firstBody = JSON.parse(firstText);

      assert.equal(first.status, 200);
      assert.equal(firstBody.scanned, 2);
      assert.equal(firstBody.recovered, 1);
      assert.doesNotMatch(firstText, /Cron Buyer|example\.com|Test Street/i);

      const orders = await query<{ flagged_reason: string | null }>(
        `select flagged_reason from "order" where stripe_session_id = $1`,
        [paid.id],
      );
      assert.equal(orders.length, 1);
      assert.equal(orders[0]!.flagged_reason, "reconciled");

      const second = await (await run()).json();
      assert.equal(second.recovered, 0);
      assert.equal(second.alreadyRecorded, 1);

      const still = await query(`select 1 from "order" where stripe_session_id = $1`, [paid.id]);
      assert.equal(still.length, 1, "a second run creates nothing");

      const last = await query<{ value: string }>(
        "select value::text as value from setting where key = 'last_reconcile'",
      );
      assert.match(last[0]!.value, /"scanned":\s*2/);
    });

    it("stops at its bound and says so", async () => {
      const client = fakeStripe([
        session({ payment_status: "unpaid" }),
        session({ payment_status: "unpaid" }),
        session({ payment_status: "unpaid" }),
      ]);

      const capped = await reconcileStripeSessions(72, { client, maxSessions: 2 });
      assert.equal(capped.scanned, 2);
      assert.equal(capped.truncated, true);

      const late = await reconcileStripeSessions(72, { client, deadlineMs: Date.now() - 1 });
      assert.equal(late.scanned, 0);
      assert.equal(late.truncated, true);
    });

    async function makeIntent(): Promise<string> {
      const intentId = randomUUID();
      await query(
        `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
         values ($1, $2::jsonb, 8900, 700)`,
        [
          intentId,
          JSON.stringify([
            {
              variantId,
              quantity: 1,
              slug: "cron-test",
              productName: "Cron Test",
              productKind: "Fixture",
              sizeLabel: "M",
              sku: `CRON-${intentId.slice(0, 8)}`,
              unitCents: 8900,
              lineCents: 8900,
              stock: 5,
            },
          ]),
        ],
      );
      return intentId;
    }

    const refundState = async (sessionId: string) =>
      (
        await query<{ refunded_cents: number; refund_status: string }>(
          `select refunded_cents, refund_status from "order" where stripe_session_id = $1`,
          [sessionId],
        )
      )[0];

    it("a dashboard refund of an order whose webhook was missed lands on the order it creates", async () => {
      // B4: the webhook for the order failed, the owner refunded it from the
      // Stripe dashboard, and the reconciler then created the order. It used
      // to be created unrefunded — and shipped.
      const paid = session({ client_reference_id: await makeIntent() });
      const pi = paid.payment_intent as string;
      const client = fakeStripe([paid], [refund(pi, 9600)]);

      const run = () =>
        handleReconcileCron(call(`Bearer ${SECRET}`), {
          reconcile: (hours, options) => reconcileStripeSessions(hours, { ...options, client }),
          sweepSessions: async () => 0,
        });

      const response = await run();
      assert.equal(response.status, 200);
      assert.equal((await response.json()).recovered, 1);
      assert.deepEqual(await refundState(paid.id), { refunded_cents: 9600, refund_status: "full" });

      const last = await query<{ value: string }>(
        "select value::text as value from setting where key = 'last_reconcile'",
      );
      assert.match(last[0]!.value, /"refunds":\s*\{[^}]*"synced":\s*1/);

      // Again: nothing changes, nothing is created.
      assert.equal((await (await run()).json()).alreadyRecorded, 1);
      assert.deepEqual(await refundState(paid.id), { refunded_cents: 9600, refund_status: "full" });
    });

    it("syncs a refund on an order that already exists, taking the largest running total", async () => {
      const paid = session({ client_reference_id: await makeIntent() });
      const pi = paid.payment_intent as string;
      await reconcileStripeSessions(72, { client: fakeStripe([paid]) });
      assert.deepEqual(await refundState(paid.id), { refunded_cents: 0, refund_status: "none" });

      // Two dashboard refunds of one charge, listed newest first: each carries
      // the charge's running total at the time it was expanded.
      const report = await reconcileRefunds(72, {
        client: fakeStripe([], [refund(pi, 5000), refund(pi, 2000)]),
      });

      assert.deepEqual(report, { scanned: 2, synced: 1, unmatched: 0 });
      assert.deepEqual(await refundState(paid.id), {
        refunded_cents: 5000,
        refund_status: "partial",
      });
    });

    it("a refund with no order yet is counted, not fatal, and applied once the order exists", async () => {
      const pi = `pi_${randomUUID()}`;
      const client = fakeStripe([], [refund(pi, 1500)]);

      const first = await reconcileStripeSessions(72, { client });
      assert.deepEqual(first.refunds, { scanned: 1, synced: 0, unmatched: 1 });

      const paid = session({ client_reference_id: await makeIntent(), payment_intent: pi });
      const second = await reconcileStripeSessions(72, { client: fakeStripe([paid], [refund(pi, 1500)]) });

      assert.equal(second.created, 1);
      assert.deepEqual(second.refunds, { scanned: 1, synced: 1, unmatched: 0 });
      assert.deepEqual(await refundState(paid.id), {
        refunded_cents: 1500,
        refund_status: "partial",
      });
    });

    it("a refund list that fails does not lose the session walk's report", async () => {
      const client = fakeStripe([session({ payment_status: "unpaid" })]);
      client.refunds.list = (() => {
        throw Object.assign(new Error("No such refund: buyer@example.com"), {
          name: "StripePermissionError",
        });
      }) as unknown as Stripe["refunds"]["list"];

      const report = await reconcileStripeSessions(72, { client });
      assert.equal(report.scanned, 1);
      assert.equal(report.refunds?.failed, "StripePermissionError");
      assert.doesNotMatch(JSON.stringify(report), /@/);
    });

    it("the refund pass honours the deadline too", async () => {
      const report = await reconcileRefunds(72, {
        client: fakeStripe([], [refund(`pi_${randomUUID()}`, 100)]),
        deadlineMs: Date.now() - 1,
      });
      assert.deepEqual(report, { scanned: 0, synced: 0, unmatched: 0, truncated: true });
    });
  },
);
