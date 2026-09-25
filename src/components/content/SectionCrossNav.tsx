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

export function SectionCrossNav({ current }: { current: Collection }) {
  const others = ORDER.filter((key) => key !== current);

  return (
    <section aria-labelledby="sections" className="mt-24">
      <h2
        id="sections"
        className="display-condensed mb-8 text-2xl text-chalk"
      >
        The rest of the writing
      </h2>
      <ul className="m-0 grid list-none gap-px border border-steel-dim bg-steel-dim p-0 md:grid-cols-2">
        {others.map((key) => {
          const section = SECTIONS[key];
          return (
            <li key={key} className="bg-ink">
              <Link
                href={section.href}
                aria-labelledby={`section-${key}-title`}
                aria-describedby={`section-${key}-summary`}
                className="group flex h-full flex-col p-7 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
              >
                <h3 id={`section-${key}-title`} className="display-condensed text-lg text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                  {section.name}
                </h3>
                <p id={`section-${key}-summary`} className="mt-3 grow text-sm text-steel">
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
