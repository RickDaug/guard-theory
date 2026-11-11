import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import nextConfig from "../../next.config.ts";
import { isIndexable } from "../../src/lib/site.ts";

describe("isIndexable", () => {
  it("is opt-in: nothing but an explicit true allows it", () => {
    for (const allowIndexing of [undefined, "", "false", "TRUE", "1", "yes"]) {
      assert.equal(isIndexable({ allowIndexing, vercelEnv: undefined }), false);
      assert.equal(isIndexable({ allowIndexing, vercelEnv: "production" }), false);
    }
  });

  it("allows production, and a host that is not Vercel, when opted in", () => {
    assert.equal(isIndexable({ allowIndexing: "true", vercelEnv: "production" }), true);
    assert.equal(isIndexable({ allowIndexing: "true", vercelEnv: undefined }), true);
    assert.equal(isIndexable({ allowIndexing: "true", vercelEnv: "" }), true);
  });

  it("refuses every other Vercel environment even when opted in", () => {
    for (const vercelEnv of ["preview", "development", "staging"]) {
      assert.equal(
        isIndexable({ allowIndexing: "true", vercelEnv }),
        false,
        `a ${vercelEnv} deployment with the opt-in ticked would be indexable`,
      );
    }
  });
});

describe("the X-Robots-Tag header", () => {
  const original = process.env.VERCEL_ENV;
  afterEach(() => {
    if (original === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = original;
  });

  async function robotsHeader(vercelEnv: string | undefined) {
    if (vercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = vercelEnv;

    const rules = (await nextConfig.headers?.()) ?? [];
    assert.equal(rules.length, 1);
    const rule = rules[0]!;
    assert.equal(rule.source, "/:path*");
    // Whatever else happens, the security headers are still there.
    assert.ok(rule.headers.some((h) => h.key === "Content-Security-Policy"));
    return rule.headers.find((h) => h.key === "X-Robots-Tag")?.value;
  }

  it("is sent on a preview", async () => {
    assert.equal(await robotsHeader("preview"), "noindex");
    assert.equal(await robotsHeader("development"), "noindex");
  });

  it("is not sent in production, or off Vercel", async () => {
    assert.equal(await robotsHeader("production"), undefined);
    assert.equal(await robotsHeader(undefined), undefined);
  });
});
