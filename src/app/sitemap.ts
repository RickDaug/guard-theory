import type { MetadataRoute } from "next";
import { publishedEntryPaths } from "@/content/technique";
import {
  indexableJournalCategorySlugs,
  indexableTechniqueCategorySlugs,
} from "@/content/category-gate";
import { listProductViews } from "@/lib/catalogue";
import { isProductIndexable } from "@/lib/catalogue/structured-data";
import { POLICIES } from "@/content/policies";
import { publishedArticles } from "@/content/journal";
import { FIGURES } from "@/content/figures";
import { absoluteUrl } from "@/lib/site";

/**
 * The sitemap is generated from the same registries the routes are, so a page
 * cannot exist without being listed or be listed without existing.
 *
 * Deliberately excluded: /design-system (internal reference, noindex) and the
 * utility routes that have no standalone value to a searcher.
 *
 * No `lastModified` is emitted. We do not track per-page modification dates
 * yet, and a build timestamp on every URL is a lie that tells crawlers
 * everything changed whenever we deploy.
 */
/**
 * Products are read from the same listing /shop renders, per request: a product
 * the owner activates in the portal has no registry entry, and one archived
 * there must leave the sitemap the moment it leaves the shop — not at the next
 * deploy. With no database the listing is the registry, so the build is
 * unchanged. Drafts created in the portal are never listed.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await listProductViews()).filter(isProductIndexable);

  const staticRoutes = [
    "/",
    "/shop",
    "/first-edition",
    "/lookbook",
    "/about",
    "/manifesto",
    "/journal",
    "/technique",
    "/figures",
    "/size-and-fit",
    "/faq",
    "/contact",
  ];

  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(path) })),
    ...products.map((product) => ({ url: absoluteUrl(`/shop/${product.slug}`) })),
    // Category pages enter the sitemap only once they clear the three-entry
    // gate, and they are computed from the same predicate that sets their
    // robots meta — a page cannot be noindex and offered to a crawler at the
    // same time. Seventeen of twenty were previously listed while holding one
    // or two entries.
    ...indexableTechniqueCategorySlugs().map((slug) => ({
      url: absoluteUrl(`/technique/${slug}`),
    })),
    // Signed-off entries only. A technique draft renders at its address for
    // the person who has to read it, and is noindex until they do; see
    // isPublishedEntry in src/content/technique/index.ts.
    ...publishedEntryPaths().map((path) => ({ url: absoluteUrl(path) })),
    ...indexableJournalCategorySlugs().map((slug) => ({
      url: absoluteUrl(`/journal/category/${slug}`),
    })),
    // Only published articles. Drafts render and are readable, but they carry
    // no publication date, so offering them to crawlers as though they were
    // published is exactly the dishonesty the editorial policy rules out.
    ...publishedArticles().map((article) => ({
      url: absoluteUrl(`/journal/${article.slug}`),
    })),
    ...FIGURES.map((figure) => ({ url: absoluteUrl(`/figures/${figure.slug}`) })),
    ...POLICIES.map((policy) => ({ url: absoluteUrl(`/policies/${policy.slug}`) })),
  ];
}
