import { CATEGORIES as TECHNIQUE_CATEGORIES, ENTRIES } from "@/content/technique";
import { PRODUCTS } from "@/content/products";
import { POLICIES } from "@/content/policies";
import { ARTICLES } from "@/content/journal";
import { FIGURES } from "@/content/figures";

/**
 * A flat index built at build time from the same registries the routes use.
 *
 * Deliberately not a search service. The whole corpus is small enough to ship
 * and filter in the browser, which means search works offline, costs nothing,
 * sends no query anywhere, and cannot silently fall out of sync with the site.
 * When the corpus outgrows that, this is the one module to replace.
 */

export type SearchKind =
  | "Article"
  | "Figure"
  | "Technique"
  | "Product"
  | "Policy"
  | "Category";

export type SearchDocument = {
  id: string;
  kind: SearchKind;
  title: string;
  summary: string;
  href: string;
  /** Lower-cased haystack. Precomputed so filtering does no work per keystroke. */
  haystack: string;
};

function toDocument(
  doc: Omit<SearchDocument, "haystack">,
  extraTerms: string[] = [],
): SearchDocument {
  return {
    ...doc,
    haystack: [doc.title, doc.summary, doc.kind, ...extraTerms]
      .join(" ")
      .toLowerCase(),
  };
}

export function buildSearchIndex(): SearchDocument[] {
  return [
    // Articles and figures were both missing from this index while the page
    // told the reader everything on the site was searchable. Searching
    // "Maeda" returned nothing on a site with a profile and an article about
    // him.
    ...ARTICLES.map((article) =>
      toDocument(
        {
          id: `article:${article.slug}`,
          kind: "Article",
          title: article.title,
          summary: article.standfirst,
          href: `/journal/${article.slug}`,
        },
        article.sections.map((section) => section.heading),
      ),
    ),
    ...FIGURES.map((figure) =>
      toDocument(
        {
          id: `figure:${figure.slug}`,
          kind: "Figure",
          title: figure.name,
          summary: figure.standfirst,
          href: `/figures/${figure.slug}`,
        },
        [figure.lifespan ?? "", figure.contribution],
      ),
    ),
    ...ENTRIES.map((entry) =>
      toDocument(
        {
          id: `technique:${entry.slug}`,
          kind: "Technique",
          title: entry.title,
          summary: entry.summary,
          href: `/technique/${entry.category}/${entry.slug}`,
        },
        [entry.difficulty, entry.relevance, entry.coreConcept],
      ),
    ),
    ...TECHNIQUE_CATEGORIES.map((category) =>
      toDocument({
        id: `category:${category.slug}`,
        kind: "Category",
        title: category.name,
        summary: category.summary,
        href: `/technique/${category.slug}`,
      }),
    ),
    ...PRODUCTS.map((product) =>
      toDocument(
        {
          id: `product:${product.slug}`,
          kind: "Product",
          title: `${product.name} — ${product.kind}`,
          summary: product.summary,
          href: `/shop/${product.slug}`,
        },
        product.constructionPoints.map((point) => point.label),
      ),
    ),
    ...POLICIES.map((policy) =>
      toDocument({
        id: `policy:${policy.slug}`,
        kind: "Policy",
        title: policy.title,
        summary: policy.summary,
        href: `/policies/${policy.slug}`,
      }),
    ),
  ];
}

/**
 * All terms must appear somewhere in the document. Order-independent, so
 * "guard closed" finds the closed guard, and no fuzzy matching — a result you
 * did not ask for is worse than no result.
 */
export function searchDocuments(
  index: SearchDocument[],
  query: string,
): SearchDocument[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return index.filter((doc) => terms.every((term) => doc.haystack.includes(term)));
}
