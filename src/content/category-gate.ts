/**
 * The three-entry gate on category pages.
 *
 * `docs/seo-strategy.md` §5 states it plainly: "ship the category page only
 * when it has its introduction plus at least three entries", and
 * `docs/editorial-calendar.md` §2 repeats it for the Journal — "the Journal
 * should not hold itself to a lower standard".
 *
 * The rule was documented and never implemented. Every category page was
 * indexable and every one was in the sitemap, including twelve technique
 * categories holding a single entry each and rendering 53 to 76 words. That is
 * seventeen pages of scaffolding offered to a crawler as though each were a
 * destination, and it dilutes the pages that are.
 *
 * WHY A GATE RATHER THAN MORE WORDS
 *
 * The obvious alternative is to write an introduction for each thin category
 * until it clears some word count. That inverts the rule: the number of entries
 * is the thing being measured because it is the thing a reader came for. A
 * category page padded to 400 words that still lists one entry is worse than
 * the short version, because it takes longer to discover there is nothing here.
 *
 * The gate is computed from the live registries, so it releases itself. Publish
 * a third entry in a category and that page becomes indexable and enters the
 * sitemap on the next build, with nobody remembering to flip a flag.
 *
 * Under the gate, pages still render, are still linked and are still crawlable.
 * They carry `noindex, follow` — the links out are followed, the page itself is
 * not offered as a search result.
 *
 * SERVER ONLY: imports the journal and technique registries.
 */
import {
  CATEGORIES as JOURNAL_CATEGORIES,
  isPublished,
  ARTICLES,
} from "./journal/index.ts";
import { CATEGORIES as TECHNIQUE_CATEGORIES, ENTRIES } from "./technique/index.ts";

/** The documented bar. One number, quoted by both collections. */
export const CATEGORY_ENTRY_MINIMUM = 3;

/**
 * Published articles only.
 *
 * A draft renders and is readable but carries no publication date and is itself
 * noindex, so three drafts would let a category page through the gate while
 * offering a crawler three pages it is being told not to index.
 */
export function journalCategoryCount(slug: string): number {
  return ARTICLES.filter((a) => a.category === slug && isPublished(a)).length;
}

export function techniqueCategoryCount(slug: string): number {
  return ENTRIES.filter((e) => e.category === slug).length;
}

export function isJournalCategoryIndexable(slug: string): boolean {
  return journalCategoryCount(slug) >= CATEGORY_ENTRY_MINIMUM;
}

export function isTechniqueCategoryIndexable(slug: string): boolean {
  return techniqueCategoryCount(slug) >= CATEGORY_ENTRY_MINIMUM;
}

/** The category slugs that belong in the sitemap, and only those. */
export function indexableJournalCategorySlugs(): string[] {
  return JOURNAL_CATEGORIES.map((c) => c.slug).filter(isJournalCategoryIndexable);
}

export function indexableTechniqueCategorySlugs(): string[] {
  return TECHNIQUE_CATEGORIES.map((c) => c.slug).filter(
    isTechniqueCategoryIndexable,
  );
}
