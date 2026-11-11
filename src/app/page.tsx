import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";
import { GuardSystemMap } from "@/components/notation/GuardSystemMap";
import { SystemMapMotif } from "@/components/notation/SystemMapMotif";
import { EditionCard } from "@/components/home/EditionCard";
import { PRODUCTS } from "@/content/products";
import { CATEGORIES, entriesInCategory } from "@/content/technique";
import {
  CATEGORIES as JOURNAL_CATEGORIES,
  isPublished,
  publishedArticles,
  readingTimeMinutes,
} from "@/content/journal";
import {
  SECTION_DESCRIPTIONS,
  capitalise,
  numberWord,
} from "@/content/section-descriptions";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — No-gi grappling apparel`,
  description:
    "No-gi grappling apparel and a technical study of the guard: the First Edition rash guards, a sourced Journal and a Technique Library.",
  path: "/",
});

/**
 * The home page is a sequence of plates and sheets: an ink hero, a bone band
 * for the First Edition with the flats as mounted prints, a graphite contents
 * band for the Technique Library, a bone band for the latest Journal pieces,
 * and the ink footer. Every band ends with somewhere to go.
 *
 * Everything listed here is read from a registry. The home page stays static:
 * the First Edition cards come from the content registry rather than the
 * per-request catalogue view, so there is no price, no stock and no claim
 * about either — the shop reads those live.
 */

/** Format the date the way the article page does: in UTC, the zone it was written in. */
function formatPublished(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function journalCategoryName(slug: string): string {
  return JOURNAL_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}

const LINK_ON_INK =
  "text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift";

export default function HomePage() {
  // publishedArticles() is typed as Article[]; the guard narrows it again so
  // publishedAt is a string rather than a cast.
  const latest = publishedArticles()
    .filter(isPublished)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 3);

  return (
    <main id="main" tabIndex={-1}>
      {/* 1 — The hero. One plate: the headline and the real, keyboard-reachable
          system map. The motif behind the text is the same drawing seen from
          further away; decoration, hairline, and never under the type's
          contrast. No reveal here: the plate is more convincing simply there. */}
      <section
        aria-labelledby="hero-title"
        className="band-ink corner-ticks relative overflow-hidden px-6 pt-16 pb-24 md:px-12 md:pt-24 md:pb-32"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-40 w-[64rem] max-w-[170vw] text-steel-dim opacity-30 lg:-top-24 lg:-left-24"
        >
          <SystemMapMotif />
        </div>

        {/* The headline column takes half the grid and more above lg: at
            text-5xl a five-column measure broke every word onto its own line. */}
        <div className="relative mx-auto grid max-w-[104rem] gap-16 lg:grid-cols-12 lg:gap-16 xl:gap-20">
          <div className="lg:col-span-6 xl:col-span-7">
            <p className="display-wide text-xs text-chalk sm:text-sm">
              No-gi grappling apparel
            </p>

            <h1
              id="hero-title"
              className="display-condensed mt-8 text-5xl leading-[0.9] text-chalk"
            >
              {/* A <br> is a line, not a space. Without the written one
                  this read "Guard is nota position.It is a theoryof
                  control." to anything that takes the text and not the
                  layout — a search snippet, a copied line, a reader view. */}
              Guard is not{" "}
              <br />
              a position.{" "}
              <br />
              <span className="text-steel">It is a theory</span>{" "}
              <br />
              <span className="text-steel">of control.</span>
            </h1>

            <p className="prose-measure mt-10 text-lg text-chalk">
              Guard Theory makes{" "}
              <Link href="/shop" className={LINK_ON_INK}>
                no-gi grappling apparel
              </Link>{" "}
              and publishes{" "}
              <Link href="/manifesto" className={LINK_ON_INK}>
                the reasoning behind it
              </Link>
              . Position before submission. Systems before chaos.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href="/first-edition"
                className="display-plain bg-signal px-7 py-3.5 text-sm text-chalk no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-signal-dim"
              >
                Join the First Edition list
              </Link>
              <Link
                href="/journal"
                className="display-plain inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                Read the Journal
              </Link>
            </div>

            <p className="mt-14 text-base text-steel">
              First Edition — join the list for first access
            </p>
          </div>

          <div className="lg:col-span-6 xl:col-span-5">
            <p className="notation mb-8 text-2xs text-orchid">
              Fig. 01 — The guard, as a system
            </p>
            <GuardSystemMap />
          </div>
        </div>
      </section>

      {/* 2 — First Edition. A bone sheet laid on the desk, with the two flats
          mounted on it as ink plates. The only band carrying the plate grid. */}
      <section
        aria-labelledby="edition-title"
        className="band-bone band-edge plate-grid px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[104rem]">
          <div className="reveal flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <div>
              <p className="eyebrow text-slate">Wear</p>
              <h2
                id="edition-title"
                className="display-condensed mt-4 text-4xl leading-[0.9] text-ink"
              >
                First Edition
              </h2>
              {/* Signal as an object: the one rule under this band's title. */}
              <div aria-hidden="true" className="mt-6 h-1 w-14 bg-signal" />
            </div>
            <p className="max-w-[26rem] text-lg text-slate">
              {capitalise(numberWord(PRODUCTS.length))} garments, each drawn as
              a flat.
            </p>
          </div>

          <ul className="reveal m-0 mt-14 grid list-none gap-8 p-0 lg:grid-cols-2 lg:gap-10">
            {PRODUCTS.map((product, index) => (
              <li key={product.slug}>
                <EditionCard product={product} index={index} />
              </li>
            ))}
          </ul>

          <ul className="reveal m-0 mt-14 flex list-none flex-wrap gap-x-10 gap-y-4 p-0">
            <li>
              <Link
                href="/shop"
                className="link-rule display-plain inline-flex min-h-6 items-center text-sm text-signal-dim"
              >
                Shop
              </Link>
            </li>
            <li>
              {/* The header's label: shorter, same destination, and it keeps
                  the hero's button the one link on the page with that name. */}
              <Link
                href="/first-edition"
                className="link-rule display-plain inline-flex min-h-6 items-center text-sm text-signal-dim"
              >
                Join the list
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* 3 — Technique Library. A contents page on graphite: the areas of the
          game, each a row, each count derived from the published registry. */}
      <section
        aria-labelledby="technique-title"
        className="band-graphite px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto grid max-w-[104rem] gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="reveal lg:col-span-4">
            <p className="eyebrow text-steel">Study</p>
            <h2
              id="technique-title"
              className="display-condensed mt-4 text-4xl leading-[0.9] text-chalk"
            >
              Technique Library
            </h2>
            <p className="mt-8 max-w-[26rem] text-base text-chalk">
              {SECTION_DESCRIPTIONS.technique}
            </p>
            <Link
              href="/technique"
              className="link-rule display-plain mt-10 inline-flex min-h-6 items-center text-sm text-signal-lift"
            >
              Browse the Technique Library
            </Link>
          </div>

          <ul className="reveal m-0 list-none grid gap-x-12 self-start border-t border-hairline p-0 sm:grid-cols-2 lg:col-span-8">
            {CATEGORIES.map((category) => {
              const count = entriesInCategory(category.slug).length;
              return (
                <li key={category.slug} className="border-b border-hairline">
                  <Link
                    href={`/technique/${category.slug}`}
                    className="group flex min-h-6 items-baseline justify-between gap-x-6 py-4 no-underline"
                  >
                    <span className="display-condensed text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                      {category.name}
                    </span>{" "}
                    {/* A count is data, so it is set in mono. A category with
                        nothing published yet says nothing. */}
                    {count > 0 ? (
                      <span className="notation shrink-0 text-2xs text-steel tabular-nums">
                        {count === 1 ? "1 entry" : `${count} entries`}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4 — Journal. A bone sheet again, in the study register: the heading
          is Newsreader at display size so the editorial band looks like what
          it is. The three most recently published pieces. */}
      <section
        aria-labelledby="journal-title"
        className="band-bone band-edge px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-[104rem]">
          <div className="reveal flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <div className="max-w-[40rem]">
              <p className="eyebrow text-slate">Journal</p>
              <h2
                id="journal-title"
                className="display-serif mt-4 text-3xl text-ink"
              >
                Researched writing on jiu-jitsu
              </h2>
            </div>
            <p className="max-w-[28rem] text-base text-slate">
              {SECTION_DESCRIPTIONS.journal}
            </p>
          </div>

          <ul className="reveal m-0 mt-14 grid list-none gap-6 p-0 md:grid-cols-3 lg:gap-8">
            {latest.map((article) => {
              const titleId = `latest-${article.slug}-title`;
              const summaryId = `latest-${article.slug}-summary`;
              const meta = `${formatPublished(article.publishedAt)} · ${readingTimeMinutes(article)} min`;
              return (
                <li key={article.slug}>
                  <article className="card-lift relative flex h-full flex-col border border-steel bg-bone-raised p-7 hover:border-slate focus-within:border-slate sm:p-8">
                    <p className="eyebrow text-slate">
                      {journalCategoryName(article.category)}
                    </p>
                    <h3 id={titleId} className="display-serif mt-5 text-xl text-ink">
                      <Link
                        prefetch={false}
                        href={`/journal/${article.slug}`}
                        aria-describedby={summaryId}
                        className="text-ink no-underline after:absolute after:inset-0 after:content-['']"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p id={summaryId} className="mt-4 grow text-base text-slate">
                      {article.standfirst}
                    </p>
                    {/* `truncate`: a notation line near a wrap point is a
                        layout shift once Martian Mono arrives (AGENTS.md). */}
                    <p className="notation mt-8 truncate text-2xs text-slate" title={meta}>
                      <time dateTime={article.publishedAt}>
                        {formatPublished(article.publishedAt)}
                      </time>{" "}
                      · {readingTimeMinutes(article)} min
                    </p>
                  </article>
                </li>
              );
            })}
          </ul>

          <div className="reveal mt-14">
            <Link
              href="/journal"
              className="link-rule display-plain inline-flex min-h-6 items-center text-sm text-signal-dim"
            >
              Read the Journal
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
