import { SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "@/lib/site";

/**
 * Organization and WebSite, emitted once from the root layout.
 *
 * Deliberately minimal. No `sameAs` social profiles, because none are
 * confirmed; no `logo` beyond the mark we actually ship; no founder, because
 * the founder story is an owner decision and inventing one would be worse than
 * omitting it. Every property here is something we can stand behind.
 *
 * SearchAction is not declared: the site search is a client-side filter over
 * content already on the page, not a query endpoint a crawler could use.
 */
export function SiteStructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        description: SITE_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/gt-512.png"),
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: SITE_NAME,
        url: absoluteUrl("/"),
        description: SITE_DESCRIPTION,
        publisher: { "@id": absoluteUrl("/#organization") },
        inLanguage: "en",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Serialised from a literal built above; no user input reaches it.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
