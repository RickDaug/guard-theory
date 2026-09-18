import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { after, before, describe, it } from "node:test";

import { handleStripeWebhook } from "../../src/lib/orders/webhook.ts";
import { STALE_CLAIM_SECONDS } from "../../src/lib/orders/fulfil.ts";
import {
  listUnfulfilledPayments,
  resolveUnfulfilledPayment,
  statusCounts,
} from "../../src/lib/orders/manage.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The webhook, called the way Stripe calls it: a raw body and a VALID signature.
 *
 * The e2e suite can only prove the endpoint refuses what it should. Everything
 * past the signature check — which is everything that matters — was untested,
 * because a test could not get past the check. The Stripe library signs a
 * payload with the endpoint secret locally (`generateTestHeaderString`), so
 * these requests are exactly what production receives, and nothing here touches
 * the network: no Stripe call is made on any path under test, and with no mail
 * provider configured the confirmation is logged, not sent.
 */

const HAS_DB = isDatabaseConfigured();
const SECRET = "whsec_test_onlyEverUsedInThisFile";

process.env.STRIPE_SECRET_KEY ??= "sk_test_forTheOrderModeColumnOnly";
process.env.STRIPE_WEBHOOK_SECRET = SECRET;
delete process.env.RESEND_API_KEY;

const signer = new Stripe("sk_test_signingOnlyNoNetwork");

function signed(event: Record<string, unknown>, secret = SECRET): Request {
  const payload = JSON.stringify(event);
  const header = signer.webhooks.generateTestHeaderString({ payload, secret });
  return new Request("https://guardtheory.test/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": header, "content-type": "application/json" },
    body: payload,
  });
}

function sessionObject(overrides: Record<string, unknown> = {}) {
  return {
    id: `cs_test_${randomUUID()}`,
    object: "checkout.session",
    payment_status: "paid",
    amount_total: 9600,
    amount_subtotal: 8900,
    currency: "usd",
    payment_intent: `pi_${randomUUID()}`,
    total_details: { amount_tax: 0, amount_shipping: 700 },
    customer_details: { email: "buyer@example.com", phone: null },
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
  };
}

function completed(object: Record<string, unknown>, id = `evt_${randomUUID()}`) {
  return { id, object: "event", type: "checkout.session.completed", data: { object } };
}

let productId: string;
let variantId: string;

async function makeIntent(): Promise<string> {
  const intentId = randomUUID();
  await query("update variant set stock = 5 where id = $1", [variantId]);
  await query(
    `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
     values ($1, $2::jsonb, 8900, 700)`,
    [
      intentId,
      JSON.stringify([
        {
          variantId,
          quantity: 1,
          slug: "webhook-test",
          productName: "Webhook Test",
          productKind: "Fixture",
          sizeLabel: "M",
          sku: `WEBHOOK-${intentId.slice(0, 8)}`,
          unitCents: 8900,
          lineCents: 8900,
          stock: 5,
        },
      ]),
    ],
  );
  return intentId;
}

const ordersFor = async (sessionId: string) =>
  query<{ id: string }>(`select id from "order" where stripe_session_id = $1`, [sessionId]);

describe("the Stripe webhook, with a valid signature", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  before(async () => {
    productId = randomUUID();
    variantId = randomUUID();
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 8900, 'Webhook Test', 'Fixture')`,
      [productId, `webhook-test-${productId.slice(0, 8)}`],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, 'M', $3, 5)`,
      [variantId, productId, `WEBHOOK-${productId.slice(0, 8)}`],
    );
  });

  after(async () => {
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  it("refuses a body signed with the wrong secret, and a tampered body", async () => {
    const event = completed(sessionObject());
    const wrong = await handleStripeWebhook(signed(event, "whsec_someone_elses"));
    assert.equal(wrong.status, 400);

    const good = signed(event);
    const tampered = new Request(good.url, {
      method: "POST",
      headers: good.headers,
      body: JSON.stringify({ ...event, type: "charge.refunded" }),
    });
    assert.equal((await handleStripeWebhook(tampered)).status, 400);
  });

  it("creates the order, records the confirmation, and marks the event processed", async () => {
    const intentId = await makeIntent();
    const session = sessionObject({ client_reference_id: intentId });
    const event = completed(session);

    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 200);

    const orders = await ordersFor(session.id);
    assert.equal(orders.length, 1);

    const mail = await query<{ template: string }>(
      "select template from email_log where order_id = $1",
      [orders[0]!.id],
    );
    assert.deepEqual(mail.map((m) => m.template), ["order-confirmation"]);

    const ledger = await query<{ processed: boolean }>(
      "select processed_at is not null as processed from webhook_event where id = $1",
      [event.id],
    );
    assert.equal(ledger[0]?.processed, true);

    // Stripe delivers at least once. The second delivery is a 200 and nothing else.
    const again = await handleStripeWebhook(signed(event));
    assert.equal(again.status, 200);
    assert.equal(await again.text(), "duplicate");
    assert.equal((await ordersFor(session.id)).length, 1);
  });

  it("asks for a retry while another delivery holds a fresh claim", async () => {
    const intentId = await makeIntent();
    const session = sessionObject({ client_reference_id: intentId });
    const event = completed(session);

    // Another invocation claimed it a moment ago and is still working.
    await query("insert into webhook_event (id, source, type) values ($1, 'stripe', $2)", [
      event.id,
      event.type,
    ]);

    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 409, "a 200 here would cancel the only retry that could save it");
    assert.equal((await ordersFor(session.id)).length, 0);
  });

  it("rescues an event whose first handler died holding the claim", async () => {
    // Charged, claim row written, function killed. Before the fix every retry
    // answered "duplicate" with a 200 and the order never existed.
    const intentId = await makeIntent();
    const session = sessionObject({ client_reference_id: intentId });
    const event = completed(session);

    await query(
      `insert into webhook_event (id, source, type, received_at)
       values ($1, 'stripe', $2, now() - make_interval(secs => $3))`,
      [event.id, event.type, STALE_CLAIM_SECONDS + 30],
    );

    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), "ok");
    assert.equal((await ordersFor(session.id)).length, 1);
  });

  it("never lets a PAID session vanish: no order possible means a row the portal shows", async () => {
    // Each of these used to be console.error + "processed" + 200. Charged, and
    // nothing anywhere said so.
    const intentId = await makeIntent();
    const broken: Record<string, Record<string, unknown>> = {
      "no intent reference": sessionObject(),
      "intent not found": sessionObject({ client_reference_id: randomUUID() }),
      "no shipping address": sessionObject({
        client_reference_id: intentId,
        collected_information: null,
      }),
      "no email": sessionObject({ client_reference_id: intentId, customer_details: null }),
    };

    for (const [reason, session] of Object.entries(broken)) {
      const event = completed(session);
      const response = await handleStripeWebhook(signed(event));
      assert.equal(response.status, 200, reason);
      assert.equal(await response.text(), "recorded for review", reason);

      const rows = await query<{ reason: string; amount_total_cents: number; resolved: boolean }>(
        `select reason, amount_total_cents, resolved_at is not null as resolved
           from unfulfilled_payment where stripe_session_id = $1`,
        [session.id as string],
      );
      assert.equal(rows.length, 1, `${reason}: no row was recorded`);
      assert.equal(rows[0]!.reason, reason);
      assert.equal(rows[0]!.amount_total_cents, 9600);
      assert.equal(rows[0]!.resolved, false);
      assert.equal((await ordersFor(session.id as string)).length, 0);
    }

    // The portal's count and list see them.
    const open = await listUnfulfilledPayments();
    const ids = new Set(open.map((row) => row.stripe_session_id));
    for (const session of Object.values(broken)) {
      assert.equal(ids.has(session.id as string), true);
    }
    const counts = await statusCounts();
    assert.ok((counts.flagged ?? 0) >= 4);

    // A second event for the same session is one row, not two.
    const first = Object.values(broken)[0]!;
    await handleStripeWebhook(signed(completed(first)));
    const dupes = await query("select id from unfulfilled_payment where stripe_session_id = $1", [
      first.id as string,
    ]);
    assert.equal(dupes.length, 1);

    // Resolving is what takes it off the list, once.
    assert.equal(await resolveUnfulfilledPayment(open[0]!.id), true);
    assert.equal(await resolveUnfulfilledPayment(open[0]!.id), false);

    await query("delete from unfulfilled_payment where stripe_session_id = any($1)", [
      Object.values(broken).map((session) => session.id as string),
    ]);
  });

  it("an unpaid session is still ignored, and is NOT written down as money owed", async () => {
    const session = sessionObject({ payment_status: "unpaid" });
    const response = await handleStripeWebhook(signed(completed(session)));
    assert.equal(response.status, 200);
    const rows = await query("select id from unfulfilled_payment where stripe_session_id = $1", [
      session.id,
    ]);
    assert.equal(rows.length, 0);
  });

  it("answers 500, and never marks the event processed, when the payment cannot be written down", async () => {
    // A session with no id cannot be recorded: the insert fails on NOT NULL.
    const session = sessionObject({ id: null });
    const event = completed(session);
    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 500, "Stripe must be told to try again");

    // PGlite drops the connection after a failed statement and the next query
    // pays for it (AGENTS.md) — here that next query is the handler's own
    // releaseEvent, so locally the release FAILS and on real Postgres it
    // succeeds. Both are fine, and both are what production can see; what must
    // hold either way is that the claim is not left looking finished.
    await query("select 1").catch(() => {});

    const ledger = await query<{ processed: boolean }>(
      "select processed_at is not null as processed from webhook_event where id = $1",
      [event.id],
    );
    assert.ok(
      ledger.length === 0 || ledger[0]!.processed === false,
      "released, or left unprocessed for the stale takeover — never marked done",
    );
    await query("delete from webhook_event where id = $1", [event.id]);
  });

  it("sends the confirmation on the retry when the first delivery died before it", async () => {
    // First delivery: order committed, then the function was killed — no email,
    // claim left behind. Reproduced by doing exactly that much by hand.
    const intentId = await makeIntent();
    const session = sessionObject({ client_reference_id: intentId });
    const event = completed(session);

    const { fulfilCheckoutSession } = await import("../../src/lib/orders/fulfil.ts");
    const made = await fulfilCheckoutSession(session as never);
    assert.equal(made.outcome, "created");
    await query(
      `insert into webhook_event (id, source, type, received_at)
       values ($1, 'stripe', $2, now() - make_interval(secs => $3))`,
      [event.id, event.type, STALE_CLAIM_SECONDS + 30],
    );

    const orderId = (await ordersFor(session.id))[0]!.id;
    const before = await query("select id from email_log where order_id = $1", [orderId]);
    assert.equal(before.length, 0);

    // Stripe's retry. The order is "already recorded" — and the buyer still
    // gets their email, once.
    assert.equal((await handleStripeWebhook(signed(event))).status, 200);
    assert.equal((await handleStripeWebhook(signed(event))).status, 200);

    const log = await query<{ template: string }>(
      "select template from email_log where order_id = $1",
      [orderId],
    );
    assert.deepEqual(log.map((row) => row.template), ["order-confirmation"]);
    assert.equal((await ordersFor(session.id)).length, 1);
  });

  it("charge.refunded updates the order, in whatever order the events arrive", async () => {
    const intentId = await makeIntent();
    const session = sessionObject({ client_reference_id: intentId });
    assert.equal((await handleStripeWebhook(signed(completed(session)))).status, 200);

    const refunded = (amount: number) => ({
      id: `evt_${randomUUID()}`,
      object: "event",
      type: "charge.refunded",
      data: {
        object: {
          id: `ch_${randomUUID()}`,
          object: "charge",
          payment_intent: session.payment_intent,
          amount_refunded: amount,
        },
      },
    });

    // The running totals 5000 and 2000, delivered newest first.
    assert.equal((await handleStripeWebhook(signed(refunded(5000)))).status, 200);
    assert.equal((await handleStripeWebhook(signed(refunded(2000)))).status, 200);

    const rows = await query<{ refunded_cents: number; refund_status: string }>(
      `select refunded_cents, refund_status from "order" where stripe_session_id = $1`,
      [session.id],
    );
    assert.deepEqual(rows[0], { refunded_cents: 5000, refund_status: "partial" });
  });

  it("ignores event types it does not handle without claiming them", async () => {
    const event = { ...completed(sessionObject()), type: "customer.created" };
    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 200);
    const ledger = await query("select id from webhook_event where id = $1", [event.id]);
    assert.equal(ledger.length, 0);
  });
});
