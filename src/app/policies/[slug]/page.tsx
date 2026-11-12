import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { correctedPieces } from "@/content/corrections";
import { POLICIES, getPolicy } from "@/content/policies";
import { withContactLinks } from "@/content/policies/contact-links";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

/** An unknown slug is a real 404 page — see journal/[slug]/page.tsx. */
export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((policy) => ({ slug: policy.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};

  return pageMetadata({
    title: policy.title,
    description: policy.metaDescription ?? policy.summary,
    path: `/policies/${policy.slug}`,
  });
}

/** An inline link on the study ground: signal-dim, the one tint that reads on paper. */
const SHEET_LINK =
  "text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim";

/** A jump or sibling link in the margin column. */
const MARGIN_LINK =
  "link-rule inline-flex min-h-6 items-center text-sm text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-dim";

export default async function PolicyPage({ params }: Params) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const others = POLICIES.filter((p) => p.slug !== policy.slug);
  const corrected = policy.slug === "corrections" ? correctedPieces() : [];

  // The "On this page" index is built from the headings the policy already
  // has, plus the derived list of corrected pieces when it is rendered.
  const index = [
    ...policy.sections.map((section) => ({ id: section.id, heading: section.heading })),
    ...(corrected.length > 0
      ? [{ id: "corrected", heading: "Pieces carrying a correction" }]
      : []),
  ];

  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[{ href: `/policies/${policy.slug}`, label: policy.title }]}
        />

        {/* The study register: a sheet of paper laid on the dark ground. */}
        <div className="band-bone band-edge mt-10 px-7 py-14 sm:px-16 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* DOM order is the order: jump links before the content they
                jump to, so focus order, paint order and reading order agree
                at every width. The labels are not headings, so the first
                heading on the page is the policy's title. */}
            <div className="lg:col-span-3 lg:sticky lg:top-28 lg:self-start">
              <nav aria-label="On this page">
                <p className="eyebrow border-b border-steel pb-3 text-slate">On this page</p>
                <ol role="list" className="m-0 mt-5 flex list-none flex-col gap-2.5 p-0">
                  {index.map((entry) => (
                    <li key={entry.id}>
                      <a href={`#${entry.id}`} className={MARGIN_LINK}>
                        {entry.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </div>

            <article className="lg:col-span-8 lg:col-start-5">
              <h1 className="display-serif text-4xl text-ink">{policy.title}</h1>
              <div aria-hidden="true" className="mt-8 h-1 w-16 bg-signal" />
              <p className="mt-8 max-w-[38rem] text-lg text-ink">{policy.summary}</p>

              <div className="mt-14 flex flex-col gap-12">
                {policy.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 border-t border-steel pt-8"
                  >
                    <h2 className="display-condensed text-xl text-ink">
                      {section.heading}
                    </h2>
                    <div className="mt-5 flex max-w-[38rem] flex-col gap-5">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-base text-ink">
                          {withContactLinks(paragraph).map((part) =>
                            part.href ? (
                              <Link key={part.text} href={part.href} className={SHEET_LINK}>
                                {part.text}
                              </Link>
                            ) : (
                              part.text
                            ),
                          )}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              {/* The editorial policy says how a piece is checked; the
                  corrections policy is where a reader who has found something
                  wrong goes. */}
              {policy.slug === "editorial" ? (
                <p className="mt-14 max-w-[38rem] text-base text-ink">
                  Found a mistake in something we published?{" "}
                  <Link href="/policies/corrections" className={SHEET_LINK}>
                    How corrections work
                  </Link>
                  .
                </p>
              ) : null}

              {/* Derived from the pieces themselves (src/content/corrections.ts),
                  so it cannot list a piece with no note or miss one that has. */}
              {policy.slug === "corrections" && corrected.length > 0 ? (
                <section id="corrected" className="mt-12 scroll-mt-28 border-t border-steel pt-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Pieces carrying a correction
                  </h2>
                  <ul className="m-0 mt-5 flex max-w-[38rem] list-none flex-col gap-3 p-0">
                    {corrected.map((piece) => (
                      <li key={piece.href} className="text-base text-ink">
                        <Link href={piece.href} className={SHEET_LINK}>
                          {piece.title}
                        </Link>
                        {", "}
                        {piece.kind === "journal" ? "Journal" : "Influential figures"}
                        {", corrected "}
                        {piece.noteDates.join(" and ")}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {/* The sibling policies sit after the text rather than in the
                  margin, so they are never above the policy they belong to. */}
              <nav aria-label="Other policies" className="mt-16 border-t border-steel pt-8">
                <p className="eyebrow text-slate">Other policies</p>
                <ul className="m-0 mt-5 flex list-none flex-wrap gap-x-8 gap-y-2 p-0">
                  {others.map((item) => (
                    <li key={item.slug}>
                      <Link href={`/policies/${item.slug}`} className={MARGIN_LINK}>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </article>
          </div>
        </div>
      </div>
    </main>
  );
}
