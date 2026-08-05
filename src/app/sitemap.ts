import type { MetadataRoute } from "next";
import { CATEGORIES as TECHNIQUE_CATEGORIES, ENTRIES } from "@/content/technique";
import { PRODUCTS } from "@/content/products";
import { POLICIES } from "@/content/policies";
import {
  CATEGORIES as JOURNAL_CATEGORIES,
  publishedArticles,
} from "@/content/journal";
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
export default function sitemap(): MetadataRoute.Sitemap {
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
    ...PRODUCTS.map((product) => ({ url: absoluteUrl(`/shop/${product.slug}`) })),
    ...TECHNIQUE_CATEGORIES.map((category) => ({
      url: absoluteUrl(`/technique/${category.slug}`),
    })),
    ...ENTRIES.map((entry) => ({
      url: absoluteUrl(`/technique/${entry.category}/${entry.slug}`),
    })),
    ...JOURNAL_CATEGORIES.map((category) => ({
      url: absoluteUrl(`/journal/category/${category.slug}`),
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
