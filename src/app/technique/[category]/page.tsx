import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CATEGORIES, entriesInCategory, getCategory } from "@/content/technique";
import { pageMetadata } from "@/lib/metadata";
import {
  isTechniqueCategoryIndexable,
  techniqueCategoryCount,
} from "@/content/category-gate";
import { CrossLinks } from "@/components/content/CrossLinks";
import { SiblingCategories } from "@/components/content/SiblingCategories";
import { crossLinksForMany } from "@/content/crosslinks";
import { getRulesNote, type RulesNote } from "@/content/technique/rules-notes";

type Params = { params: Promise<{ category: string }> };

/** An unknown slug is a real 404 page — see journal/[slug]/page.tsx. */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: category.metaDescription,
    path: `/technique/${category.slug}`,
    // The three-entry gate. See src/content/category-gate.ts.
    indexable: isTechniqueCategoryIndexable(category.slug),
  });
}

/**
 * One area of the game, as a contents page on bone.
 *
 * The entries are listed in the order the registry gives them — alphabetical
 * by title — which is a filing order, not a reading order, so the rows carry
 * no numbers. (docs/visual-identity.md: numbers only where they refer.)
 */
export default async function TechniqueCategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const entries = entriesInCategory(category.slug);
  const rulesNote = getRulesNote(category.slug);

  // What the Journal and the Figures index say about the entries in this
  // area, gathered from the same declarations the entry pages use.
  const crossLinks = crossLinksForMany(
    "technique",
    entries.map((entry) => entry.slug),
  );

  const siblings = CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => ({
    slug: c.slug,
    name: c.name,
    href: `/technique/${c.slug}`,
    count: techniqueCategoryCount(c.slug),
  }));

  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 pt-10 pb-8 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs
            trail={[
              { href: "/technique", label: "Technique Library" },
              { href: `/technique/${category.slug}`, label: category.name },
            ]}
          />
        </div>
      </div>

      <div className="band-bone band-edge corner-ticks px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">
              {category.name}
            </h1>
            <p className="mt-8 text-lg text-ink">{category.summary}</p>
          </header>

          {rulesNote ? <RulesNoteBlock note={rulesNote} /> : null}

          {entries.length === 0 ? (
            <div className="mt-16 max-w-[42rem] border border-steel bg-bone-raised p-8 md:p-10">
              <h2 className="display-condensed text-xl text-ink">
                Nothing published here yet
              </h2>
              <p className="mt-5 text-base text-slate">
                Entries in this area are still being researched and reviewed. In
                the meantime, the rest of the library is open.
              </p>
              <Link
                href="/technique"
                className="link-rule display-plain mt-8 inline-flex min-h-6 items-center text-sm text-signal-dim"
              >
                Back to the Technique Library
              </Link>
            </div>
          ) : (
            <ul className="m-0 mt-16 max-w-[84rem] list-none border-t border-steel p-0 md:mt-20">
              {entries.map((entry) => (
                <li key={entry.slug} className="reveal border-b border-steel">
                  <Link
                    href={`/technique/${category.slug}/${entry.slug}`}
                    aria-labelledby={`entry-${entry.slug}-title`}
                    aria-describedby={`entry-${entry.slug}-summary`}
                    className="group grid gap-x-10 gap-y-2 py-7 no-underline md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)_auto] md:items-baseline md:py-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)_auto]"
                  >
                    <h2
                      id={`entry-${entry.slug}-title`}
                      className="display-condensed text-xl text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim"
                    >
                      <span className="link-rule group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
                        {entry.title}
                      </span>
                    </h2>
                    <p
                      id={`entry-${entry.slug}-summary`}
                      className="max-w-[38rem] text-base text-slate"
                    >
                      {entry.summary}
                    </p>
                    {/* Data, so mono. Kept on one line so the row's height
                        cannot depend on which font has arrived. */}
                    <span className="notation text-2xs whitespace-nowrap text-slate md:text-right">
                      {entry.difficulty} · {entry.relevance}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <CrossLinks
            links={crossLinks}
            ground="bone"
            surface
            heading="Reading connected to this area"
          />

          <SiblingCategories
            categories={siblings}
            heading="The rest of the library"
            unit="entry"
            ground="bone"
          />
        </div>
      </div>
    </main>
  );
}

/**
 * A ruleset note, where the category has one (src/content/technique/rules-notes.ts).
 *
 * Facts only, each tied to the rule document it was read from, with the date
 * it was read. Real text on the page, not a tooltip or a drawing, because the
 * reader it exists for is deciding what to drill for an event. Drawn as a
 * raised surface so it reads as a distinct document laid on the sheet, with
 * its sources as a references block beneath the statements.
 */
function RulesNoteBlock({ note }: { note: RulesNote }) {
  const number = new Map(note.sources.map((source, index) => [source.id, index + 1]));

  return (
    <section
      aria-labelledby="rules-note-heading"
      className="reveal mt-16 max-w-[46rem] border border-steel bg-bone-raised p-8 md:p-10"
    >
      <h2 id="rules-note-heading" className="display-condensed text-xl text-ink">
        {note.heading}
      </h2>
      <p className="mt-5 text-base text-slate">{note.intro}</p>
      <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
        {note.statements.map((statement) => (
          <li key={statement.text} className="text-base text-ink">
            {statement.text}{" "}
            <a
              href={`#rules-source-${number.get(statement.source)}`}
              className="notation inline-flex min-h-6 items-center text-2xs text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
            >
              Source {number.get(statement.source)}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base text-slate">{note.closing}</p>

      <h3 className="eyebrow mt-10 border-t border-steel pt-6 text-slate">
        Sources, read{" "}
        <time dateTime={note.asOf} className="notation normal-case tracking-normal">
          {note.asOf}
        </time>
      </h3>
      <ol role="list" className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
        {note.sources.map((source, index) => (
          <li key={source.id} id={`rules-source-${index + 1}`} className="flex gap-4">
            <span className="notation mt-1 shrink-0 text-2xs text-slate" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-ink">
              <a
                href={source.url}
                rel="noopener noreferrer"
                target="_blank"
                className="text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
              >
                {source.title}{" "}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <span className="block text-slate">{source.locator}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
