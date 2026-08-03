import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { ENTRIES, getCategory, getEntry } from "@/content/technique";
import { COACH_DISCLAIMER } from "@/content/technique/types";

type Params = { params: Promise<{ category: string; slug: string }> };

export function generateStaticParams() {
  return ENTRIES.map((entry) => ({
    category: entry.category,
    slug: entry.slug,
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.summary,
    alternates: { canonical: `/technique/${entry.category}/${entry.slug}` },
  };
}

/**
 * A numbered section of the entry. The numbers are real structure — an entry
 * is read in this order, and the order is the same in every entry — so they
 * are doing work rather than decorating.
 */
function Part({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate/25 pt-8 pb-12">
      <h2 className="display-condensed mb-6 flex items-baseline gap-4 text-lg text-ink">
        <span className="notation text-2xs text-signal-dim">
          {String(index).padStart(2, "0")}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OrderedNotes({ items }: { items: string[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-5 p-0">
      {items.map((item, index) => (
        <li key={item} className="flex gap-5">
          <span
            className="notation mt-1.5 shrink-0 text-2xs text-slate"
            aria-hidden="true"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-base text-ink">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export default async function TechniqueEntryPage({ params }: Params) {
  const { slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  const category = getCategory(entry.category);
  if (!category) notFound();

  const related = entry.relatedSlugs
    .map((s) => getEntry(s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[
            { href: "/technique", label: "Technique Library" },
            { href: `/technique/${category.slug}`, label: category.name },
            {
              href: `/technique/${category.slug}/${entry.slug}`,
              label: entry.title,
            },
          ]}
        />

        {/* The study register: a sheet of paper laid on the dark ground. */}
        <article className="mx-auto mt-10 max-w-[52rem] bg-bone px-7 py-14 sm:px-16 sm:py-20">
          <header className="pb-10">
            <p className="notation text-2xs text-signal-dim">
              {category.name} · {entry.difficulty} · {entry.relevance}
            </p>
            <h1 className="display-condensed mt-6 text-3xl text-ink">
              {entry.title}
            </h1>
            <p className="mt-7 text-lg text-slate">{entry.summary}</p>
          </header>

          <Part index={1} title="Position and problem">
            <p className="text-base text-ink">{entry.positionAndProblem}</p>
          </Part>

          <Part index={2} title="Objective">
            <p className="text-base text-ink">{entry.objective}</p>
          </Part>

          <Part index={3} title="Core concept">
            <p className="text-base text-ink">{entry.coreConcept}</p>
          </Part>

          <Part index={4} title="Key mechanics">
            <OrderedNotes items={entry.keyMechanics} />
          </Part>

          <Part index={5} title="Common errors">
            <ul className="m-0 flex list-none flex-col gap-5 p-0">
              {entry.commonErrors.map((error) => (
                <li key={error} className="flex gap-5">
                  <span
                    className="notation mt-1.5 shrink-0 text-2xs text-signal-dim"
                    aria-hidden="true"
                  >
                    ×
                  </span>
                  <span className="text-base text-ink">{error}</span>
                </li>
              ))}
            </ul>
          </Part>

          <Part index={6} title="Safety">
            <p className="border-l-2 border-signal-dim pl-6 text-base text-ink">
              {entry.safetyNote}
            </p>
          </Part>

          <Part index={7} title="Training progression">
            <OrderedNotes items={entry.trainingProgression} />
          </Part>

          {related.length > 0 ? (
            <Part index={8} title="Related">
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/technique/${item.category}/${item.slug}`}
                      className="text-base text-ink underline decoration-slate/40 underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Part>
          ) : null}

          <footer className="border-t border-slate/25 pt-8">
            <p className="text-sm text-slate">{COACH_DISCLAIMER}</p>
            <p className="notation mt-6 text-2xs text-slate">
              <Link
                href="/policies/editorial"
                className="underline underline-offset-[5px]"
              >
                Editorial policy
              </Link>
              {" · "}
              <Link
                href="/policies/corrections"
                className="underline underline-offset-[5px]"
              >
                Corrections
              </Link>
            </p>
          </footer>
        </article>
      </div>
    </main>
  );
}
