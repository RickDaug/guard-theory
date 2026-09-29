import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import { parseShippingCents, priceCart } from "../../src/lib/cart/price.ts";
import {
  getMailProvider,
  maskEmail,
  resetMailProvider,
  sendEmail,
} from "../../src/lib/mail/index.ts";
import {
  ensureOrderConfirmationSent,
  retryUndeliveredConfirmations,
} from "../../src/lib/orders/confirmation.ts";
import { buyUspsLabel, ShippoError } from "../../src/lib/shipping/shippo.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

const HAS_DB = isDatabaseConfigured();

describe("the shipping rate fails closed", () => {
  it("reads whole cents, and nothing else", () => {
    assert.equal(parseShippingCents("700"), 700);
    assert.equal(parseShippingCents(" 700 "), 700);
    assert.equal(parseShippingCents("0"), 0, "free shipping is a decision, made by writing 0");

    for (const bad of ["", " ", "7.00", "$7", "-700", "700abc", "1e3", "seven", "99999999", null, undefined]) {
      assert.equal(parseShippingCents(bad), null, JSON.stringify(bad));
    }
  });
});

describe("mail that was only logged is not recorded as sent", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  // Before 0008, the log-only provider (no RESEND_API_KEY, or no
  // RECEIPT_FROM_EMAIL after a bad env edit) wrote `status = 'sent'`. The
  // confirmation path keys on 'sent', so every order taken in that window was
  // permanently "confirmed" and never re-sent once mail was fixed.
  const created: string[] = [];
  const saved = {
    key: process.env.RESEND_API_KEY,
    from: process.env.RECEIPT_FROM_EMAIL,
    fetch: globalThis.fetch,
    warn: console.warn,
  };

  async function makeOrder(): Promise<string> {
    const id = randomUUID();
    created.push(id);
    await query(
      `insert into "order" (
         id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents,
         stripe_session_id, stripe_payment_intent, stripe_mode
       ) values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
                 8900, 700, 0, 9600, $2, $3, 'test')`,
      [id, `cs_test_${randomUUID()}`, `pi_${randomUUID()}`],
    );
    return id;
  }

  const statuses = async (id: string) =>
    (
      await query<{ status: string }>(
        `select status from email_log where order_id = $1 and template = 'order-confirmation'
          order by created_at, status`,
        [id],
      )
    ).map((row) => row.status);

  function noProvider() {
    delete process.env.RESEND_API_KEY;
    resetMailProvider();
  }

  /** A connected Resend whose every request is recorded rather than sent. */
  function resendThatRecords() {
    process.env.RESEND_API_KEY = "re_test_not_a_real_key";
    process.env.RECEIPT_FROM_EMAIL = "orders@guardtheory.net";
    resetMailProvider();
    const requests: { headers: Record<string, string>; body: string }[] = [];
    globalThis.fetch = (async (_url: unknown, init?: RequestInit) => {
      requests.push({
        headers: init?.headers as Record<string, string>,
        body: String(init?.body),
      });
      return new Response(JSON.stringify({ id: `email_${requests.length}` }), { status: 200 });
    }) as typeof fetch;
    return requests;
  }

  before(() => {
    console.warn = () => {};
  });

  after(async () => {
    globalThis.fetch = saved.fetch;
    console.warn = saved.warn;
    if (saved.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = saved.key;
    if (saved.from === undefined) delete process.env.RECEIPT_FROM_EMAIL;
    else process.env.RECEIPT_FROM_EMAIL = saved.from;
    resetMailProvider();
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    // No closePool here: the pricing block below closes it. Against PGlite
    // (one connection), the first query after a close answers ECONNRESET, so
    // this block sits ahead of the one that closes rather than after it.
  });

  it("with no provider, the row reads not-delivered", async () => {
    noProvider();
    const id = await makeOrder();
    await sendEmail("order-in-process", { to: "buyer@example.com", subject: "s", body: "b" }, id);
    const rows = await query<{ status: string; provider_id: string | null }>(
      "select status, provider_id from email_log where order_id = $1",
      [id],
    );
    assert.deepEqual(rows, [{ status: "not-delivered", provider_id: null }]);
  });

  it("with no provider, asking again does not pile up rows", async () => {
    noProvider();
    const id = await makeOrder();
    await ensureOrderConfirmationSent(id);
    await ensureOrderConfirmationSent(id);
    assert.deepEqual(await statuses(id), ["not-delivered"]);
  });

  it("once a provider is connected, an undelivered confirmation goes, once, with its key", async () => {
    noProvider();
    const id = await makeOrder();
    await ensureOrderConfirmationSent(id);
    assert.equal(await retryUndeliveredConfirmations(), 0, "nothing to retry with while mail only logs");

    const requests = resendThatRecords();
    assert.equal(await ensureOrderConfirmationSent(id), true);
    assert.equal(await ensureOrderConfirmationSent(id), false);

    assert.equal(requests.length, 1);
    assert.equal(requests[0]!.headers["Idempotency-Key"], `order-confirmation/${id}`);
    assert.deepEqual(await statuses(id), ["not-delivered", "sent"]);
  });

  it("the sweep finds unsent confirmations and sends each one", async () => {
    noProvider();
    const logged = await makeOrder();
    await ensureOrderConfirmationSent(logged);
    const failed = await makeOrder();
    await query(
      `insert into email_log (id, order_id, to_email, template, status, error)
       values ($1, $2, 'buyer@example.com', 'order-confirmation', 'failed', 'provider was down')`,
      [randomUUID(), failed],
    );

    const requests = resendThatRecords();
    const retried = await retryUndeliveredConfirmations();

    assert.ok(retried >= 2, `retried ${retried}`);
    const keys = requests.map((r) => r.headers["Idempotency-Key"]);
    assert.ok(keys.includes(`order-confirmation/${logged}`));
    assert.ok(keys.includes(`order-confirmation/${failed}`));
    assert.equal(await retryUndeliveredConfirmations(), 0, "a second sweep has nothing left");
  });
});

describe("pricing a cart when the rate cannot be read", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const productId = randomUUID();
  const variantId = randomUUID();
  let original: string | undefined;

  before(async () => {
    original = (
      await query<{ value: string }>("select value from setting where key = 'shipping_flat_cents'")
    )[0]?.value;
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 8900, 'Rate Test', 'Fixture')`,
      [productId, `rate-test-${productId.slice(0, 8)}`],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, 'M', $3, 5)`,
      [variantId, productId, `RATE-${productId.slice(0, 8)}`],
    );
  });

  after(async () => {
    await query(
      `insert into setting (key, value) values ('shipping_flat_cents', $1)
       on conflict (key) do update set value = excluded.value`,
      [original ?? "700"],
    );
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  const price = () => priceCart([{ variantId, quantity: 1 }], () => undefined);

  it("prices normally while the rate is readable", async () => {
    const cart = await price();
    assert.equal(cart.lines.length, 1);
    assert.equal(cart.shippingCents, Number(original ?? "700"));
    assert.ok(cart.intentId);
  });

  it("refuses to price — never charges 0 — when the rate is unreadable or gone", async () => {
    // Only intents for THIS cart. The suite's files run in parallel against
    // one database, and several of them price carts of their own; a count of
    // every row in the table moved under this test once in CI (19 !== 18)
    // because another file inserted an intent between the two reads. The
    // fixture variant's id is random, so a line carrying it is this test's.
    const intents = async () =>
      (
        await query<{ n: number }>(
          "select count(*)::int as n from checkout_intent where lines_json @> $1::jsonb",
          [JSON.stringify([{ variantId }])],
        )
      )[0]!.n;

    for (const broken of ["seven dollars", "", "-700", "7.00"]) {
      await query("update setting set value = $1 where key = 'shipping_flat_cents'", [broken]);
      const before = await intents();
      await assert.rejects(price, /shipping rate/, JSON.stringify(broken));
      assert.equal(await intents(), before, "no intent may be recorded at a made-up rate");
    }

    await query("delete from setting where key = 'shipping_flat_cents'");
    await assert.rejects(price, /shipping rate/);
  });

  it("an empty cart needs no rate, and says nothing", async () => {
    const cart = await priceCart([], () => undefined);
    assert.equal(cart.lines.length, 0);
  });
});

describe("mail does not put people in the logs", () => {
  it("masks an address", () => {
    assert.equal(maskEmail("sam.fadda@example.com"), "s***@example.com");
    assert.equal(maskEmail("not-an-address"), "***");
  });

  it("with no provider, logs the subject and a length — not the body or the address", async () => {
    const previous = { key: process.env.RESEND_API_KEY, warn: console.warn };
    delete process.env.RESEND_API_KEY;
    const lines: string[] = [];
    console.warn = (...parts: unknown[]) => void lines.push(parts.join(" "));

    try {
      const provider = getMailProvider();
      assert.equal(provider.delivers, false, "this test must not be able to send mail");
      await provider.send({
        to: "sam.fadda@example.com",
        subject: "Order 1042 received",
        body: "Sam Fadda\n1 Test Street\nLos Angeles CA 90015",
      } as never);
    } finally {
      console.warn = previous.warn;
      if (previous.key !== undefined) process.env.RESEND_API_KEY = previous.key;
    }

    const logged = lines.join("\n");
    assert.match(logged, /Order 1042 received/);
    assert.doesNotMatch(logged, /1 Test Street|90015|sam\.fadda/);
  });
});

describe("Shippo failures", () => {
  const realFetch = globalThis.fetch;
  const env = { ...process.env };

  before(() => {
    Object.assign(process.env, {
      SHIPPO_API_TOKEN: "shippo_test_neverSentAnywhere",
      SHIP_FROM_NAME: "Guard Theory",
      SHIP_FROM_STREET1: "1 Origin Street",
      SHIP_FROM_CITY: "Los Angeles",
      SHIP_FROM_STATE: "CA",
      SHIP_FROM_ZIP: "90015",
    });
  });

  after(() => {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
  });

  const to = {
    name: "Sam Fadda",
    street1: "1 Secret Lane",
    city: "Los Angeles",
    state: "CA",
    zip: "90015",
    country: "US",
  };

  // Every request is answered here. Nothing reaches the network.
  function answer(handler: (path: string) => Response | Promise<Response>) {
    globalThis.fetch = (async (input: RequestInfo | URL) =>
      handler(new URL(String(input)).pathname)) as typeof fetch;
  }

  it("never carries the response body, which can quote the address", async () => {
    answer(() => new Response('{"address_to":[{"street1":"1 Secret Lane is invalid"}]}', { status: 422 }));

    await assert.rejects(
      () => buyUspsLabel(to, "order-1"),
      (error: unknown) => {
        assert.ok(error instanceof ShippoError);
        assert.doesNotMatch(error.message, /Secret Lane/);
        assert.match(error.message, /422/);
        assert.equal(error.nothingBought, true);
        return true;
      },
    );
  });

  it("an unanswered PURCHASE is not reported as nothing bought", async () => {
    answer((path) => {
      if (path.startsWith("/shipments")) {
        return Response.json({
          rates: [{ object_id: "rate_1", provider: "USPS", amount: "5.00", servicelevel: { token: "usps_ground_advantage" } }],
        });
      }
      throw new Error("socket hang up");
    });

    await assert.rejects(
      () => buyUspsLabel(to, "order-2"),
      (error: unknown) => {
        assert.ok(error instanceof ShippoError);
        assert.equal(error.nothingBought, false, "the claim on the order must NOT be released");
        assert.match(error.message, /may or may not/);
        return true;
      },
    );
  });

  it("an unanswered rate request is safe to retry", async () => {
    answer(() => {
      throw new Error("timeout");
    });

    await assert.rejects(
      () => buyUspsLabel(to, "order-3"),
      (error: unknown) => error instanceof ShippoError && error.nothingBought === true,
    );
  });
});

