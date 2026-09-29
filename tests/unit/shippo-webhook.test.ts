import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";

import { handleShippoWebhook, refuseShippoWebhook } from "../../src/lib/shipping/webhook.ts";

/**
 * The Shippo webhook's front door. The secret is a path segment and the
 * webhook is unsigned, so what matters is that nobody without the secret can
 * tell the endpoint from a missing route — by any method.
 *
 * Nothing here reaches the database: every request either fails the secret
 * check or carries an event the handler does not act on.
 */

const ROUTE = "src/app/api/webhooks/shippo/[token]/route.ts";
const SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

function post(token: string, body: string | Record<string, unknown>): Request {
  return new Request(`https://guardtheory.test/api/webhooks/shippo/${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

/** Status, body and every header: the whole of what a caller can observe. */
async function observed(response: Response) {
  return {
    status: response.status,
    body: await response.text(),
    headers: [...response.headers.entries()],
  };
}

describe("who the Shippo webhook answers", () => {
  before(() => {
    process.env.SHIPPO_WEBHOOK_TOKEN = SECRET;
    process.env.SHIPPO_API_TOKEN = "shippo_test_neverSentAnywhere";
  });

  after(() => {
    delete process.env.SHIPPO_WEBHOOK_TOKEN;
    delete process.env.SHIPPO_API_TOKEN;
  });

  it("a wrong secret gets an empty 404, not a 401", async () => {
    for (const token of ["not-the-secret", `${SECRET}x`, SECRET.slice(0, -1), ""]) {
      const response = await handleShippoWebhook(post(token, { event: "track_updated" }), token);

      assert.equal(response.status, 404, token);
      assert.equal(await response.text(), "", token);
    }
  });

  it("refuses everyone when the secret is unset or too short, the holder included", async () => {
    delete process.env.SHIPPO_WEBHOOK_TOKEN;
    let response = await handleShippoWebhook(post("undefined", {}), "undefined");
    assert.equal(response.status, 404);

    const short = SECRET.slice(0, 31);
    process.env.SHIPPO_WEBHOOK_TOKEN = short;
    response = await handleShippoWebhook(post(short, {}), short);
    assert.equal(response.status, 404);

    process.env.SHIPPO_WEBHOOK_TOKEN = SECRET;
  });

  it("the right secret is let past the door — an event it ignores still gets a 200", async () => {
    for (const body of ["not json", { event: "track_created" }]) {
      const response = await handleShippoWebhook(post(SECRET, body), SECRET);

      assert.equal(response.status, 200);
      assert.equal(await response.text(), "ok");
    }
  });

  it("a probe by any other method is answered exactly as a wrong secret is", async () => {
    // Next answers a method a route does not export with 405 — which says the
    // path exists and names the method that works. The route exports GET and
    // HEAD for this reason, and they must be indistinguishable from the 404 a
    // wrong secret gets: same status, same empty body, same headers.
    const wrongSecret = await observed(
      await handleShippoWebhook(post("not-the-secret", {}), "not-the-secret"),
    );
    const probe = await observed(refuseShippoWebhook());

    assert.equal(probe.status, 404);
    assert.deepEqual(probe, wrongSecret);
  });

  it("the route hands GET and HEAD to that refusal", () => {
    // The route file imports through the `@/` alias, which node's test runner
    // cannot resolve, so its wiring is read rather than called.
    const source = readFileSync(ROUTE, "utf8");

    const wired = /export function (GET|HEAD)\(\): Response \{\s*return refuseShippoWebhook\(\);/g;
    const methods = [...source.matchAll(wired)].map((match) => match[1]).sort();
    assert.deepEqual(
      methods,
      ["GET", "HEAD"],
      `${ROUTE} must export GET and HEAD and answer each with refuseShippoWebhook()`,
    );
    assert.match(source, /export async function POST\(/);
  });
});
