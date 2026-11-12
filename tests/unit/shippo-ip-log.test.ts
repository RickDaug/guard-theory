import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { coarseAddress } from "../../src/lib/shipping/webhook.ts";

/**
 * The Shippo webhook warns about callers outside Shippo's published list. It
 * used to print the caller's full IP — personal data in function logs for no
 * purpose the network does not serve (security audit 2026-09-29, S3-10).
 */
describe("the Shippo webhook logs a network, not an address", () => {
  it("IPv4 to /24", () => {
    assert.equal(coarseAddress("203.0.113.77"), "203.0.113.0/24");
  });

  it("IPv6 to /48", () => {
    assert.equal(coarseAddress("2001:db8:abcd:12::1"), "2001:db8:abcd::/48");
    assert.equal(coarseAddress("2001:db8::1"), "2001:db8:0::/48");
  });

  it("does not echo anything it cannot parse", () => {
    assert.equal(coarseAddress("<script>"), "(unrecognised address)");
  });

  it("the warning does not interpolate the raw address", () => {
    const source = readFileSync(
      path.resolve(import.meta.dirname, "../../src/lib/shipping/webhook.ts"),
      "utf8",
    );
    const warnings = source.split("\n").filter((line) => line.includes("console.warn"));
    for (const line of warnings) {
      assert.doesNotMatch(line, /\$\{ip\}/, line.trim());
    }
  });
});
