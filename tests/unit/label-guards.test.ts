import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import {
  claimLabelPurchase,
  labelRefusal,
  recordBoughtLabel,
} from "../../src/lib/orders/label.ts";
import { buyUspsLabel, ShippoError, type BoughtLabel } from "../../src/lib/shipping/shippo.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The guards around buying a label: the one portal action that spends money
 * nobody gets back.
 */

const HAS_DB = isDatabaseConfigured();

const shippable = { status: "in_process", refund_status: "none", stripe_mode: "live" };

describe("a label is only bought for an order that will actually ship", () => {
  it("refuses a test order when Shippo holds a live token (real postage, fake parcel)", () => {
    const why = labelRefusal({ ...shippable, stripe_mode: "test" }, "live");
    assert.ok(why);
    assert.match(why, /test order/);
  });

  it("refuses a live order when Shippo holds a test token (a label USPS will not carry)", () => {
    assert.ok(labelRefusal({ ...shippable, stripe_mode: "live" }, "test"));
  });

  it("refuses when the Shippo token's mode cannot be read", () => {
    assert.ok(labelRefusal(shippable, "unknown"));
  });

  it("refuses a cancelled order and one refunded in full", () => {
    assert.match(labelRefusal({ ...shippable, status: "cancelled" }, "live") ?? "", /cancelled/);
    assert.match(labelRefusal({ ...shippable, refund_status: "full" }, "live") ?? "", /refunded/);
  });

  it("refuses an order under an open or lost chargeback (review S2-2, S3-10)", () => {
    assert.match(labelRefusal({ ...shippable, dispute_status: "open" }, "live") ?? "", /disputed/);
    assert.match(labelRefusal({ ...shippable, dispute_status: "lost" }, "live") ?? "", /lost/);
    assert.equal(labelRefusal({ ...shippable, dispute_status: "won" }, "live"), null);
  });

  // The inverse: a guard that refuses everything passes every test above.
  it("allows a matching mode, including a partially refunded order", () => {
    assert.equal(labelRefusal(shippable, "live"), null);
    assert.equal(labelRefusal({ ...shippable, stripe_mode: "test" }, "test"), null);
    assert.equal(
      labelRefusal({ ...shippable, status: "new", refund_status: "partial" }, "live"),
      null,
    );
  });
});

describe("Shippo says SUCCESS but leaves something out", () => {
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
    street1: "1 Test Street",
    city: "Los Angeles",
    state: "CA",
    zip: "90015",
    country: "US",
  };

  // Every request is answered here. Nothing reaches the network.
  function answer(transaction: Record<string, unknown>) {
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const path = new URL(String(input)).pathname;
      if (path.startsWith("/shipments")) {
        return Response.json({
          rates: [
            {
              object_id: "rate_1",
              provider: "USPS",
              amount: "5.00",
              currency: "USD",
              servicelevel: { token: "usps_ground_advantage" },
            },
          ],
        });
      }
      return Response.json(transaction);
    }) as typeof fetch;
  }

  it("a paid label with no tracking number is an error that keeps the claim, not an empty string", async () => {
    answer({ object_id: "txn_notracking", status: "SUCCESS", label_url: "https://example.com/l.pdf" });

    await assert.rejects(
      () => buyUspsLabel(to, "order-a"),
      (error: unknown) => {
        assert.ok(error instanceof ShippoError);
        assert.equal(error.nothingBought, false, "a SUCCESS is a purchase; the claim must stay");
        assert.match(error.message, /txn_notracking/);
        return true;
      },
    );
  });

  it("a paid label with no label file also keeps the claim", async () => {
    answer({ object_id: "txn_nolabel", status: "SUCCESS", tracking_number: "9400111" });

    await assert.rejects(
      () => buyUspsLabel(to, "order-b"),
      (error: unknown) => error instanceof ShippoError && error.nothingBought === false,
    );
  });

  it("a refused transaction is still nothing bought", async () => {
    answer({ object_id: "txn_err", status: "ERROR" });

    await assert.rejects(
      () => buyUspsLabel(to, "order-c"),
      (error: unknown) => error instanceof ShippoError && error.nothingBought === true,
    );
  });

  it("a complete label comes back whole", async () => {
    answer({
      object_id: "txn_ok",
      status: "SUCCESS",
      label_url: "https://example.com/l.pdf",
      tracking_number: "9400222",
    });
    const label = await buyUspsLabel(to, "order-d");
    assert.equal(label.trackingNumber, "9400222");
    assert.equal(label.transactionId, "txn_ok");
  });
});

const bought: BoughtLabel = {
  transactionId: "txn_paid_123",
  labelUrl: "https://example.com/label.pdf",
  trackingNumber: "9400100000000000000123",
  trackingUrl: null,
  carrier: "USPS",
  amount: "5.00",
  currency: "USD",
};

async function quietly<T>(run: (logged: unknown[][]) => Promise<T>): Promise<T> {
  const logged: unknown[][] = [];
  const realError = console.error;
  console.error = (...args: unknown[]) => void logged.push(args);
  try {
    return await run(logged);
  } finally {
    console.error = realError;
  }
}

describe("a label that was paid for is never silently lost", () => {
  it("a failed save says what was bought and logs the transaction id", async () => {
    await quietly(async (logged) => {
      const result = await recordBoughtLabel("order-x", bought, (async () => {
        throw new Error("connection terminated");
      }) as never);

      assert.ok(!result.ok);
      assert.match(result.message, /txn_paid_123/);
      assert.match(result.message, /9400100000000000000123/);
      assert.match(result.message, /Do not buy another/);
      assert.ok(logged.some((args) => String(args[0]).includes("txn_paid_123")));
    });
  });

  it("a save that matches no row is surfaced too, not reported as done", async () => {
    await quietly(async () => {
      const result = await recordBoughtLabel("order-y", bought, (async () => []) as never);
      assert.equal(result.ok, false);
    });
  });

  it("a save that lands is ok", async () => {
    const result = await recordBoughtLabel(
      "order-z",
      bought,
      (async () => [{ id: "order-z" }]) as never,
    );
    assert.deepEqual(result, { ok: true });
  });
});

describe("the claim refuses orders that are not shipping", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const created: string[] = [];

  after(async () => {
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    await closePool();
  });

  async function makeOrder(extra = ""): Promise<string> {
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
    if (extra) await query(`update "order" set ${extra} where id = $1`, [id]);
    return id;
  }

  it("a cancelled order cannot be claimed", async () => {
    const id = await makeOrder(`status = 'cancelled'`);
    assert.deepEqual(await claimLabelPurchase(id), { claimed: false, why: "not-shippable" });
  });

  it("an order refunded in full cannot be claimed", async () => {
    const id = await makeOrder(`refund_status = 'full', refunded_cents = 9600`);
    assert.deepEqual(await claimLabelPurchase(id), { claimed: false, why: "not-shippable" });
  });

  it("a partially refunded order still can", async () => {
    const id = await makeOrder(`refund_status = 'partial', refunded_cents = 100`);
    assert.deepEqual(await claimLabelPurchase(id), { claimed: true });
  });

  it("recording a label never overwrites a tracking number pasted in meanwhile", async () => {
    const id = await makeOrder(`tracking_number = 'PASTED-BY-HAND'`);
    const result = await quietly(() => recordBoughtLabel(id, bought));
    assert.equal(result.ok, false);

    const row = await query<{ tracking_number: string }>(
      `select tracking_number from "order" where id = $1`,
      [id],
    );
    assert.equal(row[0]!.tracking_number, "PASTED-BY-HAND");
  });
});
