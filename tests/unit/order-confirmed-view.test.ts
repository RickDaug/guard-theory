import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { CONFIRMED_DETAIL_HOURS, confirmedView } from "../../src/lib/orders/confirmed-view.ts";

/**
 * /order/confirmed?session_id= is a bearer URL that never expires: browser
 * history, request logs. It used to print the buyer's full email address and
 * total for ever (security audit 2026-09-29, S3-2).
 */

const NOW = new Date("2026-09-29T12:00:00Z");
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const ORDER = {
  number: "1042",
  email: "sam.fadda@example.com",
  total_cents: 9600,
  currency: "USD",
};

describe("what /order/confirmed shows", () => {
  it("masks the email even on the way back from Stripe", () => {
    const view = confirmedView({ ...ORDER, created_at: hoursAgo(0.01) }, NOW);
    assert.equal(view.detail, true);
    assert.ok(view.detail);
    assert.equal(view.maskedEmail, "s***@example.com");
    assert.ok(!JSON.stringify(view).includes("sam.fadda"), "the full address must not reach the page");
    assert.equal(view.totalCents, 9600);
  });

  it(`shows only the order number after ${CONFIRMED_DETAIL_HOURS} hours`, () => {
    const view = confirmedView({ ...ORDER, created_at: hoursAgo(CONFIRMED_DETAIL_HOURS + 0.1) }, NOW);
    assert.deepEqual(view, { detail: false, number: "1042" });
  });

  it("treats an unreadable or future timestamp as expired", () => {
    assert.equal(confirmedView({ ...ORDER, created_at: "not a date" }, NOW).detail, false);
    assert.equal(confirmedView({ ...ORDER, created_at: hoursAgo(-2) }, NOW).detail, false);
  });

  it("the page prints the view, never the raw row's email", () => {
    const page = readFileSync(
      path.resolve(import.meta.dirname, "../../src/app/order/confirmed/page.tsx"),
      "utf8",
    );
    assert.doesNotMatch(page, /\$\{order\.email\}/);
    assert.doesNotMatch(page, /order\.total_cents/);
  });
});
