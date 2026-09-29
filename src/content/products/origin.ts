import type { Specification } from "./types.ts";

/**
 * Country of origin, and the sentence the listing must carry about it.
 *
 * 16 CFR 303.34: a textile product offered online or by mail order must say, in
 * its description, that it is "Made in USA", "Imported", or both. The garment's
 * label must also carry its origin (16 CFR 303.33), and the two must agree.
 *
 * The value lives in the specification line the registry already has —
 * "Country of manufacture" — and is typed by the owner: in the portal for a
 * product made there, or in the registry with specSource "owner" for a
 * registry garment (#64's guard in tests/unit/content.test.ts refuses any other
 * source). Nothing here fills it in. An empty line produces no sentence, and
 * the go-live checklist (src/lib/portal/product-edit.ts) keeps the product off
 * the storefront until it has one.
 *
 * What the owner may type:
 *   - "Made in USA"                    — made here, of fabric made here
 *   - "Made in USA of imported fabric" — sewn here, fabric from elsewhere
 *   - "Made in USA and imported"       — some parts of each (16 CFR 303.34)
 *   - "Imported"                       — made abroad, country not named
 *   - a country, or "Made in <country>", for anywhere but the USA
 *
 * A bare "USA" is refused: whether the garment may say "Made in USA" depends on
 * where the fabric was made, and the value alone does not say. So is a
 * placeholder ("TBD", "unknown"), which would print as "Made in TBD".
 */

export const ORIGIN_LABEL = "Country of manufacture";

export type Origin = {
  /** What the listing says, in the FTC's form. */
  disclosure: string;
  /** For Product JSON-LD `countryOfOrigin`, or null when no country is named. */
  country: string | null;
};

const US_NAMES = /^(the )?(usa|u\.s\.a\.?|us|u\.s\.?|united states( of america)?|america)$/i;

const PLACEHOLDERS = /^(tbd|tbc|n\/?a|none|unknown|pending|todo|to be (confirmed|specified|decided)|\?+|-+)$/i;

/** An owner-typed origin value → the FTC disclosure, or why it cannot be one. */
export function readOrigin(raw: string | null | undefined): { ok: true; origin: Origin } | { ok: false; reason: string } {
  const value = (raw ?? "").trim().replace(/\s+/g, " ").replace(/\.$/, "");

  if (!value) {
    return { ok: false, reason: "no country of manufacture" };
  }

  const lower = value.toLowerCase();

  if (lower === "made in usa") {
    return { ok: true, origin: { disclosure: "Made in USA", country: "US" } };
  }

  if (lower === "made in usa of imported fabric") {
    return { ok: true, origin: { disclosure: "Made in USA of imported fabric", country: "US" } };
  }

  if (lower === "made in usa and imported") {
    return { ok: true, origin: { disclosure: "Made in USA and imported", country: null } };
  }

  if (lower === "imported") {
    return { ok: true, origin: { disclosure: "Imported", country: null } };
  }

  const country = value.replace(/^made in /i, "").trim();

  if (!country || PLACEHOLDERS.test(country)) {
    return { ok: false, reason: `"${value}" is not a country` };
  }

  if (US_NAMES.test(country)) {
    return {
      ok: false,
      reason:
        `"${value}" does not say where the fabric was made — write "Made in USA" (US fabric) ` +
        `or "Made in USA of imported fabric"`,
    };
  }

  return { ok: true, origin: { disclosure: `Imported — made in ${country}`, country } };
}

/** The product's origin, or null when it has none the listing can state. */
export function productOrigin(specs: readonly Specification[]): Origin | null {
  const line = specs.find((spec) => spec.label === ORIGIN_LABEL);
  const read = readOrigin(line?.value);
  return read.ok ? read.origin : null;
}
