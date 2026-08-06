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
import { pageMetadata } from "@/lib/metadata";
import { getAuthor } from "@/content/authors";

type Params = { params: Promise<{ slug: string }> };

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
      title: article.title,
      description: article.standfirst,
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
        description: article.standfirst,
        datePublished: article.publishedAt,
        ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
        articleSection: category.name,
        ...(author
          ? {
              author: {
                "@type": "Person",
                name: author.name,
                description: author.bio,
              },
            }
          : {}),
        publisher: { "@id": absoluteUrl("/#organization") },
        mainEntityOfPage: absoluteUrl(`/journal/${article.slug}`),
      }
    : null;

  return (
    <main id="main" className="px-6 py-16 md:px-12">
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
            <p className="notation mb-5 text-2xs text-signal">Contents</p>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              {article.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-[24px] items-center text-sm text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* The study register: a sheet of paper laid on the dark ground. */}
          <article className="lg:col-span-8 lg:col-start-5">
            <div className="bg-bone px-7 py-14 sm:px-16 sm:py-20 [&_p]:max-w-[38rem] [&_li]:max-w-[38rem]">
              <header className="pb-10">
                <p className="notation text-2xs text-signal-dim">
                  {category.name} · {readingTimeMinutes(article)} min read
                </p>
                <h1 className="display-condensed mt-6 text-3xl text-ink">
                  {article.title}
                </h1>
                <p className="mt-7 text-lg text-slate">{article.standfirst}</p>

                {published && author ? (
                  <p className="mt-6 text-base text-slate">
                    By <span className="text-ink">{author.name}</span>,{" "}
                    {author.role.toLowerCase()} · Published{" "}
                    <time dateTime={(article as { publishedAt: string }).publishedAt}>
                      {new Date(
                        (article as { publishedAt: string }).publishedAt,
                      ).toLocaleDateString("en-GB", {
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
                    className="scroll-mt-8 border-t border-slate/25 pt-8"
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
                <section className="mt-14 border-t border-slate/25 pt-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Where the record is contested
                  </h2>
                  <ul className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
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

              <section className="mt-14 border-t border-slate/25 pt-8">
                <h2 className="display-condensed text-xl text-ink">Sources</h2>
                <ol className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
                  {article.sources.map((source, index) => (
                    <li key={source.url} className="flex gap-5">
                      <span
                        className="notation mt-1.5 shrink-0 text-2xs text-slate"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-ink">
                        <a
                          href={source.url}
                          rel="noopener noreferrer nofollow"
                          target="_blank"
                          className="underline decoration-slate/40 underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                        >
                          {source.title}
                        </a>
                        <span className="block text-slate">
                          {source.publisher} · consulted {source.accessed}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>

              {related.length > 0 ? (
                <section className="mt-14 border-t border-slate/25 pt-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Related reading
                  </h2>
                  <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/journal/${item.slug}`}
                          className="text-base text-ink underline decoration-slate/40 underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <CrossLinks links={crossLinks} ground="bone" />

              <footer className="mt-14 border-t border-slate/25 pt-8">
                {author ? (
                  <p className="mb-6 max-w-[34rem] text-sm text-slate">
                    <span className="text-ink">{author.name}.</span> {author.bio}
                  </p>
                ) : null}
                <p className="notation text-2xs text-slate">
                  <Link
                    href="/policies/editorial"
                    className="underline underline-offset-[5px]"
                  >
                    Editorial policy
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </main>
  );
}
