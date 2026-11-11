import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArticleCard, sortNewestFirst } from "@/components/journal/ArticleCard";
import {
  CATEGORIES,
  articlesInCategory,
  getJournalCategory,
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

/** An unknown slug is a real 404 page — see journal/[slug]/page.tsx. */
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const category = getJournalCategory(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: category.metaDescription,
    path: `/journal/category/${category.slug}`,
    // The three-entry gate. See src/content/category-gate.ts.
    indexable: isJournalCategoryIndexable(category.slug),
  });
}

export default async function JournalCategoryPage({ params }: Params) {
  const { slug } = await params;
  const category = getJournalCategory(slug);
  if (!category) notFound();

  const articles = sortNewestFirst(articlesInCategory(category.slug));

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
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 pt-8 pb-6 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs
            trail={[
              { href: "/journal", label: "Journal" },
              { href: `/journal/category/${category.slug}`, label: category.name },
            ]}
          />
        </div>
      </div>

      <div className="band-bone band-edge px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <p className="eyebrow text-slate">Journal</p>
            <h1 className="display-serif mt-5 text-4xl text-ink">
              {category.name}
            </h1>
            <div aria-hidden="true" className="mt-6 h-1 w-12 bg-signal" />
            <p className="mt-8 text-lg text-slate">{category.summary}</p>
          </header>

          {articles.length === 0 ? (
            <div className="mt-16 max-w-[42rem] border border-steel bg-bone-raised p-8 sm:p-10">
              <h2 className="display-serif text-xl text-ink">
                Nothing here yet
              </h2>
              <p className="mt-5 text-base text-slate">
                Nothing has been written for this category yet. We would rather
                leave it empty than fill it to look busy.
              </p>
              <Link
                href="/journal"
                className="link-rule mt-8 inline-flex min-h-6 items-center text-sm text-signal-dim"
              >
                Back to the Journal
              </Link>
            </div>
          ) : (
            <ul
              className={`m-0 mt-16 grid list-none gap-6 p-0 ${
                // Two columns only when there is something to put in both;
                // a lone card in a two-column grid reads as one that failed
                // to load.
                articles.length > 1 ? "md:grid-cols-2" : "max-w-[40rem]"
              }`}
            >
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} headingLevel="h2" rowFrom="md" />
              ))}
            </ul>
          )}

          {crossLinks.length > 0 ? (
            <div className="mt-16 max-w-[60rem] border border-steel bg-bone-raised px-7 pb-10 sm:px-10 [&>section]:mt-0 [&>section]:border-t-0 [&>section]:pt-10">
              <CrossLinks
                links={crossLinks}
                ground="bone"
                heading="Reading connected to this category"
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="band-graphite px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <SiblingCategories
            categories={siblings}
            heading="The rest of the Journal"
            unit="article"
          />
        </div>
      </div>
    </main>
  );
}
