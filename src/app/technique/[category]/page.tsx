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
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[
            { href: "/technique", label: "Technique Library" },
            { href: `/technique/${category.slug}`, label: category.name },
          ]}
        />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            {category.name}
          </h1>
          <p className="mt-8 text-lg text-steel">{category.summary}</p>
        </header>

        {rulesNote ? <RulesNoteBlock note={rulesNote} /> : null}

        {entries.length === 0 ? (
          <div className="max-w-[42rem] border border-steel-dim p-10">
            <h2 className="display-condensed text-xl text-chalk">
              Nothing published here yet
            </h2>
            <p className="mt-5 text-base text-steel">
              Entries in this area are still being researched and reviewed. In
              the meantime, the rest of the library is open.
            </p>
            <Link
              href="/technique"
              className="display-plain mt-8 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
            >
              Back to the Technique Library
            </Link>
          </div>
        ) : (
          <ul
            className={`m-0 grid list-none gap-px bg-steel-dim p-0 ${
              // Two columns only when there is something to put in both.
              // The gap-px-over-a-tinted-background trick draws its rules by
              // letting the parent show through, so a lone entry in a
              // two-column grid leaves a filled empty cell that reads as a
              // card that failed to load.
              entries.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {entries.map((entry) => (
              <li key={entry.slug} className="bg-ink">
                <Link
                  href={`/technique/${category.slug}/${entry.slug}`}
                  aria-labelledby={`entry-${entry.slug}-title`}
                  aria-describedby={`entry-${entry.slug}-summary`}
                  className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <span className="notation text-2xs text-steel">
                    {entry.difficulty} · {entry.relevance}
                  </span>
                  <h2 id={`entry-${entry.slug}-title`} className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                    {entry.title}
                  </h2>
                  <p id={`entry-${entry.slug}-summary`} className="mt-4 text-sm text-steel">{entry.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <CrossLinks
          links={crossLinks}
          heading="Reading connected to this area"
        />

        <SiblingCategories
          categories={siblings}
          heading="The rest of the library"
          unit="entry"
        />
      </div>
    </main>
  );
}

/**
 * A ruleset note, where the category has one (src/content/technique/rules-notes.ts).
 *
 * Facts only, each tied to the rule document it was read from, with the date
 * it was read. Real text on the page, not a tooltip or a drawing, because the
 * reader it exists for is deciding what to drill for an event.
 */
function RulesNoteBlock({ note }: { note: RulesNote }) {
  const number = new Map(note.sources.map((source, index) => [source.id, index + 1]));

  return (
    <section
      aria-labelledby="rules-note-heading"
      className="mb-16 max-w-[46rem] border border-steel-dim p-8 md:p-10"
    >
      <h2 id="rules-note-heading" className="display-condensed text-xl text-chalk">
        {note.heading}
      </h2>
      <p className="mt-5 text-base text-steel">{note.intro}</p>
      <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
        {note.statements.map((statement) => (
          <li key={statement.text} className="text-base text-chalk">
            {statement.text}{" "}
            <a
              href={`#rules-source-${number.get(statement.source)}`}
              className="notation inline-flex min-h-6 items-center text-2xs text-steel underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
            >
              Source {number.get(statement.source)}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-base text-steel">{note.closing}</p>

      <h3 className="notation mt-8 text-2xs text-steel">
        Sources, read <time dateTime={note.asOf}>{note.asOf}</time>
      </h3>
      <ol role="list" className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
        {note.sources.map((source, index) => (
          <li key={source.id} id={`rules-source-${index + 1}`} className="flex gap-4">
            <span className="notation mt-1 shrink-0 text-2xs text-steel" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm text-chalk">
              <a
                href={source.url}
                rel="noopener noreferrer"
                target="_blank"
                className="underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                {source.title}{" "}
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <span className="block text-steel">{source.locator}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
