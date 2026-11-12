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
 *
 * Each plate gets a band of its own, and the bands alternate: a plate on ink,
 * then the same notation on a bone sheet (`plate-on-paper` remaps the
 * drawing's colours for paper), so the lookbook turns like the pages of the
 * document it is.
 */
export default function LookbookPage() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="band-ink corner-ticks px-6 pt-10 pb-16 md:px-12 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/lookbook", label: "Lookbook" }]} />

          <header className="mt-12 max-w-[46rem] md:mt-16">
            <p className="display-wide text-xs text-chalk sm:text-sm">First Edition</p>
            <h1 className="display-condensed mt-6 text-4xl leading-[0.9] text-chalk">
              Lookbook
            </h1>
            <p className="mt-8 text-lg text-chalk">
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
        </div>
      </section>

      {PRODUCTS.map((product, index) => {
        const onPaper = index % 2 === 0;
        const plate = String(index + 1).padStart(2, "0");
        return (
          <section
            key={product.slug}
            aria-labelledby={`look-${product.slug}`}
            className={`${
              onPaper ? "band-bone band-edge" : "band-ink"
            } px-6 py-16 md:px-12 md:py-24`}
          >
            <div className="mx-auto grid max-w-[104rem] gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="reveal lg:col-span-7">
                <p
                  className={`notation mb-8 text-2xs ${
                    onPaper ? "text-slate" : "text-orchid"
                  }`}
                >
                  Plate {plate} — {product.kind}
                </p>
                <div className={onPaper ? "plate-on-paper" : undefined}>
                  <GarmentFlat
                    points={product.constructionPoints}
                    title={`GUARD THEORY — ${product.name.toUpperCase()}, ${product.kind.toUpperCase()}`}
                    reference={`PL. ${plate} / REV A`}
                    label={`${product.name}, ${product.kind} — flat`}
                  />
                </div>
              </div>

              <div className="reveal lg:col-span-4 lg:col-start-9 lg:self-end">
                <h2
                  id={`look-${product.slug}`}
                  className={`display-condensed text-3xl leading-[0.95] ${
                    onPaper ? "text-ink" : "text-chalk"
                  }`}
                >
                  {/* One heading, both halves. Every garment here is a "Theory
                      01", so the name alone gave the page two identical h2s
                      and a headings list that could not tell them apart. */}
                  {product.name}{" "}
                  <span
                    className={`display-plain mt-3 block text-lg tracking-normal normal-case ${
                      onPaper ? "text-slate" : "text-steel"
                    }`}
                  >
                    {product.kind}
                  </span>
                </h2>
                <p
                  className={`mt-6 max-w-[32rem] text-base ${
                    onPaper ? "text-slate" : "text-chalk"
                  }`}
                >
                  {product.summary}
                </p>
                <Link
                  href={`/shop/${product.slug}`}
                  className={`link-rule display-plain mt-8 inline-flex min-h-6 items-center text-sm ${
                    onPaper ? "text-signal-dim" : "text-signal-lift"
                  }`}
                >
                  Full specification
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </main>
  );
}
