import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import Stripe from "stripe";
import { after, before, describe, it } from "node:test";

import { handleStripeWebhook } from "../../src/lib/orders/webhook.ts";
import { STALE_CLAIM_SECONDS } from "../../src/lib/orders/fulfil.ts";
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

  it("ignores event types it does not handle without claiming them", async () => {
    const event = { ...completed(sessionObject()), type: "customer.created" };
    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 200);
    const ledger = await query("select id from webhook_event where id = $1", [event.id]);
    assert.equal(ledger.length, 0);
  });
});
