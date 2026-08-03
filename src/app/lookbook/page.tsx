import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRODUCTS } from "@/content/products";

export const metadata: Metadata = {
  title: "Lookbook",
  description:
    "The First Edition as drawn: production flats for each garment, and what the photography will be when it exists.",
  alternates: { canonical: "/lookbook" },
};

/**
 * A lookbook with no photography in it.
 *
 * Nothing has been shot, and the alternatives — scraping competitor imagery,
 * licensing athlete photographs we have no right to, or generating a
 * photorealistic garment that does not exist — are all off the table. So this
 * is the honest version: the drawings, and a plain statement of what the real
 * shoot will be. See docs/image-production-plan.md.
 */
export default function LookbookPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/lookbook", label: "Lookbook" }]} />

        <header className="mt-10 mb-20 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Lookbook</h1>
          <p className="mt-8 text-lg text-steel">
            There are no photographs here, because no garment has been made and
            photographed. What follows is what exists: the production flats.
          </p>
          <p className="mt-6 text-base text-steel">
            We are not going to fill this page with borrowed imagery, licensed
            stock of somebody else&rsquo;s gym, or a photorealistic render of a
            garment that has never been sewn. When the First Edition is made, it
            will be shot on people who train, and this page will change.
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
                <p className="notation mb-8 text-2xs text-signal">
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
                  className="display-plain mt-8 inline-block text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
                >
                  Full specification
                </Link>
              </div>
            </section>
          ))}
        </div>

        <section
          aria-labelledby="shoot"
          className="mt-28 max-w-[46rem] border-t border-steel-dim pt-12"
        >
          <h2 id="shoot" className="display-condensed text-2xl text-chalk">
            What the shoot will be
          </h2>
          <div className="mt-6 flex flex-col gap-5">
            <p className="text-base text-steel">
              Grapplers, not models. Shot in a room that looks like a room people
              train in, on bodies of more than one shape, with the garment doing
              what it is for rather than being held still.
            </p>
            <p className="text-base text-steel">
              Everyone photographed will be photographed with their agreement and
              credited. Nothing will imply a sponsorship that does not exist.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
