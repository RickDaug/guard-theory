import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  CATEGORIES,
  articlesInCategory,
  getJournalCategory,
  isPublished,
  readingTimeMinutes,
} from "@/content/journal";
import { pageMetadata } from "@/lib/metadata";
import {
  isJournalCategoryIndexable,
  journalCategoryCount,
} from "@/content/category-gate";
import { CrossLinks } from "@/components/content/CrossLinks";
import { SiblingCategories } from "@/components/content/SiblingCategories";
import { crossLinksForMany } from "@/content/crosslinks";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = getJournalCategory(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: category.summary,
    path: `/journal/category/${category.slug}`,
    // The three-entry gate. See src/content/category-gate.ts.
    indexable: isJournalCategoryIndexable(category.slug),
  });
}

export default async function JournalCategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = getJournalCategory(slug);
  if (!category) notFound();

  const articles = articlesInCategory(category.slug);

  // What the Library and the Figures index hold on the same subjects.
  const crossLinks = crossLinksForMany(
    "journal",
    articles.map((article) => article.slug),
  );

  const siblings = CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => ({
    slug: c.slug,
    name: c.name,
    href: `/journal/category/${c.slug}`,
    count: journalCategoryCount(c.slug),
  }));

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[
            { href: "/journal", label: "Journal" },
            { href: `/journal/category/${category.slug}`, label: category.name },
          ]}
        />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            {category.name}
          </h1>
          <p className="mt-8 text-lg text-steel">{category.summary}</p>
        </header>

        {articles.length === 0 ? (
          <div className="max-w-[42rem] border border-steel-dim p-10">
            <h2 className="display-condensed text-xl text-chalk">
              Nothing here yet
            </h2>
            <p className="mt-5 text-base text-steel">
              Nothing has been written for this category yet. We would rather
              leave it empty than fill it to look busy.
            </p>
            <Link
              href="/journal"
              className="display-plain mt-8 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
            >
              Back to the Journal
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
              articles.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {articles.map((article) => (
              <li key={article.slug} className="bg-ink">
                <Link
                  href={`/journal/${article.slug}`}
                  className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <span className="notation text-2xs text-signal">
                    {isPublished(article) ? "Published" : "Draft"}
                  </span>
                  <h2 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                    {article.title}
                  </h2>
                  <p className="mt-4 grow text-sm text-steel">
                    {article.standfirst}
                  </p>
                  <span className="notation mt-8 text-2xs text-steel">
                    {readingTimeMinutes(article)} min · {article.sources.length}{" "}
                    sources
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <CrossLinks
          links={crossLinks}
          heading="Reading connected to this category"
        />

        <SiblingCategories
          categories={siblings}
          heading="The rest of the Journal"
          unit="article"
        />
      </div>
    </main>
  );
}
