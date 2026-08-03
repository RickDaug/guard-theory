import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ButtonLink } from "@/components/ui/Button";
import { GarmentFlat } from "@/components/product/GarmentFlat";
import { PRICE_NOTE, PRODUCTS, STATUS_LABEL, getProduct } from "@/content/products";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};

  return {
    title: `${product.name} — ${product.kind}`,
    description: product.summary,
    alternates: { canonical: `/shop/${product.slug}` },
  };
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
          <div className="lg:col-span-7 lg:sticky lg:top-8 lg:self-start">
            <p className="notation mb-8 text-2xs text-signal">
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
              <p className="text-base text-steel">{PRICE_NOTE}</p>
              <p className="mt-3 text-base text-steel">
                No release date has been announced.
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
                  Specification for {product.name}, {product.kind}. Values not
                  yet decided are shown as to be specified.
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
                        {spec.value ?? (
                          <span className="notation text-2xs text-steel">
                            To be specified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-6 max-w-[34rem] text-sm text-steel">
                Rows without a value are not yet decided. They will be filled in
                before anything is sold, and nothing will be described as
                premium in place of a number.
              </p>
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
                Labels only. Measurements are not published yet — see the{" "}
                <Link
                  href="/size-and-fit"
                  className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
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
                        className="text-base text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
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
