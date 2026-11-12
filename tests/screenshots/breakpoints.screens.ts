import { test } from "@playwright/test";
import path from "node:path";

/**
 * Capture every representative route at the four breakpoints the design has to
 * hold at, and commit the results to docs/screenshots/.
 *
 * These are review artefacts, not visual-regression assertions — they exist so
 * a human can see what the site actually looks like across sizes without
 * standing up the app.
 */

const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 820, height: 1180 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
] as const;

const ROUTES = [
  { name: "home", path: "/" },
  { name: "design-system", path: "/design-system" },
  { name: "technique-index", path: "/technique" },
  { name: "technique-entry", path: "/technique/no-gi-systems/inside-position" },
  { name: "first-edition", path: "/first-edition" },
  { name: "shop", path: "/shop" },
  { name: "product", path: "/shop/theory-01-long-sleeve" },
  { name: "journal", path: "/journal" },
  { name: "article", path: "/journal/how-a-bjj-rash-guard-should-fit" },
  { name: "figures", path: "/figures" },
  { name: "figure", path: "/figures/oswaldo-fadda" },
] as const;

const OUT = path.join("docs", "screenshots");

for (const breakpoint of BREAKPOINTS) {
  for (const route of ROUTES) {
    test(`${route.name} at ${breakpoint.name}`, async ({ page }) => {
      await page.setViewportSize({
        width: breakpoint.width,
        height: breakpoint.height,
      });
      await page.goto(route.path, { waitUntil: "load" });

      // Fonts settle after first paint; without this the capture can catch a
      // fallback face and misrepresent the type. networkidle is not used —
      // it does not settle reliably with the App Router's streaming responses.
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      // Facelift 2026-11: band children use the scroll-driven `reveal`
      // animation (animation-timeline: view()), so a full-page capture taken
      // at scroll-top would record everything below the fold at opacity 0.
      // Sizing the viewport to the document puts every band "in view" and the
      // animations complete; the capture then shows the page as a reader
      // who scrolled it would see it.
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.setViewportSize({ width: breakpoint.width, height: Math.min(height, 16000) });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 500))));

      await page.screenshot({
        path: path.join(OUT, breakpoint.name, `${route.name}.png`),
        fullPage: true,
      });
    });
  }
}
