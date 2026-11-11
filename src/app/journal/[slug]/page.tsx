import { serializeJsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CrossLinks } from "@/components/content/CrossLinks";
import { crossLinksFor } from "@/content/crosslinks";
import {
  ARTICLES,
  getArticle,
  getJournalCategory,
  isPublished,
  readingTimeMinutes,
} from "@/content/journal";
import { IS_INDEXABLE, absoluteUrl } from "@/lib/site";
import { SHARE_IMAGE_OBJECT, pageMetadata } from "@/lib/metadata";
import { getAuthor } from "@/content/authors";

type Params = { params: Promise<{ slug: string }> };

/**
 * A slug that was not built does not exist.
 *
 * Left at the default, an unknown slug is rendered on demand and `notFound()`
 * is thrown from inside that render. What production served for it was
 * `<html id="__next_error__">` — no `lang`, an empty body, and nothing at all
 * without JavaScript (SC 3.1.1, and a blank page for a mistyped address). With
 * this, an unknown slug never reaches the page: the router answers 404 with the
 * not-found page, which is a whole document. `tests/e2e/not-found.spec.ts`
 * holds every dynamic route to that with JavaScript switched off.
 *
 * Every dynamic route on the site is registry-driven and sets this. A route
 * that reads its slugs from a database at request time cannot — see the note
 * on /shop/[slug].
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const author = isPublished(article) ? getAuthor(article.authorId) : undefined;

  return {
    ...pageMetadata({
      title: article.metaTitle ?? article.title,
      shareTitle: article.title,
      description: article.metaDescription ?? article.standfirst,
      path: `/journal/${article.slug}`,
      type: "article",
      publishedTime: isPublished(article) ? article.publishedAt : undefined,
      authors: author ? [author.name] : undefined,
      indexable: isPublished(article),
    }),
    // Stated explicitly in BOTH directions, never left to inherit. Returning
    // `robots: undefined` from a page does not fall back to the layout - it
    // removes the tag, which silently made published articles indexable even
    // with the site-wide opt-in switched off.
    //
    // A draft is readable but never offered to search: it has no publication
    // date, and indexing something undated as though it were published is the
    // exact dishonesty the editorial policy rules out.
    robots:
      IS_INDEXABLE && isPublished(article)
        ? { index: true, follow: true }
        : { index: false, follow: true },
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getJournalCategory(article.category);
  if (!category) notFound();

  const related = article.relatedSlugs
    .map((s) => getArticle(s))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  // Other Journal pieces are "Related reading" above; this is the route out of
  // the Journal entirely, into the Library and the Figures index.
  const crossLinks = crossLinksFor("journal", article.slug);

  const published = isPublished(article);
  const author = published ? getAuthor(article.authorId) : undefined;

  /**
   * Article structured data is emitted only for genuinely published pieces.
   * A draft has no datePublished to state, and inventing one to satisfy a
   * schema validator would be backdating by another name.
   */
  const jsonLd = published
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": absoluteUrl(`/journal/${article.slug}#article`),
        headline: article.title,
        description: article.metaDescription ?? article.standfirst,
        // The page's own share card — the image it already declares as its
        // og:image. See SHARE_IMAGE_OBJECT.
        image: SHARE_IMAGE_OBJECT,
        datePublished: article.publishedAt,
        // Only when a revision was really recorded: `updatedAt` is the date of
        // the piece's latest correction note (src/content/corrections.ts).
        // Repeating datePublished under that name would be a claim that the
        // piece has been revised.
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        articleSection: category.name,
        ...(author
          ? {
              author:
                author.kind === "organization"
                  ? {
                      // The editorial byline is the publication, not a person:
                      // an article drafted with AI assistance must not assert
                      // in schema that a named human wrote it.
                      "@type": "Organization",
                      "@id": absoluteUrl(`/#author-${author.id}`),
                      name: author.name,
                      description: author.bio,
                      parentOrganization: { "@id": absoluteUrl("/#organization") },
                    }
                  : {
                      "@type": "Person",
                      // One node per author across every article, rather than
                      // twenty unrelated people who share a name. An identifier, not
                      // an address: there is no author page, so there is no `url`.
                      "@id": absoluteUrl(`/#author-${author.id}`),
                      name: author.name,
                      description: author.bio,
                    },
            }
          : {}),
        isPartOf: { "@id": absoluteUrl("/#website") },
        publisher: { "@id": absoluteUrl("/#organization") },
        mainEntityOfPage: absoluteUrl(`/journal/${article.slug}`),
      }
    : null;

  return (
    // The desk: ink with the plate's dot grid as texture, the one textured
    // band on this page. The sheet below is the only bone surface.
    <main id="main" tabIndex={-1} className="plate-grid px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[
            { href: "/journal", label: "Journal" },
            {
              href: `/journal/category/${category.slug}`,
              label: category.name,
            },
            { href: `/journal/${article.slug}`, label: article.title },
          ]}
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Contents. A real navigation aid on a 2,000-word piece, and it sits
              beside the text rather than interrupting it. */}
          {/* DOM order is the order: jump links before the content they jump
              to, which is conventional and keeps focus order, paint order and
              reading order identical at every width. CSS order was tried here
              and reverted - it moves the paint only, so a keyboard user tabbed
              through the contents while looking at the article.

              "Contents" is a label rather than a heading, so the first heading
              on the page is the article title. */}
          <nav
            aria-label="Contents"
            className="lg:col-span-3 lg:sticky lg:top-8 lg:self-start"
          >
            <p className="eyebrow mb-5 border-b border-steel-dim pb-3 text-steel">Contents</p>
            <ol role="list" className="m-0 flex list-none flex-col gap-3 p-0">
              {article.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="link-rule inline-flex min-h-[24px] items-center text-sm text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-lift"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* The study register: a sheet of paper laid on the dark ground. */}
          <article className="lg:col-span-8 lg:col-start-5">
            {/* The sheet: a bone band with the plate's registration ticks at
                its corners. band-bone sets text and focus-ring together. */}
            <div className="band-bone corner-ticks px-7 py-14 sm:px-16 sm:py-20 [&_p]:max-w-[38rem] [&_li]:max-w-[38rem]">
              <header className="pb-10">
                <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="eyebrow text-slate">{category.name}</span>{" "}
                  <span className="notation text-2xs text-slate">
                    {readingTimeMinutes(article)} min read
                  </span>
                </p>
                <h1 className="display-serif mt-6 text-4xl text-ink">
                  {article.title}
                </h1>
                <p className="mt-8 text-lg text-slate">{article.standfirst}</p>

                {published && author ? (
                  <p className="mt-8 border-t border-steel pt-5 text-sm text-slate">
                    By <span className="text-ink">{author.name}</span>,{" "}
                    {author.kind === "person" ? author.role.toLowerCase() : author.role} · Published{" "}
                    <time dateTime={(article as { publishedAt: string }).publishedAt}>
                      {new Date(
                        (article as { publishedAt: string }).publishedAt,
                      ).toLocaleDateString("en-GB", {
                        // A date-only ISO string parses as UTC midnight, and
                        // formatting it in the server's local zone renders the
                        // day before west of Greenwich. Every article on the
                        // site was showing a date one day earlier than the one
                        // in its own dateTime attribute — the human-readable
                        // date and the machine-readable date disagreeing, on a
                        // site whose editorial policy promises they are the
                        // same. Format in UTC, the zone the string was written
                        // in.
                        timeZone: "UTC",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </p>
                ) : null}
              </header>

              <div className="flex flex-col gap-12">
                {article.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-8 border-t border-steel pt-8"
                  >
                    <h2 className="display-condensed text-xl text-ink">
                      {section.heading}
                    </h2>
                    <div className="mt-5 flex flex-col gap-5">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-base text-ink">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {article.contestedNotes.length > 0 ? (
                <section className="mt-14 border border-steel bg-bone-raised p-6 sm:p-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Where the record is contested
                  </h2>
                  <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
                    {article.contestedNotes.map((note) => (
                      <li key={note} className="flex gap-5">
                        <span
                          className="notation mt-1.5 shrink-0 text-2xs text-signal-dim"
                          aria-hidden="true"
                        >
                          ?
                        </span>
                        <span className="text-base text-ink">{note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* References, set as a reference list: a numbered column, the
                  title as the link, the publisher and the date consulted as
                  the locator line. Every source and date is printed as is;
                  tests/unit/content.test.ts parses them. */}
              <section className="mt-14 border-t border-steel pt-8">
                <h2 className="display-condensed text-xl text-ink">Sources</h2>
                <p className="mt-3 text-sm text-slate">
                  Each source opens in a new tab.
                </p>
                <ol role="list" className="m-0 mt-6 flex list-none flex-col p-0">
                  {article.sources.map((source, index) => (
                    <li
                      key={source.url}
                      className="grid grid-cols-[2.25rem_1fr] gap-x-3 border-t border-steel py-4 first:border-t-0 first:pt-0"
                    >
                      <span
                        className="notation pt-1 text-2xs text-slate"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-ink">
                        <a
                          href={source.url}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="text-signal-dim underline decoration-signal-dim/40 underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                        >
                          {source.title}{" "}
                          <span className="sr-only">(opens in a new tab)</span>
                        </a>
                        <span className="notation mt-1.5 block text-2xs text-slate">
                          {source.publisher} · consulted {source.accessed}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {related.length > 0 ? (
                <section className="mt-14 border-t border-steel pt-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Related reading
                  </h2>
                  <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/journal/${item.slug}`}
                          className="link-rule inline-flex min-h-6 items-center text-base text-signal-dim"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* The route out of the Journal, as a raised surface on the
                  sheet. The wrapper restyles the component's own top rule and
                  spacing; the component is shared and untouched. */}
              {crossLinks.length > 0 ? (
                <div className="mt-14 border border-steel bg-bone-raised px-6 pb-8 sm:px-8 [&>section]:mt-0 [&>section]:border-t-0 [&>section]:pt-8">
                  <CrossLinks links={crossLinks} ground="bone" />
                </div>
              ) : null}

              <footer className="mt-14 border-t border-steel pt-8">
                {author ? (
                  <p className="mb-6 max-w-[34rem] text-sm text-slate">
                    <span className="text-ink">{author.name}.</span> {author.bio}
                  </p>
                ) : null}
                <p className="eyebrow text-slate">
                  <Link
                    href="/policies/editorial"
                    className="link-rule inline-flex min-h-6 items-center text-signal-dim"
                  >
                    Editorial policy
                  </Link>{" "}
                  <span aria-hidden="true">·</span>{" "}
                  <Link
                    href="/contact"
                    className="link-rule inline-flex min-h-6 items-center text-signal-dim"
                  >
                    Found a mistake? Tell us
                  </Link>
                  </p>
              </footer>
            </div>
          </article>
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
