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
  specifications: Specification[];
  /** Size labels only. Measurements are an owner decision and are not invented. */
  sizeLabels: string[];
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  "coming-soon": "Coming soon",
};

