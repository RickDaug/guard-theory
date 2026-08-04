import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CATEGORIES, entriesInCategory } from "@/content/technique";
import { COACH_DISCLAIMER } from "@/content/technique/types";

export const metadata: Metadata = {
  title: "Technique Library",
  description:
    "A concepts library for no-gi grappling, organised by the twelve areas of the game. Mechanics, common errors and safety notes for each.",
};

export default function TechniqueIndexPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/technique", label: "Technique Library" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Technique Library
          </h1>
          <p className="mt-8 text-lg text-steel">
            Twelve areas of the game, written as concepts rather than move lists.
            Each entry states the problem it addresses, the mechanics that do the
            work, the errors that undo them, and the specific risk it carries.
          </p>
          <p className="mt-6 text-base text-steel">{COACH_DISCLAIMER}</p>
        </header>

        <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((category) => {
            const entries = entriesInCategory(category.slug);
            return (
              <li key={category.slug} className="bg-ink">
                <Link
                  href={`/technique/${category.slug}`}
                  className="group flex h-full flex-col p-8 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
                >
                  <h2 className="display-condensed text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                    {category.name}
                  </h2>
                  <p className="mt-4 text-sm text-steel">{category.summary}</p>
                  <span className="notation mt-8 text-2xs text-steel">
                    {entries.length === 1
                      ? "1 entry"
                      : `${entries.length} entries`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
