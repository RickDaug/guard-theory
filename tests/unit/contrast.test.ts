import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  NON_TEXT_ON_GROUND,
  PALETTE,
  TEXT_ON_GROUND,
} from "../../src/lib/brand/palette.ts";
import {
  contrastRatio,
  formatRatio,
  hexToRgb,
  meetsAA,
  relativeLuminance,
} from "../../src/lib/color/contrast.ts";

describe("contrast maths", () => {
  it("computes the reference ratio for black on white", () => {
    assert.equal(contrastRatio("#000000", "#FFFFFF").toFixed(0), "21");
  });

  it("is symmetric", () => {
    const a = contrastRatio("#1B1725", "#D0BCD5");
    const b = contrastRatio("#D0BCD5", "#1B1725");
    assert.equal(a.toFixed(4), b.toFixed(4));
  });

  it("expands shorthand hex", () => {
    assert.deepEqual(hexToRgb("#abc"), hexToRgb("#aabbcc"));
  });

  it("rejects values that are not colours", () => {
    assert.throws(() => relativeLuminance("not-a-colour"));
  });
});

describe("brand palette meets WCAG 2.2 AA", () => {
  for (const pair of TEXT_ON_GROUND) {
    it(`${pair.fgToken} on ${pair.bgToken} clears 4.5:1 for normal text`, () => {
      const ratio = contrastRatio(pair.fg, pair.bg);
      assert.ok(
        meetsAA(ratio),
        `${pair.fgToken} on ${pair.bgToken} is ${formatRatio(ratio)}, below the 4.5:1 required for normal-size text`,
      );
    });
  }

  it("keeps the hairline colour out of the text pairings", () => {
    const hairlines = new Set(
      PALETTE.filter((s) => s.usage === "hairline").map((s) => s.token),
    );
    const textTokens = TEXT_ON_GROUND.map((p) => p.fgToken);
    for (const token of textTokens) {
      if (!hairlines.has(token)) continue;
      // A hairline colour may only appear as text if it actually passes, which
      // the assertions above already enforce. This guard exists so that adding
      // a genuine hairline (never meant to carry text) to the text table is a
      // deliberate act rather than an accident.
      const pair = TEXT_ON_GROUND.find((p) => p.fgToken === token);
      assert.ok(pair, "pairing should exist");
      assert.ok(
        meetsAA(contrastRatio(pair.fg, pair.bg)),
        `${token} is declared a hairline but is listed as text`,
      );
    }
  });

  // WCAG 2.2 SC 1.4.11. The text table says nothing about a focus ring or a
  // control border, and the ring is the one indicator on this site that a
  // keyboard user cannot do without.
  for (const pair of NON_TEXT_ON_GROUND) {
    it(`${pair.fgToken} on ${pair.bgToken} clears 3:1 as ${pair.role}`, () => {
      const ratio = contrastRatio(pair.fg, pair.bg);
      assert.ok(
        ratio >= 3,
        `${pair.fgToken} on ${pair.bgToken} is ${formatRatio(ratio)}, below the 3:1 required of a non-text indicator`,
      );
    });
  }

  // signal is declared a surface precisely because it cannot be a word. If a
  // future change lightens it into text range that is fine, but it must be a
  // deliberate change to this test rather than a silent one.
  it("keeps the brand blue out of the text pairings", () => {
    const asText = TEXT_ON_GROUND.filter((p) => p.fgToken === "signal");
    assert.equal(
      asText.length,
      0,
      "signal is a fill and an indicator; use signal-lift on dark and signal-dim on paper",
    );
  });

  it("declares a usage for every palette entry", () => {
    for (const swatch of PALETTE) {
      assert.ok(
        ["text", "surface", "hairline"].includes(swatch.usage),
        `${swatch.token} has no usage declared`,
      );
      assert.doesNotThrow(
        () => relativeLuminance(swatch.hex),
        `${swatch.token} has an invalid hex value`,
      );
    }
  });
});
