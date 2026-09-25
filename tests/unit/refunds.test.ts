import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import {
  refundOrder,
  syncRefundFromCharge,
  type CreateRefund,
} from "../../src/lib/orders/refund.ts";
import { claimLabelPurchase, releaseLabelClaim } from "../../src/lib/orders/label.ts";
import { ensureOrderConfirmationSent } from "../../src/lib/orders/confirmation.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * Refunds and labels: the two places the portal spends real money.
 *
 * There were no refund tests at all. Stripe is never called here — refundOrder
 * takes the function that moves the money as a parameter, and these pass one
 * that records what it was asked to do.
 */

const HAS_DB = isDatabaseConfigured();
delete process.env.RESEND_API_KEY;

const created: string[] = [];

async function makeOrder(totalCents = 9600): Promise<{ id: string; pi: string }> {
  const id = randomUUID();
  created.push(id);
  const pi = `pi_${randomUUID()}`;
  await query(
    `insert into "order" (
       id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
       subtotal_cents, shipping_cents, tax_cents, total_cents,
       stripe_session_id, stripe_payment_intent, stripe_mode
     ) values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
               $2, 700, 0, $3, $4, $5, 'test')`,
    [id, totalCents - 700, totalCents, `cs_test_${randomUUID()}`, pi],
  );
  return { id, pi };
}

const state = async (id: string) =>
  (
    await query<{ refunded_cents: number; refund_status: string; flagged_reason: string | null }>(
      `select refunded_cents, refund_status, flagged_reason from "order" where id = $1`,
      [id],
    )
  )[0]!;

function recorder() {
  const calls: Parameters<CreateRefund>[0][] = [];
  const createRefund: CreateRefund = async (input) => {
    calls.push(input);
  };
  return { calls, createRefund };
}

describe("refunds", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  it("a partial refund, then the rest, and then nothing more", async () => {
    const { id, pi } = await makeOrder();
    const { calls, createRefund } = recorder();

    const first = await refundOrder(id, 2000, { createRefund });
    assert.deepEqual(first, { ok: true, refundedCents: 2000, status: "partial" });
    assert.deepEqual(await state(id), {
      refunded_cents: 2000,
      refund_status: "partial",
      flagged_reason: "refunded",
    });

    const rest = await refundOrder(id, undefined, { createRefund });
    assert.deepEqual(rest, { ok: true, refundedCents: 9600, status: "full" });

    const more = await refundOrder(id, 1, { createRefund });
    assert.equal(more.ok, false);

    assert.deepEqual(
      calls.map((c) => [c.paymentIntent, c.amountCents]),
      [
        [pi, 2000],
        [pi, 7600],
      ],
    );
    assert.notEqual(calls[0]!.idempotencyKey, calls[1]!.idempotencyKey);
  });

  it("refuses amounts that are not a whole, positive, safe number of cents", async () => {
    const { id } = await makeOrder();
    const { calls, createRefund } = recorder();

    for (const amount of [0, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53, 9601]) {
      const result = await refundOrder(id, amount, { createRefund });
      assert.equal(result.ok, false, String(amount));
    }

    assert.equal(calls.length, 0, "Stripe must not be asked for any of those");
    assert.equal((await state(id)).refunded_cents, 0);
  });

  it("a double submit of the same form refunds once", async () => {
    // Both requests carry what the page showed: nothing refunded yet. They
    // serialise on the row lock; the second then no longer matches and stops.
    const { id } = await makeOrder();
    const { calls, createRefund } = recorder();

    const results = await Promise.all([
      refundOrder(id, 2000, { createRefund, expectedRefundedCents: 0 }),
      refundOrder(id, 2000, { createRefund, expectedRefundedCents: 0 }),
    ]);

    assert.equal(results.filter((r) => r.ok).length, 1);
    assert.equal(calls.length, 1);
    assert.equal((await state(id)).refunded_cents, 2000);
  });

  it("when Stripe refuses, nothing is written", async () => {
    const { id } = await makeOrder();
    const result = await refundOrder(id, 2000, {
      createRefund: async () => {
        throw new Error("charge_already_refunded");
      },
    });
    assert.equal(result.ok, false);
    assert.deepEqual(await state(id), {
      refunded_cents: 0,
      refund_status: "none",
      flagged_reason: null,
    });
  });

  it("charge.refunded events arriving out of order never lower the figure", async () => {
    const { id, pi } = await makeOrder();

    // Two dashboard refunds: 2000, then 3000 more. Stripe's events carry the
    // running total — 2000, then 5000 — and the second arrives first.
    await syncRefundFromCharge(pi, 5000);
    await syncRefundFromCharge(pi, 2000);
    assert.deepEqual(await state(id), {
      refunded_cents: 5000,
      refund_status: "partial",
      flagged_reason: "refunded",
    });

    await syncRefundFromCharge(pi, 9600);
    await syncRefundFromCharge(pi, 5000);
    assert.equal((await state(id)).refund_status, "full");
    assert.equal((await state(id)).refunded_cents, 9600);

    await assert.rejects(() => syncRefundFromCharge(pi, -1));
    await assert.rejects(() => syncRefundFromCharge(pi, 1.5));
  });
});

describe("buying a label", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  it("of two simultaneous attempts exactly one may call Shippo", async () => {
    const { id } = await makeOrder();
    const claims = await Promise.all([claimLabelPurchase(id), claimLabelPurchase(id)]);

    assert.equal(claims.filter((c) => c.claimed).length, 1);
    assert.deepEqual(
      claims.find((c) => !c.claimed),
      { claimed: false, why: "in-progress" },
    );
  });

  it("a refusal from Shippo releases the claim; a recorded label ends it for good", async () => {
    const { id } = await makeOrder();

    assert.equal((await claimLabelPurchase(id)).claimed, true);
    await releaseLabelClaim(id);
    assert.equal((await claimLabelPurchase(id)).claimed, true);

    await query(`update "order" set tracking_number = '9400100000000000000000' where id = $1`, [id]);
    assert.deepEqual(await claimLabelPurchase(id), { claimed: false, why: "has-tracking" });

    // Releasing cannot reopen an order that has a label.
    await releaseLabelClaim(id);
    assert.deepEqual(await claimLabelPurchase(id), { claimed: false, why: "has-tracking" });
  });

  it("a claim nobody finished is NOT taken over: its outcome is unknown", async () => {
    const { id } = await makeOrder();
    assert.equal((await claimLabelPurchase(id)).claimed, true);
    await query(`update "order" set label_claimed_at = now() - interval '1 hour' where id = $1`, [id]);

    assert.deepEqual(await claimLabelPurchase(id), { claimed: false, why: "abandoned" });
    assert.deepEqual(await claimLabelPurchase("no-such-order"), { claimed: false, why: "gone" });
  });
});

describe("the order confirmation", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  // The last database suite in the file tidies up and closes the pool, once.
  after(async () => {
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    await closePool();
  });

  it("goes once, however many times it is asked for", async () => {
    const { id } = await makeOrder();

    assert.equal(await ensureOrderConfirmationSent(id), true);
    assert.equal(await ensureOrderConfirmationSent(id), false);

    const log = await query("select id from email_log where order_id = $1", [id]);
    assert.equal(log.length, 1);
  });

  it("is tried again when the only attempt on record failed", async () => {
    const { id } = await makeOrder();
    await query(
      `insert into email_log (id, order_id, to_email, template, status, error)
       values ($1, $2, 'buyer@example.com', 'order-confirmation', 'failed', 'provider was down')`,
      [randomUUID(), id],
    );

    assert.equal(await ensureOrderConfirmationSent(id), true);
    assert.equal(await ensureOrderConfirmationSent("no-such-order"), false);
  });
});
