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

  test("every page has exactly one h1", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route.path, { waitUntil: "load" });
      await expect(
        page.locator("h1"),
        `${route.path} should have exactly one h1`,
      ).toHaveCount(1);
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
