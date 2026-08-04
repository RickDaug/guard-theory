import { expect, test } from "@playwright/test";

/**
 * Security headers, asserted on a real response rather than read back from the
 * config that is supposed to produce them.
 */

test("every page sends the security headers", async ({ request }) => {
  for (const path of ["/", "/first-edition", "/journal", "/shop"]) {
    const response = await request.get(path);
    const headers = response.headers();

    expect(headers["content-security-policy"], `${path} has no CSP`).toBeTruthy();
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["strict-transport-security"]).toContain("max-age=");

    // Not a security control on its own, but there is no reason to advertise.
    expect(headers["x-powered-by"]).toBeUndefined();
  }
});

test("the CSP forbids the things it claims to", async ({ request }) => {
  const csp = (await request.get("/")).headers()["content-security-policy"] ?? "";

  // Directives that must be exactly this strict. If one of these loosens, it
  // should be a deliberate edit to this test, not a silent config change.
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("form-action 'self'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("font-src 'self'");
  expect(csp).toContain("connect-src 'self'");

  // No third-party origin may appear anywhere in the policy. The site loads
  // nothing it does not serve itself, and this is what keeps it that way.
  expect(csp).not.toMatch(/https?:\/\/(?!127\.0\.0\.1|localhost)/);
});

test("no third-party request is made on any page", async ({ page }) => {
  const foreign: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") {
      foreign.push(request.url());
    }
  });

  for (const path of ["/", "/journal/how-a-bjj-rash-guard-should-fit", "/shop"]) {
    await page.goto(path, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
  }

  expect(foreign, `third-party requests:\n${foreign.join("\n")}`).toEqual([]);
});
