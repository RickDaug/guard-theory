import {
  CATEGORIES,
  type CategorySlug,
  type TechniqueEntry,
  type TechniqueReview,
} from "./types.ts";
import { armDrag } from "./entries/arm-drag.ts";
import { bloodChokeVersusAirChoke } from "./entries/blood-choke-versus-air-choke.ts";
import { butterflyGuardUnderPressure } from "./entries/butterfly-guard-under-pressure.ts";
import { butterflyHookAsLever } from "./entries/butterfly-hook-as-lever.ts";
import { closedGuardPostureBattle } from "./entries/closed-guard-posture-battle.ts";
import { connectionInOpenGuard } from "./entries/connection-in-open-guard.ts";
import { deLaRivaHook } from "./entries/de-la-riva-hook.ts";
import { elbowKneeEscape } from "./entries/elbow-knee-escape.ts";
import { framesVersusBlocks } from "./entries/frames-versus-blocks.ts";
import { gettingHipsUnderneath } from "./entries/getting-hips-underneath.ts";
import { guardRetentionIsTheKneeBetween } from "./entries/guard-retention-is-the-knee-between.ts";
import { insidePosition } from "./entries/inside-position.ts";
import { kneeCutPass } from "./entries/knee-cut-pass.ts";
import { kneeShield } from "./entries/knee-shield.ts";
import { legEntanglementAsControl } from "./entries/leg-entanglement-as-control.ts";
import { mountIsAHipPin } from "./entries/mount-is-a-hip-pin.ts";
import { pressurePassingVersusLoosePassing } from "./entries/pressure-passing-versus-loose-passing.ts";
import { retentionLadderFrameAngleInvertRecover } from "./entries/retention-ladder-frame-angle-invert-recover.ts";
import { seatBeltAndHooks } from "./entries/seat-belt-and-hooks.ts";
import { sweepingTowardTheMissingPost } from "./entries/sweeping-toward-the-missing-post.ts";
import { underhookHalfGuard } from "./entries/underhook-half-guard.ts";

/**
 * The registry. Entries are imported explicitly rather than globbed so that the
 * build fails loudly when a file is renamed or removed, instead of a route
 * quietly disappearing from the sitemap.
 */
export const ENTRIES: TechniqueEntry[] = [
  armDrag,
  bloodChokeVersusAirChoke,
  butterflyGuardUnderPressure,
  butterflyHookAsLever,
  closedGuardPostureBattle,
  connectionInOpenGuard,
  deLaRivaHook,
  elbowKneeEscape,
  framesVersusBlocks,
  gettingHipsUnderneath,
  guardRetentionIsTheKneeBetween,
  insidePosition,
  kneeCutPass,
  kneeShield,
  legEntanglementAsControl,
  mountIsAHipPin,
  pressurePassingVersusLoosePassing,
  retentionLadderFrameAngleInvertRecover,
  seatBeltAndHooks,
  sweepingTowardTheMissingPost,
  underhookHalfGuard,
];

export const ENTRIES_BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));

/**
 * The publication gate.
 *
 * An entry with no `review` predates the gate and is published. An entry with
 * one is published only once a person has set `approvedBy`. Everything a
 * reader or a crawler is offered — the category listings and their counts,
 * the sitemap, the search index, cross-links from the other collections, the
 * related-entries list on a published page — goes through this predicate.
 * `getEntry` does not, so the draft still renders at its own address for the
 * person who has to read it before signing it off.
 */
export function isPublishedEntry(entry: TechniqueEntry): boolean {
  return entry.review === undefined || entry.review.approvedBy !== null;
}

/** The published subset of any list of entries, in the order given. */
export function publishedEntries(entries: TechniqueEntry[]): TechniqueEntry[] {
  return entries.filter(isPublishedEntry);
}

export const PUBLISHED_ENTRIES: TechniqueEntry[] = publishedEntries(ENTRIES);

export function entriesInCategory(
  category: CategorySlug,
  entries: TechniqueEntry[] = PUBLISHED_ENTRIES,
): TechniqueEntry[] {
  return publishedEntries(entries)
    .filter((entry) => entry.category === category)
    .sort((a, b) => a.title.localeCompare(b.title));
}

/**
 * The addresses the sitemap offers. Drafts are left out for the same reason
 * Journal drafts are: offering a crawler a page that is itself noindex is a
 * contradiction, and offering an unsigned draft as though it were finished is
 * the thing the gate exists to prevent.
 */
export function publishedEntryPaths(entries: TechniqueEntry[] = ENTRIES): string[] {
  return publishedEntries(entries).map(
    (entry) => `/technique/${entry.category}/${entry.slug}`,
  );
}

/**
 * The entries a page may list as related. A draft may point at published
 * entries and render the links; a published entry's link to a draft resolves
 * to nothing, because a reader must not be led from a signed-off page to an
 * unsigned one.
 */
export function relatedEntries(
  entry: TechniqueEntry,
  pool: TechniqueEntry[] = ENTRIES,
): TechniqueEntry[] {
  const bySlug = pool === ENTRIES ? ENTRIES_BY_SLUG : new Map(pool.map((e) => [e.slug, e]));
  return entry.relatedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((e): e is TechniqueEntry => e !== undefined && isPublishedEntry(e));
}

/** The shortest a ledger line can be and still say who, when and what. */
export const REVIEW_LEDGER_MINIMUM = 40;

/**
 * What is wrong with an entry's review ledger, if anything. Asserted empty
 * over the registry by tests/unit/technique-review.test.ts.
 *
 * Each line of the ledger has to be long enough to be a record rather than a
 * tick — "checked" is not a fact audit. A sign-off has to name a person and
 * carry a real date, and the date cannot be in the future: a signature dated
 * for next week is a promise to read something, not a record of having read
 * it. An entry with no `review` predates the gate and has nothing to check.
 */
export function findReviewProblems(
  entries: TechniqueEntry[] = ENTRIES,
  today: Date = new Date(),
): Array<{ slug: string; problem: string }> {
  const problems: Array<{ slug: string; problem: string }> = [];
  const ledger = ["drafted", "factAudit", "voiceAudit"] as const;

  for (const entry of entries) {
    const review = entry.review;
    if (!review) continue;

    for (const line of ledger) {
      if (review[line].trim().length < REVIEW_LEDGER_MINIMUM) {
        problems.push({
          slug: entry.slug,
          problem: `review.${line} is ${review[line].trim().length} characters; a ledger line says who, when and what`,
        });
      }
    }

    const approval = review.approvedBy;
    if (approval === null) continue;

    if (approval.name.trim().length === 0) {
      problems.push({ slug: entry.slug, problem: "review.approvedBy names nobody" });
    }
    // Round-tripped, not just parsed: V8 reads "2026-02-30" as 2 March rather
    // than refusing it, so a parse alone lets an impossible date through.
    const parsed = new Date(approval.date);
    const isoDay =
      /^\d{4}-\d{2}-\d{2}$/.test(approval.date) &&
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === approval.date;
    if (!isoDay) {
      problems.push({
        slug: entry.slug,
        problem: `review.approvedBy.date "${approval.date}" is not an ISO date`,
      });
    } else if (Date.parse(approval.date) > today.getTime()) {
      problems.push({
        slug: entry.slug,
        problem: `review.approvedBy.date ${approval.date} is in the future`,
      });
    }
  }

  return problems;
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
export type { CategorySlug, TechniqueEntry, TechniqueReview };
