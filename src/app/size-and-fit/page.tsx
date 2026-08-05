import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FIT_NOTES, SIZE_CHART } from "@/content/products/size-chart";

export const metadata: Metadata = pageMetadata({
  title: "Size and fit",
  description: "Guard Theory size chart with garment measurements in inches and centimetres, and how a no-gi rash guard should actually fit.",
  path: "/size-and-fit",
});

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

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Size and fit
          </h1>
          <p className="mt-8 text-lg text-steel">
            Garment measurements, not a recommendation to size up or down. Find
            the chest you actually are and the rest follows.
          </p>
        </header>

        <section aria-labelledby="chart" className="mb-20">
          <h2 id="chart" className="display-condensed mb-8 text-2xl text-chalk">
            Size chart
          </h2>

          <div className="max-w-[70rem] overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <caption className="sr-only">
                Guard Theory size chart. To fit chest in inches and centimetres,
                and garment measurements in centimetres.
              </caption>
              <thead>
                <tr className="border-b border-steel">
                  <th scope="col" className="notation py-4 pr-6 text-2xs text-signal">
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
                  className="notation mt-1.5 shrink-0 text-2xs text-signal"
                  aria-hidden="true"
                >
                  —
                </span>
                <span className="text-base text-steel">{note}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <section aria-labelledby="quick" className="lg:col-span-7">
            <h2 id="quick" className="display-condensed text-2xl text-chalk">
              How it should fit
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
              className="display-plain mt-8 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
            >
              Read the full piece on rash guard fit
            </Link>
          </section>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-steel-dim p-7">
              <h2 className="display-condensed text-xl text-chalk">
                If we get it wrong
              </h2>
              <p className="mt-5 text-base text-steel">
                If a garment does not match the measurements on this page, that
                is a fault. Return postage is ours, both ways, and we will
                replace it or refund you — whichever you prefer.
              </p>
              <p className="mt-5 text-base text-steel">
                Size exchanges are free within thirty days, and we dispatch the
                replacement as soon as the carrier scans your return rather than
                waiting for it to reach us.
              </p>
              <Link
                href="/policies/returns"
                className="display-plain mt-7 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                Returns policy
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
