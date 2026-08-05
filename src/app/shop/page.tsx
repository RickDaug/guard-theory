import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCTS, STATUS_LABEL } from "@/content/products";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description: "What Guard Theory is making, in what order, and why. Nothing is for sale yet — the First Edition has no release date announced.",
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

export default function ShopPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/shop", label: "Shop" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <p className="notation text-2xs text-signal">First Edition</p>
          <h1 className="display-condensed mt-6 text-4xl text-chalk">Shop</h1>
          <p className="mt-8 text-lg text-steel">
            Two garments, made in one run. The specification is published in
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
            {PRODUCTS.map((product) => (
              <li key={product.slug} className="bg-ink">
                <Link
                  href={`/shop/${product.slug}`}
                  className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <span className="notation text-2xs text-steel">
                    {STATUS_LABEL[product.status]}
                  </span>
                  <h3 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                    {product.name} — {product.kind}
                  </h3>
                  <p className="mt-4 max-w-[34rem] text-sm text-steel">
                    {product.summary}
                  </p>
                </Link>
              </li>
            ))}
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
