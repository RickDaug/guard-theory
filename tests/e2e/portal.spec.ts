import { readFileSync } from "node:fs";
import path from "node:path";
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

/** `gt_crew` in development, `__Host-gt_crew` under `next start`. */
const SESSION_COOKIE = /^(__Host-)?gt_crew$/;

test.describe("portal access", () => {
  test("a signed-out visitor is redirected to sign in, never refused", async ({ request }) => {
    for (const path of [
      "/crew",
      "/crew/products",
      "/crew/categories",
      "/crew/orders",
      "/crew/list",
      "/crew/learn",
    ]) {
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

  test("the sign-in page tells a stranger nothing about the shop", async ({ page }) => {
    // It shares the portal layout, which used to show everyone the Stripe-mode
    // banner and the portal's navigation.
    await page.goto("/crew/sign-in", { waitUntil: "load" });

    await expect(page.getByRole("navigation", { name: "Portal" })).toHaveCount(0);
    await expect(page.getByText(/test mode|stripe/i)).toHaveCount(0);
    // "First Edition" is also a link in the public header, so it proves nothing
    // here; these two exist only in the portal's navigation.
    for (const label of ["Orders", "Categories"]) {
      await expect(page.getByRole("link", { name: label, exact: true })).toHaveCount(0);
    }
  });

  test("a hostile `next` never reaches the sign-in form", async ({ page }) => {
    for (const next of ["/\\evil.example", "/%09/evil.example", "//evil.example", "/shop"]) {
      await page.goto(`/crew/sign-in?next=${next}`, { waitUntil: "load" });
      await expect(page.locator('input[name="next"]')).toHaveCount(0);
    }

    await page.goto("/crew/sign-in?next=/crew/orders", { waitUntil: "load" });
    await expect(page.locator('input[name="next"]')).toHaveValue("/crew/orders");
  });

  test("a portal action POSTed without a session does nothing", async ({ request }) => {
    // Server actions are plain POSTs. Their ids are in the build output, so a
    // stranger can find them; what must hold is that calling one gets nowhere.
    const manifest = JSON.parse(
      readFileSync(path.join(process.cwd(), ".next", "server", "server-reference-manifest.json"), "utf8"),
    ) as { node: Record<string, { workers: Record<string, { filename?: string }> }> };

    // The portal layout's sign-out form puts signIn and signOut on this page
    // too. Neither needs a session — signing out without one is harmless — so
    // they are not what this test is about; the order actions are.
    const ids = Object.entries(manifest.node)
      .filter(([, entry]) =>
        Object.entries(entry.workers).some(
          ([worker, meta]) =>
            worker.includes("/crew/orders") && !meta.filename?.includes("crew/sign-in/"),
        ),
      )
      .map(([id]) => id);

    expect(ids.length, "no portal action ids found in the build manifest").toBeGreaterThan(0);

    for (const id of ids) {
      // No cookie: the proxy turns it away before the action is reached.
      const bare = await request.post("/crew/orders", {
        headers: { "Next-Action": id, "Content-Type": "text/plain;charset=UTF-8" },
        data: "[]",
        maxRedirects: 0,
      });
      expect(bare.status(), `${id} without a cookie`).toBeGreaterThanOrEqual(300);
      expect(bare.status()).toBeLessThan(400);
      expect(bare.headers()["location"] ?? "").toContain("/crew/sign-in");

      // A made-up cookie gets past the proxy, which only checks that one is
      // present — and then the action's own requireSession() refuses it.
      const forged = await request.post("/crew/orders", {
        headers: {
          "Next-Action": id,
          "Content-Type": "text/plain;charset=UTF-8",
          Cookie: "__Host-gt_crew=forged; gt_crew=forged",
          Origin: "http://127.0.0.1:3100",
        },
        data: "[]",
        maxRedirects: 0,
      });
      // Next answers a thrown action with an error row in the flight payload —
      // `1:E{"digest":…}` — and the status is 500 or 200 depending on how far the
      // stream had got, so the row is what is asserted. It is NotAuthorised,
      // thrown by requireSession() before the action reads its input.
      const body = await forged.text();
      expect(body, `${id} with a forged cookie must be refused`).toMatch(/^1:E\{"digest"/m);
    }
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
    expect(cookies.find((c) => SESSION_COOKIE.test(c.name))).toBeUndefined();
  });

  // Signing in, and everything that needs a session, is in portal-session.spec.ts:
  // one serial block, because signing in ends every other session.
});
