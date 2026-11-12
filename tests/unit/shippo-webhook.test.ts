import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, describe, it, mock } from "node:test";

import {
  applyTrackingStatus,
  handleShippoWebhook,
  refuseShippoWebhook,
} from "../../src/lib/shipping/webhook.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

const HAS_DB = isDatabaseConfigured();

/**
 * The Shippo webhook's front door. The secret is a path segment and the
 * webhook is unsigned, so what matters is that nobody without the secret can
 * tell the endpoint from a missing route — by any method.
 *
 * The first block never reaches the database: every request either fails the
 * secret check or carries an event the handler does not act on. The second
 * drives real tracking events into real orders.
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

describe("what a tracking event does to an order", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const created: string[] = [];

  async function order(status: string, trackingNumber: string): Promise<string> {
    const id = randomUUID();
    created.push(id);
    await query(
      `insert into "order" (
         id, status, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
         subtotal_cents, shipping_cents, tax_cents, total_cents,
         stripe_session_id, stripe_mode, tracking_number
       ) values ($1, $2, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
                 8900, 700, 0, 9600, $3, 'test', $4)`,
      [id, status, `cs_test_${randomUUID()}`, trackingNumber],
    );
    return id;
  }

  const row = async (id: string) =>
    (
      await query<{ status: string; flagged_reason: string | null; delivered: boolean }>(
        `select status, flagged_reason, delivered_at is not null as delivered from "order" where id = $1`,
        [id],
      )
    )[0]!;

  function tracked(trackingNumber: string, status: string, test = true) {
    return post(SECRET, {
      event: "track_updated",
      test,
      data: { tracking_number: trackingNumber, tracking_status: { status } },
    });
  }

  let quiet: ReturnType<typeof mock.method>;

  before(() => {
    process.env.SHIPPO_WEBHOOK_TOKEN = SECRET;
    process.env.SHIPPO_API_TOKEN = "shippo_test_neverSentAnywhere";
    quiet = mock.method(console, "error", () => {});
  });

  after(async () => {
    quiet.mock.restore();
    delete process.env.SHIPPO_WEBHOOK_TOKEN;
    delete process.env.SHIPPO_API_TOKEN;
    await query(`delete from "order" where id = any($1::text[])`, [created]);
    await closePool();
  });

  it("DELIVERED moves a shipped order forward, once", async () => {
    const number = `9400${randomUUID().slice(0, 8)}`;
    const id = await order("shipped", number);

    assert.equal((await handleShippoWebhook(tracked(number, "DELIVERED"), SECRET)).status, 200);
    assert.deepEqual(await row(id), { status: "delivered", flagged_reason: null, delivered: true });
    assert.equal(await applyTrackingStatus(number, "DELIVERED"), 0, "a replay changes nothing");
  });

  it("never resurrects a cancelled order, or skips an order that has not shipped", async () => {
    const cancelled = `9400${randomUUID().slice(0, 8)}`;
    const cancelledId = await order("cancelled", cancelled);
    const early = `9400${randomUUID().slice(0, 8)}`;
    const earlyId = await order("in_process", early);

    await handleShippoWebhook(tracked(cancelled, "DELIVERED"), SECRET);
    await handleShippoWebhook(tracked(early, "DELIVERED"), SECRET);
    await handleShippoWebhook(tracked(cancelled, "RETURNED"), SECRET);

    assert.deepEqual(await row(cancelledId), { status: "cancelled", flagged_reason: null, delivered: false });
    assert.equal((await row(earlyId)).status, "in_process");
  });

  it("RETURNED and FAILURE flag the order instead of being dropped", async () => {
    const returned = `9400${randomUUID().slice(0, 8)}`;
    const returnedId = await order("shipped", returned);
    const failed = `9400${randomUUID().slice(0, 8)}`;
    const failedId = await order("delivered", failed);

    assert.equal((await handleShippoWebhook(tracked(returned, "RETURNED"), SECRET)).status, 200);
    assert.equal((await handleShippoWebhook(tracked(failed, "FAILURE"), SECRET)).status, 200);

    assert.deepEqual(await row(returnedId), {
      status: "shipped",
      flagged_reason: "delivery-problem",
      delivered: false,
    });
    assert.equal((await row(failedId)).flagged_reason, "delivery-problem");
  });

  it("does not hide a chargeback behind a returned parcel", async () => {
    const number = `9400${randomUUID().slice(0, 8)}`;
    const id = await order("shipped", number);
    await query(`update "order" set flagged_reason = 'disputed' where id = $1`, [id]);

    await handleShippoWebhook(tracked(number, "RETURNED"), SECRET);
    assert.equal((await row(id)).flagged_reason, "disputed");
  });

  it("ignores an event from the other mode, and a number that is not ours", async () => {
    const number = `9400${randomUUID().slice(0, 8)}`;
    const id = await order("shipped", number);

    // A live event while the token is a test token: a preview sharing a hook.
    assert.equal((await handleShippoWebhook(tracked(number, "DELIVERED", false), SECRET)).status, 200);
    assert.equal((await row(id)).status, "shipped");

    assert.equal(await applyTrackingStatus(`9400${randomUUID()}`, "RETURNED"), 0);
    assert.equal(await applyTrackingStatus(number, "TRANSIT"), 0, "in transit is not news");
  });

  it("finds the order by an index, not a scan of every order", async () => {
    const index = await query<{ indexdef: string }>(
      "select indexdef from pg_indexes where indexname = 'order_tracking_number_idx'",
    );
    assert.equal(index.length, 1, "0011 creates order_tracking_number_idx");
    assert.match(index[0]!.indexdef, /\(tracking_number\)/);
  });
});
