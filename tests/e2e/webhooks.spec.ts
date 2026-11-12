import { expect, test } from "@playwright/test";

/**
 * The three public endpoints.
 *
 * These are the only routes that sit outside portal authentication, because
 * Stripe, Shippo and Vercel's scheduler have to reach them. What is asserted
 * here is that they refuse everything they should.
 */

test.describe("the Stripe webhook", () => {
  test("refuses a request with no signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      data: { type: "checkout.session.completed" },
    });

    // 400 for a missing signature, or 500 when Stripe is not configured at all
    // in this environment. Either way it must not be 200 — a 200 would mean an
    // unverified body reached the handler.
    expect(response.status()).not.toBe(200);
    expect([400, 500]).toContain(response.status());
  });

  test("refuses a forged signature", async ({ request }) => {
    const response = await request.post("/api/webhooks/stripe", {
      headers: { "stripe-signature": "t=1,v1=deadbeef" },
      data: { type: "checkout.session.completed" },
    });

    expect(response.status()).not.toBe(200);
  });
});

test.describe("the Shippo webhook", () => {
  test("a wrong secret gets a 404, not a 401", async ({ request }) => {
    // 401 would confirm that the endpoint exists and that a correct secret
    // would work. 404 says nothing at all.
    const response = await request.post("/api/webhooks/shippo/not-the-secret", {
      data: { event: "track_updated" },
    });

    expect(response.status()).toBe(404);
  });

  test("a GET or HEAD gets the same 404, not a 405 that names the method", async ({ request }) => {
    // The live site answered GET /api/webhooks/shippo/<anything> with 405 —
    // Next's own answer for an unexported method — which confirmed the path
    // existed to anyone who asked. Now every method without the secret reads
    // as a missing route.
    for (const method of ["get", "head"] as const) {
      const response = await request[method]("/api/webhooks/shippo/not-the-secret");
      expect(response.status(), method).toBe(404);
    }
  });

  test("is not reachable without a secret segment at all", async ({ request }) => {
    const response = await request.post("/api/webhooks/shippo", {
      data: { event: "track_updated" },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("the scheduled reconciler", () => {
  // 401 here, where Shippo's gets a 404: this path is in vercel.json in a
  // public repository, so there is nothing for a 404 to conceal, and a 401 in
  // Vercel's cron log says what is wrong where a 404 reads as a missing route.
  test("refuses a caller without the cron secret, and is never cached", async ({ request }) => {
    const attempts: Record<string, string>[] = [
      {},
      { authorization: "Bearer undefined" },
      { authorization: "Bearer " },
    ];

    for (const headers of attempts) {
      const response = await request.get("/api/cron/reconcile", { headers });

      expect(response.status()).toBe(401);
      expect(response.headers()["cache-control"]).toContain("no-store");
      expect(response.headers()["x-robots-tag"]).toContain("noindex");
      expect(await response.json()).toEqual({ ok: false });
    }
  });

  test("only answers GET", async ({ request }) => {
    const response = await request.post("/api/cron/reconcile", { data: {} });
    expect(response.status()).toBe(405);
  });
});
