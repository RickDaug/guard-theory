import { expect, test } from "@playwright/test";
import { ARTICLES, isPublished } from "../../src/content/journal/index.ts";
import { CATEGORIES as TECHNIQUE_CATEGORIES } from "../../src/content/technique/index.ts";
import { isTechniqueCategoryIndexable } from "../../src/content/category-gate.ts";

/**
 * Every indexable page needs a unique title and description, a canonical, and
 * structured data that parses. Checked against the rendered production output
 * rather than against the source that is supposed to produce it.
 */

/**
 * Routes sampled for unique titles and descriptions. Named for what it is: some
 * of these are now noindex under the three-entry gate, which does not change
 * whether their titles must be unique.
 */
const SAMPLED = [
  "/",
  "/shop",
  "/shop/theory-01-long-sleeve",
  "/shop/theory-01-short-sleeve",
  "/first-edition",
  "/lookbook",
  "/about",
  "/manifesto",
  "/journal",
  "/journal/category/bjj-history",
  "/journal/category/equipment-and-apparel",
  "/journal/how-a-bjj-rash-guard-should-fit",
  "/technique",
  "/technique/half-guard",
  "/technique/no-gi-systems/inside-position",
  "/figures",
  "/size-and-fit",
  "/faq",
  "/contact",
  "/policies/privacy",
  "/policies/editorial",
];

const NOINDEX = ["/design-system", "/search", "/maintenance", "/unsubscribe"];

test("titles and descriptions are unique across the site", async ({ page }) => {
  test.setTimeout(120_000);

  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const path of SAMPLED) {
    await page.goto(path, { waitUntil: "load" });

    const title = await page.title();
    const description =
      (await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute("content")) ?? "";

    expect(title.length, `${path} has no title`).toBeGreaterThan(0);
    expect(
      description.length,
      `${path} has no meta description`,
    ).toBeGreaterThan(0);

    // Long enough to say something, short enough not to be truncated.
    expect(description.length, `${path} description is too long`).toBeLessThan(
      200,
    );

    const titleClash = titles.get(title);
    expect(titleClash, `${path} repeats the title of ${titleClash}`).toBeUndefined();
    titles.set(title, path);

    const descriptionClash = descriptions.get(description);
    expect(
      descriptionClash,
      `${path} repeats the description of ${descriptionClash}`,
    ).toBeUndefined();
    descriptions.set(description, path);
  }
});

test("indexable pages are indexable and the rest are not", async ({ page }) => {
  test.setTimeout(120_000);

  async function robotsFor(path: string): Promise<string> {
    await page.goto(path, { waitUntil: "load" });
    return (
      (await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute("content")) ?? ""
    );
  }

  /**
   * Whether THIS build has site-wide indexing switched on, read from the build
   * rather than assumed.
   *
   * The previous version of this test hard-coded a slug it called "a piece that
   * is still a draft" and asserted it was noindex. That article was published
   * afterwards, and the assertion survived only because Playwright builds
   * without indexing enabled — which made the entire site noindex and the check
   * unfailable. The audit predicted it would go red the day the flag was
   * flipped, and it did, on the first production-configured run.
   *
   * So nothing here is hard-coded to one configuration. The site is now live
   * with indexing ON, and this test has to be true of that build and of a
   * preview build alike.
   */
  const siteIndexable = (await robotsFor("/")).includes("index, follow");

  for (const path of NOINDEX) {
    expect(await robotsFor(path), `${path} must always be noindex`).toContain(
      "noindex",
    );
  }

  /**
   * A draft renders and is readable, but must never be offered to a crawler: it
   * carries no publication date, and indexing an undated piece as published is
   * exactly what the editorial policy rules out. Driven off the registry, so
   * publishing a draft cannot leave a stale assertion behind.
   *
   * This caught a real regression once: a page returned `robots: undefined`,
   * which REMOVES the tag rather than inheriting the layout, so the article
   * became indexable while the site-wide opt-in was still off.
   */
  const drafts = ARTICLES.filter((article) => !isPublished(article));
  for (const article of drafts) {
    expect(
      await robotsFor(`/journal/${article.slug}`),
      `draft ${article.slug} must be noindex`,
    ).toContain("noindex");
  }

  // Published articles follow the site-wide switch. Asserting this in the
  // indexing-on configuration is the only thing that proves the switch reaches
  // an article at all.
  const published = ARTICLES.filter(isPublished).slice(0, 3);
  for (const article of published) {
    const robots = await robotsFor(`/journal/${article.slug}`);
    if (siteIndexable) {
      expect(robots, `published ${article.slug} should be indexable`).toContain(
        "index, follow",
      );
    } else {
      expect(
        robots,
        `${article.slug} must be noindex while the site-wide opt-in is off`,
      ).toContain("noindex");
    }
  }

  /**
   * The three-entry gate holds regardless of the site-wide switch: a category
   * under the bar is noindex even in production, and one over it follows the
   * switch. See src/content/category-gate.ts.
   */
  for (const category of TECHNIQUE_CATEGORIES) {
    const robots = await robotsFor(`/technique/${category.slug}`);
    if (isTechniqueCategoryIndexable(category.slug) && siteIndexable) {
      expect(robots, `${category.slug} clears the gate`).toContain("index, follow");
    } else {
      expect(robots, `${category.slug} is under the gate`).toContain("noindex");
    }
  }
});

test("structured data parses and claims nothing untrue", async ({ page }) => {
  test.setTimeout(120_000);

  for (const path of ["/", "/technique/no-gi-systems/inside-position", "/faq", "/figures"]) {
    await page.goto(path, { waitUntil: "load" });

    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    expect(blocks.length, `${path} emits no structured data`).toBeGreaterThan(0);

    for (const block of blocks) {
      expect(() => JSON.parse(block), `${path} has unparseable JSON-LD`).not.toThrow();
    }
  }

  // No Product or Offer anywhere: there is no price, no stock and no rating,
  // and a waitlist is not a PreOrder.
  for (const path of ["/shop", "/shop/theory-01-long-sleeve", "/first-edition"]) {
    await page.goto(path, { waitUntil: "load" });
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    for (const block of blocks) {
      expect(block, `${path} emits commerce schema without truthful data`).not.toMatch(
        /"@type"\s*:\s*"(Product|Offer|AggregateRating|Review)"/,
      );
    }
  }

  // The figures index must not be readable as a ranking.
  await page.goto("/figures", { waitUntil: "load" });
  const figureBlocks = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const itemList = figureBlocks.find((block) => block.includes("ItemList"));
  expect(itemList).toBeDefined();
  expect(itemList).toContain("ItemListOrderAscending");
  expect(itemList).not.toMatch(/"(ratingValue|position)"/);
});
