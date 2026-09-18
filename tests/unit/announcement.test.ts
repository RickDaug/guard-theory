import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, afterEach, describe, it } from "node:test";

import {
  PLACEHOLDER_MARKER,
  claimRecipient,
  countSentToday,
  findOwnerPlaceholders,
  idempotencyKeyFor,
  isReservedAddress,
  loadAlreadySent,
  loadSubscribers,
  loadUnresolved,
  parseMessageFile,
  planAnnouncement,
  problemsWithMessage,
  renderFor,
  runAnnouncement,
  settleClaim,
  startOfUtcDay,
  type Claim,
  type Subscriber,
} from "../../src/lib/mail/announcement.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import { isAmbiguousStatus } from "../../src/lib/mail/index.ts";
import type { Email, EmailLogStatus, SendResult } from "../../src/lib/mail/types.ts";

/**
 * The announcement goes to each person once, only if they still want it, and
 * only once the owner has written it.
 *
 * Those three properties are what `scripts/mail/send-announcement.ts` rests on,
 * and none of them can be checked by watching a run — a double send is only
 * visible in someone else's inbox. So they are checked here: the pure planning
 * and the send loop always, and the SQL against a real database when one is
 * configured (CI, or `npm run db:local` locally), the same way
 * waitlist-postgres.test.ts does it.
 *
 * No test here reaches a mail provider. The loop is driven with a fake sender,
 * and the one block that exercises the real Resend client replaces `fetch`
 * first.
 */

const ROOT = path.resolve(import.meta.dirname, "..", "..");

const sub = (email: string): Subscriber => ({ email, unsubscribeToken: `tok-${email}` });

const WRITTEN = {
  subject: "Theory 01",
  body: "Theory 01 is available now. The list gets it first, and this is that message.",
};

describe("the message file", () => {
  it("reads a subject, a blank line and a body, dropping leading notes", () => {
    const parsed = parseMessageFile(
      "# a note\n# another\n\nSubject:  Theory 01 \n\nFirst line.\n\n# not a note, part of the body\n",
    );
    assert.deepEqual(parsed, {
      subject: "Theory 01",
      body: "First line.\n\n# not a note, part of the body",
    });
  });

  it("accepts Windows line endings and a byte-order mark", () => {
    const parsed = parseMessageFile("﻿Subject: Theory 01\r\n\r\nBody.\r\n");
    assert.deepEqual(parsed, { subject: "Theory 01", body: "Body." });
  });

  it("refuses a file with no subject line", () => {
    assert.throws(() => parseMessageFile("Theory 01 is available now.\n"), /Subject:/);
  });

  it("refuses a subject that runs onto a second line", () => {
    // Otherwise the second line silently becomes the start of the body.
    assert.throws(() => parseMessageFile("Subject: Theory\n01\n\nBody."), /one line/);
  });

  it("the shipped example is refused, because it is not the message", async () => {
    const example = await readFile(
      path.join(ROOT, "scripts", "mail", "announcement.example.txt"),
      "utf8",
    );
    const problems = problemsWithMessage(parseMessageFile(example));
    assert.ok(
      problems.some((problem) => problem.includes(PLACEHOLDER_MARKER)),
      `the example must be blocked by its placeholder marker; got: ${problems.join(" | ")}`,
    );
  });
});

describe("the message is held to the voice rules before it can go", () => {
  it("a clean message has no problems", () => {
    assert.deepEqual(problemsWithMessage(WRITTEN), []);
  });

  it("the placeholder marker anywhere blocks it", () => {
    const problems = problemsWithMessage({
      ...WRITTEN,
      body: `${WRITTEN.body}\n\n${PLACEHOLDER_MARKER}`,
    });
    assert.equal(problems.length, 1);
  });

  it("an exclamation point in the subject blocks it", () => {
    const problems = problemsWithMessage({ ...WRITTEN, subject: "Theory 01 is here!" });
    assert.ok(problems.some((problem) => problem.startsWith("Not in email")));
  });

  it("a banned editorial construction in the body blocks it", () => {
    const problems = problemsWithMessage({
      ...WRITTEN,
      body: "A legendary drop that will unlock your potential.",
    });
    assert.equal(
      problems.filter((problem) => problem.startsWith("Banned construction")).length,
      2,
    );
  });

  it("an owner placeholder left unfilled blocks it", () => {
    // The shapes docs/announcement-drafts.md uses.
    for (const blank of ["[PRICE]", "[SHIPPING REGION]", "[DATE]", "[ARTICLE COUNT]"]) {
      const problems = problemsWithMessage({ ...WRITTEN, body: `It costs ${blank}, shipped.` });
      assert.deepEqual(
        problems.filter((problem) => problem.startsWith("Unfilled placeholder")).length,
        1,
        blank,
      );
    }

    assert.ok(problemsWithMessage({ ...WRITTEN, subject: "Theory 01, [DATE]" }).length > 0, "in the subject too");

    // The bracketed instruction, with its inner blank filled and its wrapper left on.
    assert.deepEqual(
      findOwnerPlaceholders("[OPTIONAL, ONLY IF FIXED: The First Edition opens on the 4th.]"),
      ["[OPTIONAL, ONLY IF FIXED:"],
    );
    assert.deepEqual(findOwnerPlaceholders("[DATE] and again [DATE]"), ["[DATE]"], "reported once");
  });

  it("ordinary brackets in ordinary prose do not", () => {
    for (const prose of [
      "He wrote that it was [sic] finished.",
      "See the note [1] at the foot, and [Theory 01] above.",
      "Option [A] or option [b].",
      "The array is written a[0], and NASA is an acronym (NASA), not a blank.",
      "Sizes: S, M, L. IN ALL CAPS WITHOUT BRACKETS.",
      "[Translated from the Portuguese]",
    ]) {
      assert.deepEqual(findOwnerPlaceholders(prose), [], prose);
      assert.deepEqual(problemsWithMessage({ ...WRITTEN, body: prose }), [], prose);
    }
  });

  it("an empty subject or body blocks it", () => {
    assert.ok(problemsWithMessage({ subject: "", body: WRITTEN.body }).length > 0);
    assert.ok(problemsWithMessage({ subject: WRITTEN.subject, body: "" }).length > 0);
  });
});

describe("who gets it today", () => {
  it("reserved test domains are never addressed", () => {
    for (const address of [
      "test-1@example.com",
      "a@mail.example.org",
      "a@example.net",
      "a@thing.test",
      "a@x.invalid",
      "a@localhost",
      "a@example",
    ]) {
      assert.equal(isReservedAddress(address), true, address);
    }
    for (const address of ["a@gmail.com", "a@myexample.com", "a@example.co.uk", "a@testing.io"]) {
      assert.equal(isReservedAddress(address), false, address);
    }
  });

  it("skips anyone the ledger already has, case-insensitively", () => {
    const plan = planAnnouncement({
      subscribers: [sub("A@real.dev"), sub("b@real.dev")],
      alreadySent: new Set(["a@real.dev"]),
      dailyCap: 100,
      sentToday: 0,
    });
    assert.deepEqual(plan.send.map((s) => s.email), ["b@real.dev"]);
    assert.equal(plan.alreadySent, 1);
  });

  it("never lists the same address twice in one run", () => {
    const plan = planAnnouncement({
      subscribers: [sub("a@real.dev"), sub("A@REAL.DEV")],
      alreadySent: new Set(),
      dailyCap: 100,
      sentToday: 0,
    });
    assert.equal(plan.send.length, 1);
  });

  it("stops at the cap and leaves the rest for tomorrow, in signup order", () => {
    const subscribers = Array.from({ length: 5 }, (_, i) => sub(`p${i}@real.dev`));
    const plan = planAnnouncement({ subscribers, alreadySent: new Set(), dailyCap: 3, sentToday: 0 });
    assert.deepEqual(plan.send.map((s) => s.email), ["p0@real.dev", "p1@real.dev", "p2@real.dev"]);
    assert.equal(plan.deferred, 2);
  });

  it("counts what was already sent today against the cap", () => {
    // A mail test at breakfast spends Resend's quota as surely as the
    // announcement does. The cap is the account's, not this run's.
    const subscribers = Array.from({ length: 5 }, (_, i) => sub(`p${i}@real.dev`));
    const plan = planAnnouncement({ subscribers, alreadySent: new Set(), dailyCap: 100, sentToday: 98 });
    assert.equal(plan.send.length, 2);
    assert.equal(plan.deferred, 3);
  });

  it("sends nothing once the day is spent, even if it is overspent", () => {
    const plan = planAnnouncement({
      subscribers: [sub("a@real.dev")],
      alreadySent: new Set(),
      dailyCap: 100,
      sentToday: 140,
    });
    assert.equal(plan.send.length, 0);
    assert.equal(plan.allowance, 0);
    assert.equal(plan.deferred, 1);
  });

  it("the second day picks up exactly where the first stopped", () => {
    const subscribers = Array.from({ length: 5 }, (_, i) => sub(`p${i}@real.dev`));
    const day1 = planAnnouncement({ subscribers, alreadySent: new Set(), dailyCap: 3, sentToday: 0 });
    const day2 = planAnnouncement({
      subscribers,
      alreadySent: new Set(day1.send.map((s) => s.email)),
      dailyCap: 3,
      sentToday: 0,
    });
    assert.deepEqual(day2.send.map((s) => s.email), ["p3@real.dev", "p4@real.dev"]);
    assert.equal(day2.deferred, 0);
  });
});

describe("the send loop", () => {
  const noSleep = async () => {};
  const claimAll = async (email: string): Promise<Claim> => ({ id: `claim-${email}` });
  const settles = async () => true;
  const OK: SendResult = { ok: true, providerId: "re_1" };
  const refused = (error: string): SendResult => ({ ok: false, unknown: false, error });
  const people = (n: number) => Array.from({ length: n }, (_, i) => sub(`p${i}@real.dev`));

  it("renders each message with that reader's own unsubscribe token", async () => {
    const seen: Email[] = [];
    await runAnnouncement({ send: [sub("a@real.dev"), sub("b@real.dev")] }, WRITTEN, {
      claim: claimAll,
      deliver: async (email) => {
        seen.push(email);
        return OK;
      },
      settle: settles,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.deepEqual(seen.map((e) => e.to), ["a@real.dev", "b@real.dev"]);
    assert.match(seen[1]!.body, /\/unsubscribe\?t=tok-b@real\.dev/);
    assert.doesNotMatch(seen[1]!.body, /tok-a@/);
  });

  it("claims, then sends, then settles — in that order, for every address", async () => {
    const order: string[] = [];
    await runAnnouncement({ send: people(2) }, WRITTEN, {
      claim: async (email) => {
        order.push(`claim ${email}`);
        return { id: `id-${email}` };
      },
      deliver: async (email) => {
        order.push(`send ${email.to}`);
        return OK;
      },
      settle: async (id, result) => {
        order.push(`settle ${id} ${result.ok}`);
        return true;
      },
      sleep: noSleep,
      delayMs: 0,
    });
    assert.deepEqual(order, [
      "claim p0@real.dev",
      "send p0@real.dev",
      "settle id-p0@real.dev true",
      "claim p1@real.dev",
      "send p1@real.dev",
      "settle id-p1@real.dev true",
    ]);
  });

  it("every message carries the same idempotency key on every run, whatever the case", async () => {
    const keys: (string | undefined)[] = [];
    for (const address of ["Reader@Real.dev", "reader@real.dev"]) {
      await runAnnouncement({ send: [sub(address)] }, WRITTEN, {
        claim: claimAll,
        deliver: async (email) => {
          keys.push(email.idempotencyKey);
          return OK;
        },
        settle: settles,
        sleep: noSleep,
        delayMs: 0,
      });
    }
    assert.equal(keys[0], keys[1]);
    assert.equal(keys[0], idempotencyKeyFor("READER@real.dev"));
    assert.match(keys[0]!, /^announcement:[0-9a-f]{64}$/);
    assert.ok(keys[0]!.length <= 256, "Resend's limit");
    assert.doesNotMatch(keys[0]!, /reader/i, "the address itself stays out of the header");
  });

  it("waits between messages, not before the first", async () => {
    const sleeps: number[] = [];
    await runAnnouncement({ send: people(3) }, WRITTEN, {
      claim: claimAll,
      deliver: async () => OK,
      settle: settles,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      delayMs: 250,
    });
    assert.deepEqual(sleeps, [250, 250]);
  });

  it("a timeout is unknown: the run stops, and the address is handed to a person", async () => {
    // The provider's own words for an AbortSignal.timeout — the request may
    // have been accepted before the answer stalled.
    const delivered: string[] = [];
    const settled: SendResult[] = [];
    const outcome = await runAnnouncement({ send: people(3) }, WRITTEN, {
      claim: claimAll,
      deliver: async (email) => {
        delivered.push(email.to);
        return delivered.length === 2
          ? { ok: false, unknown: true, error: "no answer from Resend: The operation was aborted due to timeout" }
          : OK;
      },
      settle: async (_id, result) => {
        settled.push(result);
        return true;
      },
      sleep: noSleep,
      delayMs: 0,
    });

    assert.deepEqual(delivered, ["p0@real.dev", "p1@real.dev"], "the third is never attempted");
    assert.deepEqual(outcome.needsCheck, ["p1@real.dev"]);
    assert.equal(outcome.sent, 1);
    assert.equal(outcome.failed, 0, "unknown is not a failure: a failure is retried");
    assert.match(outcome.stoppedBecause ?? "", /will not be retried/);
    assert.equal(settled[1]!.ok === false && settled[1]!.unknown, true, "recorded as unknown");
  });

  it("a provider that throws is unknown too, not a crash and not a failure", async () => {
    let calls = 0;
    const settled: SendResult[] = [];
    const outcome = await runAnnouncement({ send: people(2) }, WRITTEN, {
      claim: claimAll,
      deliver: async () => {
        calls += 1;
        throw new Error("socket hang up");
      },
      settle: async (_id, result) => {
        settled.push(result);
        return true;
      },
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(calls, 1);
    assert.deepEqual(outcome.needsCheck, ["p0@real.dev"]);
    assert.deepEqual(settled, [{ ok: false, unknown: true, error: "socket hang up" }]);
  });

  it("an address another run has claimed is skipped, and costs no provider call", async () => {
    const delivered: string[] = [];
    const sleeps: number[] = [];
    const kinds: string[] = [];
    const outcome = await runAnnouncement({ send: people(3) }, WRITTEN, {
      claim: async (email) => (email === "p1@real.dev" ? "claimed" : { id: email }),
      deliver: async (email) => {
        delivered.push(email.to);
        return OK;
      },
      settle: settles,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      delayMs: 250,
      onResult: (_email, kind) => kinds.push(kind),
    });
    assert.deepEqual(delivered, ["p0@real.dev", "p2@real.dev"]);
    assert.deepEqual(kinds, ["sent", "claimed", "sent"]);
    assert.equal(outcome.skipped, 1);
    assert.equal(outcome.sent, 2);
    assert.equal(outcome.stoppedBecause, null);
    assert.deepEqual(sleeps, [250], "paced on sends, not on skips");
  });

  it("someone who unsubscribed after the plan was made is not sent to", async () => {
    const delivered: string[] = [];
    const outcome = await runAnnouncement({ send: people(2) }, WRITTEN, {
      claim: async (email) => (email === "p0@real.dev" ? "unsubscribed" : { id: email }),
      deliver: async (email) => {
        delivered.push(email.to);
        return OK;
      },
      settle: settles,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.deepEqual(delivered, ["p1@real.dev"]);
    assert.equal(outcome.skipped, 1);
  });

  it("no claim, no send: a ledger that cannot be written stops the run before the provider", async () => {
    let calls = 0;
    const outcome = await runAnnouncement({ send: people(2) }, WRITTEN, {
      claim: async () => {
        throw new Error("connection terminated");
      },
      deliver: async () => {
        calls += 1;
        return OK;
      },
      settle: settles,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(calls, 0);
    assert.match(outcome.stoppedBecause ?? "", /email_log/);
    assert.deepEqual(outcome.needsCheck, [], "nothing was sent, so nothing needs checking");
  });

  it("stops the moment a send cannot be settled, and flags the address", async () => {
    // The row is still `pending`, which still blocks a second send. But the
    // ledger is not taking writes, and that is the end of the run.
    for (const settle of [
      async () => false,
      async () => {
        throw new Error("connection terminated");
      },
    ]) {
      let calls = 0;
      const outcome = await runAnnouncement({ send: people(2) }, WRITTEN, {
        claim: claimAll,
        deliver: async () => {
          calls += 1;
          return OK;
        },
        settle,
        sleep: noSleep,
        delayMs: 0,
      });
      assert.equal(calls, 1);
      assert.equal(outcome.sent, 1);
      assert.deepEqual(outcome.needsCheck, ["p0@real.dev"]);
      assert.match(outcome.stoppedBecause ?? "", /email_log/);
    }
  });

  it("stops on a 429 rather than asking again", async () => {
    let calls = 0;
    const outcome = await runAnnouncement({ send: people(2) }, WRITTEN, {
      claim: claimAll,
      deliver: async () => {
        calls += 1;
        return refused('429: {"name":"daily_quota_exceeded"}');
      },
      settle: settles,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(calls, 1);
    assert.match(outcome.stoppedBecause ?? "", /429/);
    assert.deepEqual(outcome.needsCheck, [], "a refusal is an answer");
  });

  it("carries on past one refused address, and stops after three in a row", async () => {
    const results = [false, true, false, false, false, true];
    let i = 0;
    const outcome = await runAnnouncement({ send: people(results.length) }, WRITTEN, {
      claim: claimAll,
      deliver: async () => (results[i++] ? OK : refused("422: bad address")),
      settle: settles,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(i, 5, "the sixth address must not be attempted");
    assert.equal(outcome.sent, 1);
    assert.equal(outcome.failed, 4);
    assert.match(outcome.stoppedBecause ?? "", /3 failures in a row/);
  });
});

describe("what the provider's answer means", () => {
  const realFetch = globalThis.fetch;
  const realEnv = { key: process.env.RESEND_API_KEY, from: process.env.RECEIPT_FROM_EMAIL };

  // A fresh module per test: the provider is chosen once and kept. The fake
  // key never leaves the process, because `fetch` is replaced before anything
  // can call it — no test here reaches Resend.
  async function providerWith(fetchStub: typeof fetch) {
    process.env.RESEND_API_KEY = "re_test_not_a_key";
    process.env.RECEIPT_FROM_EMAIL = "Guard Theory <hello@guardtheory.net>";
    globalThis.fetch = fetchStub;
    const mod = (await import(
      `../../src/lib/mail/index.ts?fresh=${randomUUID()}`
    )) as typeof import("../../src/lib/mail/index.ts");
    return mod.getMailProvider();
  }

  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realEnv.key === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = realEnv.key;
    if (realEnv.from === undefined) delete process.env.RECEIPT_FROM_EMAIL;
    else process.env.RECEIPT_FROM_EMAIL = realEnv.from;
  });

  const message = renderFor(sub("reader@real.dev"), WRITTEN);

  it("sends the idempotency key and the list headers to Resend", async () => {
    let seen: { url: string; init: RequestInit } | undefined;
    const provider = await providerWith(async (url, init) => {
      seen = { url: String(url), init: init! };
      return Response.json({ id: "re_123" });
    });

    assert.deepEqual(await provider.send(message), { ok: true, providerId: "re_123" });
    assert.equal(seen!.url, "https://api.resend.com/emails");

    const headers = seen!.init.headers as Record<string, string>;
    assert.equal(headers["Idempotency-Key"], idempotencyKeyFor("reader@real.dev"));

    const body = JSON.parse(String(seen!.init.body)) as { headers: Record<string, string> };
    assert.match(body.headers["List-Unsubscribe"]!, /^<https?:\/\/[^>]+\/unsubscribe\/one-click\?t=[^>]+>$/);
    assert.equal(body.headers["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  });

  it("a message with no key and no headers sends neither", async () => {
    let init: RequestInit | undefined;
    const provider = await providerWith(async (_url, i) => {
      init = i;
      return Response.json({ id: "re_1" });
    });
    await provider.send({ to: "reader@real.dev", subject: "s", body: "b" });
    assert.equal("Idempotency-Key" in (init!.headers as object), false);
    assert.equal("headers" in (JSON.parse(String(init!.body)) as object), false);
  });

  it("a timeout or a dropped connection is unknown, not failed", async () => {
    const provider = await providerWith(async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    });
    const result = await provider.send(message);
    assert.equal(result.ok, false);
    assert.equal(!result.ok && result.unknown, true);
  });

  it("a refusal is an answer; a 5xx or a 409 is not", async () => {
    for (const [status, unknown] of [
      [422, false],
      [401, false],
      [429, false],
      [409, true],
      [500, true],
      [502, true],
      [504, true],
    ] as const) {
      const provider = await providerWith(async () => new Response("nope", { status }));
      const result = await provider.send(message);
      assert.equal(!result.ok && result.unknown, unknown, String(status));
      assert.equal(!result.ok && result.error.startsWith(`${status}:`), true, String(status));
      assert.equal(isAmbiguousStatus(status), unknown);
    }
  });

  it("a 2xx with an unreadable body is still sent", async () => {
    const provider = await providerWith(async () => new Response("<html>", { status: 200 }));
    assert.deepEqual(await provider.send(message), { ok: true, providerId: null });
  });

  it("the generic path refuses the announcement, which must be claimed first", async () => {
    let called = false;
    await providerWith(async () => {
      called = true;
      return Response.json({ id: "re_1" });
    });
    const { sendAndRecord } = await import("../../src/lib/mail/index.ts");
    const result = await sendAndRecord("announcement", message);
    assert.equal(result.ok, false);
    assert.equal(called, false, "nothing may reach the provider");
  });
});

describe("the quota's day", () => {
  it("starts at midnight UTC, whatever the clock on this machine says", () => {
    assert.equal(startOfUtcDay(new Date("2026-09-18T23:59:59.999Z")).toISOString(), "2026-09-18T00:00:00.000Z");
    assert.equal(startOfUtcDay(new Date("2026-09-19T00:00:00.000Z")).toISOString(), "2026-09-19T00:00:00.000Z");
    assert.equal(startOfUtcDay(new Date("2026-09-19T00:01:00.000Z")).toISOString(), "2026-09-19T00:00:00.000Z");
    // 19:30 on the 18th in Texas is already the 19th in UTC.
    assert.equal(startOfUtcDay(new Date("2026-09-18T19:30:00-05:00")).toISOString(), "2026-09-19T00:00:00.000Z");
  });
});

const configured = isDatabaseConfigured();
const tag = randomUUID();
const addr = (name: string) => `anntest-${name}-${tag}@real.dev`;

describe("the queries, against a real database", { skip: !configured }, () => {
  after(async () => {
    if (!configured) return;
    await query("DELETE FROM waitlist_signup WHERE email LIKE $1", [`anntest-%-${tag}@real.dev`]);
    await query("DELETE FROM email_log WHERE to_email LIKE $1", [`anntest-%-${tag}@real.dev`]);
    await closePool();
  });

  async function signup(email: string, extra: { unsubscribed?: boolean; consent?: boolean } = {}) {
    await query(
      `insert into waitlist_signup
         (id, email, first_name, consent, submitted_at, unsubscribed_at, unsubscribe_token)
       values ($1, $2, 'Pat', $3, now(), $4, $5)`,
      [randomUUID(), email, extra.consent ?? true, extra.unsubscribed ? new Date() : null, randomUUID()],
    );
  }

  async function logged(email: string, template: string, status: EmailLogStatus, at?: Date) {
    await query(
      `insert into email_log (id, to_email, template, status, created_at)
       values ($1, $2, $3, $4, coalesce($5, now()))`,
      [randomUUID(), email, template, status, at ?? null],
    );
  }

  async function statusOf(email: string): Promise<string[]> {
    const rows = await query<{ status: string }>(
      "select status from email_log where lower(to_email) = lower($1) and template = 'announcement' order by created_at",
      [email],
    );
    return rows.map((row) => row.status);
  }

  it("loads only the subscribed who consented", async () => {
    await signup(addr("active"));
    await signup(addr("gone"), { unsubscribed: true });
    await signup(addr("noconsent"), { consent: false });

    const mine = (await loadSubscribers()).filter((s) => s.email.includes(tag)).map((s) => s.email);
    assert.deepEqual(mine, [addr("active")]);
  });

  it("sent, pending and unknown all count as done; only failed is retried", async () => {
    await logged(addr("done").toUpperCase(), "announcement", "sent");
    await logged(addr("killed"), "announcement", "pending");
    await logged(addr("timedout"), "announcement", "unknown");
    await logged(addr("bounced"), "announcement", "failed");
    await logged(addr("tested"), "test", "sent");

    const sent = await loadAlreadySent();
    assert.equal(sent.has(addr("done")), true, "a sent row blocks, whatever its case");
    assert.equal(sent.has(addr("killed")), true, "a run died mid-send: it may have gone");
    assert.equal(sent.has(addr("timedout")), true, "no answer is not a no");
    assert.equal(sent.has(addr("bounced")), false, "a refused attempt must be retried");
    assert.equal(sent.has(addr("tested")), false, "a mail test is not the announcement");

    const unresolved = (await loadUnresolved()).filter((row) => row.email.includes(tag));
    assert.deepEqual(
      unresolved.map((row) => [row.email, row.status]).sort(),
      [
        [addr("killed"), "pending"],
        [addr("timedout"), "unknown"],
      ],
    );
  });

  it("the kill window: a pending row left by a dead run keeps the address out of the plan", async () => {
    // Claimed, then the process was killed — before the provider call or after
    // it, nobody knows. The next day's plan must not contain the address.
    await signup(addr("midsend"));
    const claim = await claimRecipient(addr("midsend"));
    assert.equal(typeof claim, "object");

    const plan = planAnnouncement({
      subscribers: (await loadSubscribers()).filter((s) => s.email.includes(tag)),
      alreadySent: await loadAlreadySent(),
      dailyCap: 100,
      sentToday: 0,
    });
    assert.equal(plan.send.some((s) => s.email === addr("midsend")), false);

    // And if a stale plan still names it, the claim refuses.
    assert.equal(await claimRecipient(addr("midsend")), "claimed");
    assert.deepEqual(await statusOf(addr("midsend")), ["pending"]);
  });

  it("two runs at once: one claim wins, whatever the case of the address", async () => {
    await signup(addr("race"));
    const claims = await Promise.all([
      claimRecipient(addr("race")),
      claimRecipient(addr("race").toUpperCase()),
      claimRecipient(addr("race")),
    ]);
    assert.equal(claims.filter((claim) => typeof claim === "object").length, 1);
    assert.equal(claims.filter((claim) => claim === "claimed").length, 2);
    assert.deepEqual(await statusOf(addr("race")), ["pending"]);
  });

  it("the index itself refuses a second row, even from code that skips the claim", async () => {
    await logged(addr("indexed"), "announcement", "sent");
    for (const status of ["pending", "sent", "unknown"] as const) {
      await assert.rejects(
        logged(addr("indexed").toUpperCase(), "announcement", status),
        /email_log_announcement_once_idx|unique/i,
        status,
      );
      // PGlite's socket server hangs up after any statement that errors, and
      // the NEXT query is the one that sees ECONNRESET. Real Postgres does
      // not. This absorbs the reset so the next assertion is about the index.
      await query("select 1").catch(() => {});
    }
    // Failed rows and other templates are outside it.
    await logged(addr("indexed"), "announcement", "failed");
    await logged(addr("indexed"), "test", "sent");
    await logged(addr("indexed"), "test", "sent");
  });

  it("unsubscribing between the plan and the send stops the send", async () => {
    await signup(addr("leaver"));
    const planned = (await loadSubscribers()).find((s) => s.email === addr("leaver"));
    assert.ok(planned, "in the plan while still subscribed");

    // ...the script sits at its confirmation prompt, and the reader leaves.
    await query("update waitlist_signup set unsubscribed_at = now() where email = $1", [addr("leaver")]);

    const delivered: string[] = [];
    const outcome = await runAnnouncement({ send: [planned] }, WRITTEN, {
      claim: claimRecipient,
      deliver: async (email) => {
        delivered.push(email.to);
        return { ok: true, providerId: null };
      },
      settle: settleClaim,
      sleep: async () => {},
      delayMs: 0,
    });

    assert.deepEqual(delivered, []);
    assert.equal(outcome.skipped, 1);
    assert.deepEqual(await statusOf(addr("leaver")), [], "and no claim is left behind");
  });

  it("withdrawn consent stops it the same way", async () => {
    await signup(addr("withdrew"), { consent: false });
    assert.equal(await claimRecipient(addr("withdrew")), "unsubscribed");
  });

  it("a claim settles to what happened, once", async () => {
    for (const [name, result, status] of [
      ["s-sent", { ok: true, providerId: "re_9" }, "sent"],
      ["s-failed", { ok: false, unknown: false, error: "422: bad address" }, "failed"],
      ["s-unknown", { ok: false, unknown: true, error: "timeout" }, "unknown"],
    ] as const) {
      await signup(addr(name));
      const claim = await claimRecipient(addr(name));
      assert.ok(typeof claim === "object");
      assert.equal(await settleClaim(claim.id, result), true);
      assert.deepEqual(await statusOf(addr(name)), [status]);
      assert.equal(await settleClaim(claim.id, { ok: true, providerId: null }), false, "only out of pending");
      assert.deepEqual(await statusOf(addr(name)), [status]);
    }

    // A refused address can be claimed again; the other two cannot.
    assert.equal(typeof (await claimRecipient(addr("s-failed"))), "object");
    assert.equal(await claimRecipient(addr("s-sent")), "claimed");
    assert.equal(await claimRecipient(addr("s-unknown")), "claimed");
  });

  it("a full run against the ledger: sent once, and the second run sends nothing", async () => {
    await signup(addr("run-a"));
    await signup(addr("run-b"));
    const mine = async () => (await loadSubscribers()).filter((s) => s.email.includes(`-run-`) && s.email.includes(tag));
    const delivered: string[] = [];
    const deps = {
      claim: claimRecipient,
      deliver: async (email: Email): Promise<SendResult> => {
        delivered.push(email.to);
        // The second message is accepted by the provider and the answer is lost.
        return delivered.length === 2
          ? { ok: false, unknown: true, error: "timeout" }
          : { ok: true, providerId: "re_1" };
      },
      settle: settleClaim,
      sleep: async () => {},
      delayMs: 0,
    };

    const first = await runAnnouncement({ send: await mine() }, WRITTEN, deps);
    assert.deepEqual(first.needsCheck, [addr("run-b")]);

    const again = planAnnouncement({
      subscribers: await mine(),
      alreadySent: await loadAlreadySent(),
      dailyCap: 100,
      sentToday: 0,
    });
    assert.deepEqual(again.send, [], "neither the sent nor the unknown address is planned again");
    assert.deepEqual(delivered, [addr("run-a"), addr("run-b")]);
  });

  it("counts today's sends of every template toward the quota", async () => {
    const before = await countSentToday();
    await logged(addr("today-a"), "test", "sent");
    await logged(addr("today-b"), "announcement", "sent");
    await logged(addr("today-c"), "announcement", "failed");
    await logged(addr("today-d"), "announcement", "unknown");
    await logged(addr("today-e"), "announcement", "pending");
    await logged(addr("yesterday"), "announcement", "sent", new Date(Date.now() - 2 * 86_400_000));
    // Unknown and pending may have spent quota, so they are counted as spent.
    assert.equal(await countSentToday(), before + 4);
  });

  it("the day is the UTC day: 23:59 and 00:01 are different days", async () => {
    // Far enough in the future that nothing else in the table is near it.
    const lateYesterday = new Date("2099-03-09T23:59:00.000Z");
    const earlyToday = new Date("2099-03-10T00:01:00.000Z");
    await logged(addr("utc-late"), "test", "sent", lateYesterday);
    await logged(addr("utc-early"), "test", "sent", earlyToday);

    // At 00:01 UTC, the 23:59 message belongs to a quota that has reset.
    assert.equal(await countSentToday(new Date("2099-03-10T00:01:30.000Z")), 1);
    // At 23:59 the evening before, it is today's, and 00:01 has not happened...
    // but it is in the table, and later than midnight, so it counts: the query
    // has a floor and no ceiling, which is right for a clock that only runs forward.
    assert.equal(await countSentToday(new Date("2099-03-09T23:59:30.000Z")), 2);
    // Two minutes apart on the clock, a whole day apart on the quota.
    assert.equal(await countSentToday(new Date("2099-03-10T23:59:00.000Z")), 1);
    assert.equal(await countSentToday(new Date("2099-03-11T00:01:00.000Z")), 0);
  });
});
