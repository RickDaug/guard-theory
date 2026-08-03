import { CATEGORIES, type CategorySlug, type TechniqueEntry } from "./types.ts";
import { armDrag } from "./entries/arm-drag.ts";
import { bloodChokeVersusAirChoke } from "./entries/blood-choke-versus-air-choke.ts";
import { butterflyHookAsLever } from "./entries/butterfly-hook-as-lever.ts";
import { closedGuardPostureBattle } from "./entries/closed-guard-posture-battle.ts";
import { connectionInOpenGuard } from "./entries/connection-in-open-guard.ts";
import { elbowKneeEscape } from "./entries/elbow-knee-escape.ts";
import { framesVersusBlocks } from "./entries/frames-versus-blocks.ts";
import { gettingHipsUnderneath } from "./entries/getting-hips-underneath.ts";
import { insidePosition } from "./entries/inside-position.ts";
import { kneeCutPass } from "./entries/knee-cut-pass.ts";
import { kneeShield } from "./entries/knee-shield.ts";
import { seatBeltAndHooks } from "./entries/seat-belt-and-hooks.ts";

/**
 * The registry. Entries are imported explicitly rather than globbed so that the
 * build fails loudly when a file is renamed or removed, instead of a route
 * quietly disappearing from the sitemap.
 */
export const ENTRIES: TechniqueEntry[] = [
  armDrag,
  bloodChokeVersusAirChoke,
  butterflyHookAsLever,
  closedGuardPostureBattle,
  connectionInOpenGuard,
  elbowKneeEscape,
  framesVersusBlocks,
  gettingHipsUnderneath,
  insidePosition,
  kneeCutPass,
  kneeShield,
  seatBeltAndHooks,
];

export const ENTRIES_BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));

export function entriesInCategory(category: CategorySlug): TechniqueEntry[] {
  return ENTRIES.filter((entry) => entry.category === category).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getEntry(slug: string) {
  return ENTRIES_BY_SLUG.get(slug);
}

/**
 * Every relatedSlugs value must point at a real entry. Called by the content
 * integrity test so a dangling cross-reference fails the suite rather than
 * rendering a broken link.
 */
export function findDanglingRelatedSlugs(): Array<{ from: string; to: string }> {
  const dangling: Array<{ from: string; to: string }> = [];
  for (const entry of ENTRIES) {
    for (const related of entry.relatedSlugs) {
      if (related === entry.slug) {
        dangling.push({ from: entry.slug, to: `${related} (self-reference)` });
        continue;
      }
      if (!ENTRIES_BY_SLUG.has(related)) {
        dangling.push({ from: entry.slug, to: related });
      }
    }
  }
  return dangling;
}

export { CATEGORIES };
export type { CategorySlug, TechniqueEntry };
