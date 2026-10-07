import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FIT_NOTES, SIZE_CHART } from "@/content/products/size-chart";

/**
 * The chart renders only when src/content/products/size-chart.ts has rows, and
 * it can only have rows the owner supplied. Until then this page is the fit
 * guide and says nothing about a chart — the one published here from 2026-08-04
 * to 2026-09-29 was invented (docs/owner-decisions.md §3).
 */
const HAS_CHART = SIZE_CHART.length > 0;

export const metadata: Metadata = pageMetadata(
  HAS_CHART
    ? {
        title: "Rash guard size chart and fit guide",
        description: "Guard Theory size chart: to-fit chest in inches and centimetres, garment measurements in centimetres, and how a no-gi rash guard should actually fit.",
        path: "/size-and-fit",
      }
    : {
        title: "How a rash guard should fit",
        description: "How a no-gi rash guard should actually fit: the checks to run when you try one on, from where the hem sits in guard to a comfortable full exhale.",
        path: "/size-and-fit",
      },
);

const CHECKS = [
  "Tight enough that the hem does not travel when you sit in guard and stand up.",
  "Seams sitting where the body bends, not across the point of the shoulder.",
  "Sleeves ending where you want them to, not where they get dragged to.",
  "A full exhale that is comfortable standing still.",
];

export default function SizeAndFitPage() {
  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/size-and-fit", label: "Size and fit" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Size and fit
          </h1>
          <p className="mt-8 text-lg text-steel">
            {HAS_CHART
              ? "Garment measurements, not a recommendation to size up or down. Find the chest you actually are and the rest follows."
              : "What to check when you try a rash guard on. For the general question — how a rash guard should fit on anyone’s garment — there is a longer piece in the Journal."}
          </p>
        </header>

        {HAS_CHART ? (
        <section aria-labelledby="chart" className="mb-20">
          <h2 id="chart" className="display-condensed mb-8 text-2xl text-chalk">
            Size chart
          </h2>

          {/* The table is wider than a phone, so this box scrolls sideways — and
              a box that scrolls has to be reachable, or a keyboard user cannot
              get to the sleeve columns at all (SC 2.1.1). Focusable, named, and
              a region so the name is announced. */}
          <div
            role="region"
            aria-labelledby="chart"
            tabIndex={0}
            className="max-w-[70rem] overflow-x-auto"
          >
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Guard Theory size chart. To fit chest in inches and centimetres,
                and garment measurements in centimetres.
              </caption>
              <thead>
                <tr className="border-b border-steel">
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-orchid">
                    Size
                  </th>
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-steel">
                    To fit chest (in)
                  </th>
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-steel">
                    To fit chest (cm)
                  </th>
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-steel">
                    Body length (cm)
                  </th>
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-steel">
                    Sleeve, long (cm)
                  </th>
                  <th scope="col" className="notation py-4 text-2xs text-steel">
                    Sleeve, short (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => (
                  <tr key={row.size} className="border-b border-steel-dim">
                    <th
                      scope="row"
                      className="display-condensed py-4 pr-6 text-lg font-normal text-chalk"
                    >
                      {row.size}
                    </th>
                    <td className="py-4 pr-6 text-base text-steel">
                      {row.toFitChestIn}
                    </td>
                    <td className="py-4 pr-6 text-base text-steel">
                      {row.toFitChestCm}
                    </td>
                    <td className="py-4 pr-6 text-base text-steel">
                      {row.bodyLengthCm}
                    </td>
                    <td className="py-4 pr-6 text-base text-steel">
                      {row.longSleeveCm}
                    </td>
                    <td className="py-4 text-base text-steel">
                      {row.shortSleeveCm}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="m-0 mt-10 flex max-w-[42rem] list-none flex-col gap-3 p-0">
            {FIT_NOTES.map((note) => (
              <li key={note} className="flex gap-5">
                <span
                  className="notation mt-1.5 shrink-0 text-2xs text-orchid"
                  aria-hidden="true"
                >
                  —
                </span>
                <span className="text-base text-steel">{note}</span>
              </li>
            ))}
          </ul>
        </section>
        ) : null}

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <section aria-labelledby="quick" className="lg:col-span-7">
            <h2 id="quick" className="display-condensed text-2xl text-chalk">
              How it should fit
            </h2>
            <ul className="m-0 mt-6 flex max-w-[36rem] list-none flex-col gap-4 p-0">
              {CHECKS.map((check) => (
                <li key={check} className="flex gap-5">
                  <span
                    className="notation mt-1.5 shrink-0 text-2xs text-orchid"
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
              className="display-plain mt-8 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
            >
              Read the full piece on rash guard fit
            </Link>
          </section>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-steel-dim p-7">
              <h2 className="display-condensed text-xl text-chalk">
                {HAS_CHART ? "If we get it wrong" : "Size exchanges"}
              </h2>
              {HAS_CHART ? (
                <p className="mt-5 text-base text-steel">
                  If a garment does not match the measurements on this page, that
                  is a fault, and the return postage is ours.
                </p>
              ) : null}
              <p className="mt-5 text-base text-steel">
                To change a size, return the garment within thirty days of
                delivery. We ship the replacement, at our cost, when your
                return arrives with us.
              </p>
              <Link
                href="/policies/returns"
                className="display-plain mt-7 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                Returns policy
              </Link>
            </div>
          </aside>
        </div>

        {/* Most readers arrive here from a product page with a size in mind.
            Hand them back rather than leaving the browser's Back as the only
            way to the garment. */}
        <Link
          href="/shop"
          className="display-plain mt-16 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
        >
          Back to the shop
        </Link>
      </div>
    </main>
  );
}
