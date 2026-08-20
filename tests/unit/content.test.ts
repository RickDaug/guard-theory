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
import { FIGURES } from "../../src/content/figures/index.ts";
import {
  CROSS_LINKS,
  crossLinksFor,
  findDanglingCrossLinks,
} from "../../src/content/crosslinks.ts";
import {
  CATEGORY_ENTRY_MINIMUM,
  indexableJournalCategorySlugs,
  indexableTechniqueCategorySlugs,
  journalCategoryCount,
  techniqueCategoryCount,
} from "../../src/content/category-gate.ts";

/**
 * Content integrity. These are the failures that would otherwise reach a page
 * as a broken link, an empty category or a missing safety note — cheap to
 * catch here, embarrassing to catch in production.
 */

describe("the three-entry gate on category pages", () => {
  it("holds the bar at the documented three", () => {
    // Pinned to the literal, not to the constant.
    //
    // The first version of the test below compared the gate's output against a
    // count computed with CATEGORY_ENTRY_MINIMUM — the same constant the gate
    // uses. Both moved together, so lowering the bar to 1 reopened all
    // seventeen thin pages and the suite stayed green. Verified by doing it.
    //
    // The number is a documented editorial policy (docs/seo-strategy.md §5,
    // docs/editorial-calendar.md §2), so changing it should require changing
    // the documents and this line, deliberately.
    assert.equal(CATEGORY_ENTRY_MINIMUM, 3);
  });

  it("keeps thin categories out of the sitemap", () => {
    const leaked = [
      ...indexableJournalCategorySlugs().filter(
        (slug) => journalCategoryCount(slug) < 3,
      ),
      ...indexableTechniqueCategorySlugs().filter(
        (slug) => techniqueCategoryCount(slug) < 3,
      ),
    ];
    assert.deepEqual(
      leaked,
      [],
      `categories under the three-entry bar are indexable: ${leaked.join(", ")}`,
    );
  });

  it("admits a category the moment it has three entries", () => {
    // Guards against a gate that is accidentally always closed — which would
    // pass the test above while quietly deindexing the whole site.
    const admitted = [
      ...indexableJournalCategorySlugs(),
      ...indexableTechniqueCategorySlugs(),
    ];
    const expected = [
      ...JOURNAL_CATEGORIES.filter((c) => journalCategoryCount(c.slug) >= 3).map(
        (c) => c.slug,
      ),
      ...CATEGORIES.filter((c) => techniqueCategoryCount(c.slug) >= 3).map(
        (c) => c.slug,
      ),
    ];
    assert.deepEqual(admitted, expected);
    assert.ok(
      admitted.length > 0,
      "no category clears the gate — the gate is stuck shut, not the content thin",
    );
  });

  it("counts published articles only", () => {
    // Three drafts would otherwise open a category page whose three targets
    // are all themselves noindex.
    for (const category of JOURNAL_CATEGORIES) {
      const published = ARTICLES.filter(
        (a) => a.category === category.slug && isPublished(a),
      ).length;
      assert.equal(journalCategoryCount(category.slug), published);
    }
  });
});

describe("cross-section links", () => {
  it("point at documents that exist", () => {
    const dangling = findDanglingCrossLinks();
    assert.deepEqual(
      dangling,
      [],
      `cross-links point at missing documents: ${dangling
        .map((d) => `${d.ref.collection}/${d.ref.slug}`)
        .join(", ")}`,
    );
  });

  it("never join two documents in the same collection", () => {
    // Same-collection relationships belong in that collection's own
    // relatedSlugs. A link declared in both places renders twice.
    const sameCollection = CROSS_LINKS.filter(
      (link) => link.a.collection === link.b.collection,
    );
    assert.deepEqual(
      sameCollection.map((l) => `${l.a.slug} <-> ${l.b.slug}`),
      [],
      "cross-links must connect different collections",
    );
  });

  it("carry a basis for every link", () => {
    // A link asserts that two documents are related. If that cannot be stated
    // in a sentence, it is a guess and does not belong on the site.
    const unjustified = CROSS_LINKS.filter((link) => link.basis.trim().length < 20);
    assert.deepEqual(
      unjustified.map((l) => `${l.a.slug} <-> ${l.b.slug}`),
      [],
      "every cross-link needs a basis traceable to one of the two documents",
    );
  });

  it("are declared once and resolve from both ends", () => {
    for (const link of CROSS_LINKS) {
      const fromA = crossLinksFor(link.a.collection, link.a.slug);
      const fromB = crossLinksFor(link.b.collection, link.b.slug);

      assert.ok(
        fromA.some((l) => l.collection === link.b.collection && l.slug === link.b.slug),
        `${link.a.slug} does not resolve its link to ${link.b.slug}`,
      );
      assert.ok(
        fromB.some((l) => l.collection === link.a.collection && l.slug === link.a.slug),
        `${link.b.slug} does not resolve its link back to ${link.a.slug}`,
      );
    }
  });

  it("leave no duplicate edges", () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const link of CROSS_LINKS) {
      const key = [
        `${link.a.collection}/${link.a.slug}`,
        `${link.b.collection}/${link.b.slug}`,
      ]
        .sort()
        .join(" <-> ");
      if (seen.has(key)) duplicates.push(key);
      seen.add(key);
    }
    assert.deepEqual(duplicates, [], "the same pair is declared more than once");
  });
});

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

/**
 * What search and social actually show.
 *
 * A snippet is cut around 155-160 characters and a card often shows about 125,
 * so a standfirst written to read well *on the page* gets an ellipsis through it
 * everywhere else. The fix was not to shorten the standfirsts — they are doing
 * their own job well — but to let an entry carry a separate `metaDescription`
 * for the other one.
 *
 * This asserts the outcome rather than the field: an entry passes if its
 * effective description is short enough, however it gets there. 29 of 40 needed
 * the second field; the rest were already fine and do not have one.
 *
 * Without this the site drifts straight back. Nothing else notices: an
 * over-long description is not an error, not a build failure and not a ranking
 * penalty — it is simply a sentence the reader never sees the end of.
 */
describe("meta descriptions fit what search and social display", () => {
  const LIMIT = 160;

  const SUBJECTS: Array<{ kind: string; slug: string; effective: string; onPage: string }> = [
    ...ARTICLES.map((a) => ({
      kind: "journal",
      slug: a.slug,
      effective: a.metaDescription ?? a.standfirst,
      onPage: a.standfirst,
    })),
    ...ENTRIES.map((e) => ({
      kind: "technique",
      slug: e.slug,
      effective: e.metaDescription ?? e.summary,
      onPage: e.summary,
    })),
    ...FIGURES.map((f) => ({
      kind: "figures",
      slug: f.slug,
      effective: f.metaDescription ?? f.standfirst,
      onPage: f.standfirst,
    })),
  ];

  for (const subject of SUBJECTS) {
    it(`${subject.kind}/${subject.slug} has a description search can show whole`, () => {
      assert.ok(
        subject.effective.length <= LIMIT,
        `${subject.kind}/${subject.slug} is ${subject.effective.length} characters, ` +
          `over the ${LIMIT} a snippet shows. Give it a metaDescription rather than ` +
          `cutting the standfirst, which has a different job.`,
      );
      assert.ok(
        subject.effective.length > 40,
        `${subject.kind}/${subject.slug} has a description too short to say anything`,
      );
    });
  }

  it("does not carry a metaDescription that is longer than what it replaces", () => {
    for (const subject of SUBJECTS) {
      if (subject.effective === subject.onPage) continue;
      assert.ok(
        subject.effective.length < subject.onPage.length,
        `${subject.kind}/${subject.slug} has a metaDescription no shorter than its ` +
          `standfirst — if it is not shortening anything, delete it`,
      );
    }
  });
});
