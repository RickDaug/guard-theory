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
        // Internal reference and transient states. Nothing here is useful in a
        // results page, and the design system would dilute the real content.
        disallow: [
          "/design-system",
          "/search",
          "/unsubscribe",
          "/maintenance",
          "/form-success",
          "/form-error",
          "/email-confirmed",
          // Commerce routes. Per-reader or single-use; nothing a crawler should
          // hold on to, and /checkout has a side effect on a GET.
          "/cart",
          "/checkout",
          "/order",
          "/api",
          // The Crew Portal is deliberately NOT listed here.
          //
          // robots.txt is a public file. Naming the portal's path in it would
          // publish the one thing PORTAL_PATH exists to keep out of
          // opportunistic scans — a disallow list is a map for anyone who
          // reads it in the other direction. It is kept out of crawls the way
          // that actually works: nothing links to it, every portal page sends
          // noindex, and it is not in the sitemap.
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
