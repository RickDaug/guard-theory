import type { ConstructionPoint, Specification } from "@/content/products";

/**
 * The commerce half of a product: the facts the content registry deliberately
 * cannot hold.
 *
 * `priceCents` is nullable and starts null. A product with no price is not an
 * error state and not a "coming soon" — it is a product whose price the owner
 * has not typed yet, and the page says nothing at all about price. That is the
 * absence rule from AGENTS.md expressed as a type.
 */

export type StockStatus = "purchasable" | "sold-out" | "unreleased";

export type VariantView = {
  id: string;
  sizeLabel: string;
  sku: string;
  stock: number;
  /** Convenience for the UI, which should never do arithmetic on stock. */
  inStock: boolean;
};

export type Commerce = {
  productId: string;
  status: "draft" | "active" | "sold-out" | "archived";
  priceCents: number | null;
  saleCents: number | null;
  currency: string;
  categorySlug: string | null;
  variants: VariantView[];
  images: { url: string; alt: string; width: number; height: number }[];
};

export type ProductView = {
  slug: string;
  name: string;
  kind: string;
  summary: string;
  metaDescription?: string;
  description: string;
  constructionPoints: ConstructionPoint[];
  specifications: Specification[];
  sizeLabels: string[];

  /** Null when there is no database row — and so, no price and no buy box. */
  commerce: Commerce | null;
};

/** The price actually being charged: the sale price when there is one. */
export function effectivePriceCents(view: ProductView): number | null {
  if (!view.commerce) {
    return null;
  }
  return view.commerce.saleCents ?? view.commerce.priceCents;
}

/**
 * Whether this product can be bought right now, and if not, why not.
 *
 * The three answers are meaningfully different to a reader. "Sold out" says a
 * run finished; "unreleased" says nothing about dates, because the site does
 * not discuss dates — owner-decisions item 5.
 */
export function stockStatus(view: ProductView): StockStatus {
  const commerce = view.commerce;

  if (!commerce || commerce.status === "draft" || commerce.status === "archived") {
    return "unreleased";
  }

  // A price is part of being purchasable. A buy button on a product with no
  // price would have to invent one at some point in the flow.
  if (effectivePriceCents(view) === null) {
    return "unreleased";
  }

  if (commerce.status === "sold-out") {
    return "sold-out";
  }

  return commerce.variants.some((variant) => variant.inStock) ? "purchasable" : "sold-out";
}

/**
 * Whether this view carries enough truth for Product/Offer structured data.
 *
 * The rule in AGENTS.md was "no Product/Offer schema without truthful data".
 * This is that rule, as a function, called by the emitter and asserted by
 * tests/e2e/metadata.spec.ts. A real price, a real currency, and a real
 * availability that matches actual stock — or nothing at all.
 */
export function hasPublishableOffer(view: ProductView): boolean {
  if (!view.commerce) {
    return false;
  }

  const price = effectivePriceCents(view);
  const status = stockStatus(view);

  return price !== null && price > 0 && (status === "purchasable" || status === "sold-out");
}
