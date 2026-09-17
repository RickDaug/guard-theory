import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, describe, it } from "node:test";

import { getWaitlistStore, unsubscribeByToken } from "../../src/lib/waitlist/index.ts";
import { getContactStore } from "../../src/lib/contact/store.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The SQL, actually run.
 *
 * `storage.test.ts` proves the right store is CHOSEN and that the wrong one
 * refuses. It does not execute a single statement, so every query in
 * postgres-store.ts and contact/store.ts was unverified by the suite — the
 * shape AGENTS.md warns about, where a guard has only ever been green because
 * it never touched the thing it claims to cover.
 *
 * This file runs against whatever `DATABASE_URL` points at: the Postgres
 * service container in CI, PGlite locally (`npm run db:local`), or a Neon
 * branch. It skips entirely when no database is configured, so a contributor
 * without one still gets a green suite — but CI always has one, so the SQL is
 * never shipped unexercised.
 *
 * Every row it writes is namespaced with a UUID and deleted afterwards.
 */

const configured = isDatabaseConfigured();
const tag = randomUUID();
const addr = (name: string) => `pgtest-${name}-${tag}@example.com`;

describe("the Postgres stores, exercised against a real database", { skip: !configured }, () => {
  after(async () => {
    if (!configured) return;
    await query("DELETE FROM waitlist_signup WHERE email LIKE $1", [`pgtest-%-${tag}@example.com`]);
    await query("DELETE FROM contact_message WHERE email LIKE $1", [`pgtest-%-${tag}@example.com`]);
    await closePool();
  });

  it("stores a signup and reports it as new", async () => {
    const email = addr("new");

    const result = await getWaitlistStore().add({
      email,
      firstName: "Pat",
      sleevePreference: "no-preference",
      productInterest: [],
      consent: true as const,
      submittedAt: new Date().toISOString(),
    });

    assert.deepEqual(result, { ok: true, alreadyOnList: false });

    const rows = await query<{ n: number }>(
      "SELECT count(*)::int AS n FROM waitlist_signup WHERE email = $1",
      [email],
    );
    assert.equal(rows[0]?.n, 1, "exactly one row should exist for the address");
  });

  it("treats a repeat address as already-on-list, case-insensitively", async () => {
    const email = addr("dupe");
    const signup = {
      firstName: "Pat",
      sleevePreference: "no-preference" as const,
      productInterest: [],
      consent: true as const,
      submittedAt: new Date().toISOString(),
    };

    await getWaitlistStore().add({ ...signup, email });
    // The same person, shouting. A second row here would mean a duplicate mail
    // on announcement day, which is the failure a reader actually notices.
    const second = await getWaitlistStore().add({ ...signup, email: email.toUpperCase() });

    assert.deepEqual(second, { ok: true, alreadyOnList: true });

    const rows = await query<{ n: number }>(
      "SELECT count(*)::int AS n FROM waitlist_signup WHERE lower(email) = lower($1)",
      [email],
    );
    assert.equal(rows[0]?.n, 1, "a repeat address must not create a second row");
  });

  it("issues an unsubscribe token that works once and stays honest after", async () => {
    const email = addr("unsub");

    await getWaitlistStore().add({
      email,
      firstName: "Pat",
      sleevePreference: "no-preference",
      productInterest: [],
      consent: true as const,
      submittedAt: new Date().toISOString(),
    });

    const rows = await query<{ unsubscribe_token: string }>(
      "SELECT unsubscribe_token FROM waitlist_signup WHERE email = $1",
      [email],
    );
    const token = rows[0]?.unsubscribe_token;
    assert.ok(token, "a signup must be given an unsubscribe token at insert time");

    // CAN-SPAM requires the mechanism to keep working; it must not error on a
    // second click, and it must not claim success for a token it never issued.
    assert.equal(await unsubscribeByToken(token), "unsubscribed");
    assert.equal(await unsubscribeByToken(token), "already");
    assert.equal(await unsubscribeByToken("not-a-real-token"), "unknown-token");

    const after = await query<{ unsubscribed_at: Date | null }>(
      "SELECT unsubscribed_at FROM waitlist_signup WHERE email = $1",
      [email],
    );
    assert.notEqual(after[0]?.unsubscribed_at, null, "unsubscribing must be recorded on the row");
  });

  it("stores a contact message", async () => {
    const email = addr("contact");

    const saved = await getContactStore().save({
      name: "Pat",
      email,
      topic: "product",
      message: "A question about sizing.",
      receivedAt: new Date().toISOString(),
    });

    assert.equal(saved, true);

    const rows = await query<{ n: number }>(
      "SELECT count(*)::int AS n FROM contact_message WHERE email = $1",
      [email],
    );
    assert.equal(rows[0]?.n, 1);
  });
});
