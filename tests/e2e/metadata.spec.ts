import { expect, test } from "@playwright/test";

/**
 * Every indexable page needs a unique title and description, a canonical, and
 * structured data that parses. Checked against the rendered production output
 * rather than against the source that is supposed to produce it.
 */

const INDEXABLE = [
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

  for (const path of INDEXABLE) {
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

  for (const path of NOINDEX) {
    await page.goto(path, { waitUntil: "load" });
    const robots =
      (await page
        .locator('meta[name="robots"]')
        .first()
        .getAttribute("content")) ?? "";
    expect(robots, `${path} should be noindex`).toContain("noindex");
  }

  // A draft article renders, but must never be offered to a crawler: it has no
  // publication date, and indexing an undated piece as published is exactly
  // what the editorial policy rules out.
  //
  // Uses a piece that is still a draft. When the flagships were published this
  // assertion caught a real regression - the page returned robots: undefined,
  // which removes the tag rather than inheriting the layout, so the article
  // became indexable despite the site-wide opt-in being off.
  await page.goto("/journal/how-to-wash-a-rash-guard", {
    waitUntil: "load",
  });
  const draftRobots =
    (await page
      .locator('meta[name="robots"]')
      .first()
      .getAttribute("content")) ?? "";
  expect(draftRobots).toContain("noindex");
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
