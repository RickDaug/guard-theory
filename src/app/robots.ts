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
        // Nothing is disallowed, on purpose.
        //
        // This used to list /design-system, /search, /unsubscribe,
        // /maintenance, /form-success, /form-error and /email-confirmed. Every
        // one of them already serves `noindex`, and a crawler that is forbidden
        // to fetch a page never reads the noindex on it — so the disallow was
        // defeating the rule that actually keeps a URL out of a results page. A
        // blocked URL can still be listed, bare, from its inbound links.
        //
        // A path belongs here only when it CANNOT answer with a robots meta
        // tag: a route handler, a webhook, a GET with a side effect. There is
        // none yet.
      },
    ],
    // No `host`: it is a Yandex-only directive that every other parser
    // ignores, and the canonical host is already enforced by a redirect.
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
