import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, afterEach, describe, it } from "node:test";

import {
  BACKOFF_BASE_MS,
  CAMPAIGN_DELAY_MS,
  MAX_BACKOFF_MS,
  RATE_LIMIT_RETRIES,
  advanceCampaign,
  backoffMs,
  campaignIdempotencyKey,
  createCampaign,
  draftCampaign,
  isRateLimited,
  loadCampaignProgress,
  realSendProblem,
  recoverStale,
  type AdvanceDeps,
} from "../../src/lib/mail/campaign.ts";
import { claimRecipient, countSentToday, idempotencyKeyFor } from "../../src/lib/mail/announcement.ts";
import { parseRetryAfter } from "../../src/lib/mail/index.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import type { Email, SendResult } from "../../src/lib/mail/types.ts";

/**
 * The announcement as a campaign: queued once, sent a batch at a time, resumed
 * across calls, and never sent to anyone twice.
 *
 * Nothing here reaches a mail provider. `deliver` is a fake that records what
 * it was handed; the SQL runs against a real database when one is configured.
 */

const WRITTEN = {
  subject: "Theory 01",
  body: "Theory 01 is available now. The list gets it first, and this is that message.",
};

describe("pacing and backoff", () => {
  it("paces at two requests a second", () => {
    assert.equal(CAMPAIGN_DELAY_MS, 500);
  });

  it("doubles from one second, honours Retry-After, and is capped", () => {
    assert.equal(backoffMs(0), BACKOFF_BASE_MS);
    assert.equal(backoffMs(1), BACKOFF_BASE_MS * 2);
    assert.equal(backoffMs(2), BACKOFF_BASE_MS * 4);
    assert.equal(backoffMs(0, 3_000), 3_000, "the provider asked for longer");
    assert.equal(backoffMs(20), MAX_BACKOFF_MS);
    assert.equal(backoffMs(0, 60_000), MAX_BACKOFF_MS);
  });

  it("reads Retry-After in seconds, and nothing else", () => {
    assert.equal(parseRetryAfter("2"), 2_000);
    assert.equal(parseRetryAfter(" 0.5 "), 500);
    assert.equal(parseRetryAfter(null), null);
    assert.equal(parseRetryAfter("Wed, 21 Oct 2026 07:28:00 GMT"), null);
    assert.equal(parseRetryAfter("-1"), null);
  });

  it("only a refused 429 is a rate limit; an unknown answer never is", () => {
    assert.equal(isRateLimited({ ok: false, unknown: false, error: "429: slow down" }), true);
    assert.equal(isRateLimited({ ok: false, unknown: false, error: "422: bad address" }), false);
    assert.equal(isRateLimited({ ok: false, unknown: true, error: "429: via a gateway" }), false);
    assert.equal(isRateLimited({ ok: true, providerId: null }), false);
  });
});

describe("the idempotency key", () => {
  it("is per campaign and recipient, stable, case-blind and carries no address", () => {
    const a = campaignIdempotencyKey("c1", "Pat@Real.dev");
    assert.equal(a, campaignIdempotencyKey("c1", "pat@real.dev"));
    assert.notEqual(a, campaignIdempotencyKey("c2", "pat@real.dev"));
    assert.notEqual(a, campaignIdempotencyKey("c1", "sam@real.dev"));
    assert.equal(a.includes("pat"), false);
    assert.ok(a.startsWith("announcement:c1:"));
    assert.ok(a.length <= 256, "Resend's limit");
    assert.notEqual(a, idempotencyKeyFor("pat@real.dev"));
  });
});

describe("the portal's real-send gate", () => {
  it("refuses a deployment with no provider, or links that are not production", () => {
    assert.match(realSendProblem({ siteUrl: "https://guardtheory.net", delivers: false }) ?? "", /provider/);
    assert.match(
      realSendProblem({ siteUrl: "https://guard-theory-git-x.vercel.app", delivers: true }) ?? "",
      /NEXT_PUBLIC_SITE_URL/,
    );
    assert.equal(realSendProblem({ siteUrl: "https://guardtheory.net", delivers: true }), null);
  });
});

const configured = isDatabaseConfigured();
const tag = randomUUID();
const addr = (name: string) => `camptest-${name}-${tag}@real.dev`;

describe("campaigns, against a real database", { skip: !configured }, () => {
  const campaigns: string[] = [];

  afterEach(async () => {
    // One open campaign at a time is the rule, so each test closes its own.
    if (campaigns.length > 0) {
      await query("delete from announcement_campaign where id = any($1::text[])", [campaigns.splice(0)]);
    }
  });

  after(async () => {
    await query("delete from waitlist_signup where email like $1", [`camptest-%-${tag}@real.dev`]);
    await query("delete from email_log where to_email like $1", [`camptest-%-${tag}@real.dev`]);
    await closePool();
  });

  async function signup(email: string, extra: { unsubscribed?: boolean } = {}) {
    await query(
      `insert into waitlist_signup
         (id, email, first_name, consent, submitted_at, unsubscribed_at, unsubscribe_token)
       values ($1, $2, 'Pat', true, now(), $3, $4)`,
      [randomUUID(), email, extra.unsubscribed ? new Date() : null, randomUUID()],
    );
  }

  /**
   * A campaign over exactly these addresses. Written directly rather than by
   * `createCampaign`, which queues the whole list — including rows other test
   * files own in a shared CI database.
   */
  async function campaignOf(emails: string[]): Promise<string> {
    const id = randomUUID();
    await query(
      "insert into announcement_campaign (id, subject, body, recipients) values ($1, $2, $3, $4)",
      [id, WRITTEN.subject, WRITTEN.body, emails.length],
    );
    await query(
      `insert into announcement_delivery (campaign_id, email, position)
       select $1, e.email, e.position from unnest($2::text[]) with ordinality as e(email, position)`,
      [id, emails],
    );
    campaigns.push(id);
    return id;
  }

  function fakeProvider(answer: (email: Email, call: number) => SendResult = () => ({ ok: true, providerId: "re_1" })) {
    const delivered: Email[] = [];
    const slept: number[] = [];
    const deps: AdvanceDeps = {
      deliver: async (email) => {
        delivered.push(email);
        return answer(email, delivered.length);
      },
      sleep: async (ms) => {
        slept.push(ms);
      },
      dailyCap: 1_000_000,
    };
    return { delivered, slept, deps };
  }

  async function statuses(campaignId: string): Promise<Record<string, string>> {
    const rows = await query<{ email: string; status: string }>(
      "select email, status from announcement_delivery where campaign_id = $1",
      [campaignId],
    );
    return Object.fromEntries(rows.map((row) => [row.email, row.status]));
  }

  async function ledger(email: string): Promise<string[]> {
    const rows = await query<{ status: string }>(
      "select status from email_log where lower(to_email) = $1 and template = 'announcement' order by created_at",
      [email],
    );
    return rows.map((row) => row.status);
  }

  it("is written once: a second submission finds the open campaign instead of queueing again", async () => {
    await signup(addr("c-live"));
    await signup(addr("c-gone"), { unsubscribed: true });
    await signup(addr("c-had"));
    await query(
      "insert into email_log (id, to_email, template, status) values ($1, $2, 'announcement', 'sent')",
      [randomUUID(), addr("c-had")],
    );

    const draft = await draftCampaign();
    assert.ok(draft.due >= 1, "the dry run counts the live signup");
    const first = await createCampaign(WRITTEN);
    assert.ok("created" in first, JSON.stringify(first));
    campaigns.push(first.created);
    assert.ok(first.recipients >= 1);

    const mine = Object.keys(await statuses(first.created)).filter((email) => email.includes(tag));
    assert.deepEqual(mine, [addr("c-live")], "not the unsubscribed, not one who already has it");

    const second = await createCampaign(WRITTEN);
    assert.deepEqual(second, { open: first.created });
    const count = await query<{ n: number }>(
      "select count(*)::int as n from announcement_campaign where status = 'open'",
    );
    assert.equal(count[0]?.n, 1);
  });

  it("refuses a message that fails the checks, and writes nothing", async () => {
    const result = await createCampaign({ subject: "Theory 01 is here!", body: WRITTEN.body });
    assert.ok("problems" in result);
  });

  it("sends a batch per call, paced, and resumes until everyone is reached exactly once", async () => {
    const emails = ["b1", "b2", "b3", "b4", "b5"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    const { delivered, slept, deps } = fakeProvider();

    const first = await advanceCampaign(id, { ...deps, batchSize: 2 });
    assert.equal(first.sent, 2);
    assert.equal(first.progress?.status, "open");
    assert.equal(first.progress?.queued, 3);
    assert.deepEqual(slept, [CAMPAIGN_DELAY_MS], "one pause between two sends");

    await advanceCampaign(id, { ...deps, batchSize: 2 });
    const last = await advanceCampaign(id, { ...deps, batchSize: 2 });
    assert.equal(last.progress?.status, "done");
    assert.equal(last.progress?.sent, 5);

    assert.deepEqual(delivered.map((email) => email.to), emails, "in list order, once each");
    assert.deepEqual(
      delivered.map((email) => email.idempotencyKey),
      emails.map((email) => campaignIdempotencyKey(id, email)),
    );
    for (const email of emails) assert.deepEqual(await ledger(email), ["sent"]);

    const after = await advanceCampaign(id, deps);
    assert.equal(after.sent, 0);
    assert.equal(delivered.length, 5, "a press after the end sends nothing");
  });

  it("two presses at once take different rows, and nobody gets two copies", async () => {
    const emails = ["p1", "p2", "p3", "p4"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    const { delivered, deps } = fakeProvider();

    await Promise.all([advanceCampaign(id, deps), advanceCampaign(id, deps), advanceCampaign(id, deps)]);

    assert.deepEqual(delivered.map((email) => email.to).sort(), [...emails].sort());
    assert.equal((await loadCampaignProgress(id))?.sent, 4);
  });

  it("stops when its time runs out and leaves the rest queued for the next call", async () => {
    const emails = ["t1", "t2", "t3"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    const { delivered, deps } = fakeProvider();
    let clock = 0;

    const outcome = await advanceCampaign(id, {
      ...deps,
      budgetMs: 1_000,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms + 600;
      },
    });

    assert.equal(outcome.sent, 1);
    assert.match(outcome.stoppedBecause ?? "", /time ran out/);
    assert.deepEqual(await statuses(id), { [emails[0]!]: "sent", [emails[1]!]: "queued", [emails[2]!]: "queued" });
    assert.equal(delivered.length, 1);
  });

  it("backs off on a 429 and sends once it is let through", async () => {
    await signup(addr("r-ok"));
    const id = await campaignOf([addr("r-ok")]);
    const { delivered, slept, deps } = fakeProvider((_email, call) =>
      call < 3 ? { ok: false, unknown: false, error: "429: too many requests" } : { ok: true, providerId: "re_2" },
    );

    const outcome = await advanceCampaign(id, deps);
    assert.equal(outcome.sent, 1);
    assert.deepEqual(slept, [backoffMs(0), backoffMs(1)]);
    assert.equal(delivered.length, 3);
    assert.equal(new Set(delivered.map((email) => email.idempotencyKey)).size, 1, "one key across retries");
    assert.deepEqual(await ledger(addr("r-ok")), ["sent"], "one claim, however many tries");
  });

  it("a 429 that outlasts the backoff leaves the row queued, and the next call sends it", async () => {
    await signup(addr("r-stuck"));
    const id = await campaignOf([addr("r-stuck")]);
    const refused = fakeProvider(() => ({ ok: false, unknown: false, error: "429: daily quota" }));

    const outcome = await advanceCampaign(id, refused.deps);
    assert.equal(refused.delivered.length, RATE_LIMIT_RETRIES + 1);
    assert.match(outcome.stoppedBecause ?? "", /429/);
    assert.deepEqual(await statuses(id), { [addr("r-stuck")]: "queued" });
    assert.deepEqual(await ledger(addr("r-stuck")), ["failed"], "refused, so outside the once index");

    const later = fakeProvider();
    const resumed = await advanceCampaign(id, later.deps);
    assert.equal(resumed.sent, 1);
    assert.deepEqual(await ledger(addr("r-stuck")), ["failed", "sent"]);
  });

  it("an unknown answer stops the call and is never retried", async () => {
    const emails = ["u1", "u2"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    const { delivered, deps } = fakeProvider(() => ({ ok: false, unknown: true, error: "no answer from Resend" }));

    const outcome = await advanceCampaign(id, deps);
    assert.equal(outcome.unknown, 1);
    assert.match(outcome.stoppedBecause ?? "", /no usable answer/i);
    assert.equal(delivered.length, 1, "the second address waits for a person");

    const next = fakeProvider();
    await advanceCampaign(id, next.deps);
    assert.deepEqual(next.delivered.map((email) => email.to), [emails[1]], "the unknown one is not sent again");
    assert.deepEqual(await statuses(id), { [emails[0]!]: "unknown", [emails[1]!]: "sent" });
  });

  it("someone who unsubscribes after the campaign is written is not sent to", async () => {
    await signup(addr("leaver"));
    const id = await campaignOf([addr("leaver")]);
    await query("update waitlist_signup set unsubscribed_at = now() where email = $1", [addr("leaver")]);
    const { delivered, deps } = fakeProvider();

    const outcome = await advanceCampaign(id, deps);
    assert.equal(outcome.unsubscribed, 1);
    assert.equal(delivered.length, 0);
    assert.deepEqual(await statuses(id), { [addr("leaver")]: "unsubscribed" });
    assert.equal((await loadCampaignProgress(id))?.status, "done");
  });

  it("an address someone else already claimed is skipped, not sent", async () => {
    await signup(addr("claimed"));
    await claimRecipient(addr("claimed"));
    const id = await campaignOf([addr("claimed")]);
    const { delivered, deps } = fakeProvider();

    await advanceCampaign(id, deps);
    assert.equal(delivered.length, 0);
    assert.deepEqual(await statuses(id), { [addr("claimed")]: "skipped" });
  });

  it("a call that died holding rows: the ledger decides what they become", async () => {
    const emails = ["k-claimed", "k-sent", "k-never"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    await query("update announcement_delivery set status = 'sending' where campaign_id = $1", [id]);
    // Died after claiming, before or after the provider call: nobody knows.
    await claimRecipient(emails[0]!);
    // Died after sending and settling the ledger, before writing progress.
    await query(
      "insert into email_log (id, to_email, template, status) values ($1, $2, 'announcement', 'sent')",
      [randomUUID(), emails[1]],
    );
    // Died before claiming: nothing went.

    assert.equal(await recoverStale(id, 3600), 0, "rows a live call may still hold are left alone");
    assert.equal(await recoverStale(id, 0), 3);
    assert.deepEqual(await statuses(id), {
      [emails[0]!]: "unknown",
      [emails[1]!]: "sent",
      [emails[2]!]: "queued",
    });

    const { delivered, deps } = fakeProvider();
    await advanceCampaign(id, deps);
    assert.deepEqual(delivered.map((email) => email.to), [emails[2]]);
  });

  it("a ledger that cannot be written stops the call, and the row stays blocked", async () => {
    const emails = ["l1", "l2"].map(addr);
    for (const email of emails) await signup(email);
    const id = await campaignOf(emails);
    const { delivered, deps } = fakeProvider();

    const outcome = await advanceCampaign(id, { ...deps, settle: async () => false });
    assert.match(outcome.stoppedBecause ?? "", /email_log could not be updated/);
    assert.equal(delivered.length, 1);
    assert.deepEqual(await statuses(id), { [emails[0]!]: "sending", [emails[1]!]: "queued" });
    assert.deepEqual(await ledger(emails[0]!), ["pending"]);
  });

  it("respects the day's quota across every template", async () => {
    await signup(addr("q1"));
    const id = await campaignOf([addr("q1")]);
    const today = await countSentToday();
    const { delivered, deps } = fakeProvider();

    const outcome = await advanceCampaign(id, { ...deps, dailyCap: today });
    assert.equal(delivered.length, 0);
    assert.match(outcome.stoppedBecause ?? "", /quota/);
    assert.deepEqual(await statuses(id), { [addr("q1")]: "queued" });
  });
});
