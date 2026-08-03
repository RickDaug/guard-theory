import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SearchClient } from "@/components/search/SearchClient";
import { buildSearchIndex } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Technique Library, the garments and the policies.",
  // A search page is not a destination for a crawler; the pages it points at are.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  const index = buildSearchIndex();

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/search", label: "Search" }]} />

        <header className="mt-10 mb-12 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">Search</h1>
          <p className="mt-8 text-lg text-steel">
            Everything on the site is indexed in the page you are reading — no
            query is sent anywhere, and this works with the network off.
          </p>
        </header>

        <SearchClient index={index} />
      </div>
    </main>
  );
}
