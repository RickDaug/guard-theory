import type { MetadataRoute } from "next";
import { IS_INDEXABLE, absoluteUrl } from "@/lib/site";

/**
 * Indexing is opt-in, not opt-out.
 *
 * Unless NEXT_PUBLIC_ALLOW_INDEXING is explicitly "true", everything is
 * disallowed. A preview deployment or a staging environment therefore cannot be
 * indexed by forgetting to add a rule — it has to be deliberately switched on.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Only what cannot answer with a robots meta tag is listed here.
        //
        // This used to list /design-system, /search, /unsubscribe,
        // /maintenance, /form-success, /form-error and /email-confirmed. Every
        // one of them already serves `noindex`, and a crawler that is forbidden
        // to fetch a page never reads the noindex on it — so the disallow was
        // defeating the rule that actually keeps a URL out of a results page. A
        // blocked URL can still be listed, bare, from its inbound links. The
        // same goes for /cart and /order: both are pages, both send noindex.
        //
        // /api is different. The Stripe and Shippo webhooks and the reconciler
        // cron are route handlers: there is no document to carry a meta tag,
        // and a fetch of one is at best a wasted request.
        disallow: ["/api"],
        // The Crew Portal is deliberately NOT listed here.
        //
        // robots.txt is a public file. Naming the portal's path in it would
        // publish the one thing PORTAL_PATH exists to keep out of
        // opportunistic scans — a disallow list is a map for anyone who
        // reads it in the other direction. It is kept out of crawls the way
        // that actually works: nothing links to it, every portal page sends
        // noindex, and it is not in the sitemap.
      },
    ],
    // No `host`: it is a Yandex-only directive that every other parser
    // ignores, and the canonical host is already enforced by a redirect.
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
