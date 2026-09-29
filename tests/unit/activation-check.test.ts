import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import {
  CRON_SECRET_MIN_LENGTH,
  SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH,
  assessShippoWebhooks,
  assessStripeTax,
  assessStripeWebhooks,
  checkDatabase,
  checkEnvironment,
  checkShippo,
  checkStripe,
  format,
  loadEnv,
  redact,
  runChecks,
} from "../../scripts/activation-check.mjs";
import { classifyMigrations, checksumOf } from "../../scripts/db/guard.mjs";
import { CRON_SECRET_MIN_LENGTH as CODE_CRON_MIN } from "../../src/lib/orders/cron.ts";
import { SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH as CODE_SHIPPO_MIN } from "../../src/lib/shipping/webhook.ts";
import { STRIPE_WEBHOOK_EVENTS } from "../../src/lib/stripe/webhook-events.ts";
import { STRIPE_API_VERSION } from "../../src/lib/stripe/client.ts";
import { hashPassword } from "../../src/lib/portal/auth.ts";

/**
 * scripts/activation-check.mjs, with the network and the database stubbed.
 *
 * Three things matter more than any single verdict: it never prints a value,
 * it never writes (every request is a GET, the database runs READ ONLY and
 * rolls back), and the webhook's event list is the handler's, not a copy.
 */

type Result = { section: string; label: string; status: "pass" | "fail" | "warn"; detail?: string; fix?: string };

const SITE = "https://guardtheory.net";
// Built at runtime so no key-shaped literal is committed (GitHub push protection).
const STRIPE_KEY = ["rk", "test", "fixtureOnlyNotAKey"].join("_");
const SHIPPO_TOKEN = ["shippo", "test", "fixtureOnlyNotAToken"].join("_");
const HOOK_TOKEN = "a".repeat(20) + "B".repeat(20);

async function goodEnv(): Promise<Record<string, string>> {
  return {
    DATABASE_URL: "postgresql://owner:pw-SEKRIT-db@ep-x-pooler.neon.tech/neondb?sslmode=require",
    DATABASE_URL_UNPOOLED: "postgresql://owner:pw-SEKRIT-db@ep-x.neon.tech/neondb?sslmode=require",
    STRIPE_SECRET_KEY: STRIPE_KEY,
    STRIPE_WEBHOOK_SECRET: ["whsec", "SEKRITfixture"].join("_"),
    SHIPPO_API_TOKEN: SHIPPO_TOKEN,
    SHIPPO_WEBHOOK_TOKEN: HOOK_TOKEN,
    SHIP_FROM_NAME: "Sender Name SEKRIT",
    SHIP_FROM_STREET1: "1 Example Street SEKRIT",
    SHIP_FROM_CITY: "Los Angeles",
    SHIP_FROM_STATE: "CA",
    SHIP_FROM_ZIP: "90012",
    PORTAL_PASSWORD_HASH: await hashPassword("correct horse battery staple"),
    CRON_SECRET: "c".repeat(64),
    RESEND_API_KEY: "re_SEKRITresendkey123",
    RECEIPT_FROM_EMAIL: "orders@guardtheory.net",
    OWNER_ALERT_EMAIL: "owner-secret@example.com",
    VERCEL_ENV: "production",
  };
}

const byLabel = (results: Result[], label: string) => results.filter((r) => r.label === label);
const failed = (results: Result[]) => results.filter((r) => r.status === "fail");

function endpoint(overrides: Record<string, unknown> = {}) {
  return {
    url: `${SITE}/api/webhooks/stripe`,
    enabled_events: [...STRIPE_WEBHOOK_EVENTS],
    api_version: STRIPE_API_VERSION,
    status: "enabled",
    livemode: false,
    ...overrides,
  };
}

type Call = { url: string; method: string; auth: string | undefined };

/** A fetch that answers from a table of URL substrings and records every call. */
function stubFetch(routes: [string, number, unknown][]) {
  const calls: Call[] = [];
  const fetch = async (url: string, init: RequestInit = {}) => {
    const headers = (init.headers ?? {}) as Record<string, string>;
    calls.push({ url, method: init.method ?? "GET", auth: headers.Authorization });
    const hit = routes.find(([fragment]) => url.includes(fragment));
    const [, status, body] = hit ?? ["", 404, { error: { message: "not stubbed" } }];
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  };
  return { fetch, calls };
}

function happyRoutes(): [string, number, unknown][] {
  return [
    ["api.stripe.com/v1/events", 200, { data: [{ livemode: false }] }],
    ["api.stripe.com/v1/checkout/sessions", 200, { data: [] }],
    ["api.stripe.com/v1/refunds", 200, { data: [] }],
    ["api.stripe.com/v1/charges", 200, { data: [] }],
    ["api.stripe.com/v1/payment_intents", 200, { data: [] }],
    ["api.stripe.com/v1/webhook_endpoints", 200, { data: [endpoint()] }],
    ["api.stripe.com/v1/tax/settings", 200, { status: "active", head_office: { address: { state: "CA" } } }],
    [
      "api.stripe.com/v1/tax/registrations",
      200,
      { data: [{ status: "active", country: "US", country_options: { us: { state: "CA" } } }] },
    ],
    ["api.goshippo.com/carrier_accounts", 200, { results: [{ carrier: "usps", active: true }] }],
    [
      "api.goshippo.com/webhooks",
      200,
      { results: [{ url: `${SITE}/api/webhooks/shippo/${HOOK_TOKEN}`, event: "track_updated", active: true, is_test: true }] },
    ],
    ["api.resend.com/domains", 401, { name: "restricted_api_key", message: "This API key is restricted to only send emails" }],
  ];
}

/** A database stub that records every statement. */
function stubDb(rows: Record<string, unknown[]>) {
  const statements: string[] = [];
  let ended = false;
  const connect = async () => ({
    query: async (sql: string) => {
      statements.push(sql);
      const key = Object.keys(rows).find((fragment) => sql.includes(fragment));
      return { rows: key ? rows[key] : [] };
    },
    end: async () => {
      ended = true;
    },
  });
  return { connect, statements, ended: () => ended };
}

function migrationsDir(files: Record<string, string>) {
  const dir = mkdtempSync(path.join(tmpdir(), "gt-activation-"));
  for (const [name, sql] of Object.entries(files)) writeFileSync(path.join(dir, name), sql);
  return dir;
}

describe("activation check: the numbers it shares with the code", () => {
  it("uses the code's own minimum lengths", () => {
    assert.equal(CRON_SECRET_MIN_LENGTH, CODE_CRON_MIN);
    assert.equal(SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH, CODE_SHIPPO_MIN);
  });

  it("takes the webhook's events from the handler's list, disputes included", () => {
    assert.ok(STRIPE_WEBHOOK_EVENTS.includes("charge.dispute.created"));
    assert.ok(STRIPE_WEBHOOK_EVENTS.includes("charge.dispute.closed"));
    // The handler builds its set from the same array; assessStripeWebhooks defaults to it.
    const results = assessStripeWebhooks([endpoint({ enabled_events: ["checkout.session.completed"] })], {
      url: `${SITE}/api/webhooks/stripe`,
      mode: "test",
    }) as Result[];
    const missing = byLabel(results, "events: missing")[0]!;
    for (const event of STRIPE_WEBHOOK_EVENTS.filter((e) => e !== "checkout.session.completed")) {
      assert.match(missing.detail!, new RegExp(event.replace(/\./g, "\\.")));
    }
  });
});

describe("activation check: environment", () => {
  it("passes a complete, well-formed production environment", async () => {
    assert.deepEqual(failed(checkEnvironment(await goodEnv()) as Result[]), []);
  });

  it("tells a Sensitive variable pulled empty apart from a missing one", async () => {
    const env = { ...(await goodEnv()), STRIPE_SECRET_KEY: "" };
    delete (env as Record<string, string | undefined>).SHIPPO_API_TOKEN;
    const results = checkEnvironment(env) as Result[];
    const empty = byLabel(results, "STRIPE_SECRET_KEY")[0]!;
    assert.equal(empty.status, "fail");
    assert.equal(empty.detail, "empty");
    assert.match(empty.fix!, /vercel env pull/);
    assert.equal(byLabel(results, "SHIPPO_API_TOKEN")[0]!.detail, "not set");
  });

  it("refuses short tokens, a bad hash, a wrong webhook secret and a publishable key", async () => {
    const env = {
      ...(await goodEnv()),
      CRON_SECRET: "x".repeat(CRON_SECRET_MIN_LENGTH - 1),
      SHIPPO_WEBHOOK_TOKEN: "y".repeat(SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH - 1),
      PORTAL_PASSWORD_HASH: "correct horse battery staple",
      STRIPE_WEBHOOK_SECRET: "sk_test_notAWebhookSecret",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_x",
    };
    const labels = failed(checkEnvironment(env) as Result[]).map((r) => r.label).sort();
    assert.deepEqual(labels, [
      "CRON_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "PORTAL_PASSWORD_HASH",
      "SHIPPO_WEBHOOK_TOKEN",
      "STRIPE_WEBHOOK_SECRET",
    ]);
  });

  it("fails a test Stripe key paired with a live Shippo token, and a live key outside production", async () => {
    const mixed = checkEnvironment({ ...(await goodEnv()), SHIPPO_API_TOKEN: "shippo_live_abc" }) as Result[];
    assert.equal(byLabel(mixed, "Stripe and Shippo modes")[0]!.status, "fail");

    const preview = checkEnvironment({
      ...(await goodEnv()),
      STRIPE_SECRET_KEY: "rk_live_abc",
      SHIPPO_API_TOKEN: "shippo_live_abc",
      VERCEL_ENV: "preview",
    }) as Result[];
    assert.equal(byLabel(preview, "STRIPE_SECRET_KEY")[0]!.status, "fail");
  });

  it("reads the file, then lets a non-empty exported value win over an empty pulled one", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "gt-env-"));
    try {
      const file = path.join(dir, ".env.production.local");
      writeFileSync(file, 'STRIPE_SECRET_KEY=""\nSHIP_FROM_CITY="From file"\n');
      const env = loadEnv(file, { STRIPE_SECRET_KEY: STRIPE_KEY, SHIP_FROM_CITY: "" });
      assert.equal(env.STRIPE_SECRET_KEY, STRIPE_KEY);
      assert.equal(env.SHIP_FROM_CITY, "From file");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("activation check: Stripe webhook endpoint", () => {
  const options = { url: `${SITE}/api/webhooks/stripe`, mode: "test" };

  it("passes exactly the handler's events, pinned to the SDK's version", () => {
    const results = assessStripeWebhooks([endpoint()], options) as Result[];
    assert.deepEqual(failed(results), []);
  });

  it("names missing and extra events separately", () => {
    const enabled = [...STRIPE_WEBHOOK_EVENTS.filter((e) => !e.startsWith("charge.dispute.")), "customer.created"];
    const results = assessStripeWebhooks([endpoint({ enabled_events: enabled })], options) as Result[];
    assert.equal(byLabel(results, "events: missing")[0]!.detail, "charge.dispute.created, charge.dispute.closed");
    assert.match(byLabel(results, "events: missing")[0]!.fix!, /chargeback/);
    assert.equal(byLabel(results, "events: extra")[0]!.detail, "customer.created");
  });

  it("fails a wildcard subscription, an old API version, a disabled or live endpoint", () => {
    const results = assessStripeWebhooks(
      [endpoint({ enabled_events: ["*"], api_version: "2024-06-20", status: "disabled", livemode: true })],
      options,
    ) as Result[];
    assert.deepEqual(failed(results).map((r) => r.label).sort(), ["API version", "events", "mode", "status"]);
  });

  it("fails when nothing points at the site, and warns about duplicates", () => {
    const none = assessStripeWebhooks([endpoint({ url: "https://elsewhere.example/hook" })], options) as Result[];
    assert.equal(none.length, 1);
    assert.equal(none[0]!.status, "fail");

    const two = assessStripeWebhooks([endpoint(), endpoint({ url: `${SITE}/api/webhooks/stripe/` })], options) as Result[];
    assert.equal(byLabel(two, "duplicate endpoints")[0]!.status, "warn");
  });
});

describe("activation check: Stripe Tax", () => {
  it("fails without an active California registration, whatever else is right", () => {
    const results = assessStripeTax({ status: "active", head_office: { address: { state: "CA" } } }, [
      { status: "active", country: "US", country_options: { us: { state: "NY" } } },
    ]) as Result[];
    const registration = byLabel(results, "California registration")[0]!;
    assert.equal(registration.status, "fail");
    assert.match(registration.fix!, /\$0 tax/);
  });

  it("fails pending settings and a head office outside California", () => {
    const results = assessStripeTax(
      { status: "pending", status_details: { pending: { missing_fields: ["head_office"] } }, head_office: null },
      null,
    ) as Result[];
    assert.deepEqual(failed(results).map((r) => r.label), ["settings", "head office"]);
  });
});

describe("activation check: network calls", () => {
  it("only ever GETs, and a full run on good settings has nothing to fix", async () => {
    const { fetch, calls } = stubFetch(happyRoutes());
    const db = stubDb({
      "to_regclass('_migration')": [{ t: "_migration" }],
      "from _migration": [{ name: "0001_a.sql", checksum: checksumOf("select 1;\n") }],
      "to_regclass('product')": [{ product: "product", variant: "variant", setting: "setting" }],
      "from product p": [{ n: 1 }],
      "shipping_flat_cents": [{ value: "700" }],
    });
    const dir = migrationsDir({ "0001_a.sql": "select 1;\n" });
    try {
      const results = (await runChecks(await goodEnv(), {
        fetch,
        connect: db.connect,
        migrationsDir: dir,
        site: SITE,
      })) as Result[];
      assert.deepEqual(failed(results), []);
      assert.ok(calls.length >= 10);
      assert.ok(calls.every((call) => call.method === "GET"), "every request is a GET");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("never prints a value — not on success, and not when a provider quotes the key back", async () => {
    const env = await goodEnv();
    const routes = happyRoutes();
    routes.unshift([
      "api.stripe.com/v1/webhook_endpoints",
      403,
      { error: { message: `The provided key '${STRIPE_KEY}' does not have the required permissions (rak_webhook_read).` } },
    ]);
    const { fetch } = stubFetch(routes);
    const dir = migrationsDir({ "0001_a.sql": "select 1;\n" });
    try {
      const db = stubDb({});
      const output = format(await runChecks(env, { fetch, connect: db.connect, migrationsDir: dir, site: SITE }));
      for (const [name, value] of Object.entries(env)) {
        if (["VERCEL_ENV", "SHIP_FROM_STATE", "SHIP_FROM_ZIP", "SHIP_FROM_CITY"].includes(name)) continue;
        assert.ok(!output.includes(value), `${name}'s value appears in the output`);
      }
      assert.ok(!output.includes("SEKRIT"), "a secret-marked string appears in the output");
      // The permission Stripe names is kept: it is the fix.
      assert.match(output, /rak_webhook_read/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("stops at an unrecognised key, and reports a livemode mismatch", async () => {
    const env = await goodEnv();
    const rejected = await checkStripe(env, { fetch: stubFetch([["v1/events", 401, {}]]).fetch, site: SITE });
    assert.equal(rejected.length, 1);
    assert.equal(rejected[0]!.status, "fail");

    const live = await checkStripe(env, {
      fetch: stubFetch([["v1/events", 200, { data: [{ livemode: true }] }], ...happyRoutes()]).fetch,
      site: SITE,
    });
    assert.equal(byLabel(live as Result[], "livemode")[0]!.status, "fail");
  });

  it("finds the Shippo webhook by the token without printing its URL", async () => {
    const env = { ...(await goodEnv()), SHIPPO_WEBHOOK_TOKEN: "Z".repeat(40) };
    const results = (await checkShippo(env, { fetch: stubFetch(happyRoutes()).fetch, site: SITE })) as Result[];
    const hook = byLabel(results, "track_updated endpoint")[0]!;
    assert.equal(hook.status, "fail");
    assert.match(hook.detail!, /none ends in the current SHIPPO_WEBHOOK_TOKEN/);
    assert.ok(!format(results).includes(HOOK_TOKEN));
  });

  it("fails a live-mode Shippo webhook against a test token", () => {
    const results = assessShippoWebhooks(
      [{ url: `${SITE}/api/webhooks/shippo/${HOOK_TOKEN}`, event: "track_updated", is_test: false }],
      { site: SITE, token: HOOK_TOKEN, mode: "test" },
    ) as Result[];
    assert.equal(byLabel(results, "mode")[0]!.status, "fail");
  });
});

describe("activation check: database", () => {
  it("reads inside a read-only transaction, rolls it back, and writes nothing", async () => {
    const db = stubDb({
      "to_regclass('_migration')": [{ t: "_migration" }],
      "from _migration": [{ name: "0001_a.sql", checksum: checksumOf("select 1;\n") }],
      "to_regclass('product')": [{ product: "product", variant: "variant", setting: "setting" }],
      "from product p": [{ n: 0 }],
    });
    const dir = migrationsDir({ "0001_a.sql": "select 1;\n", "0002_b.sql": "select 2;\n" });
    try {
      const results = (await checkDatabase(await goodEnv(), { connect: db.connect, migrationsDir: dir })) as Result[];
      assert.equal(db.statements[0], "begin read only");
      assert.equal(db.statements.at(-1), "rollback");
      assert.ok(db.ended());
      for (const sql of db.statements) {
        assert.doesNotMatch(sql, /\b(insert|update|delete|create|alter|drop)\b/i);
      }
      assert.equal(byLabel(results, "migrations")[0]!.detail, "pending: 0002_b.sql");
      assert.equal(byLabel(results, "something to buy")[0]!.status, "fail");
      assert.equal(byLabel(results, "flat shipping")[0]!.status, "fail");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("reports a failed connection without the connection string", async () => {
    const env = await goodEnv();
    const results = (await checkDatabase(env, {
      connect: async () => {
        throw new Error(`connect failed for ${env.DATABASE_URL_UNPOOLED}`);
      },
      migrationsDir: ".",
    })) as Result[];
    assert.equal(results[0]!.status, "fail");
    assert.ok(!format(results).includes("pw-SEKRIT-db"));
  });

  it("classifies applied, pending, edited and unknown migrations like migrate --status", () => {
    const { migrations, unknown } = classifyMigrations(
      [
        { name: "0002_b.sql", sql: "b" },
        { name: "0001_a.sql", sql: "a" },
        { name: "0003_c.sql", sql: "c" },
      ],
      [
        { name: "0001_a.sql", checksum: checksumOf("a") },
        { name: "0002_b.sql", checksum: checksumOf("edited") },
        { name: "0009_z.sql", checksum: "x" },
      ],
    );
    assert.deepEqual(migrations, [
      { name: "0001_a.sql", state: "applied" },
      { name: "0002_b.sql", state: "changed" },
      { name: "0003_c.sql", state: "pending" },
    ]);
    assert.deepEqual(unknown, ["0009_z.sql"]);
  });
});

describe("activation check: redaction", () => {
  it("removes key-shaped strings and connection-string passwords even when env does not hold them", () => {
    const text = redact(
      "sk_live_abc123 rk_test_x whsec_q shippo_live_abc re_abcdefghij postgres://u:p@host/db /api/webhooks/shippo/tok123",
    );
    assert.doesNotMatch(text, /abc123|rk_test_x|whsec_q|shippo_live_abc|re_abcdefghij|u:p@|tok123/);
  });
});
