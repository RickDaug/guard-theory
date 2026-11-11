import Link from "next/link";
import type { Collection } from "@/content/crosslinks";
import { SECTION_DESCRIPTIONS } from "@/content/section-descriptions";

/**
 * The route between the three editorial sections at index level.
 *
 * The Journal, the Technique Library and the Figures index were built as three
 * separate collections and each index linked only into itself — a reader who
 * reached the bottom of any of them had no way across without the site header.
 *
 * The descriptions here are the sections' own meta descriptions — the same
 * strings, imported, not copies of them. Two descriptions of the same thing
 * drift, and the shorter one always ends up flattering.
 */

const SECTIONS: Record<
  Collection,
  { href: string; name: string; description: string }
> = {
  journal: {
    href: "/journal",
    name: "Journal",
    description: SECTION_DESCRIPTIONS.journal,
  },
  technique: {
    href: "/technique",
    name: "Technique Library",
    description: SECTION_DESCRIPTIONS.technique,
  },
  figure: {
    href: "/figures",
    name: "Influential figures",
    description: SECTION_DESCRIPTIONS.figure,
  },
};

const ORDER: Collection[] = ["journal", "technique", "figure"];

/**
 * Ground the block is drawn on. On ink it is the hairline grid it has always
 * been; on bone (the facelift's contents pages) each section is a raised
 * surface — bone-raised fill, steel hairline, square corners — that lifts on
 * hover and ends in the link.
 */
type Ground = "ink" | "bone";

const GROUND = {
  ink: {
    heading: "text-chalk",
    list: "gap-px border border-steel-dim bg-steel-dim",
    item: "bg-ink",
    link: "p-7 hover:bg-ink-raised",
    title: "text-chalk group-hover:text-signal-lift",
    summary: "text-steel",
  },
  bone: {
    heading: "text-ink",
    list: "gap-6",
    item: "card-lift reveal border border-steel bg-bone-raised hover:border-slate focus-within:border-slate",
    link: "p-7 md:p-8",
    title: "text-ink group-hover:text-signal-dim",
    summary: "text-slate",
  },
} as const satisfies Record<Ground, Record<string, string>>;

export function SectionCrossNav({
  current,
  ground = "ink",
}: {
  current: Collection;
  ground?: Ground;
}) {
  const others = ORDER.filter((key) => key !== current);
  const tone = GROUND[ground];

  return (
    <section aria-labelledby="sections" className="mt-24">
      <h2
        id="sections"
        className={`display-condensed mb-8 text-2xl ${tone.heading}`}
      >
        The rest of the writing
      </h2>
      <ul className={`m-0 grid list-none p-0 md:grid-cols-2 ${tone.list}`}>
        {others.map((key) => {
          const section = SECTIONS[key];
          return (
            <li key={key} className={tone.item}>
              <Link
                href={section.href}
                aria-labelledby={`section-${key}-title`}
                aria-describedby={`section-${key}-summary`}
                className={`group flex h-full flex-col no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] ${tone.link}`}
              >
                <h3
                  id={`section-${key}-title`}
                  className={`display-condensed text-lg transition-colors duration-[140ms] ease-[var(--ease-control)] ${tone.title}`}
                >
                  {section.name}
                </h3>
                <p
                  id={`section-${key}-summary`}
                  className={`mt-3 grow text-sm ${tone.summary}`}
                >
                  {section.description}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
