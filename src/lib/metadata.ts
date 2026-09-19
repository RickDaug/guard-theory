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

/**
 * The card every share carries.
 *
 * This used to be Next's `opengraph-image.png` file convention in `src/app/`,
 * and the result was worse than having no card at all: the convention reached
 * `/` and nothing else, so the front page shared with an image and every
 * article and product page shared with **no `og:image` at all** — while still
 * announcing `twitter:card = summary_large_image`, which asks a platform for a
 * large image card and then hands it nothing. The pages people actually share
 * were the broken ones, and it was invisible from the homepage.
 *
 * So the image is declared here instead, once, and every route that calls this
 * helper gets it. One mechanism rather than two, and the one that works.
 * `tests/e2e/metadata.spec.ts` now fetches the image on every sampled route.
 *
 * The card is deliberately the same on every page: the per-page part of a
 * preview is the title and the description, which are per-page already. A
 * request-time generated image would put a font fetch on the critical path of
 * something that has to be right the first time a link is pasted, and this
 * project's Open Graph card has always been a committed file for that reason.
 */
export const SHARE_IMAGE = {
  url: absoluteUrl("/og-card.png"),
  width: 1200,
  height: 630,
  alt:
    "The Guard Theory mark and wordmark on the brand ground, over the line: " +
    "no-gi grappling apparel, and a technical study of the guard.",
} as const;

/**
 * The same card, as the `image` of a page's structured data.
 *
 * Truthful only because of the paragraph above: this IS the image every page
 * declares as its `og:image`, so stating it in JSON-LD repeats a claim the page
 * already makes rather than adding one. It is the page's image, not a
 * photograph of its subject, and it must not be attached to anything that
 * reads as one — a Person, a product.
 */
export const SHARE_IMAGE_OBJECT = {
  "@type": "ImageObject",
  url: SHARE_IMAGE.url,
  width: SHARE_IMAGE.width,
  height: SHARE_IMAGE.height,
} as const;

export function pageMetadata({
  title,
  shareTitle,
  description,
  path,
  type = "website",
  publishedTime,
  authors,
  indexable = true,
}: {
  title: string;
  /**
   * The title on a link preview, when it should differ from the `<title>`.
   * A card has room for a full headline that a results page would cut.
   */
  shareTitle?: string;
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
      title: shareTitle ?? title,
      description,
      url,
      locale: "en",
      images: [SHARE_IMAGE],
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle ?? title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
