import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
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

/**
 * A control's border is how a sighted reader finds the control, so it is a
 * non-text indicator under SC 1.4.11 and owes 3:1.
 *
 * The pairing table above already said so — and listed a colour no control was
 * using. Every input and the header's outlined button drew `steel-dim`, which
 * is 1.7:1 on graphite, while the table passed. A table that is not read by the
 * components proves the table. So this reads the components.
 */
describe("control borders use the colour the table tested", () => {
  const root = path.resolve(import.meta.dirname, "..", "..", "src");
  const read = (file: string) => readFileSync(path.join(root, file), "utf8");

  const tested = new Set(
    NON_TEXT_ON_GROUND.filter((p) => /border/.test(p.role)).map((p) => `border-${p.fgToken}`),
  );

  /** Each file, and the fragment that identifies the control inside it. */
  const CONTROLS: Array<{ file: string; control: RegExp; name: string }> = [
    { file: "components/ui/Field.tsx", control: /const CONTROL_BORDER = "([^"]+)"/, name: "input, select, textarea" },
    { file: "components/ui/Button.tsx", control: /outline:\s*"(border [^"]+)"/, name: "outlined button" },
    { file: "components/site/SiteHeader.tsx", control: /className="(display-plain border [^"]+)"/, name: "header call to action" },
    { file: "components/search/SearchClient.tsx", control: /className="(w-full border [^"]+)"/, name: "search input" },
  ];

  for (const { file, control, name } of CONTROLS) {
    it(`${name} (${file})`, () => {
      const classes = control.exec(read(file))?.[1];
      assert.ok(classes, `could not find the ${name} in ${file} — the guard has gone blind, fix its pattern`);

      const borders = classes
        .split(/\s+/)
        .filter((c) => /^border-[a-z]/.test(c) && !/^border-(x|y|t|r|b|l)$/.test(c));
      assert.ok(borders.length > 0, `${name} declares no border colour`);
      for (const border of borders) {
        assert.ok(
          tested.has(border),
          `${name} draws ${border}, which is not tested at 3:1 as a control border ` +
            `(tested: ${[...tested].join(", ")})`,
        );
      }
    });
  }

  it("never falls back to the hairline inside Field", () => {
    // Inside a string literal, that is — the comment explaining the rule names it.
    const literals = read("components/ui/Field.tsx").match(/"[^"]*"/g) ?? [];
    assert.deepEqual(
      literals.filter((literal) => literal.includes("border-steel-dim")),
      [],
    );
  });
});

/**
 * "Change a colour by changing its mix, not by typing a new hex." This is the
 * mix, recomputed: linear-light sRGB, the way every derived swatch was solved.
 */
describe("steel-mid is the mix it says it is", () => {
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const toSrgb = (l: number) =>
    Math.round(255 * (l <= 0.0031308 ? 12.92 * l : 1.055 * l ** (1 / 2.4) - 0.055));
  const mix = (from: string, to: string, t: number) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    const channel = (x: number, y: number) =>
      toSrgb(toLinear(x) * (1 - t) + toLinear(y) * t).toString(16).padStart(2, "0");
    return `#${channel(a.r, b.r)}${channel(a.g, b.g)}${channel(a.b, b.b)}`.toUpperCase();
  };
  const hexOf = (token: string) => PALETTE.find((s) => s.token === token)!.hex;

  it("reproduces a swatch that already existed, so the method is the project's", () => {
    assert.equal(mix(hexOf("steel-dim"), hexOf("ink"), 0.22), hexOf("slate"));
    assert.equal(mix(hexOf("ink"), hexOf("steel-dim"), 0.22), hexOf("graphite"));
  });

  it("steel-dim → steel, 40%", () => {
    const swatch = PALETTE.find((s) => s.token === "steel-mid")!;
    assert.equal(swatch.origin, "steel-dim → steel, 40%");
    assert.equal(mix(hexOf("steel-dim"), hexOf("steel"), 0.4), swatch.hex);
  });
});
