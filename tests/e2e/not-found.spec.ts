import { expect, test } from "@playwright/test";

/**
 * A wrong address gets a page, not a shell.
 *
 * Every dynamic route used to answer an unknown slug with
 * `<html id="__next_error__">`: no `lang`, an empty body, and the 404 content
 * only after hydration. With JavaScript off that is a blank screen, and with it
 * on it is still a document that does not state its language (SC 3.1.1).
 *
 * So this runs with JavaScript disabled, which is the only configuration in
 * which "the content is in the HTML" and "the content appeared eventually" are
 * different results.
 */
test.use({ javaScriptEnabled: false });

const BOGUS = [
  // One per dynamic route in src/app. A new dynamic route belongs here.
  "/journal/no-such-article",
  "/journal/category/no-such-category",
  "/shop/no-such-product",
  "/figures/no-such-person",
  "/technique/no-such-category",
  "/technique/no-such-category/no-such-entry",
  // A real entry under the wrong category is also not an address.
  "/technique/closed-guard/inside-position",
  "/policies/no-such-policy",
  // And a path no route matches at all, which always worked — the control.
  "/no-such-page",
];

for (const path of BOGUS) {
  test(`${path} is a whole 404 document without JavaScript`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: "load" });
    expect(response?.status(), `${path} should be a 404`).toBe(404);

    const html = page.locator("html");
    expect(
      await html.getAttribute("lang"),
      `${path} serves a document that does not state its language`,
    ).toMatch(/^en(-GB)?$/);
    expect(
      await html.getAttribute("id"),
      `${path} served Next's error shell instead of the not-found page`,
    ).not.toBe("__next_error__");

    await expect(
      page.locator("main h1"),
      `${path} has no heading in the served HTML`,
    ).toContainText("does not exist");

    // A way out that is in the markup, not painted in later.
    await expect(page.locator('main a[href="/"]')).toBeVisible();

    expect(await page.title(), `${path} is titled as if it were another page`).toMatch(
      /not found/i,
    );
  });
}
