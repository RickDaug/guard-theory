import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { ProductForm } from "./ProductForm";
import { NewProductForm } from "./NewProductForm";
import { SizesEditor } from "./SizesEditor";
import { ContentForm } from "./ContentForm";
import { getProduct } from "@/content/products";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  slug: string;
  status: string;
  price_cents: number | null;
  sale_cents: number | null;
  db_name: string | null;
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

type SpecRow = { product_id: string; label: string; value: string | null };

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
    `select id, slug, status, price_cents, sale_cents, name as db_name,
            kind, summary, description
       from product where status <> 'archived' order by sort_index, slug`,
  );

  const variants = await query<VariantRow>(
    "select id, product_id, size_label, sku, stock from variant order by sort_index, size_label",
  );

  const specs = await query<SpecRow>(
    "select product_id, label, value from product_spec order by product_id, position",
  );

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-4 text-3xl text-chalk">Products</h1>
        <p className="mb-12 max-w-[46rem] text-base text-steel">
          A new product starts as a draft. It can go live only once it has a price, at least
          one size, its words, and the fabric weight, composition, seam construction and print
          method the shop says every product page states. Leave the price empty and the
          storefront says nothing about price at all.
        </p>

        <div className="mb-16">
          <NewProductForm />
        </div>

        {products.length === 0 ? (
          <p className="text-lg text-steel">
            No products yet. Create one above, or run{" "}
            <span className="notation text-2xs">npm run db:seed</span> to create rows for the
            two garments already written into the site.
          </p>
        ) : (
          <div className="flex flex-col gap-16">
            {products.map((product) => {
              const registry = getProduct(product.slug);
              const sizes = variants.filter((variant) => variant.product_id === product.id);

              return (
                <div key={product.id} className="flex flex-col gap-4">
                  <ProductForm
                    id={product.id}
                    name={registry?.name ?? product.db_name ?? product.slug}
                    slug={product.slug}
                    status={product.status}
                    priceCents={product.price_cents}
                    saleCents={product.sale_cents}
                    variants={sizes.map((variant) => ({
                      id: variant.id,
                      sizeLabel: variant.size_label,
                      stock: variant.stock,
                    }))}
                  />

                  <SizesEditor
                    productId={product.id}
                    sizes={sizes.map((variant) => ({
                      id: variant.id,
                      sizeLabel: variant.size_label,
                      sku: variant.sku,
                    }))}
                  />

                  {registry ? (
                    <p className="border border-steel-dim p-7 text-base text-steel">
                      This garment&rsquo;s words and specification are written into the site
                      itself. The developer changes them.
                    </p>
                  ) : (
                    <ContentForm
                      id={product.id}
                      name={product.db_name ?? ""}
                      kind={product.kind ?? ""}
                      summary={product.summary ?? ""}
                      description={product.description ?? ""}
                      specs={specs
                        .filter((spec) => spec.product_id === product.id)
                        .map((spec) => ({ label: spec.label, value: spec.value }))}
                    />
                  )}

                  <p className="text-base text-steel">Images: added by the developer for now.</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
