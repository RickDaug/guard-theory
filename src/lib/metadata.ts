import type { Metadata } from "next";
import { IS_INDEXABLE, SITE_NAME, absoluteUrl } from "./site.ts";

/**
 * Page metadata, built in one place.
 *
 * Every page was inheriting the root layout's Open Graph block, so all 82
 * routes shared one title, one description and one `og:url` pointing at the
 * homepage. Sharing any article anywhere produced a card for the front page —
 * which defeats the entire point of having a link preview.
 *
 * `openGraph.url` must be per-page; setting only `alternates.canonical` does
 * not populate it.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  authors,
  indexable = true,
}: {
  title: string;
  description: string;
  /** Root-relative, e.g. "/journal/some-slug". */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  authors?: string[];
  /** False for pages that must never be indexed even in production. */
  indexable?: boolean;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    robots:
      IS_INDEXABLE && indexable
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "en",
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
