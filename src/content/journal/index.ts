import { CATEGORIES, isPublished, readingTimeMinutes } from "./types.ts";
import type { Article, JournalCategorySlug } from "./types.ts";
import { deLaRivaAndTheGuardThatTookHisName } from "./entries/de-la-riva-and-the-guard-that-took-his-name.ts";
import { gripDecayAndTheHalfLifeOfANoGiGrip } from "./entries/grip-decay-and-the-half-life-of-a-no-gi-grip.ts";
import { howToWashARashGuard } from "./entries/how-to-wash-a-rash-guard.ts";
import { seatedGuardAndSupineGuard } from "./entries/seated-guard-and-supine-guard.ts";
import { theDropoutNumberNobodyCanSource } from "./entries/the-dropout-number-nobody-can-source.ts";
import { whatTheEarlyUfcTournamentsDemonstrated } from "./entries/what-the-early-ufc-tournaments-demonstrated.ts";
import { drillingRehearsingAndPositionalSparring } from "./entries/drilling-rehearsing-and-positional-sparring.ts";
import { guardRetentionAsASystem } from "./entries/guard-retention-as-a-system.ts";
import { howABjjRashGuardShouldFit } from "./entries/how-a-bjj-rash-guard-should-fit.ts";
import { howNoGiRulesetsReshapedTechniqueSelection } from "./entries/how-no-gi-rulesets-reshaped-technique-selection.ts";
import { maedaAndTheArrivalOfJudoInBrazil } from "./entries/maeda-and-the-arrival-of-judo-in-brazil.ts";
import { takingTheBackFromTurtle } from "./entries/taking-the-back-from-turtle.ts";
import { theArmbarFromClosedGuard } from "./entries/the-armbar-from-closed-guard.ts";
import { theGuillotineFromTheFrontHeadlock } from "./entries/the-guillotine-from-the-front-headlock.ts";
import { theKimuraAsAControlBeforeItIsAFinish } from "./entries/the-kimura-as-a-control-before-it-is-a-finish.ts";
import { theRearNakedStrangleFromBackControl } from "./entries/the-rear-naked-strangle-from-back-control.ts";
import { theTriangleAndTheAngle } from "./entries/the-triangle-and-the-angle.ts";
import { whySportJiuJitsuDoesNotTransferDirectlyToMma } from "./entries/why-sport-jiu-jitsu-does-not-transfer-directly-to-mma.ts";

/**
 * Imported explicitly rather than globbed, so a renamed file fails the build
 * instead of silently dropping an article from the Journal and the sitemap.
 */
export const ARTICLES: Article[] = [
  deLaRivaAndTheGuardThatTookHisName,
  drillingRehearsingAndPositionalSparring,
  gripDecayAndTheHalfLifeOfANoGiGrip,
  guardRetentionAsASystem,
  howABjjRashGuardShouldFit,
  howNoGiRulesetsReshapedTechniqueSelection,
  howToWashARashGuard,
  maedaAndTheArrivalOfJudoInBrazil,
  seatedGuardAndSupineGuard,
  theDropoutNumberNobodyCanSource,
  whatTheEarlyUfcTournamentsDemonstrated,
  takingTheBackFromTurtle,
  theArmbarFromClosedGuard,
  theGuillotineFromTheFrontHeadlock,
  theKimuraAsAControlBeforeItIsAFinish,
  theRearNakedStrangleFromBackControl,
  theTriangleAndTheAngle,
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
