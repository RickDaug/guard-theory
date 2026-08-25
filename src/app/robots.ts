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
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
