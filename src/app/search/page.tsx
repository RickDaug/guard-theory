import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SearchClient } from "@/components/search/SearchClient";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search the Journal, the Technique Library, the figures index, the garments and the policies.",
  // A search page is not a destination for a crawler; the pages it points at are.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <main id="main" tabIndex={-1}>
      <div className="band-ink px-6 pt-10 pb-8 md:px-12">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/search", label: "Search" }]} />
        </div>
      </div>

      <div className="band-bone band-edge corner-ticks px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[104rem]">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">Search</h1>
            <p className="mt-8 text-lg text-ink">
              The Journal, the Technique Library, the figures, the garments and
              the policies are indexed in the page you are reading — no query is
              sent anywhere, and this works with the network off.
            </p>
          </header>

          <SearchClient index={index} />
        </div>
      </div>
    </main>
  );
}
