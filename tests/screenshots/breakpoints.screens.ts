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

      await page.screenshot({
        path: path.join(OUT, breakpoint.name, `${route.name}.png`),
        fullPage: true,
      });
    });
  }
}
