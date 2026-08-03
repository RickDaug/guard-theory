import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Influential figures",
  description:
    "An index of people whose work changed jiu-jitsu. Alphabetical, explicitly not a ranking, and researched before it is published.",
  alternates: { canonical: "/figures" },
};

/**
 * Explicitly not a ranking — and that is enforced in the markup, not only in
 * the copy. The list declares an alphabetical itemListOrder and carries no
 * rating or position properties, so nothing here can be read as a leaderboard.
 *
 * Names only, for now. A name asserts nothing; a biography asserts a great
 * deal, and every claim in one has to be sourced before it goes up. Entries
 * are being written against the standards in /policies/editorial.
 */
const IN_PREPARATION = [
  "André Galvão",
  "Ffion Davies",
  "Marcelo Garcia",
  "Marcus Almeida",
  "Mitsuyo Maeda",
  "Rickson Gracie",
  "Roger Gracie",
  "Rolls Gracie",
  "Royce Gracie",
  "Xande Ribeiro",
].sort((a, b) => a.localeCompare(b));

const CRITERIA = [
  "Their work changed what other people do, not only what they themselves could do.",
  "The change is traceable — in how a position is taught, in what a ruleset rewards, or in where the art spread.",
  "There is enough documented record to write about them without guessing.",
];

export default function FiguresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": absoluteUrl("/figures#index"),
    name: "Influential figures in jiu-jitsu",
    description:
      "An alphabetical index of figures whose work changed jiu-jitsu. Not a ranking.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: IN_PREPARATION.length,
    itemListElement: IN_PREPARATION.map((name) => ({
      "@type": "ListItem",
      name,
    })),
  };

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/figures", label: "Influential figures" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h1 className="display-condensed text-4xl text-chalk">
              Influential figures
            </h1>

            <p className="mt-10 max-w-[36rem] text-lg text-steel">
              An index of people whose work changed jiu-jitsu, in alphabetical
              order.
            </p>

            <p className="mt-6 max-w-[36rem] border-l-2 border-signal py-1 pl-6 text-base text-steel">
              <span className="text-chalk">This is not a ranking.</span> It is
              not a list of the best grapplers, it is not ordered by anything
              except the alphabet, and nobody&rsquo;s absence from it is a
              verdict. &ldquo;Greatest ever&rdquo; arguments require criteria
              nobody agrees on, so we are not having one.
            </p>

            <section aria-labelledby="criteria" className="mt-14">
              <h2
                id="criteria"
                className="display-condensed text-2xl text-chalk"
              >
                How someone gets on this list
              </h2>
              <ul className="m-0 mt-6 flex max-w-[36rem] list-none flex-col gap-4 p-0">
                {CRITERIA.map((item) => (
                  <li key={item} className="flex gap-5">
                    <span
                      className="notation mt-1.5 shrink-0 text-2xs text-signal"
                      aria-hidden="true"
                    >
                      —
                    </span>
                    <span className="text-base text-steel">{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="index" className="mt-14">
              <h2 id="index" className="display-condensed text-2xl text-chalk">
                In preparation
              </h2>
              <p className="mt-5 max-w-[36rem] text-base text-steel">
                These entries are being researched and are not published yet. A
                name here commits us to writing about that person carefully — it
                does not stand in for having done it.
              </p>

              <ul className="m-0 mt-8 grid max-w-[46rem] list-none grid-cols-1 gap-px bg-steel-dim p-0 sm:grid-cols-2">
                {IN_PREPARATION.map((name) => (
                  <li key={name} className="bg-ink px-6 py-5">
                    <span className="display-plain text-base text-chalk">
                      {name}
                    </span>
                    <span className="notation mt-1 block text-2xs text-steel">
                      Entry in preparation
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-steel-dim p-7">
              <h2 className="display-condensed text-xl text-chalk">
                Why nothing is published yet
              </h2>
              <p className="mt-5 text-base text-steel">
                Biographies are the easiest writing on a jiu-jitsu site to get
                wrong. Gym legends get repeated as fact, records get inflated,
                and private motivations get invented for people who never stated
                them.
              </p>
              <p className="mt-5 text-base text-steel">
                Each entry needs multiple independent sources before it goes up,
                and where the record is genuinely contested the entry will say
                so instead of choosing the tidier version.
              </p>
              <Link
                href="/policies/editorial"
                className="display-plain mt-7 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                Editorial policy
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
