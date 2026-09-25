import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ALLOWED_TRANSITIONS,
  STATUS_LABEL,
  canTransition,
  type OrderStatus,
} from "../../src/lib/orders/manage.ts";

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
