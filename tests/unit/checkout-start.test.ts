import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import { startCheckout } from "../../src/lib/stripe/start.ts";
import { sessionExpiresAt } from "../../src/lib/stripe/checkout.ts";
import { priceCart, purgeStaleIntents, snapshotDrift } from "../../src/lib/cart/price.ts";
import {
  CHECKOUT_INTENT_RETENTION_DAYS,
  CHECKOUT_INTENT_TTL_MINUTES,
  CHECKOUT_SESSION_MINUTES,
  MAX_CART_LINES,
  type PricedLine,
} from "../../src/lib/cart/types.ts";

/**
 * The hop to Stripe, on our side of it.
 *
 * It used to be a GET route that 303'd, and the e2e suite requested it with bad
 * intents. It is a server action returning a value now, so the same cases are
 * asserted here against the function the action wraps. None of them reaches
 * Stripe: every case returns before `createCheckoutSession` is called.
 *
 * The contract every case shares: a problem comes back as a named reason the
 * cart can put into words, never as a throw and never as a URL.
 */

const HAS_DB = isDatabaseConfigured();

function withKey<T>(key: string | undefined, run: () => Promise<T>): Promise<T> {
  const previous = process.env.STRIPE_SECRET_KEY;

  if (key === undefined) {
    delete process.env.STRIPE_SECRET_KEY;
  } else {
    process.env.STRIPE_SECRET_KEY = key;
  }

  return run().finally(() => {
    if (previous === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = previous;
    }
  });
}

const FAKE_KEY = "sk_test_noNetworkCallIsMadeByAnyCaseHere";

describe("starting a checkout", () => {
  it("no intent is a named problem, not a throw", async () => {
    assert.deepEqual(await startCheckout(""), { ok: false, problem: "no-intent" });
    assert.deepEqual(await startCheckout("   "), { ok: false, problem: "no-intent" });
  });

  it("a non-string intent from the wire is treated as none", async () => {
    // Server actions receive whatever the client serialised.
    const result = await startCheckout(undefined as unknown as string);
    assert.deepEqual(result, { ok: false, problem: "no-intent" });
  });

  it("with no Stripe key it says unavailable rather than failing", async () => {
    const result = await withKey(undefined, () => startCheckout("any-intent"));
    assert.deepEqual(result, { ok: false, problem: "unavailable" });
  });
});

describe("starting a checkout against a database", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  // The pool is closed once, by the last database suite in this file. Closing
  // it here and reopening it a moment later resets PGlite's one connection.

  it("an unknown intent is expired, and the cart is left intact", async () => {
    const result = await withKey(FAKE_KEY, () => startCheckout(`missing-${randomUUID()}`));
    assert.deepEqual(result, { ok: false, problem: "expired" });
  });

  it("a paid intent is refused, so nobody is sent to pay twice", async () => {
    const id = randomUUID();
    await query(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents, consumed_at)
       values ($1, '[]'::jsonb, 0, 0, now())`,
      [id],
    );

    const result = await withKey(FAKE_KEY, () => startCheckout(id));
    assert.deepEqual(result, { ok: false, problem: "already-paid" });
  });

  it("an intent with no lines is empty, and never reaches Stripe", async () => {
    const id = randomUUID();
    await query(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents)
       values ($1, '[]'::jsonb, 0, 0)`,
      [id],
    );

    const result = await withKey(FAKE_KEY, () => startCheckout(id));
    assert.deepEqual(result, { ok: false, problem: "empty" });
  });
});

/**
 * A priced cart is a snapshot, and snapshots go off.
 *
 * Every case below returns BEFORE a Checkout Session would be created — that
 * is the point of them — so none reaches Stripe. The one path that would, a
 * fresh snapshot nothing has moved under, is asserted on `snapshotDrift`
 * directly rather than through `startCheckout`.
 */
describe("a checkout intent that has gone off", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const productId = randomUUID();
  const variantId = randomUUID();
  const sku = `STALE-${productId.slice(0, 8)}`;
  let shipping = 0;

  const line = (overrides: Partial<PricedLine> = {}): PricedLine => ({
    variantId,
    quantity: 2,
    slug: `stale-test-${productId.slice(0, 8)}`,
    productName: "Stale Test",
    productKind: "Fixture",
    sizeLabel: "M",
    sku,
    unitCents: 8900,
    lineCents: 17800,
    stock: 5,
    ...overrides,
  });

  async function intent(lines: PricedLine[], ageMinutes = 0, shippingCents = shipping) {
    const id = randomUUID();
    await query(
      `insert into checkout_intent (id, lines_json, subtotal_cents, shipping_cents, created_at)
       values ($1, $2::jsonb, $3, $4, now() - make_interval(mins => $5))`,
      [id, JSON.stringify(lines), lines.reduce((t, l) => t + l.lineCents, 0), shippingCents, ageMinutes],
    );
    return id;
  }

  const reset = () =>
    Promise.all([
      query("update product set status = 'active', price_cents = 8900, sale_cents = null where id = $1", [
        productId,
      ]),
      query("update variant set stock = 5 where id = $1", [variantId]),
    ]);

  before(async () => {
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 8900, 'Stale Test', 'Fixture')`,
      [productId, `stale-test-${productId.slice(0, 8)}`],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, 'M', $3, 5)`,
      [variantId, productId, sku],
    );
    const rows = await query<{ value: string }>(
      "select value from setting where key = 'shipping_flat_cents'",
    );
    shipping = Number(rows[0]!.value);
  });

  after(async () => {
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  it("nothing moved: no drift", async () => {
    assert.equal(await snapshotDrift([line()], shipping), null);
  });

  it("an intent past its TTL is expired, however true its figures still are", async () => {
    const fresh = await intent([line()], CHECKOUT_INTENT_TTL_MINUTES - 2);
    const old = await intent([line()], CHECKOUT_INTENT_TTL_MINUTES + 1);

    assert.equal(await snapshotDrift([line()], shipping), null, "the figures are still right");
    assert.deepEqual(await withKey(FAKE_KEY, () => startCheckout(old)), {
      ok: false,
      problem: "expired",
    });

    // And the control, so the TTL is what refused it: the younger twin gets
    // past the age check and is stopped by the NEXT guard instead.
    await query("update variant set stock = 0 where id = $1", [variantId]);
    assert.deepEqual(await withKey(FAKE_KEY, () => startCheckout(fresh)), {
      ok: false,
      problem: "cart-changed",
    });
    await reset();
  });

  it("a price change, a sale, a withdrawal, a sell-out or a new shipping rate all stop it", async () => {
    const moves: Record<string, () => Promise<unknown>> = {
      "price raised": () => query("update product set price_cents = 9900 where id = $1", [productId]),
      "price lowered": () => query("update product set price_cents = 100 where id = $1", [productId]),
      "sale started": () => query("update product set sale_cents = 6900 where id = $1", [productId]),
      "price removed": () => query("update product set price_cents = null where id = $1", [productId]),
      "taken off sale": () => query("update product set status = 'draft' where id = $1", [productId]),
      "one left, two wanted": () => query("update variant set stock = 1 where id = $1", [variantId]),
      "size deleted": () => query("delete from variant where id = $1", [variantId]),
    };

    for (const [name, move] of Object.entries(moves)) {
      const id = await intent([line()]);
      await move();
      assert.deepEqual(
        await withKey(FAKE_KEY, () => startCheckout(id)),
        { ok: false, problem: "cart-changed" },
        name,
      );

      if (name === "size deleted") {
        await query(
          `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, 'M', $3, 5)`,
          [variantId, productId, sku],
        );
      }
      await reset();
    }

    const wrongShipping = await intent([line()], 0, shipping + 100);
    assert.deepEqual(await withKey(FAKE_KEY, () => startCheckout(wrongShipping)), {
      ok: false,
      problem: "cart-changed",
    });
  });

  it("a snapshot that does not add up is refused even if every row agrees", async () => {
    assert.match(
      (await snapshotDrift([line({ lineCents: 1 })], shipping)) ?? "",
      /line total/,
    );
    assert.match((await snapshotDrift([line({ quantity: 0, lineCents: 0 })], shipping)) ?? "", /quantity/);
  });

  it("old unpaid intents are swept; paid ones and recent ones are kept", async () => {
    const days = (n: number) => n * 24 * 60;
    const oldUnpaid = await intent([line()], days(CHECKOUT_INTENT_RETENTION_DAYS + 1));
    const recent = await intent([line()], days(CHECKOUT_INTENT_RETENTION_DAYS - 1));
    const oldPaid = await intent([line()], days(CHECKOUT_INTENT_RETENTION_DAYS + 30));
    await query("update checkout_intent set consumed_at = now() where id = $1", [oldPaid]);

    assert.ok((await purgeStaleIntents()) >= 1);

    const left = await query<{ id: string }>(
      "select id from checkout_intent where id = any($1::text[])",
      [[oldUnpaid, recent, oldPaid]],
    );
    assert.deepEqual(left.map((row) => row.id).sort(), [recent, oldPaid].sort());
  });

  it("a cart is capped at MAX_CART_LINES distinct lines", async () => {
    const flood = Array.from({ length: MAX_CART_LINES + 200 }, (_, i) => ({
      variantId: `flood-${i}`,
      quantity: 1,
    }));
    // The real line comes last — past the cap — so it must NOT be priced.
    const priced = await priceCart([...flood, { variantId, quantity: 1 }], () => undefined);
    assert.equal(priced.dropped.length, MAX_CART_LINES);
    assert.equal(priced.lines.length, 0);

    // The same size listed many times is one line and is never cut off.
    const repeated = await priceCart(
      Array.from({ length: 50 }, () => ({ variantId, quantity: 1 })),
      () => undefined,
    );
    assert.equal(repeated.lines.length, 1);
    assert.equal(repeated.lines[0]!.quantity, 5, "clamped to stock, not multiplied by repetition");
  });
});

describe("the Checkout Session expiry", () => {
  it("is never less than Stripe's 30-minute minimum, and never much more", () => {
    assert.equal(CHECKOUT_SESSION_MINUTES, 30);
    for (const now of [0, 1, 59_999, 60_000, 1_726_000_000_123, 1_726_000_059_999]) {
      const seconds = sessionExpiresAt(now) - now / 1000;
      assert.ok(seconds > 30 * 60 + 60, `${now}: ${seconds}s leaves no margin over the minimum`);
      assert.ok(seconds <= 32 * 60, `${now}: ${seconds}s is longer than intended`);
    }
  });

  it("is stable within a minute, so a double-click shares an idempotency key", () => {
    const base = 1_726_000_020_000;
    assert.equal(sessionExpiresAt(base), sessionExpiresAt(base + 30_000));
    assert.notEqual(sessionExpiresAt(base), sessionExpiresAt(base + 60_000));
  });
});
