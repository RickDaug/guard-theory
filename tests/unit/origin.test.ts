import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { PRODUCTS } from "../../src/content/products/index.ts";
import { ORIGIN_LABEL, productOrigin, readOrigin } from "../../src/content/products/origin.ts";
import { PUBLISHED_SPECIFICATIONS } from "../../src/content/products/published-specs.ts";
import { storefrontProblems, type StorefrontCheck } from "../../src/lib/portal/product-edit.ts";

/**
 * Country of origin in the online listing: 16 CFR 303.34 requires every
 * product description to say "Made in USA", "Imported", or both. And because
 * the specification mentions fabric, 15 U.S.C. §70b(c) requires the full fibre
 * content too.
 *
 * The properties: the sentence is only ever built from the owner's value; an
 * empty or unusable value produces no sentence and keeps the product off the
 * storefront; the registry garments, which have no owner specification, stay
 * blocked and say nothing about origin.
 */

/** A product that has everything. Values are fixtures, not garment facts. */
function whole(origin: string | null): StorefrontCheck {
  return {
    priceCents: 100,
    name: "Fixture",
    kind: "Fixture kind",
    summary: "Fixture summary",
    description: "Fixture description",
    specs: PUBLISHED_SPECIFICATIONS.map((label) => ({
      label,
      value: label === ORIGIN_LABEL ? origin : `fixture ${label}`,
    })),
    sizeLabels: ["M"],
    imageAlts: ["Fixture garment laid flat, front view, on white."],
  };
}

describe("reading the owner's origin value", () => {
  it("states each FTC form as written", () => {
    assert.deepEqual(readOrigin("Made in USA"), { ok: true, origin: { disclosure: "Made in USA", country: "US" } });
    assert.deepEqual(readOrigin("made in usa of imported fabric"), {
      ok: true,
      origin: { disclosure: "Made in USA of imported fabric", country: "US" },
    });
    assert.deepEqual(readOrigin("Made in USA and imported"), {
      ok: true,
      origin: { disclosure: "Made in USA and imported", country: null },
    });
    assert.deepEqual(readOrigin("Imported"), { ok: true, origin: { disclosure: "Imported", country: null } });
  });

  it("states a foreign country as imported, and names it", () => {
    // "Fixtureland" is a fixture, not a claim about where anything is made.
    for (const typed of ["Fixtureland", "Made in Fixtureland", "  made in  Fixtureland. "]) {
      assert.deepEqual(
        readOrigin(typed),
        { ok: true, origin: { disclosure: "Imported — made in Fixtureland", country: "Fixtureland" } },
        typed,
      );
    }
  });

  it("refuses a bare USA, which does not say where the fabric was made", () => {
    for (const typed of ["USA", "U.S.", "United States", "Made in the United States", "made in us"]) {
      const read = readOrigin(typed);
      assert.equal(read.ok, false, typed);
    }
  });

  it("refuses nothing, and placeholders, rather than printing them", () => {
    for (const typed of [null, undefined, "", "   ", "TBD", "Made in TBD", "n/a", "unknown", "?"]) {
      assert.equal(readOrigin(typed).ok, false, String(typed));
    }
  });

  it("is the registry's own line, and one of the promised lines", () => {
    assert.ok((PUBLISHED_SPECIFICATIONS as readonly string[]).includes(ORIGIN_LABEL));
    for (const product of PRODUCTS) {
      assert.ok(
        product.specifications.some((spec) => spec.label === ORIGIN_LABEL),
        `${product.slug} has no "${ORIGIN_LABEL}" line`,
      );
    }
  });
});

describe("the go-live checklist", () => {
  it("lets a product with a stated origin and a fibre composition go live", () => {
    assert.deepEqual(storefrontProblems(whole("Made in USA of imported fabric")), []);
    assert.deepEqual(storefrontProblems(whole("Fixtureland")), []);
  });

  it("refuses a product with no country of manufacture", () => {
    assert.deepEqual(storefrontProblems(whole(null)), ["a country of manufacture"]);

    const withoutLine = whole(null);
    withoutLine.specs = withoutLine.specs.filter((spec) => spec.label !== ORIGIN_LABEL);
    assert.deepEqual(storefrontProblems(withoutLine), ["a country of manufacture"]);
  });

  it("refuses an origin the listing cannot state, with the reason", () => {
    const problems = storefrontProblems(whole("USA"));
    assert.equal(problems.length, 1);
    assert.match(problems[0]!, /Made in USA of imported fabric/);
    assert.match(problems[0]!, /where the fabric was made/);

    assert.equal(storefrontProblems(whole("TBD")).length, 1);
  });

  it("requires the full fibre composition whenever the specification shows a fabric line", () => {
    const check = whole("Imported");
    check.specs = check.specs.map((spec) =>
      spec.label === "Fabric composition" ? { ...spec, value: null } : spec,
    );
    // Fabric weight is still shown, so the composition must be too.
    assert.deepEqual(storefrontProblems(check), ["a fabric composition"]);
  });

  it("keeps both registry garments blocked, origin included", () => {
    for (const product of PRODUCTS.filter((p) => p.specSource !== "owner")) {
      const problems = storefrontProblems({
        ...product,
        priceCents: 100,
        specs: product.specifications,
        sizeLabels: ["M"],
        imageAlts: ["Fixture garment laid flat, front view, on white."],
      });
      assert.ok(problems.includes("a country of manufacture"), product.slug);
      assert.ok(problems.includes("a fabric composition"), product.slug);
    }
  });
});

describe("the product page", () => {
  it("invents no origin for a product that has none", () => {
    for (const product of PRODUCTS) {
      const line = product.specifications.find((spec) => spec.label === ORIGIN_LABEL);
      if (product.specSource !== "owner") {
        assert.equal(line?.value ?? null, null, `${product.slug} has an origin with no owner source`);
        assert.equal(productOrigin(product.specifications), null, product.slug);
      }
    }
    assert.equal(productOrigin([]), null);
    assert.equal(productOrigin([{ label: ORIGIN_LABEL, value: null }]), null);
    assert.equal(productOrigin([{ label: ORIGIN_LABEL, value: "USA" }]), null);
  });

  // Source-level: the page is a server component with a database read, and the
  // rendered checks are in tests/e2e/metadata.spec.ts.
  const page = readFileSync(new URL("../../src/app/shop/[slug]/page.tsx", import.meta.url), "utf8");

  it("renders the disclosure only from the owner's value, and only when there is one", () => {
    assert.match(page, /const origin = productOrigin\(product\.specifications\);/);
    assert.match(page, /\{origin \? \(\s*<p[^>]*data-origin-disclosure[^>]*>\s*\{origin\.disclosure\}/);
    assert.doesNotMatch(page, /Made in|Imported/, "the page hard-codes an origin");
  });

  it("puts countryOfOrigin in the Product JSON-LD only when a country is named", () => {
    assert.match(page, /\.\.\.\(origin\?\.country \? \{ countryOfOrigin: origin\.country \} : \{\}\)/);
  });

  it("prints the origin line as its disclosure, never the raw value", () => {
    assert.match(page, /spec\.label === ORIGIN_LABEL \? \{ \.\.\.spec, value: origin \? origin\.disclosure : null \}/);
  });
});
