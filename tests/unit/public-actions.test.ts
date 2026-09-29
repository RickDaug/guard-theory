import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, describe, it } from "node:test";

import { PricingRefusedError, priceCart } from "../../src/lib/cart/price.ts";
import { parseContact, MAX_NAME } from "../../src/lib/contact/validate.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import { waitlistConfirmation } from "../../src/lib/mail/templates.ts";
import {
  CHECKOUT_CALLER_BUCKET,
  CHECKOUT_SURGE_BUCKET,
  CHECKOUT_SURGE_SETTING,
  PRICE_CALL_BUCKET,
  readCheckoutSurge,
  recordCheckoutSurge,
} from "../../src/lib/public-limits.ts";
import { callerKey } from "../../src/lib/rate-limit-db.ts";
import {
  CONFIRMATION_TTL_HOURS,
  PENDING_RETENTION_DAYS,
  confirmByToken,
  isExpired,
  parseConfirmation,
  purgeUnconfirmed,
  sendConfirmation,
  signConfirmation,
  signatureValid,
} from "../../src/lib/waitlist/confirm.ts";
import { getWaitlistStore } from "../../src/lib/waitlist/index.ts";

/**
 * The public, unauthenticated actions: cart pricing, checkout, the contact
 * form and the waitlist (security review 2026-09-29, S2-4 and the checkout half
 * of S2-2).
 */

const read = (path: string) => readFileSync(path, "utf8");

/** The body of one exported function, up to the next top-level export. */
function body(source: string, name: string): string {
  const start = source.indexOf(`export async function ${name}`);
  assert.ok(start !== -1, `${name} not found`);
  const next = source.indexOf("\nexport ", start + 1);
  return source.slice(start, next === -1 ? undefined : next);
}

describe("public actions, statically", () => {
  it("every cart pricing call is counted before the first query", () => {
    const fn = body(read("src/lib/cart/price.ts"), "priceCart");
    const gate = fn.indexOf("takeRateLimit(PRICE_CALL_BUCKET");
    const firstQuery = fn.indexOf("await query");
    assert.ok(gate !== -1, "priceCart must take PRICE_CALL_BUCKET");
    assert.ok(gate < firstQuery, "and take it before it reads anything");
  });

  it("the checkout's all-callers limit records for the owner instead of refusing buyers", () => {
    const fn = body(read("src/app/cart/actions.ts"), "startCheckoutAction");
    const caller = fn.indexOf("takeRateLimit(CHECKOUT_CALLER_BUCKET");
    const surge = fn.indexOf("takeRateLimit(CHECKOUT_SURGE_BUCKET");
    const start = fn.indexOf("startCheckout(intentId)");
    assert.ok(caller !== -1 && surge !== -1 && start !== -1);
    assert.ok(caller < surge && surge < start);
    // The per-caller refusal is the only "busy".
    assert.equal(fn.match(/problem: "busy"/g)?.length, 1);
    assert.ok(fn.indexOf('problem: "busy"') < surge, "nothing after the surge check refuses");
    assert.ok(fn.slice(surge, start).includes("recordCheckoutSurge()"));
  });

  it("the buckets mean what they say: strict per caller, a breaker across everyone", () => {
    assert.ok(CHECKOUT_CALLER_BUCKET.perCaller <= 10);
    assert.ok(CHECKOUT_CALLER_BUCKET.allCallers >= Number.MAX_SAFE_INTEGER);
    assert.ok(CHECKOUT_SURGE_BUCKET.perCaller >= Number.MAX_SAFE_INTEGER);
    assert.ok(PRICE_CALL_BUCKET.perCaller > 0 && PRICE_CALL_BUCKET.perCaller <= 200);
  });

  for (const [file, bucket] of [
    ["src/app/contact/actions.ts", "CONTACT_BUCKET"],
    ["src/app/first-edition/actions.ts", "WAITLIST_BUCKET"],
  ] as const) {
    it(`${file} is limited in Postgres, not in one instance's memory`, () => {
      const source = read(file);
      assert.doesNotMatch(source, /@\/lib\/rate-limit"/, "the in-memory limiter is gone");
      assert.doesNotMatch(source, /checkRateLimit\(/);
      assert.match(source, new RegExp(`takeRateLimit\\(${bucket}`));
    });
  }

  it("caps the contact name at 100 characters, and every other free-text field", () => {
    const form = (fields: Record<string, string>) => {
      const data = new FormData();
      for (const [key, value] of Object.entries(fields)) data.set(key, value);
      return data;
    };
    const good = { name: "Pat", email: "pat@example.com", message: "Hello.", topic: "other" };

    assert.equal(MAX_NAME, 100);
    assert.ok(parseContact(form({ ...good, name: "n".repeat(100) })).ok);

    const long = parseContact(form({ ...good, name: "n".repeat(101) }));
    assert.ok(!long.ok && long.errors.name);

    const email = parseContact(form({ ...good, email: `${"e".repeat(250)}@example.com` }));
    assert.ok(!email.ok && email.errors.email);

    const message = parseContact(form({ ...good, message: "m".repeat(4001) }));
    assert.ok(!message.ok && message.errors.message);

    // Topic is a fixed set; anything else is filed as "other", whatever its length.
    const topic = parseContact(form({ ...good, topic: "t".repeat(10_000) }));
    assert.ok(topic.ok && topic.value.topic === "other");
  });

  it("the announcement goes only to confirmed and legacy addresses", () => {
    const send = body(read("src/app/crew/list/actions.ts"), "sendAnnouncement");
    assert.match(send, /where unsubscribed_at is null\s+and consent_state in \('confirmed', 'legacy'\)/);
  });

  it("opening the confirmation link changes nothing; only the button's POST confirms", () => {
    const page = read("src/app/first-edition/confirm/page.tsx");
    assert.doesNotMatch(page, /confirmByToken|update |insert /i);
    assert.match(read("src/components/waitlist/ConfirmForm.tsx"), /<form action=\{formAction\}/);
    assert.match(body(read("src/app/first-edition/actions.ts"), "confirmWaitlist"), /confirmByToken\(/);
  });

  it("the migration marks existing signups legacy and new ones pending", () => {
    const sql = read("migrations/0013_waitlist_double_opt_in.sql").replace(/--.*$/gm, "");
    const legacy = sql.indexOf("default 'legacy'");
    const pending = sql.indexOf("set default 'pending'");
    assert.ok(legacy !== -1 && pending > legacy, "legacy fills the existing rows, then pending is the default");
    assert.doesNotMatch(sql, /set consent_state\s*=\s*'confirmed'/, "no row is claimed to have confirmed");
  });
});

describe("the confirmation token", () => {
  const id = randomUUID();
  const email = "someone@example.com";

  it("round-trips, and is bound to the row, the address and the expiry", () => {
    const token = signConfirmation(id, email);
    const parsed = parseConfirmation(token);
    assert.ok(parsed);
    assert.equal(parsed.id, id);
    assert.ok(signatureValid(parsed, email));
    assert.ok(signatureValid(parsed, "SOMEONE@example.com"), "address case does not matter");
    assert.ok(!signatureValid(parsed, "someone-else@example.com"));
    assert.ok(!signatureValid({ ...parsed, id: randomUUID() }, email));
    assert.ok(!signatureValid({ ...parsed, expires: parsed.expires + 3600 }, email), "cannot be extended");
    assert.ok(!isExpired(parsed));
  });

  it("expires", () => {
    const issued = new Date(Date.now() - (CONFIRMATION_TTL_HOURS + 1) * 3_600_000);
    const parsed = parseConfirmation(signConfirmation(id, email, issued));
    assert.ok(parsed && isExpired(parsed));
  });

  it("rejects anything that is not the right shape", () => {
    for (const bad of ["", "a.b", "a.b.c.d", "x".repeat(300), `${id}.123.${"A".repeat(43)}`]) {
      assert.equal(parseConfirmation(bad), null, bad.slice(0, 20));
    }
  });

  it("the email carries the link and says ignoring it is enough", () => {
    const token = signConfirmation(id, email);
    const mail = waitlistConfirmation(email, "Pat", token, CONFIRMATION_TTL_HOURS, PENDING_RETENTION_DAYS);
    assert.ok(mail.body.includes(`/first-edition/confirm?t=${token}`));
    assert.match(mail.body, /ignore this message/);
    assert.ok(mail.body.includes(`${PENDING_RETENTION_DAYS} days`));
  });
});

const HAS_DB = isDatabaseConfigured();
const tag = randomUUID();
const addr = (name: string) => `optin-${name}-${tag}@example.com`;
const signup = (email: string, firstName = "Pat") => ({
  email,
  firstName,
  productInterest: [],
  consent: true as const,
  submittedAt: new Date().toISOString(),
});

describe("public actions, in Postgres", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  after(async () => {
    await query("delete from waitlist_signup where email like $1", [`optin-%-${tag}@example.com`]);
    await query("delete from email_log where to_email like $1", [`optin-%-${tag}@example.com`]);
    await query("delete from setting where key = $1", [CHECKOUT_SURGE_SETTING]);
    await query("delete from rate_limit where bucket = $1", [PRICE_CALL_BUCKET.name]);
    await closePool();
  });

  it("a re-price with a made-up previous intent is counted", async () => {
    const key = callerKey(`optin-${tag}-a`);
    await priceCart([{ variantId: "no-such-variant", quantity: 1 }], () => undefined, {
      callerKey: key,
      previousIntentId: "made-up",
    });
    const rows = await query<{ hits: number }>(
      "select hits from rate_limit where bucket = $1 and key_hash = $2",
      [PRICE_CALL_BUCKET.name, key],
    );
    assert.equal(rows[0]?.hits, 1);
  });

  it("a caller past the pricing limit is refused before anything is read", async () => {
    const key = callerKey(`optin-${tag}-b`);
    await query(
      `insert into rate_limit (bucket, key_hash, window_start, hits)
       values ($1, $2, to_timestamp(floor(extract(epoch from now()) / $3::int) * $3::int), $4)`,
      [PRICE_CALL_BUCKET.name, key, PRICE_CALL_BUCKET.windowSeconds, PRICE_CALL_BUCKET.perCaller],
    );

    await assert.rejects(
      priceCart([{ variantId: "no-such-variant", quantity: 1 }], () => undefined, {
        callerKey: key,
        previousIntentId: "made-up",
      }),
      PricingRefusedError,
    );
  });

  it("records a checkout surge for the owner, one episode at a time", async () => {
    await query("delete from setting where key = $1", [CHECKOUT_SURGE_SETTING]);
    await recordCheckoutSurge();
    await recordCheckoutSurge();
    const surge = await readCheckoutSurge();
    assert.ok(surge);
    assert.equal(surge.calls, 2);
    assert.ok(!Number.isNaN(Date.parse(surge.since)) && !Number.isNaN(Date.parse(surge.last)));

    // An episode that ended long ago is not continued.
    await query(
      `update setting set value = jsonb_set(value::jsonb, '{last}', to_jsonb(now() - interval '1 day'))::text
        where key = $1`,
      [CHECKOUT_SURGE_SETTING],
    );
    await recordCheckoutSurge();
    assert.equal((await readCheckoutSurge())?.calls, 1);
  });

  async function state(email: string) {
    const rows = await query<{
      consent_state: string;
      confirmed_at: Date | null;
      unsubscribed_at: Date | null;
      first_name: string;
      confirmation_delivery: string | null;
    }>(
      `select consent_state, confirmed_at, unsubscribed_at, first_name, confirmation_delivery
         from waitlist_signup where email = $1`,
      [email],
    );
    return rows[0];
  }

  it("a signup is pending until the link's Confirm is pressed, and only once", async () => {
    const email = addr("confirm");
    const added = await getWaitlistStore().add(signup(email));
    assert.ok(added.ok && added.confirm);
    assert.equal((await state(email))?.consent_state, "pending");

    const token = signConfirmation(added.confirm.id, email);
    assert.equal(await confirmByToken(token), "confirmed");
    const after = await state(email);
    assert.equal(after?.consent_state, "confirmed");
    assert.ok(after?.confirmed_at);

    assert.equal(await confirmByToken(token), "already");
  });

  it("refuses a forged token and an expired one, and confirms nothing", async () => {
    const email = addr("forged");
    const added = await getWaitlistStore().add(signup(email));
    assert.ok(added.ok && added.confirm);

    // Right row, made-up signature; and a genuine signature for another address.
    const [encodedId, expires] = signConfirmation(added.confirm.id, email).split(".");
    assert.equal(await confirmByToken(`${encodedId}.${expires}.${"A".repeat(43)}`), "invalid");
    assert.equal(
      await confirmByToken(signConfirmation(added.confirm.id, "attacker@example.com")),
      "invalid",
    );

    const stale = signConfirmation(
      added.confirm.id,
      email,
      new Date(Date.now() - (CONFIRMATION_TTL_HOURS + 1) * 3_600_000),
    );
    assert.equal(await confirmByToken(stale), "expired");
    assert.equal(await confirmByToken(`${Buffer.from(randomUUID()).toString("base64url")}.1.${"A".repeat(43)}`), "invalid");
    assert.equal((await state(email))?.consent_state, "pending");
  });

  it("a stranger resubmitting a confirmed address changes nothing and mails nothing", async () => {
    const email = addr("stranger");
    const added = await getWaitlistStore().add(signup(email, "Pat"));
    assert.ok(added.ok && added.confirm);
    await confirmByToken(signConfirmation(added.confirm.id, email));

    const again = await getWaitlistStore().add(signup(email, "Mallory"));
    assert.deepEqual(again, { ok: true, alreadyOnList: true, confirm: null });
    assert.equal((await state(email))?.first_name, "Pat");
  });

  it("rejoining after an unsubscribe waits for confirmation before it is on the list again", async () => {
    const email = addr("rejoin");
    const added = await getWaitlistStore().add(signup(email));
    assert.ok(added.ok && added.confirm);
    await confirmByToken(signConfirmation(added.confirm.id, email));
    await query("update waitlist_signup set unsubscribed_at = now() where email = $1", [email]);

    const again = await getWaitlistStore().add(signup(email));
    assert.ok(again.ok && again.confirm && !again.alreadyOnList);
    const pending = await state(email);
    assert.equal(pending?.consent_state, "pending");
    assert.ok(pending?.unsubscribed_at, "still unsubscribed until the address confirms");

    assert.equal(await confirmByToken(signConfirmation(again.confirm.id, email)), "confirmed");
    assert.equal((await state(email))?.unsubscribed_at, null);
  });

  it("an old link cannot undo an unsubscribe", async () => {
    const email = addr("undo");
    const added = await getWaitlistStore().add(signup(email));
    assert.ok(added.ok && added.confirm);
    const token = signConfirmation(added.confirm.id, email);
    await confirmByToken(token);
    await query("update waitlist_signup set unsubscribed_at = now() where email = $1", [email]);

    assert.equal(await confirmByToken(token), "expired");
    assert.ok((await state(email))?.unsubscribed_at);
  });

  it("with no mail provider the confirmation is recorded as not delivered", async () => {
    const saved = { key: process.env.RESEND_API_KEY, from: process.env.RECEIPT_FROM_EMAIL };
    delete process.env.RESEND_API_KEY;
    delete process.env.RECEIPT_FROM_EMAIL;
    try {
      const email = addr("mail");
      const added = await getWaitlistStore().add(signup(email));
      assert.ok(added.ok && added.confirm);
      // getMailProvider caches its choice; in this process nothing set a key.
      assert.equal(await sendConfirmation(added.confirm), "not-delivered");
      assert.equal((await state(email))?.confirmation_delivery, "not-delivered");
    } finally {
      if (saved.key !== undefined) process.env.RESEND_API_KEY = saved.key;
      if (saved.from !== undefined) process.env.RECEIPT_FROM_EMAIL = saved.from;
    }
  });

  it("deletes pending signups nobody confirmed, and nothing else", async () => {
    const old = addr("old-pending");
    const kept = addr("old-confirmed");
    await getWaitlistStore().add(signup(old));
    const confirmed = await getWaitlistStore().add(signup(kept));
    assert.ok(confirmed.ok && confirmed.confirm);
    await confirmByToken(signConfirmation(confirmed.confirm.id, kept));
    await query(
      `update waitlist_signup
          set submitted_at = now() - make_interval(days => $2 + 1), confirmation_sent_at = null
        where email = any($1::text[])`,
      [[old, kept], PENDING_RETENTION_DAYS],
    );

    assert.ok((await purgeUnconfirmed()) >= 1);
    assert.equal(await state(old), undefined);
    assert.equal((await state(kept))?.consent_state, "confirmed");
  });

  it("a row written without a state is pending, never legacy", async () => {
    const email = addr("default");
    await query(
      `insert into waitlist_signup (id, email, first_name, consent, submitted_at, unsubscribe_token)
       values ($1, $2, 'Pat', true, now(), $3)`,
      [randomUUID(), email, randomUUID()],
    );
    assert.equal((await state(email))?.consent_state, "pending");
  });
});
