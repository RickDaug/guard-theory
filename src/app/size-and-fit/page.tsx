import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PRODUCTS } from "@/content/products";

export const metadata: Metadata = {
  title: "Size and fit",
  description:
    "How a BJJ rash guard should fit, what to check, and why Guard Theory has not published measurements yet.",
  alternates: { canonical: "/size-and-fit" },
};

/**
 * This page is deliberately narrow: it covers Guard Theory's own sizing.
 *
 * The general question — how a rash guard should fit, on anyone's garment — is
 * answered at length in the Journal. Two pages competing for one intent would
 * produce two thin pages, so this one summarises and points at the full
 * treatment rather than restating it.
 */
const CHECKS = [
  "Tight enough that the hem does not travel when you sit in guard and stand up.",
  "Seams sitting where the body bends, not across the point of the shoulder.",
  "Sleeves ending where you want them to, not where they get dragged to.",
  "A full exhale that is comfortable standing still.",
];

export default function SizeAndFitPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/size-and-fit", label: "Size and fit" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h1 className="display-condensed text-4xl text-chalk">
              Size and fit
            </h1>

            <p className="mt-10 max-w-[36rem] text-lg text-steel">
              This page covers Guard Theory&rsquo;s own sizing. For the general
              question — how a rash guard should fit on anyone&rsquo;s garment —
              there is a longer piece in the Journal.
            </p>

            <section aria-labelledby="quick" className="mt-14">
              <h2 id="quick" className="display-condensed text-2xl text-chalk">
                The short version
              </h2>
              <ul className="m-0 mt-6 flex max-w-[36rem] list-none flex-col gap-4 p-0">
                {CHECKS.map((check) => (
                  <li key={check} className="flex gap-5">
                    <span
                      className="notation mt-1.5 shrink-0 text-2xs text-signal"
                      aria-hidden="true"
                    >
                      —
                    </span>
                    <span className="text-base text-steel">{check}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/journal/how-a-bjj-rash-guard-should-fit"
                className="display-plain mt-8 inline-block text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                Read the full piece on rash guard fit
              </Link>
            </section>

            <section aria-labelledby="between" className="mt-16 max-w-[36rem]">
              <h2 id="between" className="display-condensed text-2xl text-chalk">
                Sizing between brands
              </h2>
              <p className="mt-5 text-base text-steel">
                There is no shared standard. A medium from one brand can be a
                different garment from a medium at another, which is why a size
                chart with real chest and length measurements is worth more than
                a letter. When ours exists it will be measurements, not a
                recommendation to size up or down.
              </p>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-steel-dim p-7">
              <h2 className="display-condensed text-xl text-chalk">
                No measurements yet
              </h2>
              <p className="mt-5 text-base text-steel">
                Guard Theory has not published a size chart, because no garment
                has been produced and measured. Inventing one would be worse than
                not having one — you would buy against it.
              </p>
              <p className="mt-5 text-base text-steel">
                When the First Edition is made, this page will carry chest,
                length and sleeve measurements per size, taken from production
                garments rather than from a pattern.
              </p>
              <p className="mt-5 text-base text-steel">
                If a return is caused by our chart being wrong, that will be our
                cost.
              </p>
            </div>

            <h2 className="notation mt-12 mb-5 text-2xs text-signal">
              Size labels planned
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
              {PRODUCTS[0]?.sizeLabels.map((size) => (
                <li
                  key={size}
                  className="notation border border-steel-dim px-4 py-2 text-2xs text-steel"
                >
                  {size}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-steel">
              See the{" "}
              <Link
                href="/shop"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                garments themselves
              </Link>
              .
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
