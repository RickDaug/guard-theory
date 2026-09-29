/**
 * The specification lines the site says every product page states.
 *
 * `src/app/first-edition/page.tsx` and `src/app/shop/page.tsx` say "fabric
 * weight, composition, seam construction and print method are stated on the
 * product page". `src/content/claims.ts` holds every registry product to that,
 * and the Crew Portal holds a product it created to the same list before it
 * can go on the storefront (src/lib/portal/product-edit.ts). One list, so the
 * two rules cannot drift apart.
 */
export const PUBLISHED_SPECIFICATIONS = [
  "Fabric weight",
  "Fabric composition",
  "Seam construction",
  "Print method",
] as const;
