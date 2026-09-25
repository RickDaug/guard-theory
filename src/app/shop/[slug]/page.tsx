import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { metadata as notFoundMetadata } from "@/app/not-found";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { BuyBox } from "@/components/product/BuyBox";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRODUCTS, STATUS_LABEL } from "@/content/products";
import {
  effectivePriceCents,
  getProductView,
  hasPublishableOffer,
  stockStatus,
} from "@/lib/catalogue";
import { toDecimalString } from "@/lib/money";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { serializeJsonLd } from "@/lib/json-ld";

type Params = { params: Promise<{ slug: string }> };

/*
 * No generateStaticParams and no `dynamicParams = false` here, on purpose —
 * and a known cost.
 *
 * Every other dynamic route lists its slugs at build time and refuses the
 * rest, so an unknown slug never reaches the page: the router renders the
 * not-found route, layouts and all, as a whole document. This route cannot.
 * Its products come from the database at request time, and a product the
 * owner creates in the portal has no registry entry to list, so it is rendered
 * per request (`dynamic` below) and an unknown slug throws `notFound()` from
 * inside the render.
 *
 * What Next 16.2 serves for that is a 404 with the right title and `noindex`
 * whose body is `<html id="__next_error__">`: the not-found page is drawn once
 * JavaScript runs, and with it off the screen is blank. There is no supported
 * way round it for a slug decided at request time. A not-found.tsx beside this
 * file is a client boundary and changes nothing in the HTML; the whole-document
 * 404 is only ever the not-found route, which the router reaches by an
 * unmatched path or by the build-time manifest; and the proxy does no database
 * lookups (src/proxy.ts says why). tests/e2e/not-found.spec.ts records this
 * route as the one exception, and fails the day it stops being one.
 * docs/owner-decisions.md §14 has the choice this leaves the owner.
 */

/**
 * One read per request. generateMetadata and the page both need the product,
 * and without this each would query the database for it.
 */
const loadProduct = cache((slug: string) => getProductView(slug));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  // The not-found boundary's own title, so a mistyped address is not titled
  // as if it were the shop.
  if (!product) return notFoundMetadata;

  return pageMetadata({
    title: `${product.name} — ${product.kind}`,
    description: product.metaDescription ?? product.summary,
    path: `/shop/${product.slug}`,
  });
}

/**
 * Product and Offer structured data is emitted here ONLY when it is true.
 *
 * The old rule was that none appeared at all, because there was no price and no
 * availability and a waitlist is not a PreOrder. That has not been relaxed —
 * hasPublishableOffer() is the same rule, now expressed as a condition instead
 * of an absence, and tests/e2e/metadata.spec.ts asserts the emitted values
 * rather than asserting emptiness. A product with no price still emits nothing.
 *
 * The page renders per request because stock and price can change between
 * builds, and a cached "in stock" is a lie with a delay on it. With no database
 * configured the read is a pure function of the registry and costs nothing.
 */
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  const availability = stockStatus(product);
  const priceCents = effectivePriceCents(product);
  const showOffer = hasPublishableOffer(product);
  const other = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        {showOffer && priceCents !== null && product.commerce ? (
          <script
            type="application/ld+json"
            // Not executable script, so the Content-Security-Policy does not
            // apply to it. Emitted only when hasPublishableOffer() is true, so
            // every value below is one the owner entered.
            dangerouslySetInnerHTML={{
              __html: serializeJsonLd({
                "@context": "https://schema.org",
                "@type": "Product",
                name: `${product.name} — ${product.kind}`,
                description: product.summary,
                sku: product.commerce.variants[0]?.sku,
                url: absoluteUrl(`/shop/${product.slug}`),
                offers: {
                  "@type": "Offer",
                  price: toDecimalString(priceCents),
                  priceCurrency: product.commerce.currency,
                  availability:
                    availability === "purchasable"
                      ? "https://schema.org/InStock"
                      : "https://schema.org/OutOfStock",
                  url: absoluteUrl(`/shop/${product.slug}`),
                },
              }),
            }}
          />
        ) : null}

        <Breadcrumbs
          trail={[
            { href: "/shop", label: "Shop" },
            { href: `/shop/${product.slug}`, label: `${product.name} — ${product.kind}` },
          ]}
        />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          {/* Sticky on wide screens so the drawing stays with you while you
              read the specification beside it. */}
          {/* min-w-0 is load-bearing. A grid item's min-width is `auto`, which
              resolves to its min-content width, and the truncating caption below
              is `whitespace-nowrap` — so without this the track grows to the
              full untruncated string and the caption never truncates at all. It
              pushed the page 3px past the viewport at 390px, which the committed
              mobile screenshot caught: every other one is 390 wide and this one
              was 393. */}
          <div className="min-w-0 lg:col-span-7 lg:sticky lg:top-8 lg:self-start">
            {/**
             * One line, always — the same rule, and the same reason, as the
             * breadcrumb. At 390px this label fits on one line in the metric
             * fallback and needs two in Martian Mono, so when the font landed
             * it grew 16px and pushed the plate and everything under it down:
             * a measured 0.1787 CLS, identical across five runs of
             * `npm run cls`, against 0.0000 for the same page without it.
             *
             * A wrap point depends on glyph width, so no fallback calibration
             * can move it. Not wrapping is what makes the height independent of
             * which font has arrived. Nothing is lost when it truncates: the
             * plate's own title block, directly beneath, names the same garment.
             */}
            <p
              className="notation mb-8 truncate text-2xs text-orchid"
              title={`Fig. 02 — ${product.name}, ${product.kind.toLowerCase()}, front`}
            >
              Fig. 02 — {product.name}, {product.kind.toLowerCase()}, front
            </p>
            <GarmentFlat
              points={product.constructionPoints}
              title={`GUARD THEORY — ${product.name.toUpperCase()}, ${product.kind.toUpperCase()}`}
              reference="FIG. 02 / REV A"
            />
          </div>

          <div className="lg:col-span-5">
            <p className="notation text-2xs text-steel">
              {availability === "purchasable"
                ? "Available"
                : availability === "sold-out"
                  ? "Sold out"
                  : STATUS_LABEL["coming-soon"]}
            </p>
            <h1 className="display-condensed mt-6 text-3xl text-chalk">
              {product.name}
            </h1>
            <p className="display-plain mt-3 text-lg text-steel">
              {product.kind}
            </p>

            <p className="mt-8 max-w-[34rem] text-base text-steel">
              {product.description}
            </p>

            {availability === "purchasable" && priceCents !== null && product.commerce ? (
              <BuyBox
                productName={product.name}
                priceCents={priceCents}
                compareAtCents={
                  product.commerce.saleCents !== null ? product.commerce.priceCents : null
                }
                currency={product.commerce.currency}
                variants={product.commerce.variants}
              />
            ) : (
              <div className="mt-10 border border-steel-dim p-6">
                <p className="notation text-2xs text-orchid">First Edition</p>
                <p className="mt-4 text-base text-steel">
                  {availability === "sold-out"
                    ? "That run is finished. We do not quietly restock and call it a new release."
                    : "Join the list and you will hear the moment it is available. One message, no newsletter."}
                </p>
                <div className="mt-7">
                  <ButtonLink href="/first-edition">Join the First Edition list</ButtonLink>
                </div>
              </div>
            )}

            <section aria-labelledby="specs" className="mt-14">
              <h2 id="specs" className="display-condensed mb-6 text-xl text-chalk">
                Specification
              </h2>
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Specification for {product.name}, {product.kind}.
                </caption>
                <tbody>
                  {product.specifications.map((spec) => (
                    <tr key={spec.label} className="border-b border-steel-dim">
                      <th
                        scope="row"
                        className="display-plain py-4 pr-6 align-top text-sm font-normal text-steel"
                      >
                        {spec.label}
                      </th>
                      <td className="py-4 align-top text-sm text-chalk">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section aria-labelledby="sizes" className="mt-14">
              <h2 id="sizes" className="display-condensed mb-6 text-xl text-chalk">
                Sizes
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {product.sizeLabels.map((size) => (
                  <li
                    key={size}
                    className="notation border border-steel-dim px-4 py-2 text-2xs text-steel"
                  >
                    {size}
                  </li>
                ))}
              </ul>
              <p className="mt-6 max-w-[34rem] text-sm text-steel">
                Full measurements are in the{" "}
                <Link
                  href="/size-and-fit"
                  className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
                >
                  size and fit guide
                </Link>
                .
              </p>
            </section>

            {other.length > 0 ? (
              <section aria-labelledby="other" className="mt-14">
                <h2
                  id="other"
                  className="display-condensed mb-6 text-xl text-chalk"
                >
                  Also in the First Edition
                </h2>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {other.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/shop/${item.slug}`}
                        className="text-base text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
                      >
                        {item.name} — {item.kind}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
