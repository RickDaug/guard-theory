import { expect, test } from "@playwright/test";

/**
 * The Crew Portal's door.
 *
 * The property that matters most here is that a signed-out visitor gets a
 * REDIRECT, not a 401. That is not only politeness: links.spec.ts fails on any
 * crawled page returning 400 or above, and console.spec.ts fails on any
 * response of 400 or above on a listed route. A 401 on a browser navigation
 * would break both — and a redirect is the correct answer for a navigation
 * anyway, which is usually the sign that a test is right rather than in the way.
 */

test.describe("portal access", () => {
  test("a signed-out visitor is redirected to sign in, never refused", async ({ request }) => {
    for (const path of ["/crew", "/crew/products", "/crew/categories"]) {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(
        response.status(),
        `${path} must redirect a signed-out visitor, not return an error`,
      ).toBeGreaterThanOrEqual(300);
      expect(response.status()).toBeLessThan(400);

      expect(response.headers()["location"] ?? "", `${path} must send them to sign in`).toContain(
        "/crew/sign-in",
      );
    }
  });

  test("remembers where they were heading", async ({ request }) => {
    const response = await request.get("/crew/products", { maxRedirects: 0 });
    expect(response.headers()["location"] ?? "").toContain("next=");
  });

  test("the sign-in page is reachable and is not indexable", async ({ page }) => {
    await page.goto("/crew/sign-in", { waitUntil: "load" });

    await expect(page.getByRole("heading", { level: 1, name: /sign in/i })).toBeVisible();

    const robots = await page.locator('meta[name="robots"]').first().getAttribute("content");
    expect(robots ?? "", "the portal must never be indexable").toContain("noindex");
  });

  test("the portal is not in the sitemap", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/crew");
  });

  test("the portal is not linked from the public site", async ({ page }) => {
    // Reachability is what keeps it out of the links crawl, so it is asserted
    // rather than assumed.
    for (const path of ["/", "/shop", "/journal"]) {
      await page.goto(path, { waitUntil: "load" });
      expect(await page.locator('a[href*="/crew"]').count(), `${path} links to the portal`).toBe(0);
    }
  });

  test("refuses to sign anyone in when it is not configured", async ({ page }) => {
    // No PORTAL_PASSWORD_HASH in this environment. It must fail closed and say
    // so, rather than letting an empty password through.
    await page.goto("/crew/sign-in", { waitUntil: "load" });

    await page.getByLabel(/password/i).fill("anything at all");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    // Scoped to the form: Next renders its own empty role="alert" route
    // announcer at the document root, which an unscoped query also matches.
    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/not configured|not right/i);

    // The summary takes focus, so a screen-reader user lands on the reason.
    await expect(alert).toBeFocused();

    // Still on the sign-in page, with no session cookie handed out.
    expect(page.url()).toContain("/crew/sign-in");
    const cookies = await page.context().cookies();
    expect(cookies.find((c) => c.name === "gt_crew")).toBeUndefined();
  });

  /**
   * The signing-in path itself.
   *
   * Runs only where a password and a database exist — CI, or a local run with
   * `npm run db:local`. It does not silently pass when they do not: it skips,
   * loudly, because a sign-in test that reports green without ever signing in
   * is the guard that has only ever been green.
   */
  const configured =
    Boolean(process.env.PORTAL_PASSWORD_HASH) &&
    Boolean(process.env.PORTAL_TEST_PASSWORD) &&
    Boolean(process.env.DATABASE_URL);

  test("the right password opens the door, the wrong one does not", async ({ page }) => {
    test.skip(!configured, "no PORTAL_PASSWORD_HASH / PORTAL_TEST_PASSWORD / DATABASE_URL");

    await page.goto("/crew/sign-in", { waitUntil: "load" });
    await page.getByLabel(/password/i).fill("definitely-not-the-password");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    const alert = page.locator("form").getByRole("alert");
    await expect(alert).toContainText(/not right/i);
    expect((await page.context().cookies()).find((c) => c.name === "gt_crew")).toBeUndefined();

    await page.getByLabel(/password/i).fill(process.env.PORTAL_TEST_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await page.waitForURL(/\/crew(\?|$)/);
    await expect(page.getByRole("heading", { level: 1, name: /today/i })).toBeVisible();

    const cookie = (await page.context().cookies()).find((c) => c.name === "gt_crew");
    expect(cookie, "a session cookie must be set").toBeTruthy();
    expect(cookie!.httpOnly, "the session cookie must be httpOnly").toBe(true);
    expect(cookie!.sameSite).toBe("Lax");

    // And the pages behind the door now open.
    await page.goto("/crew/products", { waitUntil: "load" });
    await expect(page.getByRole("heading", { level: 1, name: /products/i })).toBeVisible();
  });
});
