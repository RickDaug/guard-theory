/**
 * The product CONTENT model.
 *
 * Still deliberately missing: price, stock level, rating, review count, release
 * date. That has not been relaxed — it has been enforced harder. Those values
 * now live in the database, entered by the owner through the Crew Portal, and
 * this model still cannot represent them. A registry file physically cannot
 * carry an invented price, which is a stronger guarantee than a rule about not
 * typing one.
 *
 * What a page renders is a ProductView — this content joined to whatever
 * commerce facts exist for the slug. See src/lib/catalogue. With no database
 * the join produces content and nothing else, and the page renders exactly as
 * it did before commerce: no price, no buy box, no claim about either.
 *
 * `Product`/`Offer` structured data is emitted only from a view that has a real
 * price and real stock — asserted in tests/e2e/metadata.spec.ts, which now
 * checks that what we publish is true rather than that we publish nothing.
 */

/**
 * The status a product has before any database row exists for it — which is
 * also its status in a build with no database, and the only status the
 * registry itself can express. Everything else is a commercial fact and lives
 * in the `product` table.
 */
export type ProductStatus = "coming-soon";

/** A callout on the technical flat, keyed to the drawing by number. */
export type ConstructionPoint = {
  code: string;
  label: string;
  /** What the drawing shows. Never a performance or durability claim. */
  note: string;
};

/**
 * A specification line. `value` is null until the owner supplies a real figure;
 * the UI renders that as "to be specified" rather than inventing a number or
 * hiding the row.
 */
export type Specification = {
  label: string;
  value: string | null;
};

/** Who supplied a set of product facts. There is no other valid source. */
export type SpecSource = "owner" | null;

/**
 * Specification lines that restate what the product IS rather than how it is
 * made — "Long" on the long sleeve — and so need no supplier. Keep this short:
 * everything else is a manufacturing fact.
 */
export const DRAWN_SPECIFICATION_LABELS: readonly string[] = ["Sleeve"];

export type Product = {
  slug: string;
  name: string;
  /** e.g. "Long sleeve rash guard". Used in listings and breadcrumbs. */
  kind: string;
  status: ProductStatus;
  summary: string;
  /**
   * The search-and-share description, when the summary is the wrong length for
   * one. The summary is a card line on /shop and /lookbook; this is what a
   * search result shows. Optional, and asserted in tests/unit/content.test.ts.
   */
  metaDescription?: string;
  description: string;
  constructionPoints: ConstructionPoint[];
  /**
   * Where the specification values came from. `"owner"` only when the owner
   * (or their manufacturer, through them) supplied them. While this is null,
   * only the lines in DRAWN_SPECIFICATION_LABELS may carry a value and
   * `constructionPoints` must be empty. Asserted in tests/unit/content.test.ts.
   *
   * It exists because on 2026-08-04 a fabric composition, a GSM, a seam type
   * and a print method were typed in with no source and were published until
   * 2026-09-29. See docs/owner-decisions.md §3.
   */
  specSource: SpecSource;
  specifications: Specification[];
  /**
   * Size labels only, and empty until the owner supplies a range. Purchasable
   * sizes come from the owner's variants in the portal, which override this.
   */
  sizeLabels: string[];
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  "coming-soon": "Coming soon",
};

