import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { ProductForm } from "./ProductForm";
import { getProduct } from "@/content/products";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  status: string;
  price_cents: number | null;
  sale_cents: number | null;
  db_name: string | null;
};

type VariantRow = { id: string; product_id: string; size_label: string; stock: number };

/**
 * Products.
 *
 * Everything editable is on one screen because there are two products. A list
 * that links to a detail page that links back would be three navigations to
 * change a number.
 */
export default async function ProductsPage() {
  await requirePortalPage(portalUrl("/products"));

  if (!isDatabaseConfigured()) {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[70rem]">
          <h1 className="display-condensed mb-8 text-3xl text-chalk">Products</h1>
          <p className="text-lg text-steel">
            There is no database connected, so there is nothing to edit. See
            docs/database-runbook.md.
          </p>
        </div>
      </main>
    );
  }

  const products = await query<Row>(
    `select id, slug, status, price_cents, sale_cents, name as db_name
       from product where status <> 'archived' order by sort_index, slug`,
  );

  const variants = await query<VariantRow>(
    "select id, product_id, size_label, stock from variant order by sort_index, size_label",
  );

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-4 text-3xl text-chalk">Products</h1>
        <p className="mb-12 max-w-[46rem] text-base text-steel">
          A product needs a price before it can go live. Leave the price empty and the
          storefront says nothing about price at all, which is the right thing to show
          until you have decided.
        </p>

        {products.length === 0 ? (
          <p className="text-lg text-steel">
            No products yet. Run <span className="notation text-2xs">npm run db:seed</span> to
            create rows for the two garments already written into the site.
          </p>
        ) : (
          <div className="flex flex-col gap-10">
            {products.map((product) => (
              <ProductForm
                key={product.id}
                id={product.id}
                name={getProduct(product.slug)?.name ?? product.db_name ?? product.slug}
                slug={product.slug}
                status={product.status}
                priceCents={product.price_cents}
                saleCents={product.sale_cents}
                variants={variants
                  .filter((variant) => variant.product_id === product.id)
                  .map((variant) => ({
                    id: variant.id,
                    sizeLabel: variant.size_label,
                    stock: variant.stock,
                  }))}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
