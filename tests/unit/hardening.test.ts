import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import { parseShippingCents, priceCart } from "../../src/lib/cart/price.ts";
import { getMailProvider, maskEmail } from "../../src/lib/mail/index.ts";
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
    const intents = async () =>
      (await query<{ n: number }>("select count(*)::int as n from checkout_intent"))[0]!.n;

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
