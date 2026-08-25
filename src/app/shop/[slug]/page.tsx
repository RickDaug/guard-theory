import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRODUCTS, STATUS_LABEL, getProduct } from "@/content/products";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return pageMetadata({
    title: `${product.name} — ${product.kind}`,
    description: product.metaDescription ?? product.summary,
    path: `/shop/${product.slug}`,
  });
}

/**
 * No Product or Offer structured data is emitted anywhere on this page.
 *
 * There is no price, no availability and no review data, and a waitlist is not
 * a PreOrder. Emitting Product schema without truthful values would be both a
 * lie to readers and a policy violation. The conditions under which it may be
 * added are listed in docs/structured-data-map.md.
 */
export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const other = PRODUCTS.filter((p) => p.slug !== product.slug);

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
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
              {STATUS_LABEL[product.status]}
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

            <div className="mt-10 border border-steel-dim p-6">
              <p className="notation text-2xs text-orchid">
                First Edition
              </p>
              <p className="mt-4 text-base text-steel">
                Join the list and you will hear the moment it is available. One
                message, no newsletter.
              </p>
              <div className="mt-7">
                <ButtonLink href="/first-edition">
                  Join the First Edition list
                </ButtonLink>
              </div>
            </div>

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
                Full measurements in inches and centimetres are in the{" "}
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
