import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRODUCTS } from "@/content/products";

export const metadata: Metadata = pageMetadata({
  title: "Lookbook",
  description: "The First Edition as drawn: a production flat for each garment, to the standard the factory is handed and the measurements come from.",
  path: "/lookbook",
});

/**
 * The range, drawn.
 *
 * Production flats rather than photography: a flat states construction and
 * carries the measurements, which is what someone choosing between two
 * garments actually needs. Photography joins it, it does not replace it.
 */
export default function LookbookPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/lookbook", label: "Lookbook" }]} />

        <header className="mt-10 mb-20 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Lookbook</h1>
          <p className="mt-8 text-lg text-steel">
            Every garment, drawn to production standard. A flat is what the
            factory is handed and what the measurements come from — the part of
            a lookbook you can actually check.
          </p>
        </header>

        <div className="flex flex-col gap-24">
          {PRODUCTS.map((product, index) => (
            <section
              key={product.slug}
              aria-labelledby={`look-${product.slug}`}
              className="grid gap-12 lg:grid-cols-12 lg:gap-16"
            >
              <div className="lg:col-span-7">
                <p className="notation mb-8 text-2xs text-orchid">
                  Plate {String(index + 1).padStart(2, "0")} — {product.kind}
                </p>
                <GarmentFlat
                  points={product.constructionPoints}
                  title={`GUARD THEORY — ${product.name.toUpperCase()}, ${product.kind.toUpperCase()}`}
                  reference={`PL. ${String(index + 1).padStart(2, "0")} / REV A`}
                />
              </div>

              <div className="lg:col-span-4 lg:col-start-9">
                <h2
                  id={`look-${product.slug}`}
                  className="display-condensed text-2xl text-chalk"
                >
                  {product.name}
                </h2>
                <p className="display-plain mt-2 text-lg text-steel">
                  {product.kind}
                </p>
                <p className="mt-6 max-w-[32rem] text-base text-steel">
                  {product.summary}
                </p>
                <Link
                  href={`/shop/${product.slug}`}
                  className="display-plain mt-8 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
                >
                  Full specification
                </Link>
              </div>
            </section>
          ))}
        </div>

      </div>
    </main>
  );
}
