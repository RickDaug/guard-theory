import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";

import { INTENT_REUSE_MINUTES, priceCart } from "../../src/lib/cart/price.ts";
import { CHECKOUT_INTENT_TTL_MINUTES } from "../../src/lib/cart/types.ts";
import {
  CHECKOUT_BUCKET,
  PRICE_BUCKET,
  RATE_LIMIT_RETENTION_HOURS,
  callerKey,
  sweepRateLimits,
  takeRateLimit,
  type RateLimitBucket,
} from "../../src/lib/rate-limit-db.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

const HAS_DB = isDatabaseConfigured();

describe("the cart's rate limit, statically", () => {
  it("never keeps the address: the key is a keyed hash", () => {
    const key = callerKey("203.0.113.9");
    assert.match(key, /^[0-9a-f]{64}$/);
    assert.equal(key, callerKey(" 203.0.113.9 "), "the same caller is the same key");
    assert.notEqual(key, callerKey("203.0.113.10"));
    assert.ok(!key.includes("203.0.113.9"));
  });

  it("keys an IPv6 caller by its /64, so rotating addresses is one caller", () => {
    assert.equal(callerKey("2001:db8:5:6::1"), callerKey("2001:db8:5:6:ffff:1:2:3"));
    assert.notEqual(callerKey("2001:db8:5:6::1"), callerKey("2001:db8:5:7::1"));
    assert.equal(callerKey("::ffff:203.0.113.9"), callerKey("203.0.113.9"));
  });

  it("a reused intent always has time left to be turned into a checkout", () => {
    assert.ok(INTENT_REUSE_MINUTES > 0);
    assert.ok(CHECKOUT_INTENT_TTL_MINUTES - INTENT_REUSE_MINUTES >= 10);
  });

  it("starting a checkout is counted before Stripe is asked for anything", () => {
    const source = readFileSync("src/app/cart/actions.ts", "utf8");
    const body = source.slice(source.indexOf("export async function startCheckoutAction"));
    const gate = body.indexOf("takeRateLimit(CHECKOUT_BUCKET");
    assert.ok(gate !== -1, "startCheckoutAction must take the checkout rate limit");
    assert.ok(gate < body.indexOf("startCheckout(intentId)"), "and take it first");
  });

  it("pricing passes the caller's key, so new intents are counted", () => {
    const source = readFileSync("src/app/cart/actions.ts", "utf8");
    assert.match(source, /callerKey: await currentCallerKey\(\)/);
  });

  it("the migration creates the table the limiter writes", () => {
    const sql = readFileSync("migrations/0010_rate_limit.sql", "utf8");
    assert.match(sql, /create table if not exists rate_limit/);
    assert.match(sql, /primary key \(bucket, key_hash, window_start\)/);
  });
});

describe("the cart's rate limit, in Postgres", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  // A bucket of this test's own, so nothing else in the suite moves its counts.
  const bucket = (perCaller: number, allCallers: number): RateLimitBucket => ({
    name: `test-${randomUUID()}`,
    windowSeconds: 3600,
    perCaller,
    allCallers,
  });

  after(async () => {
    await query("delete from rate_limit where bucket like 'test-%'");
  });

  it("lets a caller through up to its limit, then refuses with a wait", async () => {
    const b = bucket(3, 100);
    const me = callerKey(`198.51.100.${Math.floor(Math.random() * 250)}`);

    for (let i = 0; i < 3; i += 1) {
      assert.deepEqual(await takeRateLimit(b, me), { allowed: true }, `call ${i + 1}`);
    }

    const refused = await takeRateLimit(b, me);
    assert.equal(refused.allowed, false);
    assert.ok(!refused.allowed && refused.retryAfterSeconds >= 1 && refused.retryAfterSeconds <= 3600);

    // Someone else is unaffected.
    assert.deepEqual(await takeRateLimit(b, callerKey("192.0.2.1")), { allowed: true });
  });

  it("holds one row per caller per window, however hard it pushes", async () => {
    const b = bucket(2, 100);
    const me = callerKey("192.0.2.77");
    for (let i = 0; i < 10; i += 1) await takeRateLimit(b, me);

    const rows = await query<{ hits: number }>(
      "select hits from rate_limit where bucket = $1 and key_hash = $2",
      [b.name, me],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.hits, 10);
  });

  it("stores no address anywhere", async () => {
    const b = bucket(5, 100);
    await takeRateLimit(b, callerKey("192.0.2.200"));
    const rows = await query<{ key_hash: string }>(
      "select key_hash from rate_limit where bucket = $1",
      [b.name],
    );
    assert.ok(rows.length > 0);
    for (const row of rows) {
      assert.ok(row.key_hash === "*" || /^[0-9a-f]{64}$/.test(row.key_hash), row.key_hash);
      assert.ok(!row.key_hash.includes("192.0.2.200"));
    }
  });

  it("limits everyone together, and a refused caller does not use up the others' share", async () => {
    const b = bucket(2, 4);
    const loud = callerKey("203.0.113.1");

    // Two allowed, then refused many times: only the two count against everyone.
    for (let i = 0; i < 20; i += 1) await takeRateLimit(b, loud);

    assert.deepEqual(await takeRateLimit(b, callerKey("203.0.113.2")), { allowed: true });
    assert.deepEqual(await takeRateLimit(b, callerKey("203.0.113.3")), { allowed: true });

    const botnet = await takeRateLimit(b, callerKey("203.0.113.4"));
    assert.equal(botnet.allowed, false, "the fifth caller-allowed request exceeds the all-callers limit");
  });

  it("sweeps windows older than a day, and keeps current ones", async () => {
    const b = bucket(5, 100);
    await takeRateLimit(b, callerKey("192.0.2.5"));
    await query(
      `insert into rate_limit (bucket, key_hash, window_start, hits)
       values ($1, 'old', now() - make_interval(hours => $2 + 1), 1)`,
      [b.name, RATE_LIMIT_RETENTION_HOURS],
    );

    assert.ok((await sweepRateLimits()) >= 1);

    const left = await query<{ key_hash: string }>(
      "select key_hash from rate_limit where bucket = $1 order by key_hash",
      [b.name],
    );
    assert.ok(!left.some((row) => row.key_hash === "old"), "the old window went");
    assert.ok(left.length >= 1, "the current window stayed");
  });

  it("the real buckets are sane", () => {
    for (const b of [PRICE_BUCKET, CHECKOUT_BUCKET]) {
      assert.ok(b.perCaller > 0 && b.allCallers > b.perCaller && b.windowSeconds > 0, b.name);
    }
    assert.notEqual(PRICE_BUCKET.name, CHECKOUT_BUCKET.name);
  });
});

describe("pricing reuses the browser's own intent", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const productId = randomUUID();
  const variantId = randomUUID();
  const content = () => undefined;

  const intentsForThisCart = async () =>
    (
      await query<{ n: number }>(
        "select count(*)::int as n from checkout_intent where lines_json @> $1::jsonb",
        [JSON.stringify([{ variantId }])],
      )
    )[0]!.n;

  before(async () => {
    await query(
      `insert into setting (key, value) values ('shipping_flat_cents', '700')
       on conflict (key) do nothing`,
    );
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 8900, 'Limit Test', 'Fixture')`,
      [productId, `limit-test-${productId.slice(0, 8)}`],
    );
    await query(
      `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, 'M', $3, 5)`,
      [variantId, productId, `LIMIT-${productId.slice(0, 8)}`],
    );
  });

  after(async () => {
    await query("delete from checkout_intent where lines_json @> $1::jsonb", [
      JSON.stringify([{ variantId }]),
    ]);
    await query("delete from product where id = $1", [productId]);
    await query("delete from rate_limit where bucket = $1 and key_hash <> '*'", [PRICE_BUCKET.name]);
    await closePool();
  });

  it("an unchanged cart keeps its intent instead of writing a new one", async () => {
    const first = await priceCart([{ variantId, quantity: 1 }], content);
    assert.ok(first.intentId);
    const before = await intentsForThisCart();

    for (let i = 0; i < 5; i += 1) {
      const again = await priceCart([{ variantId, quantity: 1 }], content, {
        previousIntentId: first.intentId,
      });
      assert.equal(again.intentId, first.intentId);
    }

    assert.equal(await intentsForThisCart(), before, "no row was written for a re-price");
  });

  it("a changed cart gets a new intent", async () => {
    const first = await priceCart([{ variantId, quantity: 1 }], content);
    const changed = await priceCart([{ variantId, quantity: 2 }], content, {
      previousIntentId: first.intentId,
    });
    assert.ok(changed.intentId);
    assert.notEqual(changed.intentId, first.intentId);
  });

  it("a paid intent, or an old one, is never handed back", async () => {
    const paid = await priceCart([{ variantId, quantity: 1 }], content);
    await query("update checkout_intent set consumed_at = now() where id = $1", [paid.intentId]);
    const afterPaid = await priceCart([{ variantId, quantity: 1 }], content, {
      previousIntentId: paid.intentId,
    });
    assert.notEqual(afterPaid.intentId, paid.intentId);

    const old = await priceCart([{ variantId, quantity: 1 }], content);
    await query(
      "update checkout_intent set created_at = now() - make_interval(mins => $2 + 1) where id = $1",
      [old.intentId, INTENT_REUSE_MINUTES],
    );
    const afterOld = await priceCart([{ variantId, quantity: 1 }], content, {
      previousIntentId: old.intentId,
    });
    assert.notEqual(afterOld.intentId, old.intentId);
  });

  it("another cart's intent id is not a way to borrow its intent", async () => {
    const other = await priceCart([{ variantId, quantity: 3 }], content);
    const mine = await priceCart([{ variantId, quantity: 1 }], content, {
      previousIntentId: other.intentId,
    });
    assert.notEqual(mine.intentId, other.intentId);
  });

  it("past the limit, the cart is still priced but no new intent is written", async () => {
    const me = callerKey(`limit-test-${randomUUID()}`);

    for (let i = 0; i < PRICE_BUCKET.perCaller; i += 1) {
      await takeRateLimit(PRICE_BUCKET, me);
    }

    const before = await intentsForThisCart();
    const cart = await priceCart([{ variantId, quantity: 4 }], content, { callerKey: me });

    assert.equal(cart.intentId, null, "no checkout is offered");
    assert.equal(cart.lines.length, 1, "but the figures are still shown");
    assert.equal(await intentsForThisCart(), before, "and nothing was written");
  });

  it("re-pricing an unchanged cart is not counted against the limit", async () => {
    const me = callerKey(`reuse-test-${randomUUID()}`);
    const first = await priceCart([{ variantId, quantity: 1 }], content, { callerKey: me });
    assert.ok(first.intentId);

    for (let i = 0; i < PRICE_BUCKET.perCaller + 5; i += 1) {
      const again = await priceCart([{ variantId, quantity: 1 }], content, {
        callerKey: me,
        previousIntentId: first.intentId,
      });
      assert.equal(again.intentId, first.intentId);
    }
  });
});
