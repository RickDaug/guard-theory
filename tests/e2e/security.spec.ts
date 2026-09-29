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

/**
 * `script-src` has no 'unsafe-inline' (S3-1). Static pages list a hash for
 * each inline script Next wrote into them; per-request pages carry a nonce.
 * Checked on the served bytes and in a real browser, on both kinds of page
 * and on a 404, which is served from the build at a path no page claims.
 */
const CSP_ROUTES = [
  "/",
  "/technique/no-gi-systems/inside-position",
  "/journal/how-a-bjj-rash-guard-should-fit",
  "/first-edition",
  "/shop",
  "/shop/theory-01-long-sleeve",
  "/cart",
  "/order/confirmed",
  "/no-such-page-csp-check",
];

function scriptSrcOf(policy: string): string[] {
  const directive = policy
    .split(";")
    .map((d) => d.trim().split(/\s+/))
    .find(([name]) => name === "script-src");
  return directive ? directive.slice(1) : [];
}

test("script-src forbids inline script, and every inline script is allowed by hash or nonce", async ({
  request,
}) => {
  const { createHash } = await import("node:crypto");

  for (const path of CSP_ROUTES) {
    const response = await request.get(path);
    const policies = (response.headers()["content-security-policy"] ?? "")
      .split(/\n|,(?=\s*default-src)/)
      .filter(Boolean);
    expect(policies, `${path}: exactly one CSP`).toHaveLength(1);

    const sources = scriptSrcOf(policies[0]!);
    expect(sources, `${path}: script-src`).toContain("'self'");
    expect(sources, `${path}: script-src`).not.toContain("'unsafe-inline'");
    expect(sources, `${path}: script-src`).not.toContain("'unsafe-eval'");

    const nonce = sources.find((s) => s.startsWith("'nonce-"))?.slice(7, -1);
    const html = await response.text();
    let inline = 0;

    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attributes = match[1] ?? "";
      if (/\bsrc\s*=/.test(attributes)) continue;
      if (/type="application\/ld\+json"/.test(attributes)) continue;
      inline += 1;

      const hash = `'sha256-${createHash("sha256").update(match[2] ?? "").digest("base64")}'`;
      const nonced = nonce !== undefined && attributes.includes(`nonce="${nonce}"`);
      expect(
        nonced || sources.includes(hash),
        `${path}: inline script ${hash} is allowed by neither hash nor nonce`,
      ).toBe(true);
    }

    // A page with no inline script would make this test pass vacuously.
    expect(inline, `${path}: expected Next's inline scripts`).toBeGreaterThan(0);
  }
});

test("no page reports a CSP violation in the browser", async ({ page }) => {
  for (const path of CSP_ROUTES) {
    await page.addInitScript(() => {
      (window as unknown as { __csp: string[] }).__csp = [];
      document.addEventListener("securitypolicyviolation", (event) => {
        (window as unknown as { __csp: string[] }).__csp.push(
          `${event.violatedDirective} ${event.blockedURI}`,
        );
      });
    });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const violations = await page.evaluate(
      () => (window as unknown as { __csp: string[] }).__csp,
    );
    expect(violations, path).toEqual([]);
  }
});
