import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { after, describe, it } from "node:test";

import {
  PLACEHOLDER_MARKER,
  countSentToday,
  hasSentRow,
  isReservedAddress,
  loadAlreadySent,
  loadSubscribers,
  parseMessageFile,
  planAnnouncement,
  problemsWithMessage,
  runAnnouncement,
  type Subscriber,
} from "../../src/lib/mail/announcement.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import type { Email } from "../../src/lib/mail/types.ts";

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
 * No test here reaches a mail provider. The loop is driven with a fake sender.
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

  it("renders each message with that reader's own unsubscribe token", async () => {
    const seen: Email[] = [];
    await runAnnouncement({ send: [sub("a@real.dev"), sub("b@real.dev")] }, WRITTEN, {
      send: async (email) => {
        seen.push(email);
        return { ok: true };
      },
      recorded: async () => true,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.deepEqual(seen.map((e) => e.to), ["a@real.dev", "b@real.dev"]);
    assert.match(seen[1]!.body, /\/unsubscribe\?t=tok-b@real\.dev/);
    assert.doesNotMatch(seen[1]!.body, /tok-a@/);
  });

  it("waits between messages, not before the first", async () => {
    const sleeps: number[] = [];
    await runAnnouncement({ send: [sub("a@real.dev"), sub("b@real.dev"), sub("c@real.dev")] }, WRITTEN, {
      send: async () => ({ ok: true }),
      recorded: async () => true,
      sleep: async (ms) => {
        sleeps.push(ms);
      },
      delayMs: 250,
    });
    assert.deepEqual(sleeps, [250, 250]);
  });

  it("stops on a 429 rather than asking again", async () => {
    let calls = 0;
    const outcome = await runAnnouncement({ send: [sub("a@real.dev"), sub("b@real.dev")] }, WRITTEN, {
      send: async () => {
        calls += 1;
        return { ok: false, error: '429: {"name":"daily_quota_exceeded"}' };
      },
      recorded: async () => true,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(calls, 1);
    assert.match(outcome.stoppedBecause ?? "", /429/);
  });

  it("carries on past one failed address, and stops after three in a row", async () => {
    const results = [false, true, false, false, false, true];
    let i = 0;
    const outcome = await runAnnouncement(
      { send: results.map((_, n) => sub(`p${n}@real.dev`)) },
      WRITTEN,
      {
        send: async () => (results[i++] ? { ok: true } : { ok: false, error: "422: bad address" }),
        recorded: async () => true,
        sleep: noSleep,
        delayMs: 0,
      },
    );
    assert.equal(i, 5, "the sixth address must not be attempted");
    assert.equal(outcome.sent, 1);
    assert.equal(outcome.failed, 4);
    assert.match(outcome.stoppedBecause ?? "", /3 failures in a row/);
  });

  it("stops the moment a sent message is missing from the ledger", async () => {
    // sendEmail swallows a failed log write. For a list send that is a double
    // send waiting for tomorrow's run, so the loop refuses to continue.
    let calls = 0;
    const outcome = await runAnnouncement({ send: [sub("a@real.dev"), sub("b@real.dev")] }, WRITTEN, {
      send: async () => {
        calls += 1;
        return { ok: true };
      },
      recorded: async () => false,
      sleep: noSleep,
      delayMs: 0,
    });
    assert.equal(calls, 1);
    assert.equal(outcome.sent, 1);
    assert.match(outcome.stoppedBecause ?? "", /email_log/);
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

  async function logged(email: string, template: string, status: "sent" | "failed") {
    await query(
      `insert into email_log (id, to_email, template, status) values ($1, $2, $3, $4)`,
      [randomUUID(), email, template, status],
    );
  }

  it("loads only the subscribed who consented", async () => {
    await signup(addr("active"));
    await signup(addr("gone"), { unsubscribed: true });
    await signup(addr("noconsent"), { consent: false });

    const mine = (await loadSubscribers()).filter((s) => s.email.includes(tag)).map((s) => s.email);
    assert.deepEqual(mine, [addr("active")]);
  });

  it("counts only a sent announcement as already sent", async () => {
    await logged(addr("done").toUpperCase(), "announcement", "sent");
    await logged(addr("bounced"), "announcement", "failed");
    await logged(addr("tested"), "test", "sent");

    const sent = await loadAlreadySent();
    assert.equal(sent.has(addr("done")), true, "a sent row blocks, whatever its case");
    assert.equal(sent.has(addr("bounced")), false, "a failed attempt must be retried");
    assert.equal(sent.has(addr("tested")), false, "a mail test is not the announcement");

    assert.equal(await hasSentRow(addr("done")), true);
    assert.equal(await hasSentRow(addr("bounced")), false);
  });

  it("counts today's sends of every template toward the quota", async () => {
    const before = await countSentToday();
    await logged(addr("today-a"), "test", "sent");
    await logged(addr("today-b"), "announcement", "sent");
    await logged(addr("today-c"), "announcement", "failed");
    await query(
      `insert into email_log (id, to_email, template, status, created_at)
       values ($1, $2, 'announcement', 'sent', now() - interval '2 days')`,
      [randomUUID(), addr("yesterday")],
    );
    assert.equal(await countSentToday(), before + 2);
  });
});
