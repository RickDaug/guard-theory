import { theory01LongSleeve } from "./entries/theory-01-long-sleeve.ts";
import { theory01ShortSleeve } from "./entries/theory-01-short-sleeve.ts";
import type { Product } from "./types.ts";

/**
 * Imported explicitly rather than globbed, so a renamed file fails the build
 * instead of silently removing a product from the sitemap.
 */
export const PRODUCTS: Product[] = [theory01LongSleeve, theory01ShortSleeve];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((product) => product.slug === slug);
}

export type { ConstructionPoint, Product, Specification } from "./types.ts";
export { STATUS_LABEL } from "./types.ts";
