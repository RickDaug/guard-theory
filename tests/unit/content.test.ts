import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CATEGORIES,
  ENTRIES,
  entriesInCategory,
  findDanglingRelatedSlugs,
} from "../../src/content/technique/index.ts";
import {
  ARTICLES,
  CATEGORIES as JOURNAL_CATEGORIES,
  findDanglingRelatedSlugs as findDanglingArticleSlugs,
  isPublished,
  publishedArticles,
} from "../../src/content/journal/index.ts";

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

describe("journal integrity", () => {
  it("has no dangling or self-referential related links", () => {
    assert.deepEqual(findDanglingArticleSlugs(), []);
  });

  it("files every article under a real category", () => {
    const known = new Set(JOURNAL_CATEGORIES.map((c) => c.slug));
    for (const article of ARTICLES) {
      assert.ok(
        known.has(article.category),
        `${article.slug} is filed under unknown category ${article.category}`,
      );
    }
  });

  it("uses a unique slug and unique section anchors", () => {
    const slugs = new Set<string>();
    for (const article of ARTICLES) {
      assert.ok(!slugs.has(article.slug), `duplicate article slug: ${article.slug}`);
      slugs.add(article.slug);

      const anchors = new Set<string>();
      for (const section of article.sections) {
        assert.ok(
          !anchors.has(section.id),
          `${article.slug} repeats section anchor ${section.id}`,
        );
        anchors.add(section.id);
      }
    }
  });

  it("cites at least three sources per article, each with a real URL and date", () => {
    for (const article of ARTICLES) {
      assert.ok(
        article.sources.length >= 3,
        `${article.slug} cites fewer than three sources`,
      );
      for (const source of article.sources) {
        assert.doesNotThrow(
          () => new URL(source.url),
          `${article.slug} has an unparseable source URL: ${source.url}`,
        );
        assert.match(
          source.accessed,
          /^\d{4}-\d{2}-\d{2}$/,
          `${article.slug} has a malformed accessed date: ${source.accessed}`,
        );
        assert.ok(
          !Number.isNaN(Date.parse(source.accessed)),
          `${article.slug} has an impossible accessed date: ${source.accessed}`,
        );
      }
    }
  });

  /**
   * The publication-date guarantee, asserted rather than assumed. Nothing may
   * be dated unless it is genuinely published, and the sitemap must contain
   * only published pieces.
   */
  it("never dates an unpublished article, and never lists one in the sitemap", () => {
    for (const article of ARTICLES) {
      if (isPublished(article)) {
        assert.match(
          article.publishedAt,
          /^\d{4}-\d{2}-\d{2}/,
          `${article.slug} is published with a malformed date`,
        );
        assert.ok(
          article.authorId.length > 0,
          `${article.slug} is published without an author`,
        );
      } else {
        assert.ok(
          !("publishedAt" in article),
          `${article.slug} is a draft but carries a publication date`,
        );
      }
    }

    for (const article of publishedArticles()) {
      assert.ok(
        isPublished(article),
        `${article.slug} reached the sitemap without being published`,
      );
    }
  });

  it("gives every article enough substance to be worth reading", () => {
    for (const article of ARTICLES) {
      assert.ok(
        article.sections.length >= 5,
        `${article.slug} has fewer than five sections`,
      );
      const words = article.sections
        .flatMap((s) => s.paragraphs)
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      assert.ok(
        words >= 1200,
        `${article.slug} is ${words} words, below the 1,200 flagship floor`,
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

  it("keeps banned constructions out of Journal copy", () => {
    for (const article of ARTICLES) {
      const text = [
        article.title,
        article.standfirst,
        ...article.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
        ...article.contestedNotes,
      ].join(" ");

      for (const pattern of BANNED) {
        assert.ok(
          !pattern.test(text),
          `${article.slug} contains a banned construction matching ${pattern}`,
        );
      }
    }
  });

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
