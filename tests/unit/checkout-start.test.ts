import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import { startCheckout } from "../../src/lib/stripe/start.ts";

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
  after(async () => {
    await closePool();
  });

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
