import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRODUCTS } from "@/content/products";

export const metadata: Metadata = pageMetadata({
  title: "Lookbook",
  description: "The First Edition as drawn: a flat drawing of each Guard Theory no-gi rash guard, long sleeve and short sleeve, with a link to each garment.",
  path: "/lookbook",
});

/**
 * The range, drawn.
 *
 * Flats rather than photography. The flats once claimed to be what "the
 * factory is handed" and "what the measurements come from"; neither was
 * supplied (docs/owner-decisions.md §3), so the page now says only what the
 * drawing is.
 */
export default function LookbookPage() {
  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/lookbook", label: "Lookbook" }]} />

        <header className="mt-10 mb-20 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Lookbook</h1>
          <p className="mt-8 text-lg text-steel">
            Every garment,{" "}
            <Link
              href="/about#how"
              className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
            >
              drawn flat
            </Link>
            .
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
                  label={`${product.name}, ${product.kind} — flat`}
                />
              </div>

              <div className="lg:col-span-4 lg:col-start-9">
                <h2
                  id={`look-${product.slug}`}
                  className="display-condensed text-2xl text-chalk"
                >
                  {/* One heading, both halves. Every garment here is a "Theory
                      01", so the name alone gave the page two identical h2s
                      and a headings list that could not tell them apart. */}
                  {product.name}{" "}
                  <span className="display-plain mt-2 block text-lg tracking-normal text-steel normal-case">
                    {product.kind}
                  </span>
                </h2>
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
