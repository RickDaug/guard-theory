import { PRODUCTS, getProduct, type Product } from "@/content/products";
import { isDatabaseConfigured, query } from "../db/client.ts";
import type { Commerce, ProductView, VariantView } from "./types.ts";

/**
 * Joins product content to product commerce.
 *
 * Content comes from the typed registry, which is what stops the sitemap and
 * the search index drifting from the routes — a deleted entry still fails the
 * build. Commerce comes from Postgres, because a price the owner can edit and a
 * stock level that changes on payment cannot live in a file that is compiled
 * into the bundle.
 *
 * WITH NO DATABASE, EVERY VIEW HAS `commerce: null`.
 *
 * That is not a degraded mode to be apologised for. It is exactly the site as
 * it was before commerce: the product pages render, and they say nothing about
 * price or availability because there is nothing true to say. It is also what
 * makes `next build` work in CI without secrets.
 */

type ProductRow = {
  id: string;
  slug: string;
  status: Commerce["status"];
  price_cents: number | null;
  sale_cents: number | null;
  currency: string;
  category_slug: string | null;
  name: string | null;
  kind: string | null;
  summary: string | null;
  description: string | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  size_label: string;
  sku: string;
  stock: number;
};

type ImageRow = {
  product_id: string;
  blob_url: string;
  alt: string;
  width: number;
  height: number;
};

function toVariant(row: VariantRow): VariantView {
  return {
    id: row.id,
    sizeLabel: row.size_label,
    sku: row.sku,
    stock: row.stock,
    inStock: row.stock > 0,
  };
}

/** Content from the registry, commerce left empty. */
function contentOnly(product: Product): ProductView {
  return {
    slug: product.slug,
    name: product.name,
    kind: product.kind,
    summary: product.summary,
    metaDescription: product.metaDescription,
    description: product.description,
    constructionPoints: product.constructionPoints,
    specifications: product.specifications,
    sizeLabels: product.sizeLabels,
    commerce: null,
  };
}

function merge(
  product: Product | undefined,
  row: ProductRow,
  variants: VariantRow[],
  images: ImageRow[],
): ProductView | null {
  // A row with no registry entry must carry its own content — that is a product
  // created in the portal. One that carries neither is not renderable, and
  // inventing a name for it is exactly what this codebase does not do.
  const name = product?.name ?? row.name;
  const kind = product?.kind ?? row.kind;

  if (!name || !kind) {
    return null;
  }

  return {
    slug: row.slug,
    name,
    kind,
    summary: product?.summary ?? row.summary ?? "",
    metaDescription: product?.metaDescription,
    description: product?.description ?? row.description ?? "",
    constructionPoints: product?.constructionPoints ?? [],
    specifications: product?.specifications ?? [],
    // Sizes come from the variants once they exist, because those are the sizes
    // that can actually be bought. The registry list is the fallback.
    sizeLabels:
      variants.length > 0
        ? variants.map((v) => v.size_label)
        : (product?.sizeLabels ?? []),
    commerce: {
      productId: row.id,
      status: row.status,
      priceCents: row.price_cents,
      saleCents: row.sale_cents,
      currency: row.currency,
      categorySlug: row.category_slug,
      variants: variants.map(toVariant),
      images: images.map((i) => ({
        url: i.blob_url,
        alt: i.alt,
        width: i.width,
        height: i.height,
      })),
    },
  };
}

const PRODUCT_SELECT = `
  select p.id, p.slug, p.status, p.price_cents, p.sale_cents, p.currency,
         c.slug as category_slug,
         p.name, p.kind, p.summary, p.description
    from product p
    left join category c on c.id = p.category_id
`;

/**
 * One product, by slug.
 *
 * Falls back to content-only rather than to nothing when there is no database,
 * so /shop/[slug] keeps rendering. A missing slug is undefined either way, and
 * the route still 404s.
 */
export async function getProductView(slug: string): Promise<ProductView | undefined> {
  const product = getProduct(slug);

  if (!isDatabaseConfigured()) {
    return product ? contentOnly(product) : undefined;
  }

  try {
    const rows = await query<ProductRow>(`${PRODUCT_SELECT} where p.slug = $1`, [slug]);
    const row = rows[0];

    if (!row) {
      return product ? contentOnly(product) : undefined;
    }

    const [variants, images] = await Promise.all([
      query<VariantRow>(
        "select * from variant where product_id = $1 order by sort_index, size_label",
        [row.id],
      ),
      query<ImageRow>(
        "select * from product_image where product_id = $1 order by sort_index",
        [row.id],
      ),
    ]);

    return merge(product, row, variants, images) ?? (product ? contentOnly(product) : undefined);
  } catch (error) {
    // A database that is unreachable must not take the storefront down with it.
    // The page renders as content-only, which is honest — we genuinely do not
    // know the price right now, so we say nothing about it.
    console.error(
      "[guard-theory] product lookup failed, falling back to content only:",
      error instanceof Error ? error.message : error,
    );
    return product ? contentOnly(product) : undefined;
  }
}

/**
 * Every product the storefront should list.
 *
 * Ordered by the database's sort_index when there is one, so the owner controls
 * the order from the portal, and by registry order when there is not.
 */
export async function listProductViews(): Promise<ProductView[]> {
  if (!isDatabaseConfigured()) {
    return PRODUCTS.map(contentOnly);
  }

  try {
    const rows = await query<ProductRow>(
      `${PRODUCT_SELECT} where p.status <> 'archived' order by p.sort_index, p.slug`,
    );

    if (rows.length === 0) {
      return PRODUCTS.map(contentOnly);
    }

    const ids = rows.map((r) => r.id);

    const [variants, images] = await Promise.all([
      query<VariantRow>(
        "select * from variant where product_id = any($1::text[]) order by sort_index, size_label",
        [ids],
      ),
      query<ImageRow>(
        "select * from product_image where product_id = any($1::text[]) order by sort_index",
        [ids],
      ),
    ]);

    const views: ProductView[] = [];

    for (const row of rows) {
      if (row.status === "draft") {
        // Staged, not published. It is not on the storefront at all.
        continue;
      }

      const view = merge(
        getProduct(row.slug),
        row,
        variants.filter((v) => v.product_id === row.id),
        images.filter((i) => i.product_id === row.id),
      );

      if (view) {
        views.push(view);
      }
    }

    return views;
  } catch (error) {
    console.error(
      "[guard-theory] product listing failed, falling back to content only:",
      error instanceof Error ? error.message : error,
    );
    return PRODUCTS.map(contentOnly);
  }
}

export {
  effectivePriceCents,
  hasPublishableOffer,
  stockStatus,
  type Commerce,
  type ProductView,
  type StockStatus,
  type VariantView,
} from "./types.ts";
