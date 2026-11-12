import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { capitalise, numberWord } from "@/content/section-descriptions";
import { listProductViews, stockStatus } from "@/lib/catalogue";

export const metadata: Metadata = pageMetadata({
  title: "Shop — No-gi BJJ rash guards",
  description: "What Guard Theory makes: the First Edition no-gi rash guards, long sleeve and short sleeve, each drawn as a flat. Join the list for first access.",
  path: "/shop",
});

/** Stated plainly so the page is useful rather than an empty holding screen. */
const ROADMAP = [
  {
    heading: "First",
    body: "Rash guards, long and short sleeve. One garment made properly is a better start than a range made adequately.",
  },
  {
    heading: "Then",
    body: "Spats and shorts, once the rash guard fit is proven on real bodies rather than on a size chart.",
  },
  {
    heading: "Later",
    body: "Accessories. Tape first, because it is the item where specification matters most and marketing helps least.",
  },
];

/**
 * Reads live prices and stock, so it renders per request.
 *
 * A cached "available" is a lie with a delay on it. With no database configured
 * the read is a pure function of the content registry and costs nothing, which
 * is also what keeps `next build` working in CI without secrets.
 */
export const dynamic = "force-dynamic";

/**
 * The shop is a catalogue of plates: a bone sheet carrying the garments as
 * cards, each with its flat on a small ink plate, then an ink band for the
 * order the work is being done in. The breadcrumb strip stays on ink so its
 * notation keeps the ground it was set for.
 */
export default async function ShopPage() {
  const products = await listProductViews();
  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 md:px-12">
        <div className="mx-auto max-w-[104rem] py-5">
          <Breadcrumbs trail={[{ href: "/shop", label: "Shop" }]} />
        </div>
      </div>

      <div className="band-bone band-edge px-6 pt-14 pb-20 md:px-12 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-[104rem]">
          <header className="mb-14 grid gap-8 md:mb-20 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="eyebrow text-slate">First Edition</p>
              <h1 className="display-condensed mt-5 text-4xl leading-[0.9] text-ink">Shop</h1>
            </div>
            <div className="lg:col-span-5 lg:pb-2">
              <p className="max-w-[26rem] text-lg text-slate">
                {capitalise(numberWord(products.length))} garments, each drawn as a flat.
              </p>
              <div className="mt-7">
                <ButtonLink href="/first-edition">
                  Join the First Edition list
                </ButtonLink>
              </div>
            </div>
          </header>

          <section aria-labelledby="in-progress">
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-steel pb-4">
              <h2
                id="in-progress"
                className="display-condensed text-2xl text-ink"
              >
                {/* "In progress" is only true while nothing can be bought. */}
                {products.some((product) => stockStatus(product) === "purchasable")
                  ? "The garments"
                  : "In progress"}
              </h2>
            </div>

            <ul className="m-0 grid list-none gap-6 p-0 lg:grid-cols-2 lg:gap-8">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section
        aria-labelledby="order"
        className="band-ink plate-grid corner-ticks px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[104rem]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <h2 id="order" className="display-condensed text-3xl leading-[0.95] text-chalk">
                The order we are working in
              </h2>
            </div>

            {/* A genuine sequence, so the labels stay. The steps sit on one
                rule and read left to right; no numerals, because the words
                already say which comes first. */}
            <ol className="m-0 grid list-none gap-10 p-0 sm:grid-cols-3 sm:gap-8 lg:col-span-8">
              {ROADMAP.map((step) => (
                <li
                  key={step.heading}
                  className="reveal relative border-t border-steel-dim pt-6 before:absolute before:-top-px before:left-0 before:h-px before:w-10 before:bg-orchid before:content-['']"
                >
                  <h3 className="display-condensed text-xl text-chalk">
                    {step.heading}
                  </h3>
                  <p className="mt-3 max-w-[22rem] text-base text-chalk">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <p className="mt-16 text-base text-chalk md:mt-20">
            <Link
              href="/first-edition"
              className="link-rule inline-flex min-h-6 items-center text-signal-lift"
            >
              Join the First Edition list
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
