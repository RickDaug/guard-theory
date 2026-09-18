import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { STATUS_LABEL } from "@/content/products";
import { effectivePriceCents, listProductViews, stockStatus } from "@/lib/catalogue";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description: "What Guard Theory makes, and the published specification behind each garment — fabric, weight, seam construction and print method.",
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

export default async function ShopPage() {
  const products = await listProductViews();
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/shop", label: "Shop" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <p className="notation text-2xs text-orchid">First Edition</p>
          <h1 className="display-condensed mt-6 text-4xl text-chalk">Shop</h1>
          <p className="mt-8 text-lg text-steel">
            Two garments. The specification is published in
            full on each page — fabric, weight, seam construction, print method
            — because that is what you are actually choosing between.
          </p>
          <div className="mt-10">
            <ButtonLink href="/first-edition">
              Join the First Edition list
            </ButtonLink>
          </div>
        </header>

        <section aria-labelledby="in-progress" className="mb-20">
          <h2
            id="in-progress"
            className="display-condensed mb-10 text-2xl text-chalk"
          >
            In progress
          </h2>

          <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 lg:grid-cols-2">
            {products.map((product) => {
              const availability = stockStatus(product);
              const priceCents = effectivePriceCents(product);

              return (
                <li key={product.slug} className="bg-ink">
                  <Link
                    href={`/shop/${product.slug}`}
                    className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                  >
                    <span className="notation text-2xs text-steel">
                      {availability === "purchasable"
                        ? "Available"
                        : availability === "sold-out"
                          ? "Sold out"
                          : STATUS_LABEL["coming-soon"]}
                    </span>
                    <h3 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                      {product.name} — {product.kind}
                    </h3>
                    <p className="mt-4 max-w-[34rem] text-sm text-steel">
                      {product.summary}
                    </p>
                    {/* Rendered only when the owner has entered one. A product
                        with no price says nothing about price. */}
                    {priceCents !== null && product.commerce ? (
                      <p className="display-condensed mt-6 text-lg text-chalk tabular-nums">
                        {formatMoney(priceCents, product.commerce.currency)}
                      </p>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="order" className="max-w-[70rem]">
          <h2 id="order" className="display-condensed mb-10 text-2xl text-chalk">
            The order we are working in
          </h2>
          <ul className="m-0 grid list-none gap-10 p-0 sm:grid-cols-3">
            {ROADMAP.map((step) => (
              <li key={step.heading}>
                <h3 className="display-condensed text-lg text-chalk">
                  {step.heading}
                </h3>
                <p className="mt-3 text-base text-steel">{step.body}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
