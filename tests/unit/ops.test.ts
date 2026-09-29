import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";

import {
  composeDigest,
  collectStoredProblems,
  decideAlert,
  MIN_GAP_MINUTES,
  type AlertState,
  type Problem,
  REMIND_HOURS,
  runOwnerAlert,
  runProblems,
} from "../../src/lib/ops/alert.ts";
import {
  envPresence,
  migrationStatus,
  parseLastReconcile,
  readLastReconcile,
  reconcileHealth,
  RECONCILE_STALE_MINUTES,
} from "../../src/lib/ops/health.ts";
import {
  listMissingConfirmations,
  sendMissingConfirmations,
  sweepWebhookEvents,
} from "../../src/lib/ops/sweep.ts";
import { listShipQueue } from "../../src/lib/ops/ship-queue.ts";
import { emailStatusView, resendOutcome } from "../../src/lib/portal/email-status.ts";
import { type CronDeps, handleReconcileCron } from "../../src/lib/orders/cron.ts";
import {
  closePool,
  isDatabaseConfigured,
  query,
  queryTimeoutMs,
} from "../../src/lib/db/client.ts";
import type { MailProvider } from "../../src/lib/mail/types.ts";
import type { ModeCheck } from "../../src/lib/stripe/mode-check.ts";

/**
 * Ops: the owner alert, the health readers, the sweeps, the ship queue, and
 * how the cron calls them. Kept out of cron-reconcile.test.ts, whose reconcile
 * cases belong to the refund work; the cron's own wiring is tested here.
 */

const HAS_DB = isDatabaseConfigured();
const NOW = new Date("2026-09-28T12:00:00Z");
const minutesAfter = (minutes: number) => new Date(NOW.getTime() + minutes * 60_000);

delete process.env.RESEND_API_KEY;

const env = (values: Record<string, string>) => values as unknown as NodeJS.ProcessEnv;

const problem = (key: string, kind: Problem["kind"] = "unfulfilled"): Problem => ({ kind, key });

describe("when the owner alert sends", () => {
  const state = (keys: string[]): AlertState => ({ at: NOW.toISOString(), keys });

  it("sends the first time there is anything, and says nothing when there is nothing", () => {
    assert.deepEqual(decideAlert([], null, NOW), { send: false, why: "none" });
    assert.equal(decideAlert([problem("a")], null, NOW).send, true);
  });

  it("does not repeat itself inside the minimum gap, even with news", () => {
    const decision = decideAlert(
      [problem("a"), problem("b")],
      state(["a"]),
      minutesAfter(MIN_GAP_MINUTES - 1),
    );
    assert.deepEqual(decision, { send: false, why: "too-soon" });
  });

  it("sends again for a new problem once the gap has passed", () => {
    const decision = decideAlert([problem("a"), problem("b")], state(["a"]), minutesAfter(61));
    assert.deepEqual(decision, { send: true, fresh: 1 });
  });

  it("does not re-send the same list until the reminder is due", () => {
    assert.deepEqual(decideAlert([problem("a")], state(["a"]), minutesAfter(120)), {
      send: false,
      why: "already-told",
    });
    assert.equal(
      decideAlert([problem("a")], state(["a"]), minutesAfter(REMIND_HOURS * 60)).send,
      true,
    );
  });
});

describe("what the digest says", () => {
  it("counts by kind and carries no identifier", () => {
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const { subject, body } = composeDigest([
      problem(`unfulfilled:${ids[0]}`),
      problem(`unfulfilled:${ids[1]}`),
      problem(`email:${ids[2]}:order-confirmation`, "email"),
      problem("reconcile-failed", "reconcile-failed"),
    ]);

    assert.match(subject, /3 things need you/);
    assert.match(body, /Paid, with no order: 2/);
    assert.match(body, /Order emails that did not send\n/);
    assert.match(body, /scheduled reconcile failed/);
    for (const id of ids) {
      assert.ok(!body.includes(id) && !subject.includes(id), "no row id in the message");
    }
    assert.doesNotMatch(body, /@|\/crew/);
  });
});

describe("reconcile health", () => {
  const last = (minutesAgo: number) =>
    parseLastReconcile(
      JSON.stringify({
        at: new Date(NOW.getTime() - minutesAgo * 60_000).toISOString(),
        scanned: 3,
        created: 1,
        skipped: [{ sessionId: "cs_x", reason: "x" }],
        refunds: { failed: "StripeConnectionError" },
      }),
    );

  it("reads what recordReconcileRun writes", () => {
    const parsed = last(5);
    assert.equal(parsed?.scanned, 3);
    assert.equal(parsed?.skipped, 1);
    assert.equal(parsed?.refundsFailed, "StripeConnectionError");
    assert.equal(parseLastReconcile("not json"), null);
    assert.equal(parseLastReconcile(JSON.stringify({ at: "never" })), null);
  });

  it("is stale past the threshold, and not applicable without Stripe", () => {
    assert.equal(reconcileHealth(last(RECONCILE_STALE_MINUTES), NOW, true).state, "fresh");
    assert.equal(reconcileHealth(last(RECONCILE_STALE_MINUTES + 1), NOW, true).state, "stale");
    assert.equal(reconcileHealth(null, NOW, true).state, "never");
    assert.equal(reconcileHealth(null, NOW, false).state, "not-applicable");
  });

  it("turns a failed run, a stale record and a refund failure into problems", () => {
    const kinds = (problems: Problem[]) => problems.map((p) => p.kind).sort();

    assert.deepEqual(
      kinds(runProblems({ runFailed: "StripeAPIError", refundsFailed: null }, last(5), NOW, true)),
      ["reconcile-failed"],
    );
    assert.deepEqual(
      kinds(runProblems({ runFailed: null, refundsFailed: "X" }, last(90), NOW, true)),
      ["reconcile-stale", "refunds-failed"],
    );
    assert.deepEqual(runProblems({ runFailed: null, refundsFailed: null }, null, NOW, false), []);
  });
});

describe("the owner alert, end to end with a stand-in provider", () => {
  function provider(delivers: boolean, ok = true) {
    const sent: { to: string; subject: string; body: string }[] = [];
    const mail: MailProvider = {
      name: "fake",
      delivers,
      async send(email) {
        sent.push(email);
        return ok ? { ok: true, providerId: null } : { ok: false, unknown: false, error: "provider down" };
      },
    };
    return { mail, sent };
  }

  function harness(
    options: { delivers?: boolean; ok?: boolean; env?: NodeJS.ProcessEnv; modeCheck?: ModeCheck } = {},
  ) {
    const { mail, sent } = provider(options.delivers ?? true, options.ok ?? true);
    let stored: AlertState | null = null;
    let now = NOW;
    let problems: Problem[] = [problem("unfulfilled:1")];
    const writes: (AlertState | null)[] = [];

    const run = () =>
      runOwnerAlert(
        { runFailed: null, refundsFailed: null },
        {
          env: options.env ?? env({ OWNER_ALERT_EMAIL: "owner@example.com" }),
          now: () => now,
          provider: () => mail,
          stripeConfigured: () => false,
          lastReconcile: async () => null,
          modeCheck: async () => options.modeCheck ?? { state: "not-connected" },
          stored: async () => problems,
          readState: async () => stored,
          writeState: async (state) => {
            writes.push(state);
            stored = state;
          },
        },
      );

    return {
      run,
      sent,
      writes,
      setNow: (value: Date) => (now = value),
      setProblems: (value: Problem[]) => (problems = value),
    };
  }

  it("does nothing at all without OWNER_ALERT_EMAIL, or with one that is not an address", async () => {
    for (const values of [{}, { OWNER_ALERT_EMAIL: "  " }, { OWNER_ALERT_EMAIL: "owner" }] as Record<string, string>[]) {
      const h = harness({ env: env(values) });
      assert.equal(await h.run(), "not-configured");
      assert.equal(h.sent.length, 0);
    }
  });

  it("sends once, holds back the repeat, and sends again for news", async () => {
    const h = harness();

    assert.equal(await h.run(), "sent");
    assert.equal(h.sent.length, 1);
    assert.equal(h.sent[0]!.to, "owner@example.com");

    h.setNow(minutesAfter(15));
    assert.equal(await h.run(), "too-soon");

    h.setNow(minutesAfter(90));
    assert.equal(await h.run(), "already-told");

    h.setProblems([problem("unfulfilled:1"), problem("label:2", "label")]);
    assert.equal(await h.run(), "sent");
    assert.equal(h.sent.length, 2);
  });

  it("tells the owner when Stripe disagrees with the key about the mode", async () => {
    const h = harness({
      modeCheck: { state: "mismatch", keyMode: "test", stripeSays: "live", checkedAt: NOW },
    });
    h.setProblems([]);

    assert.equal(await h.run(), "sent");
    assert.match(h.sent[0]!.body, /Stripe disagrees with the key about test or live mode/);
    assert.deepEqual(h.writes.at(-1)?.keys, ["stripe-mode:test:live"]);
  });

  it("forgets what it said once everything is clear, so the next problem is news", async () => {
    const h = harness();
    await h.run();

    h.setProblems([]);
    h.setNow(minutesAfter(15));
    assert.equal(await h.run(), "none");
    assert.equal(h.writes.at(-1), null);
  });

  it("sends nothing and records nothing when mail only logs, or the provider fails", async () => {
    const quiet = harness({ delivers: false });
    assert.equal(await quiet.run(), "no-provider");
    assert.equal(quiet.sent.length, 0);
    assert.equal(quiet.writes.length, 0);

    const failing = harness({ ok: false });
    assert.equal(await failing.run(), "failed");
    assert.equal(failing.writes.length, 0, "a failed send is tried again next run");
  });
});

describe("the cron and the ops work", () => {
  const SECRET = "ops-test-secret-that-is-long-enough-0123456789";
  const request = () =>
    new Request("https://guardtheory.test/api/cron/reconcile", {
      headers: { authorization: `Bearer ${SECRET}` },
    });

  function deps(calls: string[], overrides: Partial<CronDeps> = {}): Partial<CronDeps> {
    const note =
      <T>(name: string, value: T) =>
      async () => {
        calls.push(name);
        return value;
      };

    return {
      reconcile: note("reconcile", { scanned: 0, created: 0, alreadyRecorded: 0, skipped: [] }),
      record: note("record", undefined),
      purgeIntents: note("purgeIntents", 0),
      sweepAttempts: note("sweepAttempts", 0),
      sweepSessions: note("sweepSessions", 0),
      sweepWebhookEvents: note("sweepWebhookEvents", 2),
      retryUndelivered: note("retryUndelivered", null),
      sendMissing: note("sendMissing", 1),
      alert: note("alert", "sent" as const),
      stripeConfigured: () => true,
      databaseConfigured: () => true,
      ...overrides,
    };
  }

  before(() => {
    process.env.CRON_SECRET = SECRET;
  });

  after(() => {
    delete process.env.CRON_SECRET;
  });

  it("alerts about a failed reconcile, naming only the error class", async () => {
    let context: unknown;
    const response = await handleReconcileCron(
      request(),
      deps([], {
        reconcile: async () => {
          throw Object.assign(new Error("No such customer: buyer@example.com"), {
            name: "StripeInvalidRequestError",
          });
        },
        alert: async (given) => {
          context = given;
          return "sent";
        },
      }),
    );

    assert.equal(response.status, 500);
    assert.deepEqual(context, { runFailed: "StripeInvalidRequestError", refundsFailed: null });
    const body = await response.json();
    assert.equal(body.alert, "sent");
    assert.doesNotMatch(JSON.stringify(body), /@/);
  });

  it("passes the refund pass's failure to the alert", async () => {
    let context: unknown;
    await handleReconcileCron(
      request(),
      deps([], {
        reconcile: async () => ({
          scanned: 0,
          created: 0,
          alreadyRecorded: 0,
          skipped: [],
          refunds: { scanned: 0, synced: 0, unmatched: 0, failed: "StripeConnectionError" },
        }),
        alert: async (given) => {
          context = given;
          return "none";
        },
      }),
    );

    assert.deepEqual(context, { runFailed: null, refundsFailed: "StripeConnectionError" });
  });

  it("still catches up mail and alerts while Stripe has no keys", async () => {
    const calls: string[] = [];
    const response = await handleReconcileCron(
      request(),
      deps(calls, { stripeConfigured: () => false }),
    );

    assert.equal(response.status, 200);
    assert.ok(!calls.includes("reconcile"));
    assert.ok(calls.includes("sendMissing") && calls.includes("alert"));
  });

  it("reports the sweeps and the catch-ups, and a broken alert never fails the run", async () => {
    const response = await handleReconcileCron(
      request(),
      deps([], {
        alert: async () => {
          throw new Error("relation \"setting\" does not exist");
        },
      }),
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.swept.webhookEvents, 2);
    assert.deepEqual(body.confirmations, { retried: null, missing: 1 });
    assert.equal(body.alert, "error");
  });
});

describe("what the portal says about a message", () => {
  it("says a log-only message was not sent, rather than that it failed", () => {
    assert.deepEqual(emailStatusView("not-delivered"), {
      label: "Not sent — no mail provider",
      problem: true,
    });
    assert.deepEqual(emailStatusView("failed"), { label: "Failed", problem: true });
    assert.deepEqual(emailStatusView("sent"), { label: "Sent", problem: false });
  });

  it("never answers 'Sent.' to a resend while no provider is connected", () => {
    assert.deepEqual(resendOutcome(true, true), { status: "success", message: "Sent." });

    const logged = resendOutcome(true, false);
    assert.equal(logged.status, "error");
    assert.match(logged.message, /no mail provider/);
    assert.doesNotMatch(logged.message, /^Sent/);

    assert.equal(resendOutcome(false, true).status, "error");
  });
});

describe("names, never values", () => {
  it("lists which variables are set and prints none of them", () => {
    const secret = `sk_live_${randomUUID()}`;
    const presence = envPresence(env({ STRIPE_SECRET_KEY: secret, OWNER_ALERT_EMAIL: "  " }));
    const flat = presence.flatMap((group) => group.vars);

    assert.equal(flat.find((v) => v.name === "STRIPE_SECRET_KEY")?.set, true);
    assert.equal(flat.find((v) => v.name === "OWNER_ALERT_EMAIL")?.set, false, "blank is unset");
    assert.equal(flat.find((v) => v.name === "CRON_SECRET")?.required, true);
    assert.ok(!JSON.stringify(presence).includes(secret));
  });
});

describe("the database query timeout", () => {
  it("defaults to fifteen seconds, can be changed, and can be turned off", () => {
    assert.equal(queryTimeoutMs(env({})), 15_000);
    assert.equal(queryTimeoutMs(env({ DATABASE_QUERY_TIMEOUT_MS: "4000" })), 4_000);
    assert.equal(queryTimeoutMs(env({ DATABASE_QUERY_TIMEOUT_MS: "0" })), undefined);
    assert.equal(queryTimeoutMs(env({ DATABASE_QUERY_TIMEOUT_MS: "soon" })), undefined);
  });
});

describe("ops against the database", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const made: string[] = [];

  async function order(fields: Record<string, unknown> = {}): Promise<string> {
    const id = randomUUID();
    const values: Record<string, unknown> = {
      id,
      email: "ops.buyer@example.com",
      ship_name: "Ops Buyer",
      ship_line1: "1 Test Street",
      ship_city: "Los Angeles",
      ship_state: "CA",
      ship_postal: "90015",
      subtotal_cents: 8900,
      shipping_cents: 700,
      tax_cents: 0,
      total_cents: 9600,
      stripe_session_id: `cs_test_ops_${id}`,
      stripe_mode: "test",
      ...fields,
    };
    const columns = Object.keys(values);
    await query(
      `insert into "order" (${columns.map((c) => `"${c}"`).join(", ")})
       values (${columns.map((_, i) => `$${i + 1}`).join(", ")})`,
      Object.values(values),
    );
    made.push(id);
    return id;
  }

  const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000);

  after(async () => {
    await query("delete from email_log where order_id = any($1)", [made]).catch(() => {});
    await query(`delete from "order" where id = any($1)`, [made]).catch(() => {});
    await query("delete from webhook_event where id like 'evt_ops_%'").catch(() => {});
    await query("delete from unfulfilled_payment where stripe_session_id like 'cs_test_ops_%'").catch(
      () => {},
    );
    await closePool();
  });

  it("finds every kind of stored problem, and not a failure that was later resent", async () => {
    const payment = randomUUID();
    await query(
      `insert into unfulfilled_payment (id, stripe_session_id, stripe_mode, reason)
       values ($1, $2, 'test', 'fixture')`,
      [payment, `cs_test_ops_${payment}`],
    );

    const flagged = await order({ flagged_reason: "oversell" });
    const stuckLabel = await order({ label_claimed_at: ago(30) });
    const missing = await order({ placed_at: ago(30) });
    const failed = await order();
    const resent = await order();

    for (const [orderId, statuses] of [
      [failed, ["failed"]],
      [resent, ["failed", "sent"]],
    ] as const) {
      let at = 10;
      for (const status of statuses) {
        await query(
          `insert into email_log (id, order_id, to_email, template, status, created_at)
           values ($1, $2, 'ops.buyer@example.com', 'order-confirmation', $3, $4)`,
          [randomUUID(), orderId, status, ago(at--)],
        );
      }
    }

    const event = `evt_ops_${randomUUID()}`;
    await query(`insert into webhook_event (id, type, received_at) values ($1, 'x', $2)`, [
      event,
      ago(20),
    ]);

    const keys = new Set((await collectStoredProblems()).map((p) => p.key));

    assert.ok(keys.has(`unfulfilled:${payment}`));
    assert.ok(keys.has(`flagged:${flagged}`));
    assert.ok(keys.has(`label:${stuckLabel}`));
    assert.ok(keys.has(`missing:${missing}`));
    assert.ok(keys.has(`email:${failed}:order-confirmation`));
    assert.ok(!keys.has(`email:${resent}:order-confirmation`), "the resend went");
    assert.ok(keys.has(`webhook:${event}`));
  });

  it("counts chargebacks on their own, and every newer flag as flagged", async () => {
    const open = await order({ dispute_status: "open", flagged_reason: "disputed" });
    // Decided and cleared by the owner: no longer a problem.
    const settled = await order({ dispute_status: "won" });
    // Still open after the owner cleared the flag: still a problem.
    const cleared = await order({ dispute_status: "open" });
    const returned = await order({ flagged_reason: "delivery-problem" });
    const twice = await order({ flagged_reason: "duplicate-payment" });
    const swapped = await order({ flagged_reason: "mode-mismatch" });
    const refunded = await order({ flagged_reason: "refunded" });

    const keys = new Set((await collectStoredProblems()).map((p) => p.key));

    assert.ok(keys.has(`disputed:${open}:open`));
    assert.ok(keys.has(`disputed:${cleared}:open`));
    assert.ok(![...keys].some((key) => key.startsWith(`disputed:${settled}`)));
    assert.ok(!keys.has(`flagged:${open}`), "a chargeback is said once, as a chargeback");
    for (const id of [returned, twice, swapped]) assert.ok(keys.has(`flagged:${id}`), id);
    assert.ok(!keys.has(`flagged:${refunded}`), "a refund is bookkeeping, not an alert");

    // The outcome of a dispute already reported as open is news: a new key.
    await query(`update "order" set dispute_status = 'lost' where id = $1`, [open]);
    const decided = new Set((await collectStoredProblems()).map((p) => p.key));
    assert.ok(decided.has(`disputed:${open}:lost`));
  });

  it("sends a confirmation for a paid order that has no email_log row at all, once", async () => {
    const orphan = await order({ placed_at: ago(25) });
    const young = await order({ placed_at: ago(1) });
    const cancelled = await order({ placed_at: ago(25), status: "cancelled" });

    const before = await listMissingConfirmations(500);
    assert.ok(before.includes(orphan));
    assert.ok(!before.includes(young), "still inside the webhook's own window");
    assert.ok(!before.includes(cancelled));

    // With only the log-only provider, nothing is attempted: a log row would
    // take the order out of this query without anyone being emailed.
    assert.equal(await sendMissingConfirmations({ delivers: () => false }), 0);
    const untouched = await query("select 1 from email_log where order_id = $1", [orphan]);
    assert.equal(untouched.length, 0);

    await sendMissingConfirmations({ delivers: () => true, limit: 500 });
    const rows = await query("select 1 from email_log where order_id = $1", [orphan]);
    assert.equal(rows.length, 1);
    assert.ok(!(await listMissingConfirmations(500)).includes(orphan), "and it is not tried again");
  });

  it("sweeps processed webhook events past retention and nothing else", async () => {
    const old = `evt_ops_${randomUUID()}`;
    const oldUnprocessed = `evt_ops_${randomUUID()}`;
    const recent = `evt_ops_${randomUUID()}`;

    await query(
      `insert into webhook_event (id, type, received_at, processed_at) values
         ($1, 'x', now() - interval '100 days', now() - interval '100 days'),
         ($2, 'x', now() - interval '100 days', null),
         ($3, 'x', now() - interval '5 days',   now() - interval '5 days')`,
      [old, oldUnprocessed, recent],
    );

    await sweepWebhookEvents();

    const left = (await query<{ id: string }>("select id from webhook_event where id = any($1)", [
      [old, oldUnprocessed, recent],
    ])).map((row) => row.id);

    assert.deepEqual(left.sort(), [oldUnprocessed, recent].sort());
  });

  it("queues paid orders still owed a parcel, oldest first", async () => {
    const oldest = await order({ placed_at: ago(600) });
    const preparing = await order({ placed_at: ago(300), status: "in_process" });
    const shipped = await order({ placed_at: ago(900), status: "shipped" });
    const tracked = await order({ placed_at: ago(900), tracking_number: "9400TEST" });
    const refunded = await order({
      placed_at: ago(900),
      refund_status: "full",
      refunded_cents: 9600,
    });
    const partial = await order({ placed_at: ago(200), refund_status: "partial", refunded_cents: 100 });

    const ids = (await listShipQueue(1000)).map((row) => row.id);

    for (const excluded of [shipped, tracked, refunded]) {
      assert.ok(!ids.includes(excluded));
    }
    assert.ok(ids.indexOf(oldest) < ids.indexOf(preparing));
    assert.ok(ids.indexOf(preparing) < ids.indexOf(partial));
  });

  it("reads back the reconciler's record and the migration ledger", async () => {
    // Not written here: cron-reconcile.test.ts asserts on this one row, and CI
    // runs test files in parallel against one database. The parsing is
    // covered above; this is that the query and the column agree.
    const last = await readLastReconcile();
    assert.ok(last === null || last.at instanceof Date);

    const migrations = await migrationStatus();
    assert.ok(migrations && migrations.applied > 0 && migrations.latest);
  });
});
