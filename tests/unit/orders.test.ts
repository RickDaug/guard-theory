import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import {
  ALLOWED_TRANSITIONS,
  STATUS_LABEL,
  canTransition,
  transitionOrder,
  type OrderStatus,
} from "../../src/lib/orders/manage.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

const HAS_DB = isDatabaseConfigured();
// Mail goes to the dev provider; email_log still records every attempt.
delete process.env.RESEND_API_KEY;

const ALL: OrderStatus[] = ["new", "in_process", "shipped", "delivered", "cancelled"];

describe("an order moves in one direction", () => {
  /**
   * Asserted against literals, not against the table the implementation reads.
   *
   * The house rule from content.test.ts: a test that derives its expectation
   * from the same constant the code uses cannot fail. These are written out by
   * hand so that widening the machine has to be a deliberate edit here too.
   */
  it("allows exactly the transitions the shop actually performs", () => {
    assert.deepEqual(ALLOWED_TRANSITIONS.new, ["in_process", "cancelled"]);
    assert.deepEqual(ALLOWED_TRANSITIONS.in_process, ["shipped", "cancelled"]);
    assert.deepEqual(ALLOWED_TRANSITIONS.shipped, ["delivered"]);
    assert.deepEqual(ALLOWED_TRANSITIONS.delivered, []);
    assert.deepEqual(ALLOWED_TRANSITIONS.cancelled, []);
  });

  it("refuses to skip the middle", () => {
    // An order that jumps from New to Delivered is an order nobody printed a
    // label for, and a customer who was never told it shipped.
    assert.equal(canTransition("new", "delivered"), false);
    assert.equal(canTransition("new", "shipped"), false);
    assert.equal(canTransition("in_process", "delivered"), false);
  });

  it("does not go backwards", () => {
    assert.equal(canTransition("shipped", "in_process"), false);
    assert.equal(canTransition("delivered", "shipped"), false);
    assert.equal(canTransition("in_process", "new"), false);
  });

  it("treats delivered and cancelled as final", () => {
    for (const to of ALL) {
      assert.equal(canTransition("delivered", to), false, `delivered -> ${to}`);
      assert.equal(canTransition("cancelled", to), false, `cancelled -> ${to}`);
    }
  });

  /**
   * The inverse test.
   *
   * A state machine that rejects everything passes every check above. This is
   * the one that proves it is not simply shut — the same trap content.test.ts
   * documents, where a guard was incapable of failing.
   */
  it("is not simply closed", () => {
    const reachable = ALL.flatMap((from) => ALLOWED_TRANSITIONS[from]);
    assert.ok(reachable.length >= 5, "the machine has to actually let orders move");

    assert.equal(canTransition("new", "in_process"), true);
    assert.equal(canTransition("in_process", "shipped"), true);
    assert.equal(canTransition("shipped", "delivered"), true);
  });

  it("can be walked from new to delivered", () => {
    let status: OrderStatus = "new";

    for (const step of ["in_process", "shipped", "delivered"] as OrderStatus[]) {
      assert.ok(canTransition(status, step), `stuck at ${status}, could not reach ${step}`);
      status = step;
    }

    assert.equal(status, "delivered");
  });

  it("never transitions to itself", () => {
    for (const status of ALL) {
      assert.equal(canTransition(status, status), false, `${status} -> ${status}`);
    }
  });

  it("names every state in words a person reads", () => {
    for (const status of ALL) {
      assert.ok(STATUS_LABEL[status], `${status} has no label`);
      assert.doesNotMatch(STATUS_LABEL[status], /_/, "a label is not a column name");
    }
  });
});

describe("moving an order is a compare-and-set", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const created: string[] = [];

  after(async () => {
    await query(`delete from email_log where order_id = any($1::text[])`, [created]);
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    await closePool();
  });

  async function makeOrder(status: OrderStatus, tracking: string | null = null): Promise<string> {
    const id = randomUUID();
    created.push(id);
    await query(
      `insert into "order" (
         id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents,
         stripe_session_id, stripe_payment_intent, stripe_mode, status, tracking_number
       ) values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
                 8900, 700, 0, 9600, $2, $3, 'test', $4, $5)`,
      [id, `cs_test_${randomUUID()}`, `pi_${randomUUID()}`, status, tracking],
    );
    return id;
  }

  const emails = async (id: string, template: string) =>
    (
      await query<{ n: number }>(
        `select count(*)::int as n from email_log where order_id = $1 and template = $2`,
        [id, template],
      )
    )[0]!.n;

  it("a double click on Mark shipped moves it once and emails once", async () => {
    const id = await makeOrder("in_process", "9400100000000000000999");

    const results = await Promise.all([
      transitionOrder(id, "shipped"),
      transitionOrder(id, "shipped"),
    ]);

    assert.equal(results.filter((r) => r.ok).length, 1, JSON.stringify(results));
    assert.equal(await emails(id, "order-shipped"), 1, "the customer is told once");
  });

  it("a double click on In process emails once", async () => {
    const id = await makeOrder("new");

    const results = await Promise.all([
      transitionOrder(id, "in_process"),
      transitionOrder(id, "in_process"),
      transitionOrder(id, "in_process"),
    ]);

    assert.equal(results.filter((r) => r.ok).length, 1);
    assert.equal(await emails(id, "order-in-process"), 1);
  });

  it("Mark shipped racing a Shippo DELIVERED never writes shipped over delivered", async () => {
    const id = await makeOrder("in_process", "9400100000000000000888");

    // The webhook's write, landing between transitionOrder's read and its write.
    const [result] = await Promise.all([
      transitionOrder(id, "shipped"),
      query(`update "order" set status = 'delivered' where id = $1`, [id]),
    ]);

    const row = (await query<{ status: string }>(`select status from "order" where id = $1`, [id]))[0]!;
    // Whichever landed first, the order never goes backwards from delivered.
    assert.equal(row.status, "delivered", JSON.stringify(result));
  });

  it("refuses a status outside the table in words, not with a TypeError", async () => {
    // The portal form posts `to` as free text. STATUS_LABEL[to].toLowerCase()
    // used to throw on anything outside the table.
    const id = await makeOrder("new");
    const result = await transitionOrder(id, "shipped; drop" as OrderStatus);
    assert.equal(result.ok, false);
  });

  it("still moves an order nobody else is touching", async () => {
    const id = await makeOrder("new");
    assert.deepEqual((await transitionOrder(id, "in_process")).ok, true);
    assert.deepEqual((await transitionOrder(id, "cancelled")).ok, true);
  });
});
