import { expect, test } from "@playwright/test";

/**
 * Crawls the site from the home page and asserts that every internal link
 * resolves. A broken internal link is the cheapest possible defect to ship and
 * one of the most damaging, so it is checked rather than assumed.
 *
 * External links are collected and reported but not requested — a third party
 * being down is not a defect in this site, and a test that fails because
 * somebody else's server is slow is a test people learn to ignore.
 */

const MAX_PAGES = 120;

test("every internal link resolves", async ({ page, request, baseURL }) => {
  test.setTimeout(180_000);

  const origin = new URL(baseURL ?? "http://127.0.0.1:3100").origin;

  const queue: string[] = ["/"];
  const seen = new Set<string>();
  const broken: string[] = [];
  const external = new Set<string>();

  while (queue.length > 0 && seen.size < MAX_PAGES) {
    const path = queue.shift();
    if (!path || seen.has(path)) continue;
    seen.add(path);

    const response = await page.goto(path, { waitUntil: "load" });
    const status = response?.status() ?? 0;

    if (status >= 400) {
      broken.push(`${path} returned ${status}`);
      continue;
    }

    const hrefs = await page.$$eval("a[href]", (anchors) =>
      anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
    );

    for (const href of hrefs) {
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;

      const resolved = new URL(href, `${origin}${path}`);

      if (resolved.origin !== origin) {
        external.add(resolved.toString());
        continue;
      }

      const next = resolved.pathname;
      if (!seen.has(next) && !queue.includes(next)) queue.push(next);
    }
  }

  // Anything queued but never reached because we hit the page cap would be a
  // silent gap, so the cap is asserted rather than left implicit.
  expect(
    queue.length,
    `crawl hit the ${MAX_PAGES}-page cap with ${queue.length} still queued`,
  ).toBe(0);

  // Also check the routes that nothing links to yet but which must still work.
  for (const orphan of [
    "/maintenance",
    "/unsubscribe",
    "/email-confirmed",
    "/form-success",
    "/form-error",
    "/product-unavailable",
    // Reachable only once there is something in the cart, so the crawl never
    // sees them. They still have to answer.
    "/cart",
    "/order/confirmed",
    "/sitemap.xml",
    "/robots.txt",
  ]) {
    const response = await request.get(orphan);
    if (!response.ok()) {
      broken.push(`${orphan} returned ${response.status()}`);
    }
  }

  expect(broken, broken.join("\n")).toEqual([]);

  console.log(
    `crawled ${seen.size} internal pages, found ${external.size} external link(s)`,
  );
});
