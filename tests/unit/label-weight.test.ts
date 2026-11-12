import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { buyUspsLabel } from "../../src/lib/shipping/shippo.ts";
import {
  parcelWeight,
  readWeightOz,
  weightWarning,
  type WeightLine,
} from "../../src/lib/shipping/weight.ts";

/**
 * The label declares what is in the box.
 *
 * Every label used to declare a fixed 10 oz, so a multi-garment order was
 * re-weighed by USPS and billed the difference afterwards. These pin the sum,
 * and pin that a missing weight is never guessed: the parcel falls back to the
 * fixed weight and the owner is told which sizes to weigh.
 */

const FIXED = "10";
const line = (label: string, weightOz: string | null, quantity = 1): WeightLine => ({
  label,
  weightOz,
  quantity,
});

describe("parcel weight from the order", () => {
  it("a single item declares its own weight plus the packaging", () => {
    assert.deepEqual(parcelWeight([line("Rash Guard, size M", "7.25")], "1.5", FIXED), {
      measured: true,
      weightOz: "8.75",
    });
  });

  it("quantity multiplies, and the packaging is added once per parcel", () => {
    const weight = parcelWeight(
      [line("Rash Guard, size M", "7.25", 3), line("Rash Guard, size XL", "8.10")],
      "2",
      FIXED,
    );
    // 7.25 × 3 + 8.10 + 2 = 31.85
    assert.deepEqual(weight, { measured: true, weightOz: "31.85" });
    assert.equal(weightWarning(weight), null);
  });

  it("no packaging setting row reads as 0, the documented default", () => {
    assert.deepEqual(parcelWeight([line("Rash Guard, size M", "7", 2)], null, FIXED), {
      measured: true,
      weightOz: "14",
    });
  });

  it("the database's numeric strings are summed exactly", () => {
    assert.equal(
      parcelWeight([line("A", "0.10", 3), line("B", "0.20")], "0.00", FIXED).weightOz,
      "0.5",
    );
  });

  it("any line without a weight falls back to the fixed weight, never a partial sum", () => {
    const weight = parcelWeight(
      [line("Rash Guard, size M", "7.25", 2), line("Rash Guard, size XL", null)],
      "1",
      FIXED,
    );
    assert.equal(weight.measured, false);
    assert.equal(weight.weightOz, FIXED);
    assert.ok(!weight.measured && weight.missing.length === 1);

    const warning = weightWarning(weight) ?? "";
    assert.match(warning, /^Weights not set for Rash Guard, size XL\./);
    assert.match(warning, /USPS may adjust the charge/);
    assert.match(warning, /fixed 10 oz/);
    assert.doesNotMatch(warning, /size M/, "only the lines that need weighing are named");
  });

  it("an unreadable packaging setting is not guessed at either", () => {
    const weight = parcelWeight([line("Rash Guard, size M", "7")], "a few", FIXED);
    assert.equal(weight.measured, false);
    assert.equal(weight.weightOz, FIXED);
    assert.match(weightWarning(weight) ?? "", /ship_packaging_tare_oz/);
  });
});

describe("a weight typed in the portal", () => {
  it("is ounces, positive, at most two decimals", () => {
    assert.equal(readWeightOz("7"), "7");
    assert.equal(readWeightOz(" 7.50 "), "7.5");
    assert.equal(readWeightOz("7.25 oz"), "7.25");
    assert.equal(readWeightOz(""), null, "empty clears it: not weighed yet");
    for (const bad of ["0", "-3", "7.125", "seven", "1e3", "99999"]) {
      assert.equal(readWeightOz(bad), "invalid", bad);
    }
  });
});

describe("the Shippo request carries the weight", () => {
  const realFetch = globalThis.fetch;
  const env = { ...process.env };
  let parcels: { weight: string; mass_unit: string }[] = [];

  before(() => {
    Object.assign(process.env, {
      SHIPPO_API_TOKEN: "shippo_test_neverSentAnywhere",
      SHIP_FROM_NAME: "Guard Theory",
      SHIP_FROM_STREET1: "1 Origin Street",
      SHIP_FROM_CITY: "Los Angeles",
      SHIP_FROM_STATE: "CA",
      SHIP_FROM_ZIP: "90015",
    });
    delete process.env.SHIP_PARCEL_WEIGHT_OZ;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(String(input)).pathname;
      if (path.startsWith("/shipments")) {
        parcels = JSON.parse(String(init?.body)).parcels;
        return Response.json({
          rates: [{ object_id: "rate_1", provider: "USPS", amount: "7.46", currency: "USD", servicelevel: { token: "usps_ground_advantage" } }],
        });
      }
      return Response.json({ object_id: "tx_1", status: "SUCCESS", label_url: "https://example.test/l.pdf", tracking_number: "9400" });
    }) as typeof fetch;
  });

  after(() => {
    globalThis.fetch = realFetch;
    for (const key of Object.keys(process.env)) if (!(key in env)) delete process.env[key];
    Object.assign(process.env, env);
  });

  const to = { name: "Sam Fadda", street1: "1 Test Lane", city: "Los Angeles", state: "CA", zip: "90015", country: "US" };

  it("declares the summed weight when it is given", async () => {
    await buyUspsLabel(to, "order-1", "31.85");
    assert.equal(parcels.length, 1);
    assert.equal(parcels[0]?.weight, "31.85");
    assert.equal(parcels[0]?.mass_unit, "oz");
  });

  it("still declares the fixed 10 oz when none is given", async () => {
    await buyUspsLabel(to, "order-2");
    assert.equal(parcels[0]?.weight, "10");
  });
});
