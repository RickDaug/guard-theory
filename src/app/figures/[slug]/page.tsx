import { serializeJsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Plate } from "@/components/notation/Plate";
import { CrossLinks } from "@/components/content/CrossLinks";
import { crossLinksFor } from "@/content/crosslinks";
import { FIGURES, FIGURES_ALPHABETICAL, getFigure } from "@/content/figures";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { lifespanDates } from "@/content/figures/lifespan";

type Params = { params: Promise<{ slug: string }> };

/** 4:5 in plate units, title block included: 660 × 825. */
const PLATE_W = 660;
const PLATE_FIELD_H = 787;

/** An unknown slug is a real 404 page — see journal/[slug]/page.tsx. */
export const dynamicParams = false;

export function generateStaticParams() {
  return FIGURES.map((figure) => ({ slug: figure.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const figure = getFigure(slug);
  if (!figure) return {};

  return pageMetadata({
    title: figure.name,
    description: figure.metaDescription ?? figure.standfirst,
    path: `/figures/${figure.slug}`,
    type: "article",
  });
}

export default async function FigurePage({ params }: Params) {
  const { slug } = await params;
  const figure = getFigure(slug);
  if (!figure) notFound();

  const others = FIGURES_ALPHABETICAL.filter((f) => f.slug !== figure.slug);

  // Where this person's recorded work is written about elsewhere on the site.
  const crossLinks = crossLinksFor("figure", figure.slug);

  /**
   * Person, with no award, ranking or rating properties. The index makes no
   * claim about who was best and neither does this.
   *
   * Birth and death years come out of the registry's own verified `lifespan`
   * and nowhere else. There is no `sameAs`: the registry records sources
   * ABOUT a person, not a page that IS that person, and promoting a citation
   * to an identity claim would be inventing one. It needs its own sourced
   * field first.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/figures/${figure.slug}#person`),
    name: figure.name,
    description: figure.metaDescription ?? figure.standfirst,
    ...lifespanDates(figure.lifespan),
    ...(figure.image ? { image: absoluteUrl(figure.image.src) } : {}),
  };

  return (
    // The desk: ink with the plate's dot grid as texture, the one textured
    // band on this page. The sheet is the only bone surface.
    <main id="main" tabIndex={-1} className="plate-grid px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs
          trail={[
            { href: "/figures", label: "Influential figures" },
            { href: `/figures/${figure.slug}`, label: figure.name },
          ]}
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Portrait column. Sticky on wide screens. */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 lg:self-start">
            {figure.image ? (
              <figure className="m-0">
                <div className="relative aspect-4/5 w-full overflow-hidden bg-graphite">
                  <Image
                    src={figure.image.src}
                    alt={figure.image.alt}
                    fill
                    // The column stops growing when the 104rem container
                    // does: four of twelve columns is 480px from a 1760px
                    // viewport up. Without the cap a 2560px screen was told
                    // 33vw and fetched an 845px-wide file for a 480px box.
                    sizes="(min-width: 1760px) 480px, (min-width: 1024px) 33vw, 100vw"
                    // This is the LCP element. `priority` is deprecated in
                    // Next 16 and no longer reaches the <img>; the docs say to
                    // state these two instead.
                    loading="eager"
                    fetchPriority="high"
                    className="object-cover object-top"
                  />
                </div>
                {/* The licence is displayed, not buried. It is the reason we
                    are allowed to show this at all. */}
                <figcaption className="notation mt-4 text-2xs text-steel [&_a]:text-signal-lift">
                  {figure.image.credit} · {figure.image.license} ·{" "}
                  <a
                    href={figure.image.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="underline underline-offset-[4px]"
                  >
                    source{" "}
                    <span className="sr-only">
                      of this photograph (opens in a new tab)
                    </span>
                  </a>
                </figcaption>
              </figure>
            ) : (
              // No portrait: the plate-chrome frame, whose title block states
              // the name and the dates — all the index knows — with the
              // reason as its caption. The frame is aria-hidden; the
              // caption carries the meaning.
              <figure className="m-0">
                <Plate
                  width={PLATE_W}
                  fieldHeight={PLATE_FIELD_H}
                  title={figure.name.toUpperCase()}
                  reference={figure.lifespan ?? ""}
                >
                  {null}
                </Plate>
                <figcaption className="mt-4 max-w-[22rem] text-sm text-steel">
                  No portrait. We could not find an image of {figure.name} whose
                  licence we were able to verify, and we do not publish
                  photographs we have no right to use.
                </figcaption>
              </figure>
            )}
          </div>

          {/* The study register: a sheet of paper on the dark ground. */}
          <article className="lg:col-span-8">
            {/* The sheet: a bone band with the plate's registration ticks at
                its corners. band-bone sets text and focus-ring together. */}
            <div className="band-bone corner-ticks px-7 py-14 sm:px-16 sm:py-20 [&_p]:max-w-[38rem] [&_li]:max-w-[38rem]">
              <header className="pb-10">
                <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="eyebrow text-slate">Influential figures</span>
                  {figure.lifespan ? (
                    <>
                      {" "}
                      <span className="notation text-2xs text-slate">
                        {figure.lifespan}
                      </span>
                    </>
                  ) : null}
                </p>
                <h1 className="display-serif mt-6 text-4xl text-ink">
                  {figure.name}
                </h1>
                <p className="mt-8 text-lg text-slate">{figure.standfirst}</p>
              </header>

              <div className="flex flex-col gap-5 border-t border-steel pt-8">
                {figure.body.map((paragraph) => (
                  <p key={paragraph} className="text-base text-ink">
                    {paragraph}
                  </p>
                ))}
              </div>

              <section className="mt-14 border-t border-steel pt-8">
                <h2 className="display-condensed text-xl text-ink">
                  What changed because of them
                </h2>
                <p className="mt-5 text-base text-ink">{figure.contribution}</p>
              </section>

              {figure.contestedNotes.length > 0 ? (
                <section className="mt-14 border border-steel bg-bone-raised p-6 sm:p-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Where the record is contested
                  </h2>
                  <ul role="list" className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
                    {figure.contestedNotes.map((note) => (
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

              {/* References, set as a reference list. Every source and date
                  is printed as is; tests/unit/content.test.ts parses them. */}
              <section className="mt-14 border-t border-steel pt-8">
                <h2 className="display-condensed text-xl text-ink">Sources</h2>
                <p className="mt-3 text-sm text-slate">
                  Each source opens in a new tab.
                </p>
                <ol role="list" className="m-0 mt-6 flex list-none flex-col p-0">
                  {figure.sources.map((source, index) => (
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

              {/* The route out, as a raised surface on the sheet. The wrapper
                  restyles the shared component's own top rule and spacing. */}
              {crossLinks.length > 0 ? (
                <div className="mt-14 border border-steel bg-bone-raised px-6 pb-8 sm:px-8 [&>section]:mt-0 [&>section]:border-t-0 [&>section]:pt-8">
                  <CrossLinks links={crossLinks} ground="bone" />
                </div>
              ) : null}

              <footer className="mt-14 border-t border-steel pt-8">
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

        {/* The rest of the index, as chips on the desk. Alphabetical, like
            the index itself, and unnumbered. */}
        <section aria-labelledby="more" className="mt-24">
          <h2 id="more" className="eyebrow mb-8 border-b border-steel-dim pb-4 text-steel">
            Others in the index
          </h2>
          <ul role="list" className="m-0 flex list-none flex-wrap gap-2.5 p-0">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/figures/${item.slug}`}
                  className="display-plain inline-flex min-h-6 items-center border border-steel-mid bg-ink-raised px-3.5 py-2 text-sm text-chalk no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:border-chalk hover:text-signal-lift"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </main>
  );
}
