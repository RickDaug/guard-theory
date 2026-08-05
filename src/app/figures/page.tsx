import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { FIGURES_ALPHABETICAL } from "@/content/figures";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Influential figures",
  description: "People whose work changed jiu-jitsu, in alphabetical order, with sources. An index of contributions, not a ranking.",
  path: "/figures",
});

/**
 * Not a ranking, and that is enforced in the markup rather than only asserted:
 * alphabetical itemListOrder, no rating or position properties anywhere.
 */
export default function FiguresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": absoluteUrl("/figures#index"),
    name: "Influential figures in jiu-jitsu",
    description:
      "An alphabetical index of figures whose work changed jiu-jitsu. Not a ranking.",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: FIGURES_ALPHABETICAL.length,
    itemListElement: FIGURES_ALPHABETICAL.map((figure) => ({
      "@type": "ListItem",
      name: figure.name,
      url: absoluteUrl(`/figures/${figure.slug}`),
    })),
  };

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/figures", label: "Influential figures" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Influential figures
          </h1>
          <p className="mt-8 text-lg text-steel">
            People whose work changed what the rest of us do on the mat, in
            alphabetical order. Every claim is sourced, and where the record is
            contested — which in jiu-jitsu is often — the entry says so.
          </p>
          <p className="mt-6 border-l-2 border-signal py-1 pl-6 text-base text-steel">
            <span className="text-chalk">This is not a ranking.</span>{" "}
            It is not ordered by anything except the alphabet, and nobody&rsquo;s absence
            from it is a verdict.
          </p>
        </header>

        <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {FIGURES_ALPHABETICAL.map((figure) => (
            <li key={figure.slug} className="border border-steel-dim bg-ink">
              <Link
                href={`/figures/${figure.slug}`}
                className="group flex h-full flex-col no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
              >
                <div className="relative aspect-4/5 w-full overflow-hidden bg-graphite">
                  {figure.image ? (
                    <Image
                      src={figure.image.src}
                      alt={figure.image.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top grayscale transition-[filter] duration-[420ms] ease-[var(--ease-control)] group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="max-w-[16rem] text-center text-sm text-steel">
                        No portrait with a licence we can verify
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex grow flex-col p-7">
                  {figure.lifespan ? (
                    <span className="notation text-2xs text-signal">
                      {figure.lifespan}
                    </span>
                  ) : null}
                  <h2 className="display-condensed mt-4 text-xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal">
                    {figure.name}
                  </h2>
                  <p className="mt-4 grow text-sm text-steel">
                    {figure.standfirst}
                  </p>
                  <span className="notation mt-6 text-2xs text-steel">
                    {figure.sources.length} sources
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
