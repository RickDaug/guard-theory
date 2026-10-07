import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  ENTRIES,
  PUBLISHED_ENTRIES,
  REVIEW_LEDGER_MINIMUM,
  entriesInCategory,
  findReviewProblems,
  isPublishedEntry,
  publishedEntries,
  publishedEntryPaths,
  relatedEntries,
  type TechniqueEntry,
  type TechniqueReview,
} from "../../src/content/technique/index.ts";
import { CROSS_LINKS, crossLinksFor } from "../../src/content/crosslinks.ts";
import { buildSearchIndex } from "../../src/lib/search/index.ts";

/**
 * The publication gate on the Technique Library.
 *
 * An entry drafted with assistance carries a `review`, and until a person sets
 * `review.approvedBy` it is a draft: readable at its address, listed nowhere,
 * offered to no crawler. These tests hold every listing surface to that with
 * fixtures built here, not in the registry — the registry holds writing, and a
 * test fixture in it would be a page.
 */

const ROOT = join(import.meta.dirname, "..", "..");
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const ledger: Omit<TechniqueReview, "approvedBy"> = {
  drafted: "assisted draft, 2026-09-25, from research brief technique-batch-3",
  factAudit:
    "fact audit 2026-09-26 by a second reviewer: two mechanics rewritten, one claim cut",
  voiceAudit:
    "voice audit 2026-09-26 against AGENTS.md and BANNED_CONSTRUCTIONS: clean",
};

function fixture(
  slug: string,
  review: TechniqueReview | undefined,
  relatedSlugs: string[] = [],
): TechniqueEntry {
  return {
    slug,
    category: "closed-guard",
    title: `Fixture ${slug}`,
    summary: `A fixture entry called ${slug}, used only by this test.`,
    difficulty: "Foundational",
    relevance: "Gi and no-gi",
    positionAndProblem: "Fixture.",
    objective: "Fixture.",
    coreConcept: "Fixture.",
    keyMechanics: ["Fixture."],
    commonErrors: ["Fixture."],
    safetyNote: "Fixture.",
    trainingProgression: ["Fixture."],
    relatedSlugs,
    ...(review ? { review } : {}),
  };
}

const legacy = fixture("legacy-entry", undefined, ["draft-entry", "approved-entry"]);
const approved = fixture(
  "approved-entry",
  { ...ledger, approvedBy: { name: "Rick R", date: "2026-09-20" } },
  ["draft-entry"],
);
const draft = fixture("draft-entry", { ...ledger, approvedBy: null }, [
  "approved-entry",
  "legacy-entry",
]);
const pool = [legacy, approved, draft];

describe("the publication gate", () => {
  it("treats an entry with no review as published, and one with a sign-off as published", () => {
    assert.equal(isPublishedEntry(legacy), true);
    assert.equal(isPublishedEntry(approved), true);
  });

  it("treats an entry whose sign-off is null as a draft", () => {
    assert.equal(isPublishedEntry(draft), false);
  });

  it("keeps a draft out of the published set", () => {
    assert.deepEqual(
      publishedEntries(pool).map((e) => e.slug),
      ["legacy-entry", "approved-entry"],
    );
    for (const entry of PUBLISHED_ENTRIES) {
      assert.ok(isPublishedEntry(entry), `${entry.slug} is listed without a sign-off`);
    }
    assert.equal(PUBLISHED_ENTRIES.length, ENTRIES.filter(isPublishedEntry).length);
  });

  it("keeps a draft out of its category listing", () => {
    assert.deepEqual(
      entriesInCategory("closed-guard", pool).map((e) => e.slug),
      ["approved-entry", "legacy-entry"],
    );
  });

  it("keeps a draft out of the sitemap", () => {
    assert.deepEqual(publishedEntryPaths(pool), [
      "/technique/closed-guard/legacy-entry",
      "/technique/closed-guard/approved-entry",
    ]);
    // The route reads the same function, not the registry. `node --test`
    // cannot load sitemap.ts (path aliases), so this is read as text.
    const sitemap = read("src/app/sitemap.ts");
    assert.match(sitemap, /publishedEntryPaths\(\)/);
    assert.doesNotMatch(sitemap, /\bENTRIES\b/);
  });

  it("keeps a draft out of the search index", () => {
    const techniques = buildSearchIndex({ entries: pool })
      .filter((doc) => doc.kind === "Technique")
      .map((doc) => doc.id);
    assert.deepEqual(techniques, ["technique:legacy-entry", "technique:approved-entry"]);
  });

  it("lets a draft link to published entries, and never the reverse", () => {
    assert.deepEqual(
      relatedEntries(draft, pool).map((e) => e.slug),
      ["approved-entry", "legacy-entry"],
    );
    assert.deepEqual(relatedEntries(approved, pool), []);
    assert.deepEqual(
      relatedEntries(legacy, pool).map((e) => e.slug),
      ["approved-entry"],
    );
  });

  it("never resolves a cross-link to a draft from the other collection", () => {
    // Vacuous while the registry holds no draft, and it stays in the suite so
    // the first draft with a cross-link is checked the day it lands.
    const published = new Set(PUBLISHED_ENTRIES.map((e) => e.slug));
    for (const link of CROSS_LINKS) {
      for (const [self, other] of [
        [link.a, link.b],
        [link.b, link.a],
      ] as const) {
        if (self.collection === "technique") continue;
        const leaked = crossLinksFor(self.collection, self.slug).filter(
          (l) => l.collection === "technique" && !published.has(l.slug),
        );
        assert.deepEqual(
          leaked.map((l) => l.slug),
          [],
          `${self.collection}/${self.slug} links to an unsigned technique draft (via ${other.slug})`,
        );
      }
    }
  });

  it("marks a draft as a draft on its page, and emits no Article for it", () => {
    // The page is the one surface a draft renders on. Read as text for the
    // same reason as the sitemap above.
    const page = read("src/app/technique/[category]/[slug]/page.tsx");
    assert.match(page, /const published = isPublishedEntry\(entry\)/);
    assert.match(page, /\{!published && entry\.review \?/);
    assert.match(page, /Drafted: \{entry\.review\.drafted\}/);
    assert.match(page, /const jsonLd = published\s*\?/);
    assert.match(page, /robots: \{ index: false, follow: false \}/);
    assert.match(page, /const related = relatedEntries\(entry\)/);
  });
});

describe("the review ledger", () => {
  it("is clean across the registry", () => {
    const problems = findReviewProblems();
    assert.deepEqual(
      problems,
      [],
      problems.map((p) => `${p.slug}: ${p.problem}`).join("\n"),
    );
  });

  it("holds the floor at forty characters", () => {
    // Pinned to the literal for the same reason CATEGORY_ENTRY_MINIMUM is:
    // a test that reads the constant back cannot notice it being lowered.
    assert.equal(REVIEW_LEDGER_MINIMUM, 40);
  });

  it("accepts a complete ledger with a dated sign-off", () => {
    assert.deepEqual(findReviewProblems([approved, draft, legacy]), []);
  });

  it("refuses a ledger line short enough to be a tick", () => {
    const ticked = fixture("ticked", {
      ...ledger,
      factAudit: "checked",
      voiceAudit: "ok",
      approvedBy: null,
    });
    const problems = findReviewProblems([ticked]).map((p) => p.problem);
    assert.equal(problems.length, 2);
    assert.match(problems[0]!, /review\.factAudit is 7 characters/);
    assert.match(problems[1]!, /review\.voiceAudit is 2 characters/);
  });

  it("refuses a sign-off with no name, a malformed date, or a date in the future", () => {
    const today = new Date("2026-09-24T12:00:00Z");
    const nameless = fixture("nameless", {
      ...ledger,
      approvedBy: { name: "  ", date: "2026-09-20" },
    });
    const malformed = fixture("malformed", {
      ...ledger,
      approvedBy: { name: "Rick R", date: "20 September 2026" },
    });
    const impossible = fixture("impossible", {
      ...ledger,
      approvedBy: { name: "Rick R", date: "2026-02-30" },
    });
    const future = fixture("future", {
      ...ledger,
      approvedBy: { name: "Rick R", date: "2026-09-25" },
    });

    const problems = findReviewProblems([nameless, malformed, impossible, future], today);
    assert.deepEqual(problems, [
      { slug: "nameless", problem: "review.approvedBy names nobody" },
      {
        slug: "malformed",
        problem: 'review.approvedBy.date "20 September 2026" is not an ISO date',
      },
      {
        slug: "impossible",
        problem: 'review.approvedBy.date "2026-02-30" is not an ISO date',
      },
      { slug: "future", problem: "review.approvedBy.date 2026-09-25 is in the future" },
    ]);
  });

  it("has nothing to say about an entry that predates the gate", () => {
    assert.deepEqual(findReviewProblems([legacy]), []);
  });
});
