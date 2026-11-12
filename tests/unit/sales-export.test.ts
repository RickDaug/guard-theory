import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import {
  exportErrorMessage,
  exportFilename,
  filterToRange,
  loadSalesOrders,
  ordersCsv,
  pacificDate,
  parseIsoDate,
  presetRange,
  readExportRequest,
  summaryCsv,
  type SalesOrder,
} from "../../src/lib/orders/sales-export.ts";
import { applyRefundFromCharge } from "../../src/lib/orders/refund.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The sales records export. Exact files, because this is the file the owner
 * keeps for the tax authority: a column in the wrong place, a float, or an
 * order in the wrong month is the whole failure.
 */

function order(overrides: Partial<SalesOrder>): SalesOrder {
  return {
    number: 0,
    placed_at: new Date(0),
    status: "new",
    ship_state: "CA",
    ship_postal: "90015",
    ship_country: "US",
    subtotal_cents: 8900,
    shipping_cents: 700,
    tax_cents: 0,
    total_cents: 9600,
    refunded_cents: 0,
    refunded_at: null,
    currency: "USD",
    stripe_payment_intent: null,
    stripe_mode: "live",
    ...overrides,
  };
}

// California, paid midday 15 July. Taxed.
const A = order({
  number: 101,
  placed_at: new Date("2026-07-15T19:00:00Z"),
  status: "delivered",
  tax_cents: 846,
  total_cents: 10446,
  stripe_payment_intent: "pi_A",
});
// New York, paid 23:30 on 31 July in California — 1 August in UTC. A July sale.
// Part refunded on 10 August.
const B = order({
  number: 102,
  placed_at: new Date("2026-08-01T06:30:00Z"),
  status: "shipped",
  ship_state: "NY",
  ship_postal: "10001",
  refunded_cents: 2000,
  refunded_at: new Date("2026-08-10T12:00:00Z"),
  stripe_payment_intent: "pi_B",
});
// California, paid 01:00 on 30 September; cancelled and refunded in full at
// 22:00 that evening, which is already 1 October in UTC.
const C = order({
  number: 103,
  placed_at: new Date("2026-09-30T08:00:00Z"),
  status: "cancelled",
  ship_postal: "94110",
  subtotal_cents: 17800,
  tax_cents: 1692,
  total_cents: 20192,
  refunded_cents: 20192,
  refunded_at: new Date("2026-10-01T05:00:00Z"),
  stripe_payment_intent: "pi_C",
});
// A test-mode order, with a buyer-typed state that is a spreadsheet formula.
const D = order({
  number: 104,
  placed_at: new Date("2026-08-15T18:00:00Z"),
  ship_state: "=1+1",
  ship_postal: "-73301",
  stripe_payment_intent: "pi_D",
  stripe_mode: "test",
});
// 00:30 on 1 October in California: Q4, however close to Q3 it is in UTC.
const E = order({ number: 105, placed_at: new Date("2026-10-01T07:30:00Z") });

const ORDERS_HEADER =
  "order number,paid date (Pacific time),status,ship-to state,ship-to ZIP,ship-to country," +
  "items subtotal,shipping charged,tax charged,total charged,refunded," +
  "refund recorded date (Pacific time),lost to chargeback," +
  "net (total charged minus refunded and chargebacks lost),currency," +
  "Stripe payment id,Stripe mode";

const SUMMARY_HEADER =
  "grouping,group,orders,items subtotal,shipping charged,tax charged,total charged,refunded," +
  "lost to chargeback,net (total charged minus refunded and chargebacks lost)";

describe("sales records export: dates are California's", () => {
  it("puts an instant on its Pacific calendar date", () => {
    assert.equal(pacificDate(new Date("2026-08-01T06:30:00Z")), "2026-07-31");
    assert.equal(pacificDate(new Date("2026-01-01T07:59:00Z")), "2025-12-31");
    assert.equal(pacificDate(new Date("2026-01-01T08:00:00Z")), "2026-01-01");
  });

  it("accepts only real dates", () => {
    assert.equal(parseIsoDate("2026-02-28"), "2026-02-28");
    for (const bad of ["2026-02-30", "2026-13-01", "26-01-01", "2026-1-1", "", null, "1999-12-31"]) {
      assert.equal(parseIsoDate(bad), null, String(bad));
    }
  });

  it("works out each preset from today in California", () => {
    // 22:00 on 30 September in California, 1 October in UTC.
    const lateQ3 = new Date("2026-10-01T05:00:00Z");
    assert.deepEqual(presetRange("last-month", lateQ3), { from: "2026-08-01", to: "2026-08-31" });
    assert.deepEqual(presetRange("last-quarter", lateQ3), { from: "2026-04-01", to: "2026-06-30" });
    assert.deepEqual(presetRange("last-year", lateQ3), { from: "2025-01-01", to: "2025-12-31" });
    assert.deepEqual(presetRange("this-year", lateQ3), { from: "2026-01-01", to: "2026-09-30" });

    const january = new Date("2026-01-15T20:00:00Z");
    assert.deepEqual(presetRange("last-month", january), { from: "2025-12-01", to: "2025-12-31" });
    assert.deepEqual(presetRange("last-quarter", january), { from: "2025-10-01", to: "2025-12-31" });

    const march = new Date("2028-03-10T20:00:00Z");
    assert.deepEqual(presetRange("last-month", march), { from: "2028-02-01", to: "2028-02-29" });
  });

  it("cuts the range on Pacific dates, not UTC ones", () => {
    const q3 = { from: "2026-07-01", to: "2026-09-30" };
    assert.deepEqual(
      filterToRange([A, B, C, D, E], q3).map((o) => o.number),
      [101, 102, 103, 104],
    );
    assert.deepEqual(
      filterToRange([A, B, C, D, E], { from: "2026-08-01", to: "2026-08-31" }).map((o) => o.number),
      [104],
    );
  });
});

describe("sales records export: reading the request", () => {
  const now = new Date("2026-10-01T05:00:00Z");
  const read = (qs: string) => readExportRequest(new URLSearchParams(qs), now);

  it("defaults to last month, live only, the orders file", () => {
    assert.deepEqual(read(""), {
      ok: true,
      request: { range: { from: "2026-08-01", to: "2026-08-31" }, includeTest: false, file: "orders" },
    });
  });

  it("includes test orders only when asked, and says so in the file name", () => {
    const got = read("preset=custom&from=2026-07-01&to=2026-09-30&test=1&file=summary");
    assert.ok(got.ok);
    assert.deepEqual(got.request, {
      range: { from: "2026-07-01", to: "2026-09-30" },
      includeTest: true,
      file: "summary",
    });
    assert.equal(
      exportFilename(got.request),
      "guard-theory-sales-records-summary-2026-07-01-to-2026-09-30-INCLUDES-TEST.csv",
    );
  });

  it("refuses rather than guessing", () => {
    assert.deepEqual(read("preset=custom&from=2026-07-01"), { ok: false, code: "dates-missing" });
    assert.deepEqual(read("preset=custom&from=2026-09-01&to=2026-07-01"), {
      ok: false,
      code: "dates-order",
    });
    assert.deepEqual(read("preset=forever"), { ok: false, code: "range" });
    assert.deepEqual(read("file=everything"), { ok: false, code: "file" });
  });

  it("prints only its own sentences for an error code", () => {
    assert.equal(exportErrorMessage("dates-order"), "The start date is after the end date.");
    assert.equal(exportErrorMessage("<script>"), null);
    assert.equal(exportErrorMessage("toString"), null);
  });
});

describe("sales records export: the files", () => {
  it("writes one row per order, money from cents, dates in Pacific time", () => {
    assert.equal(
      ordersCsv([A, B, C]),
      [
        ORDERS_HEADER,
        "101,2026-07-15,delivered,CA,90015,US,89.00,7.00,8.46,104.46,0.00,,0.00,104.46,USD,pi_A,live",
        "102,2026-07-31,shipped,NY,10001,US,89.00,7.00,0.00,96.00,20.00,2026-08-10,0.00,76.00,USD,pi_B,live",
        "103,2026-09-30,cancelled,CA,94110,US,178.00,7.00,16.92,201.92,201.92,2026-09-30,0.00,0.00,USD,pi_C,live",
      ].join("\r\n"),
    );
  });

  it("neutralises buyer-typed cells and marks a test order", () => {
    assert.equal(
      ordersCsv([D]).split("\r\n")[1],
      "104,2026-08-15,new,'=1+1,'-73301,US,89.00,7.00,0.00,96.00,0.00,,0.00,96.00,USD,pi_D,test",
    );
  });

  it("totals by month, California against the rest, state, and overall", () => {
    assert.equal(
      summaryCsv([A, B, C]),
      [
        SUMMARY_HEADER,
        "month paid (Pacific time),2026-07,2,178.00,14.00,8.46,200.46,20.00,0.00,180.46",
        "month paid (Pacific time),2026-09,1,178.00,7.00,16.92,201.92,201.92,0.00,0.00",
        "destination,California,2,267.00,14.00,25.38,306.38,201.92,0.00,104.46",
        "destination,Other US states,1,89.00,7.00,0.00,96.00,20.00,0.00,76.00",
        "ship-to state,CA,2,267.00,14.00,25.38,306.38,201.92,0.00,104.46",
        "ship-to state,NY,1,89.00,7.00,0.00,96.00,20.00,0.00,76.00",
        "all orders in range,total,3,356.00,21.00,25.38,402.38,221.92,0.00,180.46",
      ].join("\r\n"),
    );
  });

  it("takes a lost chargeback out of net, in its own column, and not as a refund (review S3-3)", () => {
    // Paid 96.00, 10.00 refunded as a price adjustment, then the buyer's bank
    // charged back the rest and the shop lost the dispute. None of the 86.00
    // is revenue; it used to be counted as if it were.
    const F = order({
      number: 106,
      placed_at: new Date("2026-08-20T18:00:00Z"),
      refunded_cents: 1000,
      refunded_at: new Date("2026-08-21T18:00:00Z"),
      stripe_payment_intent: "pi_F",
      dispute_status: "lost",
    });
    const won = order({ number: 107, placed_at: new Date("2026-08-21T18:00:00Z"), dispute_status: "won" });

    assert.equal(
      ordersCsv([F, won]).split("\r\n").slice(1).join("\n"),
      [
        "106,2026-08-20,new,CA,90015,US,89.00,7.00,0.00,96.00,10.00,2026-08-21,86.00,0.00,USD,pi_F,live",
        "107,2026-08-21,new,CA,90015,US,89.00,7.00,0.00,96.00,0.00,,0.00,96.00,USD,,live",
      ].join("\n"),
    );
    assert.equal(
      summaryCsv([F, won]).split("\r\n").at(-1),
      "all orders in range,total,2,178.00,14.00,0.00,192.00,10.00,86.00,96.00",
    );
  });

  it("is only a header when the range is empty", () => {
    assert.equal(ordersCsv([]), ORDERS_HEADER);
    assert.equal(
      summaryCsv([]),
      [SUMMARY_HEADER, "all orders in range,total,0,0.00,0.00,0.00,0.00,0.00,0.00,0.00"].join("\r\n"),
    );
  });
});

const HAS_DB = isDatabaseConfigured();

describe("sales records export: from the database", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const created: string[] = [];

  after(async () => {
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    await closePool();
  });

  async function insert(placedAt: string, mode: "live" | "test", state = "CA"): Promise<{ id: string; pi: string }> {
    const id = randomUUID();
    const pi = `pi_${randomUUID()}`;
    created.push(id);
    await query(
      `insert into "order" (
         id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents,
         stripe_session_id, stripe_payment_intent, stripe_mode, placed_at
       ) values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', $2, '90015',
                 8900, 700, 846, 10446, $3, $4, $5, $6)`,
      [id, state, `cs_test_${randomUUID()}`, pi, mode, placedAt],
    );
    return { id, pi };
  }

  // A year no other test writes orders into.
  const range = { from: "2031-03-01", to: "2031-03-31" };

  it("returns live orders in the Pacific range, and test ones only when asked", async () => {
    const inside = await insert("2031-03-15T19:00:00Z", "live");
    const lateOnTheLastDay = await insert("2031-04-01T06:30:00Z", "live", "NY"); // 23:30 31 March PDT
    await insert("2031-04-01T08:00:00Z", "live"); // 01:00 1 April PDT: outside
    await insert("2031-02-28T23:00:00Z", "live"); // 15:00 28 Feb PST: outside
    const test = await insert("2031-03-20T19:00:00Z", "test");

    const pis = (rows: SalesOrder[]) => rows.map((row) => row.stripe_payment_intent);

    assert.deepEqual(pis(await loadSalesOrders(range, false)), [inside.pi, lateOnTheLastDay.pi]);
    assert.deepEqual(pis(await loadSalesOrders(range, true)), [inside.pi, test.pi, lateOnTheLastDay.pi]);
  });

  it("stamps the refund date when a refund lands, and not when a replay changes nothing", async () => {
    const { id, pi } = await insert("2031-03-10T19:00:00Z", "live");
    const refundedAt = async () =>
      (await query<{ refunded_at: Date | null }>(`select refunded_at from "order" where id = $1`, [id]))[0]!
        .refunded_at;

    assert.equal(await refundedAt(), null);

    assert.equal(await applyRefundFromCharge(pi, 2000), "order");
    const first = await refundedAt();
    assert.ok(first instanceof Date);

    // Force the stamp into the past, then replay the same event and a late,
    // smaller one: neither moved the money, so neither may move the date.
    await query(`update "order" set refunded_at = '2031-03-11T00:00:00Z' where id = $1`, [id]);
    await applyRefundFromCharge(pi, 2000);
    await applyRefundFromCharge(pi, 1000);
    assert.equal((await refundedAt())?.toISOString(), "2031-03-11T00:00:00.000Z");

    await applyRefundFromCharge(pi, 5000);
    assert.notEqual((await refundedAt())?.toISOString(), "2031-03-11T00:00:00.000Z");
  });
});
