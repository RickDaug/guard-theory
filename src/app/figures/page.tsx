import { serializeJsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";
import { SectionCrossNav } from "@/components/content/SectionCrossNav";
import { SECTION_DESCRIPTIONS } from "@/content/section-descriptions";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Plate } from "@/components/notation/Plate";
import { FIGURES_ALPHABETICAL } from "@/content/figures";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Influential figures",
  description: SECTION_DESCRIPTIONS.figure,
  path: "/figures",
});

/** 4:5 in plate units, title block included: 660 × 825. */
const PLATE_W = 660;
const PLATE_FIELD_H = 787;

/**
 * Not a ranking, and that is enforced in the markup rather than only asserted:
 * alphabetical itemListOrder, no rating or position properties anywhere — and
 * on the page, a contents list with no numbering.
 */
export default function FiguresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": absoluteUrl("/figures#index"),
    name: "Influential figures in jiu-jitsu",
    description:
      "An alphabetical index of figures whose work changed jiu-jitsu. Not a ranking.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: FIGURES_ALPHABETICAL.length,
    itemListElement: FIGURES_ALPHABETICAL.map((figure) => ({
      "@type": "ListItem",
      name: figure.name,
      url: absoluteUrl(`/figures/${figure.slug}`),
    })),
  };

  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 pt-8 pb-6 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/figures", label: "Influential figures" }]} />
        </div>
      </div>

      <div className="band-bone band-edge px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">
              Influential figures
            </h1>
            <p className="mt-8 text-lg text-slate">
              People whose work changed what the rest of us do on the mat, in
              alphabetical order. Every claim is sourced, and where the record is
              contested — which in jiu-jitsu is often — the entry says so.
            </p>
            {/* The one signal block in this view: the rule beside the
                statement the page is built around. */}
            <p className="mt-6 border-l-[3px] border-signal py-1 pl-6 text-base text-slate">
              <span className="text-ink">This is not a ranking.</span>{" "}
              It is not ordered by anything except the alphabet, and nobody&rsquo;s absence
              from it is a verdict.
            </p>
          </header>

          {/* The contents list. One row per person: the portrait where a
              licence was verified, otherwise a plate-chrome frame whose title
              block states the name and the dates, which is all the index
              knows; then the name in the study face and the one line on what
              they changed. No numbers — see the paragraph above. */}
          <ul className="m-0 mt-16 list-none border-t border-steel p-0">
            {FIGURES_ALPHABETICAL.map((figure) => (
              <li key={figure.slug} className="reveal border-b border-steel">
                <Link
                  prefetch={false}
                  href={`/figures/${figure.slug}`}
                  aria-labelledby={`figure-${figure.slug}-title`}
                  aria-describedby={`figure-${figure.slug}-summary`}
                  className="group grid grid-cols-[5.5rem_1fr] gap-x-5 py-6 no-underline sm:grid-cols-[7rem_1fr] sm:gap-x-8 md:grid-cols-[7rem_1fr_auto] md:py-8"
                >
                  <div className="relative aspect-4/5 w-full overflow-hidden border border-steel bg-bone-raised">
                    {figure.image ? (
                      <Image
                        src={figure.image.src}
                        alt={figure.image.alt}
                        fill
                        sizes="112px"
                        className="object-cover object-top grayscale transition-[filter] duration-[420ms] ease-[var(--ease-control)] group-hover:grayscale-0"
                      />
                    ) : (
                      <div className="plate-on-paper plate-grid">
                        <Plate
                          width={PLATE_W}
                          fieldHeight={PLATE_FIELD_H}
                          title={figure.name.toUpperCase()}
                          reference={figure.lifespan ?? ""}
                        >
                          {null}
                        </Plate>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    {figure.lifespan ? (
                      <p className="notation text-2xs text-slate">{figure.lifespan}</p>
                    ) : null}
                    <h2
                      id={`figure-${figure.slug}-title`}
                      className="display-serif mt-2 text-2xl text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim"
                    >
                      {figure.name}
                    </h2>
                    <p
                      id={`figure-${figure.slug}-summary`}
                      className="mt-3 max-w-[40rem] text-base text-slate"
                    >
                      {figure.standfirst}
                    </p>
                  </div>

                  <p className="notation col-start-2 mt-3 text-2xs text-slate md:col-start-3 md:mt-1 md:text-right">
                    {figure.sources.length} sources
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="band-graphite px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <SectionCrossNav current="figure" />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </main>
  );
}
