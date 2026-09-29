import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import Stripe from "stripe";
import { after, before, describe, it, mock } from "node:test";

import { priceCart } from "../../src/lib/cart/price.ts";
import { startCheckout } from "../../src/lib/stripe/start.ts";
import { stripe } from "../../src/lib/stripe/client.ts";
import { handleStripeWebhook } from "../../src/lib/orders/webhook.ts";
import { resetMailProvider } from "../../src/lib/mail/index.ts";
import { getOrder, transitionOrder } from "../../src/lib/orders/manage.ts";
import {
  claimLabelPurchase,
  labelRefusal,
  recordBoughtLabel,
} from "../../src/lib/orders/label.ts";
import { buyUspsLabel, shippoMode } from "../../src/lib/shipping/shippo.ts";
import { handleShippoWebhook } from "../../src/lib/shipping/webhook.ts";
import { type CreateRefund, refundOrder } from "../../src/lib/orders/refund.ts";
import { type ReconcileClient, reconcileStripeSessions } from "../../src/lib/orders/reconcile.ts";
import { DISPUTE_LABEL, FLAG_EXPLANATION, FLAG_REASONS, FLAG_SHORT } from "../../src/lib/orders/flags.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * One order, from the cart to the reconciler, through every stage for real.
 *
 * Each stage has its own tests. What none of them checks is the seam between
 * two stages — the log-only mail that was recorded as sent, the refund that
 * arrived before its order — and a seam is where the money actually goes
 * missing. So this drives a single order through the whole path in one go and
 * checks the invariants that must hold after every step:
 *
 *   price → intent → Checkout Session → signed webhook → order + stock →
 *   confirmation → label (claim, Shippo, record) → shipped → Shippo DELIVERED →
 *   partial refund → charge.refunded → full refund → reconcile (a no-op)
 *
 * Nothing leaves the process. Stripe's session create is replaced on the real
 * client object; webhooks are signed locally with the endpoint secret, as
 * stripe-webhook.test.ts does; Resend and Shippo are a fetch stand-in, as
 * hardening.test.ts and label-guards.test.ts do; refunds are injected, as
 * refunds.test.ts does; the reconciler gets a stand-in list client, as
 * cron-reconcile.test.ts does.
 */

const HAS_DB = isDatabaseConfigured();

/** The widened flag check (0011) and the code's list of flags must be one list. */
describe("the flags the code writes are the flags the database allows", () => {
  const migrations = readdirSync("migrations")
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => readFileSync(`migrations/${file}`, "utf8").replace(/--.*$/gm, ""));

  /** The values of the LAST check a migration puts on this constraint or column. */
  function allowed(pattern: RegExp): string[] {
    const found = migrations.flatMap((sql) => [...sql.matchAll(pattern)].map((m) => m[1] ?? ""));
    const last = found.at(-1);
    assert.ok(last, `no migration matches ${pattern}`);
    return [...last.matchAll(/'([^']+)'/g)].map((m) => m[1]!).sort();
  }

  it("flagged_reason", () => {
    const inDatabase = allowed(/flagged_reason in \(([^)]*)\)/g);
    assert.deepEqual(inDatabase, [...FLAG_REASONS].sort());

    // And every one of them can be put into words on the portal.
    for (const flag of FLAG_REASONS) {
      assert.ok(FLAG_SHORT[flag], flag);
      assert.ok(FLAG_EXPLANATION[flag].length > 40, flag);
    }
  });

  it("dispute_status", () => {
    assert.deepEqual(allowed(/dispute_status in \(([^)]*)\)/g), Object.keys(DISPUTE_LABEL).sort());
  });
});

describe("one order, from the cart to the reconciler", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const WEBHOOK_SECRET = "whsec_test_moneyPathOnlyNeverSentAnywhere";
  const SHIPPO_TOKEN = "0123456789abcdef0123456789abcdef-money-path";
  const signer = new Stripe("sk_test_signingOnlyNoNetwork");

  const productId = randomUUID();
  const small = randomUUID();
  const large = randomUUID();
  const slug = `money-path-${productId.slice(0, 8)}`;
  const UNIT = 8900;
  const SHIPPING = 700;

  const savedEnv = { ...process.env };
  const realFetch = globalThis.fetch;
  let hadShippingRate = true;

  /** Every outbound request, by host. Nothing reaches the network. */
  const sent = { resend: [] as string[], shippo: [] as string[] };

  // State carried from one stage to the next, in order.
  let intentId = "";
  let sessionId = "";
  const paymentIntent = `pi_${randomUUID()}`;
  let orderId = "";
  let total = 0;
  const tracking = `9400${Date.now()}`;

  const stockOf = async (variantId: string) =>
    (await query<{ stock: number }>("select stock from variant where id = $1", [variantId]))[0]!.stock;

  const orderRow = async () => (await getOrder(orderId))!;

  const confirmations = async () =>
    (
      await query<{ status: string }>(
        `select status from email_log where order_id = $1 and template = 'order-confirmation'`,
        [orderId],
      )
    ).map((row) => row.status);

  function signed(event: Record<string, unknown>): Request {
    const payload = JSON.stringify(event);
    const header = signer.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
    return new Request("https://guardtheory.test/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": header, "content-type": "application/json" },
      body: payload,
    });
  }

  /** What Stripe would send for the paid session, two hours ago. */
  function paidSession(): Record<string, unknown> {
    return {
      id: sessionId,
      object: "checkout.session",
      livemode: false,
      created: Math.floor(Date.now() / 1000) - 2 * 60 * 60,
      status: "complete",
      payment_status: "paid",
      client_reference_id: intentId,
      metadata: { intent_id: intentId },
      amount_subtotal: 3 * UNIT,
      amount_total: total,
      currency: "usd",
      payment_intent: paymentIntent,
      total_details: { amount_tax: 0, amount_shipping: SHIPPING },
      customer_details: { email: "buyer@example.com", phone: "+13105550100" },
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
    };
  }

  function chargeRefunded(amountRefunded: number) {
    return {
      id: `evt_${randomUUID()}`,
      object: "event",
      type: "charge.refunded",
      data: {
        object: {
          id: `ch_${randomUUID()}`,
          object: "charge",
          payment_intent: paymentIntent,
          amount_refunded: amountRefunded,
        },
      },
    };
  }

  /** The invariants no stage may break. */
  async function invariants(stage: string) {
    const orders = await query<{ id: string }>(
      `select id from "order" where stripe_payment_intent = $1`,
      [paymentIntent],
    );
    assert.equal(orders.length, 1, `${stage}: one payment is one order`);

    const order = await orderRow();
    assert.equal(order.total_cents, total, `${stage}: the total never moves`);
    assert.ok(
      order.refunded_cents >= 0 && order.refunded_cents <= order.total_cents,
      `${stage}: refunded ${order.refunded_cents} of ${order.total_cents}`,
    );
    assert.equal(
      order.refund_status,
      order.refunded_cents === 0 ? "none" : order.refunded_cents < total ? "partial" : "full",
      `${stage}: refund_status agrees with refunded_cents`,
    );
    assert.equal(order.stripe_mode, "test", `${stage}: a test payment is a test order`);

    // Stock is taken once, at payment, and nothing after that gives it back.
    assert.equal(await stockOf(small), 3, `${stage}: M stock`);
    assert.equal(await stockOf(large), 4, `${stage}: L stock`);

    const unfulfilled = await query("select id from unfulfilled_payment where stripe_payment_intent = $1", [
      paymentIntent,
    ]);
    assert.equal(unfulfilled.length, 0, `${stage}: nothing is left under Needs you`);

    // Exactly one confirmation actually went, however many paths reached it.
    assert.deepEqual(await confirmations(), ["sent"], `${stage}: one confirmation, sent`);
    return order;
  }

  before(async () => {
    Object.assign(process.env, {
      STRIPE_SECRET_KEY: "sk_test_moneyPathNoNetworkCallIsMade",
      STRIPE_WEBHOOK_SECRET: WEBHOOK_SECRET,
      RESEND_API_KEY: "re_test_not_a_real_key",
      RECEIPT_FROM_EMAIL: "orders@guardtheory.net",
      SHIPPO_API_TOKEN: "shippo_test_neverSentAnywhere",
      SHIPPO_WEBHOOK_TOKEN: SHIPPO_TOKEN,
      SHIP_FROM_NAME: "Guard Theory",
      SHIP_FROM_STREET1: "1 Origin Street",
      SHIP_FROM_CITY: "Los Angeles",
      SHIP_FROM_STATE: "CA",
      SHIP_FROM_ZIP: "90015",
    });
    delete process.env.VERCEL_ENV;
    resetMailProvider();

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(String(input));

      if (url.hostname === "api.resend.com") {
        const body = JSON.parse(String(init?.body)) as { subject: string };
        sent.resend.push(body.subject);
        return Response.json({ id: `email_${sent.resend.length}` });
      }

      if (url.hostname === "api.goshippo.com") {
        sent.shippo.push(url.pathname);
        if (url.pathname.startsWith("/shipments")) {
          return Response.json({
            rates: [
              {
                object_id: "rate_money_path",
                provider: "USPS",
                amount: "5.00",
                currency: "USD",
                servicelevel: { token: "usps_ground_advantage" },
              },
            ],
          });
        }
        return Response.json({
          object_id: "txn_money_path",
          status: "SUCCESS",
          label_url: "https://example.com/label.pdf",
          tracking_number: tracking,
          tracking_url_provider: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`,
        });
      }

      throw new Error(`the money path tried to reach ${url.hostname}`);
    }) as typeof fetch;

    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', $3, 'Money Path', 'Fixture')`,
      [productId, slug, UNIT],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock)
       values ($1, $3, 'M', $4, 5), ($2, $3, 'L', $5, 5)`,
      [small, large, productId, `MP-M-${productId.slice(0, 8)}`, `MP-L-${productId.slice(0, 8)}`],
    );

    const rate = await query("select value from setting where key = 'shipping_flat_cents'");
    hadShippingRate = rate.length > 0;
    await query(
      `insert into setting (key, value) values ('shipping_flat_cents', $1)
       on conflict (key) do update set value = excluded.value`,
      [String(SHIPPING)],
    );
  });

  after(async () => {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in savedEnv)) delete process.env[key];
    Object.assign(process.env, savedEnv);
    resetMailProvider();

    if (orderId) await query(`delete from "order" where id = $1`, [orderId]);
    if (intentId) await query("delete from checkout_intent where id = $1", [intentId]);
    await query("delete from product where id = $1", [productId]);
    if (!hadShippingRate) await query("delete from setting where key = 'shipping_flat_cents'");
    await closePool();
  });

  it("1. the cart is priced on the server, and recorded as an intent", async () => {
    // Listed large-first, so the stock decrement's own ordering is exercised.
    const priced = await priceCart(
      [
        { variantId: large, quantity: 1 },
        { variantId: small, quantity: 2 },
      ],
      (asked) => (asked === slug ? { name: "Money Path", kind: "Fixture" } : undefined),
    );

    assert.ok(priced.intentId);
    assert.deepEqual(priced.dropped, []);
    assert.equal(priced.subtotalCents, 3 * UNIT);
    assert.equal(priced.shippingCents, SHIPPING);
    intentId = priced.intentId;
    total = priced.subtotalCents + priced.shippingCents;

    const intent = await query<{ subtotal_cents: number; consumed: boolean }>(
      "select subtotal_cents, consumed_at is not null as consumed from checkout_intent where id = $1",
      [intentId],
    );
    assert.deepEqual(intent[0], { subtotal_cents: 3 * UNIT, consumed: false });
    assert.equal(await stockOf(small), 5, "pricing reserves nothing");
  });

  it("2. checkout starts a session carrying exactly those figures", async () => {
    const create = mock.method(
      stripe().checkout.sessions,
      "create",
      async (params: Stripe.Checkout.SessionCreateParams) => {
        sessionId = `cs_test_${randomUUID()}`;
        return { id: sessionId, url: `https://checkout.stripe.com/c/pay/${sessionId}`, ...params };
      },
    );

    try {
      const started = await startCheckout(intentId);
      assert.equal(started.ok, true);
      assert.equal(create.mock.callCount(), 1);

      const params = create.mock.calls[0]!.arguments[0] as Stripe.Checkout.SessionCreateParams;
      assert.equal(params.client_reference_id, intentId);
      const charged = (params.line_items ?? []).reduce(
        (sum, item) => sum + (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 0),
        0,
      );
      assert.equal(charged, 3 * UNIT, "Stripe is asked for what the cart was priced at");
      assert.equal(
        params.shipping_options?.[0]?.shipping_rate_data?.fixed_amount?.amount,
        SHIPPING,
      );
    } finally {
      create.mock.restore();
    }
  });

  it("3. the paid webhook makes one order, takes the stock and sends one confirmation", async () => {
    const event = {
      id: `evt_${randomUUID()}`,
      object: "event",
      type: "checkout.session.completed",
      data: { object: paidSession() },
    };

    const response = await handleStripeWebhook(signed(event));
    assert.equal(response.status, 200);

    const orders = await query<{ id: string }>(`select id from "order" where stripe_session_id = $1`, [
      sessionId,
    ]);
    assert.equal(orders.length, 1);
    orderId = orders[0]!.id;

    const order = await invariants("paid");
    assert.equal(order.status, "new");
    assert.equal(order.flagged_reason, null, "a normal order carries no flag");

    const intent = await query<{ order_id: string | null; consumed: boolean }>(
      "select order_id, consumed_at is not null as consumed from checkout_intent where id = $1",
      [intentId],
    );
    assert.deepEqual(intent[0], { order_id: orderId, consumed: true });

    // Stripe delivers at least once. The same event again is a duplicate;
    // async_payment_succeeded for the same session is a replay. Neither makes
    // a second order, takes stock again, or sends a second confirmation.
    assert.equal(await (await handleStripeWebhook(signed(event))).text(), "duplicate");
    const replay = { ...event, id: `evt_${randomUUID()}`, type: "checkout.session.async_payment_succeeded" };
    assert.equal((await handleStripeWebhook(signed(replay))).status, 200);
    await invariants("replayed");
    assert.equal(sent.resend.length, 1);
  });

  it("4. a label is claimed, bought once and recorded, then the order ships", async () => {
    let order = await orderRow();
    assert.equal(labelRefusal(order, shippoMode()), null, "a test order with a test Shippo token");

    assert.deepEqual(await claimLabelPurchase(orderId), { claimed: true });
    assert.equal((await claimLabelPurchase(orderId)).claimed, false, "a second click buys nothing");

    const label = await buyUspsLabel(
      {
        name: order.ship_name,
        street1: order.ship_line1,
        street2: order.ship_line2,
        city: order.ship_city,
        state: order.ship_state,
        zip: order.ship_postal,
        country: order.ship_country,
        phone: order.phone,
        email: order.email,
      },
      orderId,
    );
    assert.deepEqual(await recordBoughtLabel(orderId, label), { ok: true });
    assert.equal(sent.shippo.filter((path) => path.startsWith("/transactions")).length, 1);

    assert.deepEqual(await transitionOrder(orderId, "in_process"), { ok: true, emailed: true });
    assert.deepEqual(await transitionOrder(orderId, "shipped"), { ok: true, emailed: true });

    order = await invariants("shipped");
    assert.equal(order.status, "shipped");
    assert.equal(order.tracking_number, tracking);
    assert.equal(order.shippo_transaction_id, "txn_money_path");
    assert.equal((await claimLabelPurchase(orderId)).claimed, false, "a tracked order is never relabelled");
  });

  it("5. Shippo's DELIVERED moves it forward, and a replay does nothing", async () => {
    const delivered = () =>
      new Request(`https://guardtheory.test/api/webhooks/shippo/${SHIPPO_TOKEN}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          event: "track_updated",
          test: true,
          data: { tracking_number: tracking, tracking_status: { status: "DELIVERED" } },
        }),
      });

    assert.equal((await handleShippoWebhook(delivered(), SHIPPO_TOKEN)).status, 200);
    const order = await invariants("delivered");
    assert.equal(order.status, "delivered");
    assert.equal(order.flagged_reason, null);

    assert.equal((await handleShippoWebhook(delivered(), SHIPPO_TOKEN)).status, 200);
    assert.equal((await orderRow()).status, "delivered");
  });

  it("6. a partial refund, then its webhook, agree on one figure", async () => {
    const refunds: number[] = [];
    const createRefund: CreateRefund = async (input) => {
      refunds.push(input.amountCents);
    };

    const partial = await refundOrder(orderId, 2000, { createRefund, expectedRefundedCents: 0 });
    assert.deepEqual(partial, { ok: true, refundedCents: 2000, status: "partial" });

    // Stripe's charge.refunded for that refund: the running total, the same figure.
    assert.equal((await handleStripeWebhook(signed(chargeRefunded(2000)))).status, 200);
    const order = await invariants("partly refunded");
    assert.equal(order.refunded_cents, 2000);

    // A form rendered before the refund is refused, not applied twice.
    const stale = await refundOrder(orderId, 2000, { createRefund, expectedRefundedCents: 0 });
    assert.equal(stale.ok, false);
    assert.deepEqual(refunds, [2000]);
  });

  it("7. the full refund returns the rest, and a late webhook cannot lower it", async () => {
    const refunds: number[] = [];
    const createRefund: CreateRefund = async (input) => {
      refunds.push(input.amountCents);
    };

    const rest = await refundOrder(orderId, undefined, { createRefund, expectedRefundedCents: 2000 });
    assert.deepEqual(rest, { ok: true, refundedCents: total, status: "full" });
    assert.deepEqual(refunds, [total - 2000], "only what was left is refunded");

    // The earlier, smaller running total arriving late changes nothing.
    assert.equal((await handleStripeWebhook(signed(chargeRefunded(2000)))).status, 200);
    assert.equal((await handleStripeWebhook(signed(chargeRefunded(total)))).status, 200);

    const order = await invariants("fully refunded");
    assert.equal(order.refunded_cents, total);
    assert.equal(order.flagged_reason, "refunded");
    assert.equal(order.status, "delivered", "a refund does not rewrite where the parcel is");
  });

  it("8. the reconciler finds nothing to do, and leaves a session paid seconds ago to the webhook", async () => {
    const young = {
      ...paidSession(),
      id: `cs_test_${randomUUID()}`,
      created: Math.floor(Date.now() / 1000) - 60,
      client_reference_id: randomUUID(),
    };

    const iterate = <T>(items: T[]) => () => ({
      async *[Symbol.asyncIterator]() {
        yield* items;
      },
    });
    const client: ReconcileClient = {
      checkout: {
        sessions: {
          list: iterate([young, paidSession()]) as unknown as Stripe["checkout"]["sessions"]["list"],
        },
      },
      refunds: {
        list: iterate([
          {
            id: `re_${randomUUID()}`,
            object: "refund",
            payment_intent: paymentIntent,
            charge: { id: `ch_${randomUUID()}`, payment_intent: paymentIntent, amount_refunded: total },
          },
        ]) as unknown as Stripe["refunds"]["list"],
      },
    };

    const report = await reconcileStripeSessions(72, { client });

    assert.equal(report.created, 0, "nothing was missing");
    assert.equal(report.alreadyRecorded, 1);
    assert.equal(report.deferred, 1, "the young session is the webhook's, not the reconciler's");
    assert.deepEqual(report.skipped, []);
    assert.deepEqual(
      { synced: report.refunds?.synced, unmatched: report.refunds?.unmatched },
      { synced: 1, unmatched: 0 },
    );

    const order = await invariants("reconciled");
    assert.equal(order.refunded_cents, total);
    assert.equal(order.flagged_reason, "refunded", "the reconciler does not re-flag an order it did not recover");
    assert.equal(
      (await query(`select id from "order" where stripe_session_id = $1`, [young.id])).length,
      0,
    );
    assert.equal(sent.resend.length, 3, "confirmation, being prepared, shipped — and nothing else");
  });
});
