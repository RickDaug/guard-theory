import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FIGURES, FIGURES_ALPHABETICAL, getFigure } from "@/content/figures";
import { absoluteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return FIGURES.map((figure) => ({ slug: figure.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const figure = getFigure(slug);
  if (!figure) return {};

  return pageMetadata({
    title: figure.name,
    description: figure.standfirst,
    path: `/figures/${figure.slug}`,
    type: "article",
  });
}

export default async function FigurePage({ params }: Params) {
  const { slug } = await params;
  const figure = getFigure(slug);
  if (!figure) notFound();

  const others = FIGURES_ALPHABETICAL.filter((f) => f.slug !== figure.slug);

  /**
   * Person, with no award, ranking or rating properties. The index makes no
   * claim about who was best and neither does this.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl(`/figures/${figure.slug}#person`),
    name: figure.name,
    description: figure.standfirst,
    ...(figure.image ? { image: absoluteUrl(figure.image.src) } : {}),
  };

  return (
    <main id="main" className="px-6 py-16 md:px-12">
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
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    priority
                    className="object-cover object-top"
                  />
                </div>
                {/* The licence is displayed, not buried. It is the reason we
                    are allowed to show this at all. */}
                <figcaption className="notation mt-4 text-2xs text-steel">
                  {figure.image.credit} · {figure.image.license} ·{" "}
                  <a
                    href={figure.image.sourceUrl}
                    rel="noopener noreferrer nofollow"
                    target="_blank"
                    className="underline underline-offset-[4px]"
                  >
                    source
                  </a>
                </figcaption>
              </figure>
            ) : (
              <div className="flex aspect-4/5 items-center justify-center border border-steel-dim p-8">
                <p className="max-w-[18rem] text-center text-sm text-steel">
                  No portrait. We could not find an image of {figure.name} whose
                  licence we were able to verify, and we do not publish
                  photographs we have no right to use.
                </p>
              </div>
            )}
          </div>

          {/* The study register: a sheet of paper on the dark ground. */}
          <article className="lg:col-span-8">
            <div className="bg-bone px-7 py-14 sm:px-16 sm:py-20 [&_p]:max-w-[38rem] [&_li]:max-w-[38rem]">
              <header className="pb-10">
                {figure.lifespan ? (
                  <p className="notation text-2xs text-signal-dim">
                    {figure.lifespan}
                  </p>
                ) : null}
                <h1 className="display-condensed mt-6 text-3xl text-ink">
                  {figure.name}
                </h1>
                <p className="mt-7 text-lg text-slate">{figure.standfirst}</p>
              </header>

              <div className="flex flex-col gap-5 border-t border-slate/25 pt-8">
                {figure.body.map((paragraph) => (
                  <p key={paragraph} className="text-base text-ink">
                    {paragraph}
                  </p>
                ))}
              </div>

              <section className="mt-14 border-t border-slate/25 pt-8">
                <h2 className="display-condensed text-xl text-ink">
                  What changed because of them
                </h2>
                <p className="mt-5 text-base text-ink">{figure.contribution}</p>
              </section>

              {figure.contestedNotes.length > 0 ? (
                <section className="mt-14 border-t border-slate/25 pt-8">
                  <h2 className="display-condensed text-xl text-ink">
                    Where the record is contested
                  </h2>
                  <ul className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
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

              <section className="mt-14 border-t border-slate/25 pt-8">
                <h2 className="display-condensed text-xl text-ink">Sources</h2>
                <ol className="m-0 mt-5 flex list-none flex-col gap-4 p-0">
                  {figure.sources.map((source, index) => (
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

              <footer className="mt-14 border-t border-slate/25 pt-8">
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

        <section aria-labelledby="more" className="mt-24">
          <h2 id="more" className="display-condensed mb-8 text-2xl text-chalk">
            Others in the index
          </h2>
          <ul className="m-0 flex list-none flex-wrap gap-x-8 gap-y-3 p-0">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/figures/${item.slug}`}
                  className="inline-flex min-h-6 items-center text-base text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
