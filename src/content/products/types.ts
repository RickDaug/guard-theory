/**
 * The product content model.
 *
 * Deliberately missing: price, stock level, rating, review count, release date.
 * None of those are known, and a model that cannot represent them is a model
 * that cannot accidentally publish an invented one. When real values exist they
 * are added here and to the structured-data emitter at the same time — see
 * docs/structured-data-map.md.
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
  description: string;
  constructionPoints: ConstructionPoint[];
  specifications: Specification[];
  /** Size labels only. Measurements are an owner decision and are not invented. */
  sizeLabels: string[];
};

export const STATUS_LABEL: Record<ProductStatus, string> = {
  "coming-soon": "Coming soon",
};

