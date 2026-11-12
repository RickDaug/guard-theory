import { requirePortalPage } from "@/lib/portal/guard";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured, query } from "@/lib/db/client";
import { ProductForm } from "./ProductForm";
import { NewProductForm } from "./NewProductForm";
import { SizesEditor } from "./SizesEditor";
import { ContentForm } from "./ContentForm";
import { ImagesEditor } from "./ImagesEditor";
import { isImageStorageConnected, isStoredImageUrl } from "@/lib/images/host";
import { getProduct } from "@/content/products";
import { formatMoney } from "@/lib/money";

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
  shipping_weight_oz: string | null;
};

type SpecRow = { product_id: string; label: string; value: string | null };

type ImageRow = {
  id: string;
  product_id: string;
  blob_url: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Products.
 *
 * Everything editable is on one screen because there are two products. A list
 * that links to a detail page that links back would be three navigations to
 * change a number.
 */
export default async function ProductsPage() {
  const session = await requirePortalPage(portalUrl("/products"));

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
    "select id, product_id, size_label, sku, stock, shipping_weight_oz from variant order by sort_index, size_label",
  );

  const specs = await query<SpecRow>(
    "select product_id, label, value from product_spec order by product_id, position",
  );

  const images = await query<ImageRow>(
    "select id, product_id, blob_url, alt, width, height from product_image order by product_id, sort_index, id",
  );

  const storageConnected = isImageStorageConnected();

  // Crew read the catalogue — what exists, in which sizes, how many are left —
  // and change none of it. Every product action also refuses them itself.
  if (session.role !== "owner") {
    return (
      <main id="main" className="px-6 py-16 md:px-12">
        <div className="mx-auto max-w-[70rem]">
          <h1 className="display-condensed mb-12 text-3xl text-chalk">Products</h1>
          {products.length === 0 ? (
            <p className="text-lg text-steel">No products yet.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-px bg-steel-dim p-0">
              {products.map((product) => {
                const registry = getProduct(product.slug);
                const sizes = variants.filter((variant) => variant.product_id === product.id);
                const price =
                  product.price_cents === null
                    ? "No price"
                    : formatMoney(product.sale_cents ?? product.price_cents);

                return (
                  <li key={product.id} className="flex flex-col gap-3 bg-ink px-6 py-5">
                    <p className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                      <span className="display-plain text-base text-chalk">
                        {registry?.name ?? product.db_name ?? product.slug}
                      </span>{" "}
                      <span className="text-sm text-steel">{product.status === "active" ? "Live" : product.status === "sold-out" ? "Sold out" : "Draft"}</span>{" "}
                      <span className="text-sm text-chalk tabular-nums">{price}</span>
                    </p>
                    <p className="text-sm text-steel">
                      {sizes.length === 0
                        ? "No sizes yet."
                        : sizes.map((size) => `${size.size_label}: ${size.stock} left`).join(" · ")}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[70rem]">
        <h1 className="display-condensed mb-4 text-3xl text-chalk">Products</h1>
        <p className="mb-12 max-w-[46rem] text-base text-steel">
          A new product starts as a draft. It can go live only once it has a price, at least
          one size, its words, the fabric weight, composition, seam construction and print
          method the shop says every product page states, and at least one photograph with alt
          text. Leave the price empty and the
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
                <div key={product.id} data-product={product.slug} className="flex flex-col gap-4">
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
                      weightOz: variant.shipping_weight_oz,
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

                  <ImagesEditor
                    productId={product.id}
                    connected={storageConnected}
                    images={images
                      .filter((image) => image.product_id === product.id)
                      .map((image) => ({
                        id: image.id,
                        url: image.blob_url,
                        alt: image.alt,
                        width: image.width,
                        height: image.height,
                        showable: isStoredImageUrl(image.blob_url),
                      }))}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
