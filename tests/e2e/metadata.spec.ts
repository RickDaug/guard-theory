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

const NOINDEX = [
  "/design-system",
  "/search",
  "/maintenance",
  "/unsubscribe",
  "/cart",
  "/order/confirmed",
];

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

  // Commerce schema must be TRUE, not absent.
  //
  // This test used to assert that no Product or Offer appeared anywhere,
  // because there was no price and no stock to describe. Prices are now entered
  // by the owner (docs/owner-decisions.md item 4), so the rule it protects —
  // "no Product/Offer schema without truthful data" — is asserted directly
  // instead: where an Offer appears it must carry a real price, a real currency
  // and an availability, and where there is no price no Offer may appear.
  //
  // AggregateRating and Review stay forbidden outright. There are still no
  // reviews, and there is no owner decision pending that would create any.
  for (const path of ["/shop", "/shop/theory-01-long-sleeve", "/first-edition"]) {
    await page.goto(path, { waitUntil: "load" });
    const blocks = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();

    for (const block of blocks) {
      expect(block, `${path} invents a rating or a review`).not.toMatch(
        /"@type"\s*:\s*"(AggregateRating|Review)"/,
      );

      const parsed: unknown = JSON.parse(block);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of nodes) {
        const record = node as Record<string, unknown>;

        if (record["@type"] !== "Product") {
          continue;
        }

        const offer = record.offers as Record<string, unknown> | undefined;

        expect(offer, `${path} emits a Product with no Offer`).toBeTruthy();

        // A price that is absent, empty, zero or unparseable is exactly the
        // invented value this rule exists to prevent.
        const price = Number(offer?.price);
        expect(
          Number.isFinite(price) && price > 0,
          `${path} emits an Offer with a price of "${String(offer?.price)}"`,
        ).toBe(true);

        expect(offer?.priceCurrency, `${path} emits an Offer with no currency`).toMatch(
          /^[A-Z]{3}$/,
        );

        expect(
          String(offer?.availability ?? ""),
          `${path} emits an Offer with no availability`,
        ).toMatch(/schema\.org\/(InStock|OutOfStock)$/);
      }
    }
  }

  // The waitlist is not a PreOrder, and never becomes one.
  await page.goto("/first-edition", { waitUntil: "load" });
  for (const block of await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()) {
    expect(block, "the waitlist page describes itself as a purchasable thing").not.toMatch(
      /"@type"\s*:\s*"(Product|Offer)"/,
    );
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

/**
 * A link preview is either right the first time somebody pastes the URL or it
 * is wrong in public, in somebody else's timeline, cached.
 *
 * This test exists because the site shipped with `twitter:card =
 * summary_large_image` on every page and an `og:image` on exactly one of them.
 * Next's `opengraph-image` file convention reached `/` and no nested route, so
 * the front page shared with a card and every article and product page — the
 * pages anybody would actually share — asked each platform for a large image
 * card and then handed it nothing. Nothing in the suite looked, because a
 * missing tag is not an error anywhere: the page renders, the build passes, the
 * card is just blank.
 *
 * So this asserts the tag exists AND that what it points at is really there,
 * really an image, and really the size the tags claim. A URL in a meta tag is a
 * promise to a crawler, and an unfetched promise is what produced the bug.
 */
test("every page shares with a card that actually resolves", async ({ page, request }) => {
  test.setTimeout(120_000);

  const seen = new Map<string, number>();

  for (const path of SAMPLED) {
    await page.goto(path, { waitUntil: "load" });

    const image = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content");
    const twitterImage = await page
      .locator('meta[name="twitter:image"]')
      .first()
      .getAttribute("content");
    const card = await page
      .locator('meta[name="twitter:card"]')
      .first()
      .getAttribute("content");

    expect(image, `${path} has no og:image — it would share as a bare link`).toBeTruthy();
    expect(
      twitterImage,
      `${path} declares twitter:card "${card}" and supplies no twitter:image`,
    ).toBeTruthy();
    // Crawlers do not resolve relative URLs, so the tag has to carry an
    // absolute one. Its ORIGIN is the deployment's own, which under test is
    // whatever NEXT_PUBLIC_SITE_URL was at build time and not the port this
    // server happens to be on — so the origin is what we assert, and the path
    // is what we fetch.
    expect(image, `${path} og:image must be absolute`).toMatch(/^https?:\/\//);
    const imagePath = new URL(image!).pathname;

    // Fetch it once per distinct URL rather than once per route.
    if (!seen.has(imagePath)) {
      const response = await request.get(imagePath);
      expect(response.status(), `${imagePath} is referenced but does not resolve`).toBe(200);
      expect(
        response.headers()["content-type"],
        `${imagePath} is not served as an image`,
      ).toContain("image/");
      seen.set(imagePath, (await response.body()).byteLength);
    }
    expect(seen.get(imagePath), `${imagePath} is empty`).toBeGreaterThan(1000);

    // The dimensions are a claim made to the platform doing the cropping.
    const width = await page
      .locator('meta[property="og:image:width"]')
      .first()
      .getAttribute("content");
    const height = await page
      .locator('meta[property="og:image:height"]')
      .first()
      .getAttribute("content");
    expect(width, `${path} does not state og:image:width`).toBe("1200");
    expect(height, `${path} does not state og:image:height`).toBe("630");

    const alt = await page
      .locator('meta[property="og:image:alt"]')
      .first()
      .getAttribute("content");
    expect(alt?.length ?? 0, `${path} has no og:image:alt`).toBeGreaterThan(20);
  }
});

/**
 * The unit test asserts description length on the content types. It cannot see
 * the index and static pages — /, /about, /faq, /contact, /manifesto and the
 * section indexes set their description inline in the page file — and those are
 * exactly where the thin ones were: /journal/category/guard-systems at 40
 * characters, /contact at 79, the home page at 88.
 *
 * This checks the rendered output instead, so every route is covered by one of
 * the two regardless of where its description comes from.
 *
 * Entities are decoded before measuring. React writes an apostrophe as &#x27;,
 * six characters for one, and measuring the raw attribute reports a sentence
 * ten characters longer than the one a crawler reads — which is how a passing
 * route gets flagged and a real one hides.
 */
test("every page's description is the length search can use", async ({ page }) => {
  test.setTimeout(120_000);

  const FLOOR = 110;
  const LIMIT = 160;
  const decode = (v: string) =>
    v
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&");

  for (const path of SAMPLED) {
    await page.goto(path, { waitUntil: "load" });

    const raw =
      (await page
        .locator('meta[name="description"]')
        .first()
        .getAttribute("content")) ?? "";
    const description = decode(raw);

    expect(
      description.length,
      `${path} has a ${description.length}-character description, over the ${LIMIT} ` +
        `a search snippet shows`,
    ).toBeLessThanOrEqual(LIMIT);
    expect(
      description.length,
      `${path} has a ${description.length}-character description, under the ${FLOOR} ` +
        `it takes to describe a page — Google will rewrite it into something we did not write`,
    ).toBeGreaterThanOrEqual(FLOOR);
  }
});

/**
 * The date a reader sees must be the date the crawler is given.
 *
 * `/policies/editorial` promises exactly this: "An article carries the date it
 * was genuinely published, and that is the date shown to you and to search
 * engines alike." It was not true. A date-only ISO string parses as UTC
 * midnight, and formatting it in the server's local zone renders the previous
 * day anywhere west of Greenwich — so every article displayed a date one day
 * earlier than the one in its own `dateTime` attribute and its structured data.
 *
 * Nothing caught it because both dates were internally consistent: the stored
 * value was right, the machine-readable attribute was right, and only the
 * rendered text was wrong. It is the kind of defect that is invisible until you
 * compare the two things nobody thinks to compare.
 */
test("the published date shown matches the date published", async ({ page }) => {
  test.setTimeout(120_000);

  const published = ARTICLES.filter(isPublished);
  expect(published.length, "no published articles to check").toBeGreaterThan(0);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  for (const article of published.slice(0, 6)) {
    await page.goto(`/journal/${article.slug}`, { waitUntil: "load" });

    const time = page.locator("time[dateTime], time[datetime]").first();
    const attribute =
      (await time.getAttribute("datetime")) ?? (await time.getAttribute("dateTime"));
    const shown = ((await time.textContent()) ?? "").trim();

    expect(attribute, `${article.slug} renders no machine-readable date`).toBe(
      article.publishedAt,
    );

    // Build the expected human date from the stored string directly, with no
    // Date parsing — parsing is what caused the bug.
    const [year, month, day] = article.publishedAt.split("-");
    const expected = `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;

    expect(
      shown,
      `${article.slug} shows "${shown}" but its publishedAt is ${article.publishedAt} — ` +
        `the date a reader sees and the date a crawler is given must be the same`,
    ).toBe(expected);
  }
});
