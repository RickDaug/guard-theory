/**
 * The search document shape and the matcher, with NO registry imports.
 *
 * This split exists for a measured reason. `SearchClient` is a client
 * component and imported `searchDocuments` from the module that also builds
 * the index — so the `"use client"` boundary pulled all six content
 * registries into the browser bundle: 368 KB raw, 117 KB gzipped, 82 per cent
 * of it prose string literals the browser already has as props.
 *
 * The index is serialised into the page. The client needs the matcher and the
 * type, and nothing else. Keep it that way: never import a registry here.
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
  /**
   * Extra keywords only — section headings, mechanics, a lifespan. Title,
   * summary and kind are NOT repeated here: they are already on the document,
   * and duplicating them into a precomputed haystack doubled the bytes shipped
   * to the browser for no benefit.
   */
  terms: string;
};

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

  return index.filter((doc) => {
    const haystack =
      `${doc.title} ${doc.summary} ${doc.kind} ${doc.terms}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
