import { expect, test } from "@playwright/test";

/**
 * The two public endpoints.
 *
 * These are the only routes that sit outside portal authentication, because
 * Stripe and Shippo have to reach them. What is asserted here is that they
 * refuse everything they should.
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

  test("is not reachable without a secret segment at all", async ({ request }) => {
    const response = await request.post("/api/webhooks/shippo", {
      data: { event: "track_updated" },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
