import type { Metadata } from "next";
import { SectionCrossNav } from "@/components/content/SectionCrossNav";
import { SECTION_DESCRIPTIONS } from "@/content/section-descriptions";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ArticleCard, sortNewestFirst } from "@/components/journal/ArticleCard";
import { ARTICLES, CATEGORIES, articlesInCategory } from "@/content/journal";

export const metadata: Metadata = pageMetadata({
  title: "Journal — Researched writing on jiu-jitsu",
  description: SECTION_DESCRIPTIONS.journal,
  path: "/journal",
});

/**
 * The Journal's contents page: a bone sheet laid on the ink desk.
 *
 * The breadcrumb stays on a thin ink strip under the header (its component
 * is set for ink), the articles run as plates on paper, and the way out —
 * the other two sections — is a graphite band before the footer, so the page
 * scrolls as desk, sheet, desk.
 */
export default function JournalIndexPage() {
  const articles = sortNewestFirst(ARTICLES);

  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 pt-8 pb-6 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/journal", label: "Journal" }]} />
        </div>
      </div>

      <div className="band-bone band-edge px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">Journal</h1>
            {/* The one signal block in this view: the rule under the title. */}
            <div aria-hidden="true" className="mt-6 h-1 w-12 bg-signal" />
            <p className="mt-8 text-lg text-slate">
              Researched writing on jiu-jitsu. Every factual claim traces to a
              listed source, and where the historical record is contested the
              piece says so rather than picking the tidier version.
            </p>
          </header>

          {/* The categories as filter chips: eyebrow labels, 24px targets. */}
          <nav aria-label="Categories" className="mt-12">
            <ul className="m-0 flex list-none flex-wrap gap-2.5 p-0">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    prefetch={false}
                    href={`/journal/category/${category.slug}`}
                    className="eyebrow inline-flex min-h-6 items-center border border-steel bg-bone-raised px-3.5 py-2 text-ink no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:border-slate hover:text-signal-dim"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="all" className="mt-20">
            <h2 id="all" className="eyebrow mb-8 border-b border-steel pb-4 text-slate">
              All articles
            </h2>

            <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  headingLevel="h3"
                  featured={index === 0}
                />
              ))}
            </ul>
          </section>

          <section aria-labelledby="categories" className="mt-24">
            <h2
              id="categories"
              className="eyebrow mb-8 border-b border-steel pb-4 text-slate"
            >
              Categories
            </h2>

            <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map((category) => {
                const count = articlesInCategory(category.slug).length;
                return (
                  <li key={category.slug} className="reveal flex">
                    <Link
                      prefetch={false}
                      href={`/journal/category/${category.slug}`}
                      aria-labelledby={`category-${category.slug}-title`}
                      aria-describedby={`category-${category.slug}-summary`}
                      className="card-lift group flex w-full flex-col border border-steel bg-bone-raised p-6 no-underline hover:border-slate focus-visible:border-slate sm:p-7"
                    >
                      <h3
                        id={`category-${category.slug}-title`}
                        className="display-serif text-lg text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim"
                      >
                        {category.name}
                      </h3>
                      <p id={`category-${category.slug}-summary`} className="mt-3 grow text-sm text-slate">
                        {category.summary}
                      </p>
                      <span className="notation mt-6 text-2xs text-slate">
                        {count === 0
                          ? "Nothing yet"
                          : count === 1
                            ? "1 article"
                            : `${count} articles`}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

      <div className="band-graphite px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <SectionCrossNav current="journal" />
        </div>
      </div>
    </main>
  );
}
