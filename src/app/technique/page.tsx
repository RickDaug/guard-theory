import type { Metadata } from "next";
import { SectionCrossNav } from "@/components/content/SectionCrossNav";
import {
  SECTION_DESCRIPTIONS,
  TECHNIQUE_AREA_COUNT,
  capitalise,
  numberWord,
} from "@/content/section-descriptions";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CATEGORIES, entriesInCategory } from "@/content/technique";
import { COACH_DISCLAIMER } from "@/content/technique/types";

export const metadata: Metadata = pageMetadata({
  title: "Technique Library",
  description: SECTION_DESCRIPTIONS.technique,
  path: "/technique",
});

/**
 * The contents page of the monograph.
 *
 * Two bands. A short ink strip carries the breadcrumb — the desk the sheet is
 * laid on — and the bone sheet beneath it carries the title in Newsreader at
 * display size, the two introductory paragraphs, and the areas of the game as
 * a table of contents: one row per area, name, summary and the count of
 * published entries as mono data. The count is derived from the registry
 * exactly as before; nothing here is typed by hand.
 */
export default function TechniqueIndexPage() {
  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink plate-grid px-6 pt-10 pb-8 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/technique", label: "Technique Library" }]} />
        </div>
      </div>

      <div className="band-bone band-edge corner-ticks px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">
              Technique Library
            </h1>
            <p className="mt-8 text-lg text-ink">
              {capitalise(numberWord(TECHNIQUE_AREA_COUNT))} areas of the game,
              written as concepts rather than move lists. Each entry states the problem it addresses, the mechanics that do the
              work, the errors that undo them, and the specific risk it carries.
            </p>
            <p className="mt-6 text-base text-slate">{COACH_DISCLAIMER}</p>
          </header>

          <ul className="m-0 mt-16 max-w-[84rem] list-none border-t border-steel p-0 md:mt-20">
            {CATEGORIES.map((category) => {
              const entries = entriesInCategory(category.slug);
              return (
                <li key={category.slug} className="reveal border-b border-steel">
                  <Link
                    prefetch={false}
                    href={`/technique/${category.slug}`}
                    aria-labelledby={`category-${category.slug}-title`}
                    aria-describedby={`category-${category.slug}-summary`}
                    className="group grid gap-x-10 gap-y-2 py-7 no-underline md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_7rem] md:items-baseline md:py-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)_8rem]"
                  >
                    <h2
                      id={`category-${category.slug}-title`}
                      className="display-condensed text-xl text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim"
                    >
                      <span className="link-rule group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
                        {category.name}
                      </span>
                    </h2>
                    <p
                      id={`category-${category.slug}-summary`}
                      className="max-w-[38rem] text-base text-slate"
                    >
                      {category.summary}
                    </p>
                    <span className="notation text-2xs text-slate tabular-nums md:text-right">
                      {entries.length === 1
                        ? "1 entry"
                        : `${entries.length} entries`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <SectionCrossNav current="technique" ground="bone" />
        </div>
      </div>
    </main>
  );
}
