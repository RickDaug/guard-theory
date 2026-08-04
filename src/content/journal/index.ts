import { CATEGORIES, isPublished, readingTimeMinutes } from "./types.ts";
import type { Article, JournalCategorySlug } from "./types.ts";
import { drillingRehearsingAndPositionalSparring } from "./entries/drilling-rehearsing-and-positional-sparring.ts";
import { guardRetentionAsASystem } from "./entries/guard-retention-as-a-system.ts";
import { howABjjRashGuardShouldFit } from "./entries/how-a-bjj-rash-guard-should-fit.ts";
import { howNoGiRulesetsReshapedTechniqueSelection } from "./entries/how-no-gi-rulesets-reshaped-technique-selection.ts";
import { maedaAndTheArrivalOfJudoInBrazil } from "./entries/maeda-and-the-arrival-of-judo-in-brazil.ts";
import { whySportJiuJitsuDoesNotTransferDirectlyToMma } from "./entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts";

/**
 * Imported explicitly rather than globbed, so a renamed file fails the build
 * instead of silently dropping an article from the Journal and the sitemap.
 */
export const ARTICLES: Article[] = [
  drillingRehearsingAndPositionalSparring,
  guardRetentionAsASystem,
  howABjjRashGuardShouldFit,
  howNoGiRulesetsReshapedTechniqueSelection,
  maedaAndTheArrivalOfJudoInBrazil,
  whySportJiuJitsuDoesNotTransferDirectlyToMma,
];

const BY_SLUG = new Map(ARTICLES.map((article) => [article.slug, article]));

export function getArticle(slug: string): Article | undefined {
  return BY_SLUG.get(slug);
}

export function getJournalCategory(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function articlesInCategory(category: JournalCategorySlug): Article[] {
  return ARTICLES.filter((article) => article.category === category).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

/**
 * Only published articles belong in the sitemap. Drafts render — they are
 * finished writing, and hiding them would be its own kind of dishonesty — but
 * they are noindex and are not offered to crawlers.
 */
export function publishedArticles(): Article[] {
  return ARTICLES.filter(isPublished);
}

export function findDanglingRelatedSlugs(): Array<{ from: string; to: string }> {
  const dangling: Array<{ from: string; to: string }> = [];
  for (const article of ARTICLES) {
    for (const related of article.relatedSlugs) {
      if (related === article.slug) {
        dangling.push({ from: article.slug, to: `${related} (self-reference)` });
        continue;
      }
      if (!BY_SLUG.has(related)) {
        dangling.push({ from: article.slug, to: related });
      }
    }
  }
  return dangling;
}

export { CATEGORIES, isPublished, readingTimeMinutes };
export type { Article, JournalCategorySlug } from "./types.ts";
