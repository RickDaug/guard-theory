/**
 * The specification lines the site says every product page states — the four
 * manufacturing lines and, since the country-of-origin change, the origin line
 * the FTC requires in every online listing.
 *
 * Since 2026-09-29 (#64) no page promises these: the values published before
 * then were invented, and the sentence saying they "are stated on the product
 * page" is a retired claim. The list is kept because a garment should not be
 * sold without them: the Crew Portal holds a product to it before it can go on
 * the storefront (src/lib/portal/product-edit.ts), and `src/content/claims.ts`
 * checks registry products against it once the owner has supplied a
 * specification (specSource "owner"). One list, so the two cannot drift.
 */
export const PUBLISHED_SPECIFICATIONS = [
  "Fabric weight",
  "Fabric composition",
  "Seam construction",
  "Print method",
  // 16 CFR 303.34: an online listing must say "Made in USA", "Imported" or
  // both. The line holds the owner's value; src/content/products/origin.ts
  // turns it into that sentence. Same string as ORIGIN_LABEL, which
  // tests/unit/origin.test.ts asserts.
  "Country of manufacture",
] as const;
