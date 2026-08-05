import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import {
  ARTICLES,
  CATEGORIES,
  articlesInCategory,
  isPublished,
  readingTimeMinutes,
} from "@/content/journal";
import { getAuthor } from "@/content/authors";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Researched writing on jiu-jitsu: its history, its systems, its equipment and what competition rules do to technique.",
  alternates: { canonical: "/journal" },
};

function getJournalCategoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

export default function JournalIndexPage() {
  const articles = [...ARTICLES].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/journal", label: "Journal" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Journal</h1>
          <p className="mt-8 text-lg text-steel">
            Researched writing on jiu-jitsu. Every factual claim traces to a
            listed source, and where the historical record is contested the
            piece says so rather than picking the tidier version.
          </p>
        </header>

        <section aria-labelledby="all" className="mb-24">
          <h2 id="all" className="display-condensed mb-10 text-2xl text-chalk">
            All articles
          </h2>

          <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 lg:grid-cols-3">
            {articles.map((article) => {
              const author = isPublished(article)
                ? getAuthor(article.authorId)
                : undefined;
              return (
                <li key={article.slug} className="bg-ink">
                  <Link
                    href={`/journal/${article.slug}`}
                    className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                  >
                    <span className="notation text-2xs text-signal">
                      {getJournalCategoryName(article.category)}
                    </span>
                    <h3 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                      {article.title}
                    </h3>
                    <p className="mt-4 grow text-sm text-steel">
                      {article.standfirst}
                    </p>
                    <span className="notation mt-8 text-2xs text-steel">
                      {author ? `${author.name} · ` : ""}
                      {readingTimeMinutes(article)} min ·{" "}
                      {article.sources.length} sources
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="categories">
          <h2
            id="categories"
            className="display-condensed mb-10 text-2xl text-chalk"
          >
            Categories
          </h2>

          <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const count = articlesInCategory(category.slug).length;
              return (
                <li key={category.slug} className="bg-ink">
                  <Link
                    href={`/journal/category/${category.slug}`}
                    className="group flex h-full flex-col p-7 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                  >
                    <h3 className="display-condensed text-lg text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                      {category.name}
                    </h3>
                    <p className="mt-3 grow text-sm text-steel">
                      {category.summary}
                    </p>
                    <span className="notation mt-6 text-2xs text-steel">
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
    </main>
  );
}
