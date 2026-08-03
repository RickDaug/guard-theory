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

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Researched writing on jiu-jitsu: its history, its systems, its equipment and what competition rules do to technique.",
  alternates: { canonical: "/journal" },
};

export default function JournalIndexPage() {
  const drafts = ARTICLES.filter((article) => !isPublished(article));

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/journal", label: "Journal" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Journal</h1>
          <p className="mt-8 text-lg text-steel">
            Researched writing on jiu-jitsu. Every factual claim traces to a
            source, contested history is named as contested, and nothing is
            published under a byline that does not exist.
          </p>
        </header>

        {drafts.length > 0 ? (
          <section aria-labelledby="drafts" className="mb-24">
            <h2 id="drafts" className="display-condensed mb-4 text-2xl text-chalk">
              Finished, awaiting a byline
            </h2>
            <p className="mb-10 max-w-[46rem] text-base text-steel">
              These are written and fact-checked. They are held in draft because
              an article needs a real named author with real credentials, and we
              are not inventing one. Read them now — they carry no publication
              date because they have not been published.
            </p>

            <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 lg:grid-cols-3">
              {drafts.map((article) => (
                <li key={article.slug} className="bg-ink">
                  <Link
                    href={`/journal/${article.slug}`}
                    className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                  >
                    <span className="notation text-2xs text-signal">Draft</span>
                    <h3 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                      {article.title}
                    </h3>
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
          </section>
        ) : null}

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
