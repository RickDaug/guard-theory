import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility checks across every representative route.
 *
 * Automated testing catches roughly a third of real accessibility problems, so
 * this is a floor rather than a certificate. The things it cannot check —
 * whether a diagram's key actually describes the diagram, whether an error
 * message tells you what to do — are handled by how the components are built
 * and are asserted separately below.
 */

const ROUTES = [
  { name: "home", path: "/" },
  { name: "design system", path: "/design-system" },
  { name: "technique index", path: "/technique" },
  { name: "technique category", path: "/technique/half-guard" },
  { name: "technique entry", path: "/technique/no-gi-systems/inside-position" },
  { name: "journal index", path: "/journal" },
  { name: "journal category", path: "/journal/category/bjj-history" },
  { name: "article", path: "/journal/how-a-bjj-rash-guard-should-fit" },
  { name: "shop", path: "/shop" },
  { name: "product", path: "/shop/theory-01-long-sleeve" },
  { name: "first edition", path: "/first-edition" },
  { name: "contact", path: "/contact" },
  { name: "lookbook", path: "/lookbook" },
  { name: "figures", path: "/figures" },
  { name: "about", path: "/about" },
  { name: "manifesto", path: "/manifesto" },
  { name: "size and fit", path: "/size-and-fit" },
  { name: "faq", path: "/faq" },
  { name: "search", path: "/search" },
  { name: "privacy policy", path: "/policies/privacy" },
  { name: "cart", path: "/cart" },
  { name: "order confirmed", path: "/order/confirmed" },
  { name: "404", path: "/this-route-does-not-exist" },
] as const;

for (const route of ROUTES) {
  test(`${route.name} has no WCAG 2.2 A/AA violations`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "load" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    // Named in the failure output, so a regression says which rule broke where
    // rather than only that the count changed.
    const summary = results.violations.map(
      (violation) =>
        `${violation.id} (${violation.impact}) on ${violation.nodes.length} node(s): ${violation.help}`,
    );

    expect(summary, `${route.path}\n${summary.join("\n")}`).toEqual([]);
  });
}

test.describe("keyboard and structure", () => {
  test("the skip link is the first thing you reach and it works", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeVisible();
  });

  test("every page has exactly one h1, and it is the first heading", async ({
    page,
  }) => {
    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: "load" });
      await expect(
        page.locator("h1"),
        `${route.path} should have exactly one h1`,
      ).toHaveCount(1);

      // axe's heading-order rule is tagged best-practice, so the tag selection
      // above never runs it. An article page once opened with an h2 "Contents"
      // before its own title and the suite reported a clean pass.
      const first = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .first()
        .evaluate((el) => el.tagName.toLowerCase());

      expect(first, `${route.path} starts with <${first}> before its h1`).toBe(
        "h1",
      );
    }
  });

  test("notation diagrams are hidden from assistive tech and keyed by real controls", async ({
    page,
  }) => {
    await page.goto("/");

    // The drawing itself is decorative...
    await expect(page.locator("figure svg[aria-hidden='true']")).toHaveCount(1);

    // ...and its content is carried by buttons in the tab order.
    const keys = page.getByRole("button", { name: /open guard/i });
    await expect(keys).toHaveCount(1);

    await keys.focus();
    await expect(page.getByText(/legs unlocked/i)).toBeVisible();

    // The figure's argument is the relationships between positions. If those
    // exist only as lines in an aria-hidden drawing, a screen-reader user gets
    // five isolated definitions and no system — from a plate titled "the guard,
    // as a system". The earlier version of this test asserted only that a
    // definition appeared, and passed while the meaning was missing.
    await expect(page.getByText(/connects to/i)).toBeVisible();
    await expect(page.getByText(/connects to.*half guard/i)).toBeVisible();
  });

  test("key labels are not run together", async ({ page }) => {
    await page.goto("/");

    // The key buttons are flex containers, so a whitespace-only JSX child
    // generates no flex item and silently vanishes — which rendered
    // "01Closed guard" across every page and every breakpoint.
    //
    // The separation is visual, not textual: the code span is aria-hidden, so
    // the accessible name is correctly just "Closed guard", and textContent is
    // "01Closed guard" whether or not the layout is right. The only thing that
    // actually distinguishes the two is the computed gap, so that is what is
    // asserted.
    const gaps = await page.locator("figcaption button").evaluateAll((nodes) =>
      nodes.map((node) => {
        const style = getComputedStyle(node);
        return {
          text: (node.textContent ?? "").slice(0, 24),
          display: style.display,
          columnGap: Number.parseFloat(style.columnGap) || 0,
        };
      }),
    );

    expect(gaps.length, "no key buttons found").toBeGreaterThan(0);

    const collapsed = gaps.filter(
      (g) => g.display.includes("flex") && g.columnGap < 2,
    );
    expect(
      collapsed,
      `key labels whose code and name would run together:\n${collapsed
        .map((c) => c.text)
        .join("\n")}`,
    ).toEqual([]);
  });

  test("reduced motion is honoured", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");

    const duration = await page
      .getByRole("link", { name: /join the first edition list/i })
      .evaluate((el) => getComputedStyle(el).transitionDuration);

    // Collapsed to an instant state change, not merely made faster.
    expect(Number.parseFloat(duration)).toBeLessThan(0.05);
    await context.close();
  });
});
