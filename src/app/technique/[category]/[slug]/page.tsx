import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CrossLinks } from "@/components/content/CrossLinks";
import { crossLinksFor } from "@/content/crosslinks";
import {
  ENTRIES,
  getCategory,
  getEntry,
  isPublishedEntry,
  relatedEntries,
} from "@/content/technique";
import { COACH_DISCLAIMER } from "@/content/technique/types";
import { SHARE_IMAGE_OBJECT, pageMetadata } from "@/lib/metadata";
import { serializeJsonLd } from "@/lib/json-ld";
import { absoluteUrl } from "@/lib/site";

type Params = { params: Promise<{ category: string; slug: string }> };

/** An unknown slug is a real 404 page — see journal/[slug]/page.tsx. */
export const dynamicParams = false;

/**
 * Every entry, drafts included. A draft has to render somewhere for the person
 * who is going to read it before signing it off; this is the only place it
 * does. Nothing links to it and nothing lists it — see isPublishedEntry.
 */
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

  const published = isPublishedEntry(entry);

  return {
    ...pageMetadata({
      title: entry.title,
      description: entry.metaDescription ?? entry.summary,
      path: `/technique/${entry.category}/${entry.slug}`,
      type: "article",
      indexable: published,
    }),
    // A draft is `nofollow` as well as `noindex`, which is one step past what
    // a Journal draft carries. A Journal draft is finished writing waiting on
    // a byline; a technique draft is waiting on somebody to read it, and
    // until they have, its links out are not an endorsement of anything.
    ...(published ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * The fixed reading order of an entry, stated once so the sections on the
 * page and the "In this entry" index beside them cannot disagree. The two
 * optional sections are appended per entry below.
 */
const PARTS = {
  positionAndProblem: { id: "position-and-problem", title: "Position and problem" },
  objective: { id: "objective", title: "Objective" },
  coreConcept: { id: "core-concept", title: "Core concept" },
  keyMechanics: { id: "key-mechanics", title: "Key mechanics" },
  commonErrors: { id: "common-errors", title: "Common errors" },
  safety: { id: "safety", title: "Safety" },
  trainingProgression: { id: "training-progression", title: "Training progression" },
  related: { id: "related-entries", title: "Related entries" },
  // The id CrossLinks already gives its section.
  elsewhere: { id: "crosslinks", title: "Elsewhere in Guard Theory" },
} as const;

type PartSpec = (typeof PARTS)[keyof typeof PARTS];

/**
 * A section of the entry.
 *
 * Deliberately unnumbered. The reading order is fixed and identical in every
 * entry, but nothing anywhere refers to "section 03" — and the rule in
 * docs/visual-identity.md is that numbers appear only where they refer to
 * something. The order is carried by the order.
 *
 * `scroll-mt` keeps a section's heading clear of the sticky header when the
 * index beside the entry jumps to it.
 */
function Part({
  part,
  children,
}: {
  part: PartSpec;
  children: React.ReactNode;
}) {
  return (
    <section id={part.id} className="scroll-mt-28 border-t border-steel pt-8 pb-12">
      <h2 className="display-condensed mb-6 text-lg text-ink">{part.title}</h2>
      {children}
    </section>
  );
}

/**
 * The index beside the entry on wide screens: the same section list, as
 * in-page links. A real `nav`, so it is announced as one; hidden below `lg`
 * because on a narrow screen it would sit between the title and the first
 * section and push the entry a screen down.
 */
function EntryIndex({ parts }: { parts: PartSpec[] }) {
  return (
    <nav
      aria-label="In this entry"
      className="hidden lg:block lg:sticky lg:top-28 lg:self-start"
    >
      <p className="eyebrow text-slate">In this entry</p>
      <ol role="list" className="m-0 mt-4 flex list-none flex-col gap-1 border-l border-steel p-0">
        {parts.map((part) => (
          <li key={part.id}>
            <a
              href={`#${part.id}`}
              className="link-rule inline-flex min-h-6 items-center py-0.5 pl-4 text-sm text-ink no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-dim"
            >
              {part.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * `role="list"` is not redundant here. `list-style: none` makes Safari drop the
 * list semantics, and these lists are ordered on purpose — the printed ordinal
 * is `aria-hidden` because "2 of 5" is supposed to come from the list itself.
 * Without the role, VoiceOver got neither.
 */
function OrderedNotes({ items }: { items: string[] }) {
  return (
    <ol role="list" className="m-0 flex list-none flex-col gap-5 p-0">
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
  const { category: categorySlug, slug } = await params;
  const entry = getEntry(slug);
  if (!entry) notFound();

  // The category segment is part of the address, not decoration. Without this
  // check any string returned 200 and every entry had unlimited URLs.
  if (entry.category !== categorySlug) notFound();

  const category = getCategory(entry.category);
  if (!category) notFound();

  // Published entries only. A draft may list the signed-off entries it points
  // at; a signed-off entry never lists a draft.
  const related = relatedEntries(entry);

  // The route out of the Library: the arguments in the Journal, and the people
  // whose recorded work the entry describes.
  const crossLinks = crossLinksFor("technique", entry.slug);

  const published = isPublishedEntry(entry);

  // The sections this entry actually renders, in order, for the index.
  const parts: PartSpec[] = [
    PARTS.positionAndProblem,
    PARTS.objective,
    PARTS.coreConcept,
    PARTS.keyMechanics,
    PARTS.commonErrors,
    PARTS.safety,
    PARTS.trainingProgression,
    ...(related.length > 0 ? [PARTS.related] : []),
    ...(crossLinks.length > 0 ? [PARTS.elsewhere] : []),
  ];

  /**
   * An Article with no author and no dates, on purpose.
   *
   * A Library entry has no byline and no publication date: `TechniqueEntry`
   * carries neither, by design. So this node states neither. Every property
   * below is a field the entry type requires, stated as the entry states it;
   * nothing is derived or defaulted, and the day the registry gains an author
   * or a date is the day this does.
   *
   * A draft emits nothing here at all — the breadcrumbs are the only
   * structured data on the page. Describing an unsigned draft to a crawler as
   * an Article is the claim the review gate exists to withhold.
   *
   * `HowTo`, `Course` and `LearningResource` were each considered and rejected
   * in docs/structured-data-map.md §7: a technique is not a recipe, and there
   * is no curriculum, completion or credential here to claim.
   */
  const url = absoluteUrl(`/technique/${category.slug}/${entry.slug}`);
  const jsonLd = published
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline: entry.title,
        description: entry.metaDescription ?? entry.summary,
        mainEntityOfPage: url,
        image: SHARE_IMAGE_OBJECT,
        articleSection: category.name,
        isPartOf: { "@id": absoluteUrl("/#website") },
        publisher: { "@id": absoluteUrl("/#organization") },
      }
    : null;

  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
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

        {/* The study register: a sheet of paper laid on the dark ground. The
            entry runs down the left; on wide screens its index keeps pace on
            the right. */}
        <div className="band-bone corner-ticks mx-auto mt-10 max-w-[80rem] px-7 py-14 sm:px-14 sm:py-20 lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-x-16 xl:px-20">
          <article className="min-w-0 max-w-[52rem] [&_p]:max-w-[38rem] [&_li]:max-w-[38rem]">
            <header className="pb-10">
              <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="eyebrow text-slate">{category.name}</span>{" "}
                <span className="notation text-2xs text-slate">
                  {entry.difficulty} · {entry.relevance}
                </span>
              </p>
              <h1 className="display-serif mt-6 text-3xl text-ink">
                {entry.title}
              </h1>
              <p className="mt-7 text-lg text-slate">{entry.summary}</p>

              {/* Shown on a draft and on nothing else, the way the Journal shows
                  a byline on a published article and on nothing else. Plain
                  text in the running register, not a banner: it states what
                  the page is and who produced it, and stops. */}
              {!published && entry.review ? (
                <div className="mt-8 border-l-2 border-signal-dim pl-6">
                  <p className="text-base text-slate">
                    <span className="text-ink">Draft.</span> Nobody has yet read
                    this entry and signed it off, so it is unlisted and not
                    offered to search.
                  </p>
                  <p className="notation mt-4 text-2xs text-slate">
                    Drafted: {entry.review.drafted}
                  </p>
                </div>
              ) : null}
            </header>

            <Part part={PARTS.positionAndProblem}>
              <p className="text-base text-ink">{entry.positionAndProblem}</p>
            </Part>

            <Part part={PARTS.objective}>
              <p className="text-base text-ink">{entry.objective}</p>
            </Part>

            <Part part={PARTS.coreConcept}>
              <p className="text-base text-ink">{entry.coreConcept}</p>
            </Part>

            <Part part={PARTS.keyMechanics}>
              <OrderedNotes items={entry.keyMechanics} />
            </Part>

            <Part part={PARTS.commonErrors}>
              <ul role="list" className="m-0 flex list-none flex-col gap-5 p-0">
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

            <Part part={PARTS.safety}>
              {/* The one signal fill on the page: the live-state rule down the
                  note's edge. The note is a raised surface so it reads as a
                  distinct document on the sheet, not a paragraph among them. */}
              <div className="max-w-[42rem] border border-steel border-l-[3px] border-l-signal bg-bone-raised p-6 sm:p-7">
                <p className="text-base text-ink">{entry.safetyNote}</p>
              </div>
            </Part>

            <Part part={PARTS.trainingProgression}>
              <OrderedNotes items={entry.trainingProgression} />
            </Part>

            {related.length > 0 ? (
              <Part part={PARTS.related}>
                <ul role="list" className="m-0 flex list-none flex-col gap-3 p-0">
                  {related.map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={`/technique/${item.category}/${item.slug}`}
                        className="text-base text-ink underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Part>
            ) : null}

            <CrossLinks links={crossLinks} ground="bone" surface />

            <footer className="mt-14 border-t border-steel pt-8">
              <p className="text-sm text-slate">{COACH_DISCLAIMER}</p>
              <p className="notation mt-6 text-2xs text-slate">
                <Link
                  href="/policies/editorial"
                  className="inline-flex min-h-6 items-center underline underline-offset-[5px]"
                >
                  Editorial policy
                </Link>{" "}
                <span aria-hidden="true">·</span>{" "}
                <Link
                  href="/contact"
                  className="inline-flex min-h-6 items-center underline underline-offset-[5px]"
                >
                  Found a mistake? Tell us
                </Link>
              </p>
            </footer>
          </article>

          <EntryIndex parts={parts} />
        </div>
      </div>

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ) : null}
    </main>
  );
}
