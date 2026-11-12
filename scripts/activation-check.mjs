#!/usr/bin/env node
/**
 * Is the shop ready to take a test order? Read-only, and it says what to do.
 *
 *   npm run activation:check -- --env .env.production.local
 *   npm run activation:check -- --env <file> --site https://guardtheory.net
 *   npm run activation:check -- --offline      environment checks only, no network
 *   npm run activation:check -- --ascii        OK/FAIL/WARN instead of symbols
 *
 * Every line is ✓ (fine), ✗ (blocks a test order or going live, with the exact
 * fix underneath) or ! (worth knowing, blocks nothing). The exit code is 1 when
 * anything is ✗.
 *
 * WHAT IT NEVER DOES
 *
 * - Print a value. Not a key, not a masked key, not an address. It prints the
 *   *shape* of a value ("a test restricted key", "41 characters") and the
 *   names of things. Every message that comes back from Stripe, Shippo, Resend
 *   or Postgres is passed through `redact()` first, because Stripe's own error
 *   messages quote part of the key.
 * - Write. Every Stripe, Shippo and Resend call is a GET. The database is read
 *   inside a READ ONLY transaction that is rolled back, and the migration
 *   ledger is read, never created (the same rule as `migrate.mjs --status`).
 *
 * WHERE THE VALUES COME FROM
 *
 * `--env <file>` is read first, then anything exported in the shell overrides
 * it. That order matters for one reason: `vercel env pull` writes every
 * **Sensitive** variable as an empty string. So pull the file for the names and
 * the non-sensitive values, and export the sensitive ones from your password
 * manager in the same shell. A variable that is present but empty is reported
 * as exactly that, with this explanation, rather than as missing.
 *
 * `STRIPE_CHECK_KEY` (optional, never used by the site): the shop's restricted
 * key is scoped to what the code does, and cannot read webhook endpoints or tax
 * settings. Give this script a second restricted key, from the same account and
 * mode, with read access to those, and it checks them too; without one it says
 * which dashboard page to look at instead.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

import { classifyMigrations, describeTarget } from "./db/guard.mjs";
import { STRIPE_WEBHOOK_EVENTS } from "../src/lib/stripe/webhook-events.ts";
import { STRIPE_API_VERSION, stripeKeyRefusal, stripeMode } from "../src/lib/stripe/client.ts";
import { shippoMode } from "../src/lib/shipping/shippo.ts";
import { parsePasswordHash } from "../src/lib/portal/auth.ts";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Mirrors src/lib/orders/cron.ts and src/lib/shipping/webhook.ts; a unit test holds them equal. */
export const CRON_SECRET_MIN_LENGTH = 32;
export const SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH = 32;

/** The cron route vercel.json must schedule, and the handler file behind it. */
export const CRON_PATH = "/api/cron/reconcile";

const STRIPE_API = "https://api.stripe.com";
const SHIPPO_API = "https://api.goshippo.com";
const RESEND_API = "https://api.resend.com";
const SHIPPO_API_VERSION = "2018-02-08";
const TIMEOUT_MS = 10_000;

/** The same test src/lib/ops/alert.ts and src/lib/mail/index.ts apply. */
const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Every variable whose value could hurt someone if it were printed. */
const SECRET_NAMES = [
  "STRIPE_SECRET_KEY",
  "STRIPE_CHECK_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SHIPPO_API_TOKEN",
  "SHIPPO_WEBHOOK_TOKEN",
  "CRON_SECRET",
  "PORTAL_PASSWORD_HASH",
  "RESEND_API_KEY",
  "DATABASE_URL",
  "DATABASE_URL_UNPOOLED",
  "OWNER_ALERT_EMAIL",
  "REPLY_TO_EMAIL",
  "RECEIPT_FROM_EMAIL",
];

/* -------------------------------------------------------------------------- */
/* Results                                                                     */
/* -------------------------------------------------------------------------- */

const pass = (section, label, detail) => ({ section, label, status: "pass", detail });
const fail = (section, label, detail, fix) => ({ section, label, status: "fail", detail, fix });
const warn = (section, label, detail, fix) => ({ section, label, status: "warn", detail, fix });

/**
 * Takes out anything that could be a credential: every secret value in `env`
 * verbatim, and anything shaped like a Stripe, Shippo, Resend or webhook key,
 * a connection string's password, or a Shippo webhook path.
 */
export function redact(text, env = {}) {
  let out = String(text ?? "");
  for (const name of SECRET_NAMES) {
    const value = env[name]?.trim();
    if (value && value.length >= 6) out = out.split(value).join("[redacted]");
  }
  return out
    .replace(/\b(sk|rk|pk)_(test|live)_[A-Za-z0-9*._-]+/g, "[redacted key]")
    .replace(/\bwhsec_[A-Za-z0-9+/=_-]+/g, "[redacted secret]")
    .replace(/\bshippo_(test|live)_[A-Za-z0-9]+/g, "[redacted token]")
    .replace(/\bre_[A-Za-z0-9_]{8,}/g, "[redacted key]")
    .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/g, "$1[redacted]@")
    .replace(/(\/api\/webhooks\/shippo\/)[^\s"'?]+/g, "$1[redacted]");
}

/** A value that is there but empty is almost always a Sensitive variable from `vercel env pull`. */
function emptyNote(name) {
  return (
    `${name} is present but empty. \`vercel env pull\` writes every Sensitive variable ` +
    "as an empty string, so this may be set in Vercel after all. Export the real value in this shell " +
    "(from your password manager) and run the check again."
  );
}

function read(env, name) {
  const raw = env[name];
  if (raw === undefined) return { state: "missing", value: "" };
  const value = String(raw).trim();
  return value ? { state: "set", value } : { state: "empty", value: "" };
}

/* -------------------------------------------------------------------------- */
/* Environment                                                                 */
/* -------------------------------------------------------------------------- */

const VERCEL_ENV_PAGE =
  "Vercel → project guard-theory → Settings → Environment Variables → add it to Production, mark it Sensitive, then redeploy";

/** A required variable: missing and empty are both ✗, and `check` judges the rest. */
function required(results, env, section, name, fix, check) {
  const { state, value } = read(env, name);
  if (state === "missing") {
    results.push(fail(section, name, "not set", fix));
    return null;
  }
  if (state === "empty") {
    results.push(fail(section, name, "empty", emptyNote(name)));
    return null;
  }
  const verdict = check ? check(value) : null;
  if (verdict && verdict.problem) {
    results.push(fail(section, name, verdict.problem, verdict.fix ?? fix));
    return null;
  }
  results.push(pass(section, name, verdict?.ok ?? "set"));
  return value;
}

/** An optional variable: absence is fine, a malformed value is not. */
function optional(results, env, section, name, check, absentNote = "not set (optional)") {
  const { state, value } = read(env, name);
  if (state !== "set") {
    results.push(pass(section, name, state === "empty" ? "empty (optional)" : absentNote));
    return null;
  }
  const verdict = check ? check(value) : null;
  if (verdict && verdict.problem) {
    results.push(fail(section, name, verdict.problem, verdict.fix));
    return null;
  }
  results.push(pass(section, name, verdict?.ok ?? "set"));
  return value;
}

function describeStripeKey(value) {
  const match = /^(sk|rk)_(test|live)_/.exec(value);
  if (!match) return null;
  return `${match[2]} ${match[1] === "rk" ? "restricted" : "secret"} key`;
}

function fromAddress(value) {
  const angle = /<([^<>\s]+)>\s*$/.exec(value);
  return angle ? angle[1] : value;
}

export function checkEnvironment(env) {
  const results = [];

  /* Database ---------------------------------------------------------------- */
  const S = "Environment: database";
  required(
    results,
    env,
    S,
    "DATABASE_URL",
    "It is injected by the Neon integration. Vercel → Storage → the Neon database → connect it to Production.",
    (v) =>
      /^postgres(ql)?:\/\//.test(v)
        ? { ok: `a Postgres URL (${describeTarget(v).label})` }
        : { problem: "not a postgres:// connection string" },
  );
  optional(
    results,
    env,
    S,
    "DATABASE_URL_UNPOOLED",
    (v) =>
      /^postgres(ql)?:\/\//.test(v)
        ? { ok: `a Postgres URL (${describeTarget(v).label})` }
        : { problem: "not a postgres:// connection string", fix: "Copy it from the Neon integration again." },
    "not set — migrations and backups fall back to the pooled URL",
  );

  /* Stripe ------------------------------------------------------------------ */
  const T = "Environment: Stripe";
  const key = required(
    results,
    env,
    T,
    "STRIPE_SECRET_KEY",
    "Stripe (Test mode) → Developers → API keys → Create restricted key (write: Checkout Sessions, Refunds; read: Events, Charges, PaymentIntents). Put the rk_test_… value in " +
      VERCEL_ENV_PAGE +
      ". docs/owner-checklist.md step 3.1.",
    (v) => {
      const kind = describeStripeKey(v);
      if (!kind) {
        return {
          problem: "does not start with rk_test_, rk_live_, sk_test_ or sk_live_",
          fix: "Copy the key again from Stripe → Developers → API keys. A publishable key (pk_…) is not the one.",
        };
      }
      const refusal = stripeKeyRefusal(env);
      if (refusal) {
        return {
          problem: "a LIVE key, outside Production — the site refuses it",
          fix: "Put the live key in the Production environment only; use a test key everywhere else.",
        };
      }
      return { ok: kind };
    },
  );
  if (key && key.startsWith("sk_")) {
    results.push(
      warn(
        T,
        "STRIPE_SECRET_KEY scope",
        "a full secret key, not a restricted one",
        "Works, but can do anything on the account. Create a restricted key (docs/owner-checklist.md step 3.1) and replace it.",
      ),
    );
  }
  required(
    results,
    env,
    T,
    "STRIPE_WEBHOOK_SECRET",
    "Stripe → Developers → Webhooks → the guardtheory.net endpoint → Signing secret → reveal, copy, and put it in " +
      VERCEL_ENV_PAGE +
      ".",
    (v) =>
      /^whsec_\S{8,}$/.test(v)
        ? { ok: "a webhook signing secret (whsec_…)" }
        : {
            problem: "does not start with whsec_",
            fix: "It is the endpoint's Signing secret, not an API key. Stripe → Developers → Webhooks → the endpoint → Signing secret.",
          },
  );
  optional(results, env, T, "STRIPE_APPAREL_TAX_CODE", (v) =>
    /^txcd_\d{8}$/.test(v)
      ? { ok: "a Stripe tax code" }
      : { problem: "not a Stripe tax code (txcd_ and eight digits)", fix: "Remove it (the code defaults to txcd_30021000) or correct it." },
  "not set — the code sends txcd_30021000 (owner decision, docs/owner-checklist.md step 9)");

  const publishable = read(env, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  if (publishable.state !== "missing") {
    results.push(
      fail(
        T,
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "set, and this build must not have one",
        "Delete it in Vercel. Checkout is Stripe's hosted page; a publishable key invites Stripe.js onto the site and breaks the CSP (docs/provisioning.md Tier 3).",
      ),
    );
  }

  const checkKey = read(env, "STRIPE_CHECK_KEY");
  if (checkKey.state === "set") {
    const kind = describeStripeKey(checkKey.value);
    const keyMode = stripeMode(env);
    const checkMode = stripeMode({ STRIPE_SECRET_KEY: checkKey.value });
    if (!kind) {
      results.push(fail(T, "STRIPE_CHECK_KEY", "not a Stripe secret or restricted key", "Copy it again, or unset it."));
    } else if (keyMode !== "unknown" && checkMode !== keyMode) {
      results.push(
        fail(T, "STRIPE_CHECK_KEY", `a ${checkMode} key while STRIPE_SECRET_KEY is ${keyMode}`, "Use a key from the same mode, or the endpoint it finds is the other mode's."),
      );
    } else {
      results.push(pass(T, "STRIPE_CHECK_KEY", `${kind}, used only by this script`));
    }
  }

  /* Shippo ------------------------------------------------------------------ */
  const H = "Environment: Shippo";
  required(
    results,
    env,
    H,
    "SHIPPO_API_TOKEN",
    "Shippo → Settings → API → generate a test token (shippo_test_…) and put it in " +
      VERCEL_ENV_PAGE +
      ". docs/owner-checklist.md step 4.1.",
    (v) =>
      /^shippo_(test|live)_\S+$/.test(v)
        ? { ok: `a ${shippoMode(env)} token` }
        : { problem: "does not start with shippo_test_ or shippo_live_", fix: "Copy the API token again from Shippo → Settings → API." },
  );
  required(
    results,
    env,
    H,
    "SHIPPO_WEBHOOK_TOKEN",
    "Generate a random string of at least 32 letters and digits (a password manager's generator will do) and put it in " +
      VERCEL_ENV_PAGE +
      ". docs/owner-checklist.md step 4.2.",
    (v) => {
      if (v.length < SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH) {
        return {
          problem: `${v.length} characters; the site refuses anything under ${SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH} and the webhook answers 404`,
          fix: `Replace it with at least ${SHIPPO_WEBHOOK_TOKEN_MIN_LENGTH} random letters and digits, in Vercel and in the Shippo webhook URL.`,
        };
      }
      return { ok: `${v.length} characters` };
    },
  );
  const token = read(env, "SHIPPO_WEBHOOK_TOKEN");
  if (token.state === "set" && !/^[A-Za-z0-9]+$/.test(token.value)) {
    results.push(
      warn(H, "SHIPPO_WEBHOOK_TOKEN characters", "contains characters other than letters and digits", "It is a URL path segment. Letters and digits only avoids any escaping mismatch between Shippo and the site."),
    );
  }
  const shipFix = (name) =>
    `Set ${name} to the ship-from address in ${VERCEL_ENV_PAGE}. Labels fail without all five (docs/owner-checklist.md step 4.4).`;
  for (const name of ["SHIP_FROM_NAME", "SHIP_FROM_STREET1", "SHIP_FROM_CITY"]) {
    required(results, env, H, name, shipFix(name));
  }
  required(results, env, H, "SHIP_FROM_STATE", shipFix("SHIP_FROM_STATE"), (v) =>
    /^[A-Za-z]{2}$/.test(v) ? { ok: "a two-letter state" } : { problem: "not a two-letter state code" },
  );
  required(results, env, H, "SHIP_FROM_ZIP", shipFix("SHIP_FROM_ZIP"), (v) =>
    /^\d{5}(-\d{4})?$/.test(v) ? { ok: "a ZIP code" } : { problem: "not a five-digit (or ZIP+4) ZIP code" },
  );
  optional(results, env, H, "SHIP_FROM_COUNTRY", (v) =>
    /^[A-Za-z]{2}$/.test(v) ? { ok: "a two-letter country" } : { problem: "not a two-letter country code", fix: "Use US, or remove it (it defaults to US)." },
  "not set — defaults to US");
  optional(results, env, H, "SHIP_FROM_EMAIL", (v) =>
    ADDRESS.test(v) ? { ok: "an email address" } : { problem: "not an email address", fix: "Correct it or remove it." },
  );
  for (const name of ["SHIP_PARCEL_LENGTH_IN", "SHIP_PARCEL_WIDTH_IN", "SHIP_PARCEL_HEIGHT_IN", "SHIP_PARCEL_WEIGHT_OZ"]) {
    optional(results, env, H, name, (v) =>
      /^\d+(\.\d+)?$/.test(v) && Number(v) > 0 ? { ok: "a positive number" } : { problem: "not a positive number", fix: "Correct it or remove it to use the default." },
    "not set — the code default applies");
  }

  /* Modes agree ------------------------------------------------------------- */
  const stripeM = stripeMode(env);
  const shippoM = shippoMode(env);
  if (stripeM !== "unknown" && shippoM !== "unknown") {
    results.push(
      stripeM === shippoM
        ? pass("Environment: modes", "Stripe and Shippo modes", `both ${stripeM}`)
        : fail(
            "Environment: modes",
            "Stripe and Shippo modes",
            `Stripe is ${stripeM}, Shippo is ${shippoM}`,
            stripeM === "test"
              ? "A test order would buy a real, paid label. Use the shippo_test_ token until the live cutover (docs/owner-checklist.md step 12)."
              : "Real orders would get VOID test labels. Switch both to live together (docs/owner-checklist.md step 12).",
          ),
    );
  }

  /* Portal and schedule ----------------------------------------------------- */
  const P = "Environment: portal and schedule";
  required(
    results,
    env,
    P,
    "PORTAL_PASSWORD_HASH",
    "From a checkout of main run `node scripts/hash-password.mjs`, and put the one line it prints in " +
      VERCEL_ENV_PAGE +
      ". docs/owner-checklist.md step 5.",
    (v) =>
      parsePasswordHash(v)
        ? { ok: "a usable scrypt hash" }
        : {
            problem: "not a hash the portal accepts — sign-in refuses every password",
            fix: "Run `node scripts/hash-password.mjs` again and paste the whole line it prints (it starts scrypt$). Never the password itself.",
          },
  );
  required(
    results,
    env,
    P,
    "CRON_SECRET",
    "docs/provisioning.md, \"The scheduled reconciler\", has the one-line command that sets it.",
    (v) =>
      v.length >= CRON_SECRET_MIN_LENGTH
        ? { ok: `${v.length} characters` }
        : {
            problem: `${v.length} characters; the cron route refuses anything under ${CRON_SECRET_MIN_LENGTH}`,
            fix: "Remove it and set a new one with the command in docs/provisioning.md, \"The scheduled reconciler\".",
          },
  );

  /* Mail -------------------------------------------------------------------- */
  const M = "Environment: mail";
  required(results, env, M, "RESEND_API_KEY", "Resend → API Keys → create one with sending access, and put it in " + VERCEL_ENV_PAGE + ".", (v) =>
    v.startsWith("re_") ? { ok: "a Resend key (re_…)" } : { ok: "set (does not start with re_; see the Resend check below)" },
  );
  required(
    results,
    env,
    M,
    "RECEIPT_FROM_EMAIL",
    "An address on the verified domain, in " + VERCEL_ENV_PAGE + ".",
    (v) =>
      ADDRESS.test(fromAddress(v))
        ? { ok: "an email address" }
        : { problem: "not an email address (or Name <address>)", fix: "Set it to an address on the verified Resend domain." },
  );
  required(
    results,
    env,
    M,
    "OWNER_ALERT_EMAIL",
    "Set it to an address you read, in " +
      VERCEL_ENV_PAGE +
      ". Optional to the code, but without it nothing tells you when a payment has no order or a label never finished (docs/owner-checklist.md step 6).",
    (v) =>
      ADDRESS.test(v)
        ? { ok: "an email address" }
        : { problem: "not an email address — the alert is silently off", fix: "Correct it in Vercel and redeploy." },
  );
  optional(results, env, M, "REPLY_TO_EMAIL", (v) =>
    ADDRESS.test(v)
      ? { ok: "an email address" }
      : { problem: "not an email address — it is ignored and replies go to the from-address", fix: "Correct it or remove it." },
  );

  return results;
}

/* -------------------------------------------------------------------------- */
/* Pure judgements, exported for the tests                                     */
/* -------------------------------------------------------------------------- */

function normaliseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host.toLowerCase()}${parsed.pathname.replace(/\/+$/, "")}`;
  } catch {
    return String(url);
  }
}

/**
 * The webhook endpoints Stripe returned, against what the handler acts on.
 * `mode` is the key's ("test" or "live"); each endpoint carries `livemode`.
 */
export function assessStripeWebhooks(endpoints, { url, events = STRIPE_WEBHOOK_EVENTS, apiVersion = STRIPE_API_VERSION, mode }) {
  const S = "Stripe webhook";
  const results = [];
  const want = normaliseUrl(url);
  const matching = endpoints.filter((endpoint) => normaliseUrl(endpoint.url) === want);
  const eventList = events.join(", ");

  if (matching.length === 0) {
    results.push(
      fail(
        S,
        `endpoint ${url}`,
        endpoints.length === 0 ? "no webhook endpoints on this account" : `none of the ${endpoints.length} endpoint(s) points at this URL`,
        `Stripe → Developers → Webhooks → Add endpoint. URL ${url}; events exactly: ${eventList}; API version ${apiVersion}. Copy its signing secret into STRIPE_WEBHOOK_SECRET.`,
      ),
    );
    return results;
  }

  if (matching.length > 1) {
    results.push(
      warn(
        S,
        "duplicate endpoints",
        `${matching.length} endpoints point at ${url}`,
        "Each has its own signing secret and only one can match STRIPE_WEBHOOK_SECRET; the other's deliveries fail and retry. Delete the extra one.",
      ),
    );
  }

  matching.forEach((endpoint, index) => {
    const which = matching.length > 1 ? ` (#${index + 1})` : "";
    const enabled = Array.isArray(endpoint.enabled_events) ? endpoint.enabled_events : [];

    results.push(
      endpoint.status === "enabled"
        ? pass(S, `status${which}`, "enabled")
        : fail(S, `status${which}`, String(endpoint.status ?? "unknown"), "Stripe → Developers → Webhooks → the endpoint → enable it."),
    );

    if (typeof endpoint.livemode === "boolean" && mode !== "unknown") {
      const endpointMode = endpoint.livemode ? "live" : "test";
      results.push(
        endpointMode === mode
          ? pass(S, `mode${which}`, endpointMode)
          : fail(S, `mode${which}`, `${endpointMode} endpoint, ${mode} key`, "Create the endpoint in the same mode as the key; its signing secret is per mode."),
      );
    }

    if (enabled.includes("*")) {
      results.push(
        fail(S, `events${which}`, "subscribed to every event (*)", `Edit the endpoint: select exactly ${eventList}.`),
      );
    } else {
      const missing = events.filter((event) => !enabled.includes(event));
      const extra = enabled.filter((event) => !events.includes(event));
      if (missing.length === 0 && extra.length === 0) {
        results.push(pass(S, `events${which}`, `exactly the ${events.length} the handler acts on`));
      } else {
        if (missing.length > 0) {
          results.push(
            fail(
              S,
              `events${which}: missing`,
              missing.join(", "),
              `Edit the endpoint and add ${missing.join(", ")}.` +
                (missing.some((event) => event.startsWith("charge.dispute."))
                  ? " Without the dispute events a chargeback never reaches the order, and it can be shipped while disputed."
                  : ""),
            ),
          );
        }
        if (extra.length > 0) {
          results.push(
            fail(
              S,
              `events${which}: extra`,
              extra.join(", "),
              `Edit the endpoint and remove ${extra.join(", ")}. The handler answers them 200 and does nothing; they only add noise and retries.`,
            ),
          );
        }
      }
    }

    results.push(
      endpoint.api_version === apiVersion
        ? pass(S, `API version${which}`, apiVersion)
        : fail(
            S,
            `API version${which}`,
            endpoint.api_version ? String(endpoint.api_version) : "the account default (not pinned)",
            `The endpoint must be ${apiVersion}, the version the SDK is built against. On an older version the shipping address is not where the code reads it and labels fail days later. Stripe cannot change an endpoint's version in place: create a new endpoint with ${apiVersion}, update STRIPE_WEBHOOK_SECRET, delete the old one.`,
          ),
    );
  });

  results.push(
    warn(
      S,
      "signing secret",
      "cannot be compared from here — Stripe never returns it after creation",
      "The test order proves it: an order appears in the portal within seconds of paying. If it does not, and Stripe → Webhooks → the endpoint shows 400 responses, STRIPE_WEBHOOK_SECRET is from a different endpoint.",
    ),
  );

  return results;
}

/** Stripe Tax settings and registrations. */
export function assessStripeTax(settings, registrations) {
  const S = "Stripe Tax";
  const results = [];

  if (settings) {
    if (settings.status === "active") {
      results.push(pass(S, "settings", "active"));
    } else {
      const missing = settings.status_details?.pending?.missing_fields;
      results.push(
        fail(
          S,
          "settings",
          `${settings.status ?? "unknown"}${Array.isArray(missing) && missing.length ? ` — missing: ${missing.join(", ")}` : ""}`,
          "Stripe → Settings → Tax: set the head office (the Los Angeles address) and the defaults (docs/owner-checklist.md step 3.3).",
        ),
      );
    }

    const state = settings.head_office?.address?.state;
    results.push(
      state === "CA"
        ? pass(S, "head office", "in California")
        : fail(
            S,
            "head office",
            state ? `in ${state}, not California` : "not set",
            "Stripe → Settings → Tax → head office: the Los Angeles address. California is origin-sourced, so this address changes what buyers are charged.",
          ),
    );
  }

  if (registrations) {
    const active = registrations.filter(
      (r) => r.status === "active" && r.country === "US" && r.country_options?.us?.state === "CA",
    );
    const scheduled = registrations.filter(
      (r) => r.status === "scheduled" && r.country === "US" && r.country_options?.us?.state === "CA",
    );
    if (active.length > 0) {
      results.push(pass(S, "California registration", "active"));
    } else {
      results.push(
        fail(
          S,
          "California registration",
          scheduled.length > 0 ? "scheduled, not active yet" : "none",
          "Once the CDTFA seller's permit exists (docs/owner-checklist.md step 2): Stripe → Tax → Registrations → add California. Without it Stripe Tax charges $0 tax and does not error — the test order's CA tax check will read 0.",
        ),
      );
    }
  }

  return results;
}

/** Shippo's registered webhooks, against the URL the site answers on. Never prints a URL: it contains the token. */
export function assessShippoWebhooks(webhooks, { site, token, mode }) {
  const S = "Shippo webhook";
  const expected = token ? normaliseUrl(`${site}/api/webhooks/shippo/${token}`) : null;
  const prefix = normaliseUrl(`${site}/api/webhooks/shippo`);
  const ours = webhooks.filter((hook) => normaliseUrl(hook.url ?? "").startsWith(`${prefix}/`));
  const exact = expected ? ours.filter((hook) => normaliseUrl(hook.url ?? "") === expected) : [];
  const fix = `Shippo → Settings → Webhooks → add a ${mode === "live" ? "live" : "test"} webhook for track_updated at ${site}/api/webhooks/shippo/ followed by SHIPPO_WEBHOOK_TOKEN (docs/owner-checklist.md step 4.3).`;

  if (exact.length === 0) {
    return [
      fail(
        S,
        "track_updated endpoint",
        ours.length > 0
          ? `${ours.length} webhook(s) point at the site, but none ends in the current SHIPPO_WEBHOOK_TOKEN`
          : "none points at the site",
        ours.length > 0
          ? "The token in the Shippo URL and SHIPPO_WEBHOOK_TOKEN must be the same string. Edit the Shippo webhook (or the variable) so they match; a mismatch is answered 404 and Shippo gives up."
          : fix,
      ),
    ];
  }

  const results = [];
  const tracking = exact.filter((hook) => hook.event === "track_updated");
  results.push(
    tracking.length > 0
      ? pass(S, "track_updated endpoint", "registered with the current token")
      : fail(S, "track_updated endpoint", `registered for ${[...new Set(exact.map((h) => h.event))].join(", ")}, not track_updated`, fix),
  );

  for (const hook of tracking) {
    if (hook.active === false) {
      results.push(fail(S, "active", "the webhook is disabled", "Shippo → Settings → Webhooks → enable it."));
    }
    if (typeof hook.is_test === "boolean" && mode !== "unknown") {
      const hookMode = hook.is_test ? "test" : "live";
      results.push(
        hookMode === mode
          ? pass(S, "mode", hookMode)
          : fail(S, "mode", `${hookMode} webhook, ${mode} token`, "Test and live need their own registered webhooks; register one in the token's mode."),
      );
    }
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Network                                                                     */
/* -------------------------------------------------------------------------- */

async function getJson(fetchImpl, url, headers) {
  try {
    const response = await fetchImpl(url, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    let body = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: null, error: error instanceof Error ? error.message : String(error) };
  }
}

function stripeError(result, env) {
  if (result.status === 0) return `unreachable: ${redact(result.error, env)}`;
  const message = result.body?.error?.message;
  return `HTTP ${result.status}${message ? `: ${redact(message, env)}` : ""}`;
}

export async function checkStripe(env, { fetch: fetchImpl, site }) {
  const S = "Stripe";
  const results = [];
  const key = read(env, "STRIPE_SECRET_KEY").value;
  const mode = stripeMode(env);

  if (!key || !describeStripeKey(key)) {
    results.push(warn(S, "API", "skipped — STRIPE_SECRET_KEY is not usable (see above)"));
    return results;
  }

  const auth = (k) => ({ Authorization: `Bearer ${k}` });
  const events = await getJson(fetchImpl, `${STRIPE_API}/v1/events?limit=1`, auth(key));

  if (!events.ok) {
    results.push(
      fail(
        S,
        "API reachable with STRIPE_SECRET_KEY",
        stripeError(events, env),
        events.status === 401
          ? "Stripe does not recognise the key — it was rolled or deleted. Create a new restricted key and replace it in Vercel."
          : events.status === 403
            ? "The key cannot read Events. Stripe → Developers → API keys → edit the restricted key: Events → Read."
            : "Check the network and https://status.stripe.com, then run again.",
      ),
    );
    return results;
  }

  results.push(pass(S, "API reachable with STRIPE_SECRET_KEY", `${mode} key accepted`));

  const latest = events.body?.data?.[0];
  if (latest && typeof latest.livemode === "boolean") {
    const seen = latest.livemode ? "live" : "test";
    results.push(
      seen === mode
        ? pass(S, "livemode", `Stripe answers in ${seen} mode, matching the key`)
        : fail(S, "livemode", `Stripe answers in ${seen} mode, the key's prefix says ${mode}`, "Replace STRIPE_SECRET_KEY with a key copied from the dashboard in the right mode."),
    );
  } else {
    results.push(pass(S, "livemode", `no events yet to compare; the key is a ${mode} key`));
  }

  // The reads the code itself does, with the key the code uses. Writes (create
  // a Checkout Session, create a Refund) cannot be proved without writing; the
  // test order proves them.
  const probes = [
    ["Checkout Sessions", "/v1/checkout/sessions?limit=1", "the reconciler lists them"],
    ["Refunds", "/v1/refunds?limit=1", "the reconciler lists them"],
    ["Charges", "/v1/charges?limit=1", "refund and dispute sync read them"],
    ["PaymentIntents", "/v1/payment_intents?limit=1", "refunds are issued against them"],
  ];
  for (const [name, route, why] of probes) {
    const result = await getJson(fetchImpl, `${STRIPE_API}${route}`, auth(key));
    results.push(
      result.ok
        ? pass(S, `key can read ${name}`, why)
        : fail(
            S,
            `key can read ${name}`,
            stripeError(result, env),
            `Stripe → Developers → API keys → edit the restricted key and give it ${name === "Checkout Sessions" || name === "Refunds" ? "Write" : "Read"} on ${name} (docs/owner-checklist.md step 3.1).`,
          ),
    );
  }
  results.push(
    warn(
      S,
      "key can write Checkout Sessions and Refunds",
      "not provable without writing",
      "The test order (docs/test-order-runbook.md) proves both: checkout opening proves the first, the refund step the second.",
    ),
  );

  // Webhook endpoints and tax settings are outside the site key's scopes.
  const checkKey = read(env, "STRIPE_CHECK_KEY").value || key;
  const usingCheckKey = checkKey !== key;
  const outOfScope = (what, page) =>
    usingCheckKey
      ? `Give STRIPE_CHECK_KEY read access to ${what} (Stripe's error above names the permission), or check ${page} by eye.`
      : `The site's restricted key is not scoped to read ${what}, by design. Either check ${page} by eye, or create a second restricted key with read access to it, export it as STRIPE_CHECK_KEY, and run again.`;

  const endpoints = await getJson(fetchImpl, `${STRIPE_API}/v1/webhook_endpoints?limit=100`, auth(checkKey));
  if (endpoints.ok) {
    results.push(
      ...assessStripeWebhooks(endpoints.body?.data ?? [], {
        url: `${site}/api/webhooks/stripe`,
        mode,
      }),
    );
  } else {
    results.push(
      warn(
        "Stripe webhook",
        "endpoint",
        `could not read webhook endpoints (${stripeError(endpoints, env)})`,
        outOfScope(
          "webhook endpoints",
          `Stripe → Developers → Webhooks: one endpoint at ${site}/api/webhooks/stripe, events exactly ${STRIPE_WEBHOOK_EVENTS.join(", ")}, API version ${STRIPE_API_VERSION}`,
        ),
      ),
    );
  }

  const settings = await getJson(fetchImpl, `${STRIPE_API}/v1/tax/settings`, auth(checkKey));
  const registrations = await getJson(fetchImpl, `${STRIPE_API}/v1/tax/registrations?limit=100`, auth(checkKey));
  if (settings.ok || registrations.ok) {
    results.push(
      ...assessStripeTax(settings.ok ? settings.body : null, registrations.ok ? registrations.body?.data ?? [] : null),
    );
  }
  for (const [name, result, what] of [
    ["settings", settings, "tax settings"],
    ["California registration", registrations, "tax registrations"],
  ]) {
    if (!result.ok) {
      results.push(
        warn(
          "Stripe Tax",
          name,
          `could not read ${what} (${stripeError(result, env)})`,
          outOfScope(what, "Stripe → Settings → Tax (head office in Los Angeles) and Tax → Registrations (California, active)"),
        ),
      );
    }
  }

  return results;
}

function shippoError(result, env) {
  if (result.status === 0) return `unreachable: ${redact(result.error, env)}`;
  const detail = result.body?.detail;
  return `HTTP ${result.status}${typeof detail === "string" ? `: ${redact(detail, env)}` : ""}`;
}

export async function checkShippo(env, { fetch: fetchImpl, site }) {
  const S = "Shippo";
  const results = [];
  const token = read(env, "SHIPPO_API_TOKEN").value;
  const mode = shippoMode(env);

  if (!token || mode === "unknown") {
    results.push(warn(S, "API", "skipped — SHIPPO_API_TOKEN is not usable (see above)"));
    return results;
  }

  const headers = { Authorization: `ShippoToken ${token}`, "SHIPPO-API-VERSION": SHIPPO_API_VERSION };
  const carriers = await getJson(fetchImpl, `${SHIPPO_API}/carrier_accounts/?results=100`, headers);

  if (!carriers.ok) {
    results.push(
      fail(
        S,
        "API reachable with SHIPPO_API_TOKEN",
        shippoError(carriers, env),
        carriers.status === 401
          ? "Shippo does not recognise the token. Generate a new one in Shippo → Settings → API and replace it in Vercel."
          : "Check the network and Shippo's status page, then run again.",
      ),
    );
    return results;
  }

  results.push(pass(S, "API reachable with SHIPPO_API_TOKEN", `${mode} token accepted`));

  const accounts = Array.isArray(carriers.body?.results) ? carriers.body.results : [];
  const usps = accounts.filter((account) => String(account.carrier ?? "").toLowerCase() === "usps");
  results.push(
    usps.some((account) => account.active !== false)
      ? pass(S, "USPS carrier account", "active")
      : fail(
          S,
          "USPS carrier account",
          usps.length > 0 ? "present but inactive" : "none on this account",
          "Labels are USPS Ground Advantage. In Shippo's carrier settings, enable USPS for this account.",
        ),
  );

  const hooks = await getJson(fetchImpl, `${SHIPPO_API}/webhooks/`, headers);
  if (hooks.ok) {
    const list = Array.isArray(hooks.body?.results) ? hooks.body.results : Array.isArray(hooks.body) ? hooks.body : [];
    results.push(
      ...assessShippoWebhooks(list, {
        site,
        token: read(env, "SHIPPO_WEBHOOK_TOKEN").value,
        mode,
      }),
    );
  } else {
    results.push(
      warn(
        "Shippo webhook",
        "track_updated endpoint",
        `could not list webhooks (${shippoError(hooks, env)})`,
        `Check Shippo → Settings → Webhooks by eye: one track_updated webhook at ${site}/api/webhooks/shippo/ followed by SHIPPO_WEBHOOK_TOKEN, in ${mode} mode.`,
      ),
    );
  }

  return results;
}

export async function checkResend(env, { fetch: fetchImpl }) {
  const S = "Mail";
  const results = [];
  const apiKey = read(env, "RESEND_API_KEY").value;
  const from = read(env, "RECEIPT_FROM_EMAIL").value;

  results.push(
    apiKey && from
      ? pass(S, "provider", "Resend — order mail is sent")
      : fail(
          S,
          "provider",
          "logging only — order confirmations are written to the log, not sent",
          "Set both RESEND_API_KEY and RECEIPT_FROM_EMAIL in Vercel Production and redeploy.",
        ),
  );

  if (!apiKey) return results;

  const domains = await getJson(fetchImpl, `${RESEND_API}/domains`, { Authorization: `Bearer ${apiKey}` });
  const fromDomain = from ? fromAddress(from).split("@")[1]?.toLowerCase() : undefined;

  if (domains.ok) {
    const list = Array.isArray(domains.body?.data) ? domains.body.data : [];
    const match = fromDomain
      ? list.find((d) => fromDomain === String(d.name).toLowerCase() || fromDomain.endsWith(`.${String(d.name).toLowerCase()}`))
      : undefined;
    results.push(
      !fromDomain
        ? warn(S, "sending domain", "no from-address to check")
        : match && match.status === "verified"
          ? pass(S, "sending domain", `${match.name} is verified`)
          : fail(
              S,
              "sending domain",
              match ? `${match.name} is ${match.status}` : `no Resend domain covers ${fromDomain}`,
              "Resend → Domains: the from-address's domain must be Verified (DNS is at vallaserver; docs/provisioning.md Tier 4).",
            ),
    );
  } else if (domains.body?.name === "restricted_api_key") {
    results.push(
      pass(S, "Resend key", "accepted; it is sending-only, as recommended, so the domain is not readable from here"),
    );
  } else {
    results.push(
      fail(
        S,
        "Resend key",
        domains.status === 0 ? `unreachable: ${redact(domains.error, env)}` : `HTTP ${domains.status}${domains.body?.name ? ` (${domains.body.name})` : ""}`,
        domains.status === 401 || domains.status === 403
          ? "Resend does not accept the key. Resend → API Keys → create one with sending access and replace RESEND_API_KEY."
          : "Check the network, then run again.",
      ),
    );
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Database                                                                    */
/* -------------------------------------------------------------------------- */

export function readMigrationFiles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => ({ name, sql: readFileSync(path.join(dir, name), "utf8") }));
}

/** @param {string} url @returns {Promise<any>} */
async function defaultConnect(url) {
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    connectionString: url,
    ssl: /sslmode=(disable|allow)/.test(url) ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: TIMEOUT_MS,
    statement_timeout: TIMEOUT_MS,
  });
  await client.connect();
  return client;
}

/**
 * @typedef {{ query: (sql: string) => Promise<{ rows: any[] }>, end?: () => Promise<void> }} ReadClient
 * @param {Record<string, string | undefined>} env
 * @param {{ connect?: (url: string) => Promise<ReadClient>, migrationsDir: string }} options
 */
export async function checkDatabase(env, { connect = defaultConnect, migrationsDir }) {
  const S = "Database";
  const results = [];
  const url = read(env, "DATABASE_URL_UNPOOLED").value || read(env, "DATABASE_URL").value;

  if (!url) {
    results.push(warn(S, "connection", "skipped — no DATABASE_URL (see above)"));
    return results;
  }

  const target = describeTarget(url).label;
  let client;

  try {
    client = await connect(url);
  } catch (error) {
    results.push(
      fail(
        S,
        "connection",
        `could not connect to ${target}: ${redact(error instanceof Error ? error.message : error, env)}`,
        "Check the URL came from the Neon integration, and that the Neon project is not suspended (Neon console).",
      ),
    );
    return results;
  }

  try {
    // Nothing below can write, even by mistake: the transaction refuses it.
    await client.query("begin read only");
    results.push(pass(S, "connection", target));

    const ledger = await client.query("select to_regclass('_migration')::text as t");
    const applied = ledger.rows[0]?.t
      ? (await client.query("select name, checksum from _migration")).rows
      : [];
    const { migrations, unknown } = classifyMigrations(readMigrationFiles(migrationsDir), applied);
    const pending = migrations.filter((m) => m.state === "pending").map((m) => m.name);
    const changed = migrations.filter((m) => m.state === "changed").map((m) => m.name);

    results.push(
      pending.length === 0
        ? pass(S, "migrations", `all ${migrations.length} applied`)
        : fail(
            S,
            "migrations",
            `pending: ${pending.join(", ")}`,
            "Apply them before the code that needs them is deployed: `npm run db:status:production`, then `npm run db:migrate:production` (docs/database-runbook.md).",
          ),
    );
    if (changed.length > 0) {
      results.push(
        fail(S, "migrations edited after applying", changed.join(", "), "Restore the file as it was applied and write a new migration instead (scripts/db/migrate.mjs refuses to continue)."),
      );
    }
    if (unknown.length > 0) {
      results.push(
        warn(S, "migrations this checkout does not have", unknown.join(", "), "Run the check from an up-to-date checkout of the branch being deployed."),
      );
    }

    const tables = (
      await client.query(
        "select to_regclass('product')::text as product, to_regclass('variant')::text as variant, to_regclass('setting')::text as setting",
      )
    ).rows[0];

    if (tables?.product && tables?.variant) {
      const buyable = (
        await client.query(
          `select count(*)::int as n
             from product p
            where p.status = 'active' and p.price_cents is not null
              and exists (select 1 from variant v where v.product_id = p.id and v.stock > 0)`,
        )
      ).rows[0]?.n ?? 0;
      results.push(
        buyable > 0
          ? pass(S, "something to buy", `${buyable} live product(s) with a price and stock`)
          : fail(
              S,
              "something to buy",
              "no product is live with a price and stock",
              "Crew Portal → Products → a product: enter the Price, stock for at least one size, set Status to \"Live — can be bought\", Save (docs/owner-checklist.md step 7).",
            ),
      );
    }

    if (tables?.setting) {
      const flat = (await client.query("select value from setting where key = 'shipping_flat_cents'")).rows[0]?.value;
      results.push(
        flat !== undefined && /^\d+$/.test(String(flat))
          ? warn(
              S,
              "flat shipping",
              `$${(Number(flat) / 100).toFixed(2)} per order`,
              "This figure was seeded by the build, not chosen by you. Confirm it or give the new figure (docs/owner-checklist.md step 8).",
            )
          : fail(S, "flat shipping", "setting.shipping_flat_cents is missing or not a number", "Apply migrations (0003 seeds it), then set the figure (docs/owner-checklist.md step 8)."),
      );
    }
  } catch (error) {
    results.push(fail(S, "read", redact(error instanceof Error ? error.message : error, env), "Run the check again; if it repeats, `npm run db:status:production` shows the same ledger."));
  } finally {
    try {
      await client.query("rollback");
    } catch {
      // The connection may already be gone; there is nothing to roll back then.
    }
    await client.end?.();
  }

  return results;
}

/* -------------------------------------------------------------------------- */
/* Schedule                                                                    */
/* -------------------------------------------------------------------------- */

export function checkCron(root = ROOT) {
  const S = "Schedule";
  const results = [];
  let config;

  try {
    config = JSON.parse(readFileSync(path.join(root, "vercel.json"), "utf8"));
  } catch {
    results.push(fail(S, "vercel.json", "missing or not JSON", `Restore vercel.json with a cron for ${CRON_PATH}.`));
    return results;
  }

  const cron = Array.isArray(config.crons) ? config.crons.find((c) => c?.path === CRON_PATH) : undefined;
  results.push(
    cron
      ? pass(S, "cron registered", `${CRON_PATH} on "${cron.schedule}"`)
      : fail(S, "cron registered", `vercel.json schedules no ${CRON_PATH}`, `Add { "path": "${CRON_PATH}", "schedule": "*/15 * * * *" } to vercel.json's crons and deploy.`),
  );

  const route = path.join(root, "src", "app", ...CRON_PATH.split("/").filter(Boolean), "route.ts");
  results.push(
    existsSync(route)
      ? pass(S, "cron route", "the handler exists in this checkout")
      : fail(S, "cron route", `no route file for ${CRON_PATH}`, "The cron would 404; check out the branch that is deployed."),
  );

  results.push(
    warn(
      S,
      "last run",
      "not visible from here",
      "Vercel → project → Settings → Cron Jobs → /api/cron/reconcile: its last run should be 200. The portal's Settings screen shows when the reconciler last finished.",
    ),
  );

  return results;
}

/* -------------------------------------------------------------------------- */
/* Runner                                                                      */
/* -------------------------------------------------------------------------- */

export function siteUrl(env, override) {
  const raw = override || read(env, "NEXT_PUBLIC_SITE_URL").value || "https://guardtheory.net";
  return raw.replace(/\/+$/, "");
}

export async function runChecks(env, options = {}) {
  const {
    fetch: fetchImpl = globalThis.fetch,
    connect,
    offline = false,
    root = ROOT,
    migrationsDir = env.GT_MIGRATIONS_DIR?.trim() || path.join(root, "migrations"),
  } = options;
  const site = siteUrl(env, options.site);
  const results = [...checkEnvironment(env), ...checkCron(root)];

  if (offline) {
    results.push(warn("Network", "Stripe, Shippo, Resend, database", "skipped (--offline)"));
    return results;
  }

  results.push(...(await checkStripe(env, { fetch: fetchImpl, site })));
  results.push(...(await checkShippo(env, { fetch: fetchImpl, site })));
  results.push(...(await checkResend(env, { fetch: fetchImpl })));
  results.push(...(await checkDatabase(env, { connect, migrationsDir })));
  return results;
}

export function format(results, { ascii = false } = {}) {
  const mark = ascii ? { pass: "OK  ", fail: "FAIL", warn: "WARN" } : { pass: "✓", fail: "✗", warn: "!" };
  const lines = [];
  let section = null;

  for (const result of results) {
    if (result.section !== section) {
      section = result.section;
      lines.push("", section);
    }
    lines.push(`  ${mark[result.status]} ${result.label}${result.detail ? ` — ${result.detail}` : ""}`);
    if (result.fix && result.status !== "pass") {
      lines.push(`      fix: ${result.fix}`);
    }
  }

  const count = (status) => results.filter((r) => r.status === status).length;
  lines.push(
    "",
    `${count("pass")} ok, ${count("warn")} to know, ${count("fail")} to fix.` +
      (count("fail") === 0 ? " Ready for the test order: docs/test-order-runbook.md." : ""),
  );
  return lines.join("\n");
}

/**
 * `--env <file>` first, then the shell's non-empty values over it.
 * @param {string | undefined} file
 * @param {Record<string, string | undefined>} [processEnv]
 * @returns {Record<string, string>}
 */
export function loadEnv(file, processEnv = process.env) {
  const merged = {};
  if (file) {
    Object.assign(merged, parseEnv(readFileSync(file, "utf8")));
  }
  for (const [name, value] of Object.entries(processEnv)) {
    if (value !== undefined && (value.trim() !== "" || !(name in merged))) {
      merged[name] = value;
    }
  }
  return merged;
}

function argValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*?/, ""));
    return 0;
  }

  const file = argValue(argv, "--env");
  if (file && !existsSync(file)) {
    console.error(`[guard-theory] no such env file: ${file}`);
    return 1;
  }

  const env = loadEnv(file);
  const results = await runChecks(env, {
    offline: argv.includes("--offline"),
    site: argValue(argv, "--site"),
  });

  console.log(`[guard-theory] activation check against ${siteUrl(env, argValue(argv, "--site"))} — read-only, no values printed`);
  console.log(format(results, { ascii: argv.includes("--ascii") }));
  return results.some((r) => r.status === "fail") ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (error) => {
      console.error("[guard-theory] activation check failed:", redact(error instanceof Error ? error.message : error, process.env));
      process.exitCode = 1;
    },
  );
}
