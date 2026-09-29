import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import { cancelOrder, CANCEL_REFUSED_SHIPPED } from "../../src/lib/orders/cancel.ts";
import {
  refundOrder,
  REFUND_OUTCOME_UNKNOWN,
  type CreateRefund,
} from "../../src/lib/orders/refund.ts";
import { restockReturn } from "../../src/lib/orders/restock.ts";
import { claimLabelPurchase } from "../../src/lib/orders/label.ts";
import { orderCancelled } from "../../src/lib/mail/templates.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * Cancel means refund, and stock goes back exactly once.
 *
 * Before this, a cancel changed the status and nothing else: the buyer stayed
 * charged, the units stayed off the shelf, and nobody was told. A refund never
 * touched stock at all.
 *
 * Stripe is never called: cancelOrder and refundOrder take the function that
 * moves money, and these pass one that records what it was asked.
 *
 * The pool is widened to three connections for this file only, so the races
 * below are real races on the order row — two requests, two connections, the
 * database deciding — rather than two calls queueing for one connection. CI's
 * Postgres takes that as is; locally, run `db:local --max-connections 4`.
 */
process.env.DATABASE_POOL_MAX = "3";
delete process.env.RESEND_API_KEY;

const HAS_DB = isDatabaseConfigured();

let productId = "";
/** Two sizes, ids chosen so their lock order is known: A before B. */
let variantA = "";
let variantB = "";
const created: string[] = [];

type Line = { variant: string; quantity: number; stockTaken?: number | null; unitCents?: number };

async function stockOf(id: string): Promise<number> {
  return (await query<{ stock: number }>("select stock from variant where id = $1", [id]))[0]!
    .stock;
}

/**
 * A paid order as fulfilment leaves it: items written, stock taken off the
 * shelf (unless `stockTaken` says the line was oversold).
 */
async function makeOrder(
  lines: Line[],
  extra: {
    status?: string;
    tracking?: string | null;
    claimed?: boolean;
    refundedCents?: number;
  } = {},
): Promise<{ id: string; total: number; items: string[] }> {
  const id = randomUUID();
  created.push(id);
  const subtotal = lines.reduce((sum, l) => sum + (l.unitCents ?? 4000) * l.quantity, 0);
  const total = subtotal + 700;
  const refunded = extra.refundedCents ?? 0;

  await query(
    `insert into "order" (
       id, status, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
       subtotal_cents, shipping_cents, tax_cents, total_cents,
       stripe_session_id, stripe_payment_intent, stripe_mode,
       tracking_number, label_claimed_at, refunded_cents, refund_status
     ) values ($1, $2, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
               $3, 700, 0, $4, $5, $6, 'test', $7, $8, $9, $10)`,
    [
      id,
      extra.status ?? "new",
      subtotal,
      total,
      `cs_test_${randomUUID()}`,
      `pi_${randomUUID()}`,
      extra.tracking ?? null,
      extra.claimed ? new Date() : null,
      refunded,
      refunded === 0 ? "none" : refunded >= total ? "full" : "partial",
    ],
  );

  const items: string[] = [];

  for (const line of lines) {
    const itemId = randomUUID();
    items.push(itemId);
    const taken = line.stockTaken === undefined ? line.quantity : line.stockTaken;
    await query(
      `insert into order_item (id, order_id, variant_id, product_name, product_kind, size_label, sku,
                               unit_cents, quantity, stock_taken)
       values ($1, $2, $3, 'Theory 01', 'Long sleeve rash guard', $4, $5, $6, $7, $8)`,
      [
        itemId,
        id,
        line.variant,
        line.variant === variantA ? "M" : "L",
        `CANCEL-${itemId.slice(0, 8)}`,
        line.unitCents ?? 4000,
        line.quantity,
        taken,
      ],
    );
    if (taken) {
      await query("update variant set stock = stock - $2 where id = $1", [line.variant, taken]);
    }
  }

  return { id, total, items };
}

async function orderRow(id: string) {
  return (
    await query<{
      status: string;
      refunded_cents: number;
      refund_status: string;
      cancelled_at: Date | null;
      label_claimed_at: Date | null;
    }>(
      `select status, refunded_cents, refund_status, cancelled_at, label_claimed_at
         from "order" where id = $1`,
      [id],
    )
  )[0]!;
}

async function cancelEmails(id: string) {
  return query<{ status: string }>(
    `select status from email_log where order_id = $1 and template = 'order-cancelled'`,
    [id],
  );
}

function recorder() {
  const calls: Parameters<CreateRefund>[0][] = [];
  const createRefund: CreateRefund = async (input) => {
    calls.push(input);
  };
  return { calls, createRefund };
}

function stripeError(type: string, message: string): Error {
  return Object.assign(new Error(message), { type });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("cancel and restock", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  before(async () => {
    productId = randomUUID();
    variantA = `a-${randomUUID()}`;
    variantB = `b-${randomUUID()}`;
    await query(
      `insert into product (id, slug, status, price_cents, name, kind)
       values ($1, $2, 'active', 4000, 'Cancel Test', 'Fixture')`,
      [productId, `cancel-test-${productId.slice(0, 8)}`],
    );
    for (const [variant, size] of [
      [variantA, "M"],
      [variantB, "L"],
    ] as const) {
      await query(
        `insert into variant (id, product_id, size_label, sku, stock) values ($1, $2, $3, $4, 20)`,
        [variant, productId, size, `CANCEL-${variant.slice(0, 10)}`],
      );
    }
  });

  after(async () => {
    await query(`delete from email_log where order_id = any($1)`, [created]);
    await query(`delete from order_item where order_id = any($1)`, [created]);
    await query(`delete from "order" where id = any($1)`, [created]);
    await query("delete from product where id = $1", [productId]);
    await closePool();
  });

  describe("cancel means refund", () => {
    it("refunds everything, puts the stock back and emails the buyer, in one action", async () => {
      const [a0, b0] = [await stockOf(variantA), await stockOf(variantB)];
      const { id, total } = await makeOrder([
        { variant: variantB, quantity: 1 },
        { variant: variantA, quantity: 2 },
      ]);
      assert.equal(await stockOf(variantA), a0 - 2);

      const { calls, createRefund } = recorder();
      const result = await cancelOrder(id, { createRefund });

      assert.equal(result.ok, true, JSON.stringify(result));
      assert.equal(result.ok && result.refundedCents, total);
      assert.deepEqual(
        calls.map((c) => c.amountCents),
        [total],
        "exactly one refund, of everything",
      );

      const row = await orderRow(id);
      assert.equal(row.status, "cancelled");
      assert.ok(row.cancelled_at, "cancelled_at is stamped");
      assert.equal(row.refund_status, "full");
      assert.equal(row.refunded_cents, total);

      assert.equal(await stockOf(variantA), a0, "both units of M are back");
      assert.equal(await stockOf(variantB), b0, "the L is back");

      // No provider in tests: recorded as not delivered, like the rest of mail.
      assert.deepEqual(await cancelEmails(id), [{ status: "not-delivered" }]);
    });

    it("refunds only what is left after an earlier part refund", async () => {
      const { id, total } = await makeOrder([{ variant: variantA, quantity: 1 }], {
        refundedCents: 1000,
      });
      const { calls, createRefund } = recorder();

      const result = await cancelOrder(id, { createRefund });

      assert.equal(result.ok && result.refundedCents, total - 1000);
      assert.deepEqual(
        calls.map((c) => c.amountCents),
        [total - 1000],
      );
      assert.equal((await orderRow(id)).refunded_cents, total);
    });

    it("an order already refunded in full is cancelled without asking Stripe again", async () => {
      const a0 = await stockOf(variantA);
      const { id, total } = await makeOrder([{ variant: variantA, quantity: 1 }], {
        refundedCents: 4700,
      });
      assert.equal(total, 4700);
      const { calls, createRefund } = recorder();

      const result = await cancelOrder(id, { createRefund });

      assert.equal(result.ok && result.refundedCents, 0);
      assert.equal(calls.length, 0);
      assert.equal((await orderRow(id)).status, "cancelled");
      assert.equal(await stockOf(variantA), a0);
    });

    it("if Stripe refuses the refund, the order is NOT cancelled and nothing moves", async () => {
      const a0 = await stockOf(variantA);
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }]);

      const result = await cancelOrder(id, {
        createRefund: async () => {
          throw stripeError("StripeInvalidRequestError", "charge_disputed");
        },
      });

      assert.equal(result.ok, false);
      assert.match(!result.ok ? result.reason : "", /^Not cancelled\. Stripe refused/);
      const row = await orderRow(id);
      assert.equal(row.status, "new");
      assert.equal(row.refunded_cents, 0);
      assert.equal(await stockOf(variantA), a0 - 1, "stock stays with the uncancelled order");
      assert.deepEqual(await cancelEmails(id), []);
    });

    it("if Stripe does not answer, it says so truthfully and does not cancel", async () => {
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }]);

      const result = await cancelOrder(id, {
        createRefund: async () => {
          throw stripeError("StripeConnectionError", "timeout");
        },
      });

      assert.equal(result.ok, false);
      assert.ok(!result.ok && result.reason.endsWith(REFUND_OUTCOME_UNKNOWN));
      assert.equal((await orderRow(id)).status, "new");
    });

    it("a retry after an unknown outcome repeats the same Stripe request", async () => {
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }]);
      const keys: string[] = [];

      await cancelOrder(id, {
        createRefund: async (input) => {
          keys.push(input.idempotencyKey);
          throw stripeError("StripeAPIError", "500");
        },
      });
      const retry = await cancelOrder(id, {
        createRefund: async (input) => {
          keys.push(input.idempotencyKey);
        },
      });

      assert.equal(retry.ok, true);
      assert.equal(keys.length, 2);
      assert.equal(
        keys[0],
        keys[1],
        "same key, so Stripe answers with the refund it may already have made",
      );
    });

    it("refuses a shipped or delivered order in plain words: that is a return", async () => {
      for (const status of ["shipped", "delivered"]) {
        const a0 = await stockOf(variantA);
        const { id } = await makeOrder([{ variant: variantA, quantity: 1 }], {
          status,
          tracking: `9400${randomUUID().slice(0, 8)}`,
        });
        const { calls, createRefund } = recorder();

        const result = await cancelOrder(id, { createRefund });

        assert.deepEqual(result, { ok: false, reason: CANCEL_REFUSED_SHIPPED });
        assert.equal(calls.length, 0);
        assert.equal((await orderRow(id)).status, status);
        assert.equal(await stockOf(variantA), a0 - 1);
      }
    });

    it("puts back only what fulfilment took: an oversold line took nothing", async () => {
      const [a0, b0] = [await stockOf(variantA), await stockOf(variantB)];
      const { id } = await makeOrder([
        { variant: variantA, quantity: 2, stockTaken: 0 },
        { variant: variantB, quantity: 1 },
      ]);

      const result = await cancelOrder(id, recorder());

      assert.equal(result.ok, true);
      assert.equal(await stockOf(variantA), a0, "no stock invented for the oversold line");
      assert.equal(await stockOf(variantB), b0);
    });

    it("a double-clicked cancel refunds once and restocks once", async () => {
      const a0 = await stockOf(variantA);
      const { id } = await makeOrder([{ variant: variantA, quantity: 2 }]);
      const { calls, createRefund } = recorder();

      const results = await Promise.all([
        cancelOrder(id, { createRefund }),
        cancelOrder(id, { createRefund }),
      ]);

      assert.equal(results.filter((r) => r.ok).length, 1, JSON.stringify(results));
      assert.match(results.find((r) => !r.ok && "reason" in r)?.reason ?? "", /already cancelled/);
      assert.equal(calls.length, 1, "Stripe asked once");
      assert.equal(await stockOf(variantA), a0, "two units back, not four");
      assert.equal((await cancelEmails(id)).length, 1, "one email");
    });

    it("cancel racing a label purchase: the claim that arrives during the cancel buys nothing", async () => {
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }]);
      let claim: ReturnType<typeof claimLabelPurchase> | undefined;

      // The label click lands while the cancel is inside Stripe, holding the row.
      const result = await cancelOrder(id, {
        createRefund: async () => {
          claim = claimLabelPurchase(id);
          await sleep(150);
        },
      });

      assert.equal(result.ok, true);
      assert.deepEqual(await claim, { claimed: false, why: "not-shippable" });
      const row = await orderRow(id);
      assert.equal(row.status, "cancelled");
      assert.equal(row.label_claimed_at, null, "no postage is being bought for a cancelled order");
    });

    it("cancel racing a label purchase: a claim that got there first stops the cancel", async () => {
      const a0 = await stockOf(variantA);
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }]);
      const { calls, createRefund } = recorder();

      const [claim, result] = await Promise.all([
        claimLabelPurchase(id),
        sleep(20).then(() => cancelOrder(id, { createRefund })),
      ]);

      assert.deepEqual(claim, { claimed: true });
      assert.equal(result.ok, false);
      assert.match(!result.ok ? result.reason : "", /label is being bought/);
      assert.equal(calls.length, 0, "no refund while a label is in flight");
      assert.equal((await orderRow(id)).status, "new");
      assert.equal(await stockOf(variantA), a0 - 1);
    });

    it("a label that was bought does not block the cancel, and the owner is told to void it", async () => {
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }], {
        tracking: "9400111899223197428490",
        claimed: true,
      });

      const result = await cancelOrder(id, recorder());

      assert.equal(result.ok && result.hasLabel, true);
    });
  });

  describe("refunds and stock", () => {
    it("a full refund of an unshipped order puts the stock back; a part refund does not", async () => {
      const a0 = await stockOf(variantA);
      const { id, total } = await makeOrder([{ variant: variantA, quantity: 2 }]);
      const { createRefund } = recorder();

      const part = await refundOrder(id, 1000, { createRefund });
      assert.equal(part.ok && part.restock, null);
      assert.equal(await stockOf(variantA), a0 - 2, "a part refund may be a price adjustment");

      const rest = await refundOrder(id, undefined, { createRefund });
      assert.equal(rest.ok && rest.status, "full");
      assert.equal(await stockOf(variantA), a0, "the goods never left the shelf");
      assert.equal((await orderRow(id)).refunded_cents, total);

      // A cancel afterwards refunds nothing and puts nothing back twice.
      const cancelled = await cancelOrder(id, { createRefund });
      assert.equal(cancelled.ok && cancelled.refundedCents, 0);
      assert.equal(await stockOf(variantA), a0);
    });

    it("a refund of a shipped order does NOT restock unless a line is ticked", async () => {
      const a0 = await stockOf(variantA);
      const { id } = await makeOrder([{ variant: variantA, quantity: 1 }], {
        status: "delivered",
        tracking: "9400111899223197428491",
      });

      const result = await refundOrder(id, undefined, recorder());

      assert.equal(result.ok && result.status, "full");
      assert.equal(result.ok && result.restock, null);
      assert.equal(await stockOf(variantA), a0 - 1, "the garment is in the post, or worn");
    });

    it("the ticked lines of a return go back, capped at what was bought", async () => {
      const [a0, b0] = [await stockOf(variantA), await stockOf(variantB)];
      const { id, items } = await makeOrder(
        [
          { variant: variantA, quantity: 2 },
          { variant: variantB, quantity: 1 },
        ],
        { status: "shipped", tracking: "9400111899223197428492" },
      );

      const result = await refundOrder(id, 4000, {
        createRefund: recorder().createRefund,
        restock: new Map([[items[0]!, 9]]),
      });

      assert.equal(result.ok, true, JSON.stringify(result));
      assert.equal(await stockOf(variantA), a0, "both M back, never nine");
      assert.equal(await stockOf(variantB), b0 - 1, "the unticked L stays out");

      // Later, the L comes back too, after the money is all gone.
      await refundOrder(id, undefined, recorder());
      const later = await restockReturn(
        id,
        new Map([
          [items[1]!, 1],
          [items[0]!, 1],
        ]),
      );
      assert.equal(later.ok, true);
      assert.equal(await stockOf(variantB), b0);
      assert.equal(await stockOf(variantA), a0, "the M line had nothing left to put back");
    });

    it("a double-submitted return restocks once", async () => {
      const a0 = await stockOf(variantA);
      const { id, items } = await makeOrder([{ variant: variantA, quantity: 1 }], {
        status: "delivered",
        tracking: "9400111899223197428493",
      });
      const { calls, createRefund } = recorder();
      const ticks = new Map([[items[0]!, 1]]);

      const results = await Promise.all([
        refundOrder(id, undefined, { createRefund, expectedRefundedCents: 0, restock: ticks }),
        refundOrder(id, undefined, { createRefund, expectedRefundedCents: 0, restock: ticks }),
      ]);

      assert.equal(results.filter((r) => r.ok).length, 1);
      assert.equal(calls.length, 1);
      assert.equal(await stockOf(variantA), a0, "one unit back, not two");
    });

    it("ticks on an order that has not shipped are refused, and nothing is refunded", async () => {
      const { id, items } = await makeOrder([{ variant: variantA, quantity: 1 }]);
      const { calls, createRefund } = recorder();

      const result = await refundOrder(id, 1000, {
        createRefund,
        restock: new Map([[items[0]!, 1]]),
      });

      assert.equal(result.ok, false);
      assert.equal(calls.length, 0);
      const refused = await restockReturn(id, new Map([[items[0]!, 1]]));
      assert.equal(refused.ok, false);
    });
  });
});

describe("the cancellation email", () => {
  const order = {
    number: 1042,
    email: "buyer@example.com",
    shipName: "Sam Fadda",
    currency: "USD",
    subtotalCents: 8900,
    shippingCents: 700,
    taxCents: 0,
    totalCents: 9600,
    items: [],
  };

  it("says what was refunded, and accounts for an earlier part refund", () => {
    const email = orderCancelled(order, { refundedCents: 7600, earlierRefundCents: 2000 });
    assert.match(email.subject, /Order 1042 has been cancelled/);
    assert.match(email.body, /refunded \$76\.00 to the card you paid with/);
    assert.match(email.body, /\$20\.00 refunded earlier/);
    assert.match(email.body, /\/policies\/returns/);
    assert.doesNotMatch(email.body, /!/);
  });

  it("does not promise a refund that was already made", () => {
    const email = orderCancelled(order, { refundedCents: 0, earlierRefundCents: 9600 });
    assert.match(email.body, /already been refunded in full/);
    assert.doesNotMatch(email.body, /We have refunded/);
  });
});
