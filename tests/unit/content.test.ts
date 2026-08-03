import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORIES,
  ENTRIES,
  entriesInCategory,
  findDanglingRelatedSlugs,
} from "../../src/content/technique/index.ts";

/**
 * Content integrity. These are the failures that would otherwise reach a page
 * as a broken link, an empty category or a missing safety note — cheap to
 * catch here, embarrassing to catch in production.
 */

describe("technique library integrity", () => {
  it("has no dangling or self-referential related links", () => {
    const dangling = findDanglingRelatedSlugs();
    assert.deepEqual(
      dangling,
      [],
      `related slugs point at entries that do not exist: ${dangling
        .map((d) => `${d.from} -> ${d.to}`)
        .join(", ")}`,
    );
  });

  it("gives every category at least one entry", () => {
    const empty = CATEGORIES.filter(
      (category) => entriesInCategory(category.slug).length === 0,
    ).map((category) => category.slug);

    assert.deepEqual(empty, [], `categories with no entries: ${empty.join(", ")}`);
  });

  it("uses a unique slug for every entry", () => {
    const seen = new Set<string>();
    for (const entry of ENTRIES) {
      assert.ok(!seen.has(entry.slug), `duplicate slug: ${entry.slug}`);
      seen.add(entry.slug);
    }
  });

  it("points every entry at a real category", () => {
    const known = new Set(CATEGORIES.map((c) => c.slug));
    for (const entry of ENTRIES) {
      assert.ok(
        known.has(entry.category),
        `${entry.slug} is filed under unknown category ${entry.category}`,
      );
    }
  });

  it("carries a substantive, specific safety note on every entry", () => {
    const lazy = /^(train safely|be careful|listen to your body)\.?$/i;
    for (const entry of ENTRIES) {
      assert.ok(
        entry.safetyNote.length > 80,
        `${entry.slug} has a safety note too short to be specific`,
      );
      assert.ok(
        !lazy.test(entry.safetyNote.trim()),
        `${entry.slug} has a generic safety note`,
      );
    }
  });

  it("gives every entry enough mechanics, errors and progression to be useful", () => {
    for (const entry of ENTRIES) {
      assert.ok(
        entry.keyMechanics.length >= 4,
        `${entry.slug} has fewer than 4 key mechanics`,
      );
      assert.ok(
        entry.commonErrors.length >= 3,
        `${entry.slug} has fewer than 3 common errors`,
      );
      assert.ok(
        entry.trainingProgression.length >= 4,
        `${entry.slug} has fewer than 4 progression steps`,
      );
    }
  });
});

describe("editorial voice", () => {
  /**
   * The banned constructions from the brief. Greped rather than trusted,
   * because every one of them reads as machine-written and the whole editorial
   * premise depends on the writing not sounding like that.
   */
  const BANNED = [
    /in the ever[- ]evolving world of/i,
    /whether you(?:'|’)re a seasoned (?:practitioner|grappler)/i,
    /it is important to note/i,
    /this comprehensive guide will delve into/i,
    /\bgame[- ]chang(?:er|ing)\b/i,
    /\blegendary\b/i,
    /\btapestry\b/i,
    /\brevolutioniz/i,
    /\bunlock (?:your|the) (?:potential|game)/i,
    /\bembark on (?:a|your) journey/i,
  ];

  it("keeps banned constructions out of technique copy", () => {
    for (const entry of ENTRIES) {
      const text = [
        entry.title,
        entry.summary,
        entry.positionAndProblem,
        entry.objective,
        entry.coreConcept,
        entry.safetyNote,
        ...entry.keyMechanics,
        ...entry.commonErrors,
        ...entry.trainingProgression,
      ].join(" ");

      for (const pattern of BANNED) {
        assert.ok(
          !pattern.test(text),
          `${entry.slug} contains a banned construction matching ${pattern}`,
        );
      }
    }
  });
});
