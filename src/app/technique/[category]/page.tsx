import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CATEGORIES, entriesInCategory, getCategory } from "@/content/technique";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.summary,
    alternates: { canonical: `/technique/${category.slug}` },
  };
}

export default async function TechniqueCategoryPage({ params }: Params) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const entries = entriesInCategory(category.slug);

  return (
    <main id="main" className="px-6 py-16 md:px-12">
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
              className="display-plain mt-8 inline-block text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
            >
              Back to the Technique Library
            </Link>
          </div>
        ) : (
          <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 lg:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.slug} className="bg-ink">
                <Link
                  href={`/technique/${category.slug}/${entry.slug}`}
                  className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <span className="notation text-2xs text-steel">
                    {entry.difficulty} · {entry.relevance}
                  </span>
                  <h2 className="display-condensed mt-5 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                    {entry.title}
                  </h2>
                  <p className="mt-4 text-sm text-steel">{entry.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
