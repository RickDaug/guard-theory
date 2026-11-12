import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, before, describe, it } from "node:test";

import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";
import { hashSessionToken, newSessionToken, parsePasswordHash, verifyPassword } from "../../src/lib/portal/auth.ts";
import {
  PASSWORD_MIN_LENGTH,
  SHARED_PASSWORD_DISABLED_KEY,
  TOKEN_TTL_HOURS,
  changeRole,
  createCrewUser,
  deactivateUser,
  disableSharedPassword,
  findSignInUser,
  hashToken,
  issueToken,
  passwordProblem,
  peekToken,
  reactivateUser,
  setPasswordWithToken,
  usernameProblem,
} from "../../src/lib/portal/users.ts";
import { findSession, insertSession } from "../../src/lib/portal/session-store.ts";
import { SHARED_OWNER_NAME } from "../../src/lib/portal/roles.ts";
import { isCrossSiteRequest } from "../../src/lib/portal/routes.ts";
import { listOrderEvents, recordOrderEvent } from "../../src/lib/orders/events.ts";
import { crewSetPassword } from "../../src/lib/mail/templates.ts";
import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../src/content/editorial-voice.ts";

/**
 * Crew accounts: invites, passwords, deactivation, roles and the order history.
 *
 * The rules under test are the ones the owner was promised: a set-password
 * link works once and runs out; no plaintext password is stored or mailed;
 * turning someone off ends their sessions at once; and the shared password can
 * only be turned off once an owner account can sign in instead.
 */

const HAS_DB = isDatabaseConfigured();
const PASSWORD = "correct horse battery staple";

describe("password and username rules (no database)", () => {
  it("refuses short, common and self-describing passwords, and never echoes them", () => {
    assert.match(passwordProblem("short")!, new RegExp(`at least ${PASSWORD_MIN_LENGTH}`));
    assert.match(passwordProblem("password1234")!, /first an attacker tries/);
    assert.match(passwordProblem("Password1234")!, /first an attacker tries/, "case does not hide it");
    assert.match(passwordProblem("abababababab")!, /first an attacker tries/, "a repeated chunk");
    assert.match(passwordProblem("maria-the-packer-2026", { username: "maria" })!, /username or email/);
    assert.match(passwordProblem("sam.fadda.wins.again", { email: "sam.fadda@example.com" })!, /username or email/);
    assert.equal(passwordProblem(PASSWORD, { username: "maria", email: "maria@example.com" }), null);

    for (const bad of ["short", "password1234", "maria-the-packer-2026"]) {
      assert.doesNotMatch(passwordProblem(bad, { username: "maria" }) ?? "", new RegExp(bad));
    }
  });

  it("keeps \"owner\" for the shared password and refuses odd usernames", () => {
    assert.match(usernameProblem("owner")!, /kept for the shared password/);
    assert.ok(usernameProblem("Maria"), "upper case is normalised before this, never stored");
    assert.ok(usernameProblem("a"), "too short");
    assert.ok(usernameProblem("-maria"), "starts with a letter or digit");
    assert.ok(usernameProblem("ma ria"), "no spaces");
    assert.equal(usernameProblem("maria.r"), null);
  });

  it("the invite email carries the link and no password", () => {
    const link = "https://guardtheory.net/crew/set-password?t=abc";
    const email = crewSetPassword("maria@example.com", "Maria", "maria", link, "invite", TOKEN_TTL_HOURS);
    assert.match(email.body, /set-password\?t=abc/);
    assert.match(email.body, /Your username is maria\./);
    assert.match(email.body, new RegExp(`works once, for ${TOKEN_TTL_HOURS} hours`));
    assert.doesNotMatch(email.body, /password is\b|password: \S/i, "nothing that reads as a password");
    assert.deepEqual(findBannedConstructions(`${email.subject}\n${email.body}`, BANNED_CONSTRUCTIONS), []);
    assert.deepEqual(findBannedConstructions(`${email.subject}\n${email.body}`, BANNED_IN_EMAIL), []);

    const reset = crewSetPassword("maria@example.com", "Maria", "maria", link, "reset", TOKEN_TTL_HOURS);
    assert.match(reset.subject, /new password/);
  });

  it("the crew actions never put a password into mail or into their answer", () => {
    // The only template the crew actions send is crewSetPassword, and it takes
    // no password argument at all; and the actions never read a "password" field.
    const source = readFileSync(new URL("../../src/app/crew/users/actions.ts", import.meta.url), "utf8");
    assert.doesNotMatch(source, /formData\.get\("password"\)|text\(formData, "password"\)/);
    assert.doesNotMatch(source, /hashPassword|password_hash/);
  });
});

describe("the label route will not act for another site's page", () => {
  it("lets the portal's own link and a typed address through, and refuses any other site", () => {
    const from = (site?: string) => new Headers(site ? { "sec-fetch-site": site } : {});
    assert.equal(isCrossSiteRequest(from("same-origin")), false);
    assert.equal(isCrossSiteRequest(from("none")), false);
    assert.equal(isCrossSiteRequest(from()), false, "no header is not evidence of another site");
    assert.equal(isCrossSiteRequest(from("cross-site")), true);
    assert.equal(isCrossSiteRequest(from("same-site")), true, "a sibling subdomain is not this site");
  });

  it("checks before it calls Shippo or writes the order's history", () => {
    const source = readFileSync("src/app/crew/orders/[id]/label/route.ts", "utf8");
    const check = source.indexOf("isCrossSiteRequest(request.headers)");
    assert.ok(check > 0, "the label route no longer checks Sec-Fetch-Site");
    for (const effect of ["refreshLabelUrl(", "recordOrderEvent(", "getOrder("]) {
      assert.ok(check < source.indexOf(effect, source.indexOf("export async function GET")), `${effect} runs first`);
    }
  });
});

describe("crew accounts, in Postgres", { skip: !HAS_DB && "no DATABASE_URL" }, () => {
  const users: string[] = [];
  const orders: string[] = [];
  const tag = randomUUID().slice(0, 8);

  async function newUser(role: "owner" | "crew", name = `t${tag}${users.length}`) {
    const created = await createCrewUser({
      username: name,
      email: `${name}@example.com`,
      displayName: `Test ${name}`,
      role,
    });
    assert.ok(created.ok, JSON.stringify(created));
    users.push(created.id);
    return { id: created.id, username: name };
  }

  async function sessionFor(userId: string | null): Promise<string> {
    const tokenHash = hashSessionToken(newSessionToken());
    await insertSession({
      tokenHash,
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      ip: null,
      userAgent: "unit test",
    });
    return tokenHash;
  }

  before(async () => {
    await query("delete from setting where key = $1", [SHARED_PASSWORD_DISABLED_KEY]);
  });

  after(async () => {
    // The e2e suite signs in with the shared password after this runs in CI.
    await query("delete from setting where key = $1", [SHARED_PASSWORD_DISABLED_KEY]);
    if (orders.length > 0) await query(`delete from "order" where id = any($1)`, [orders]);
    if (users.length > 0) await query("delete from crew_user where id = any($1)", [users]);
    await closePool();
  });

  it("refuses a second account with the same username or email, whatever the case", async () => {
    const first = await newUser("crew");
    const again = await createCrewUser({
      username: first.username.toUpperCase(),
      email: "different@example.com",
      displayName: "Someone",
      role: "crew",
    });
    assert.deepEqual(again.ok, false);
    const sameMail = await createCrewUser({
      username: `x${tag}`,
      email: `${first.username.toUpperCase()}@EXAMPLE.com`,
      displayName: "Someone",
      role: "crew",
    });
    assert.deepEqual(sameMail.ok, false);
  });

  it("a link is stored only as a hash, sets the password once, and never again", async () => {
    const user = await newUser("crew");
    const token = await issueToken(user.id, "invite");

    const rows = await query<Record<string, unknown>>("select * from crew_token where user_id = $1", [user.id]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]!.token_hash, hashToken(token));
    for (const value of Object.values(rows[0]!)) {
      assert.notEqual(String(value), token, "the raw token is in crew_token");
    }

    // Looking at the link uses nothing up.
    assert.equal((await peekToken(token))?.username, user.username);
    assert.equal((await peekToken(token))?.purpose, "invite");

    const weak = await setPasswordWithToken(token, "password1234");
    assert.equal(weak.ok, false);
    assert.ok(await peekToken(token), "a refused password does not spend the link");

    const set = await setPasswordWithToken(token, PASSWORD);
    assert.deepEqual(set, { ok: true, username: user.username });

    // Stored as scrypt, and nothing like the plaintext.
    const stored = await query<{ password_hash: string }>("select password_hash from crew_user where id = $1", [user.id]);
    const hash = stored[0]!.password_hash;
    assert.ok(parsePasswordHash(hash), "not a usable scrypt hash");
    assert.ok(!hash.includes(PASSWORD));
    assert.equal(await verifyPassword(PASSWORD, hash), true);
    assert.equal((await findSignInUser(user.username.toUpperCase()))?.id, user.id);

    // Single use.
    assert.equal(await peekToken(token), null);
    const twice = await setPasswordWithToken(token, "another long passphrase here");
    assert.equal(twice.ok, false);
    assert.equal(await verifyPassword(PASSWORD, (await findSignInUser(user.username))!.password_hash), true);
  });

  it("a link past its 72 hours sets nothing", async () => {
    const user = await newUser("crew");
    const token = await issueToken(user.id, "invite", new Date(Date.now() - (TOKEN_TTL_HOURS + 1) * 3600_000));
    assert.equal(await peekToken(token), null);
    const result = await setPasswordWithToken(token, PASSWORD);
    assert.equal(result.ok, false);
    assert.equal(await findSignInUser(user.username), undefined);
  });

  it("a new link withdraws the old one; a reset ends the sessions the person had", async () => {
    const user = await newUser("crew");
    const first = await issueToken(user.id, "invite");
    await setPasswordWithToken(first, PASSWORD);
    const session = await sessionFor(user.id);
    assert.ok(await findSession(session));

    const older = await issueToken(user.id, "reset");
    const newer = await issueToken(user.id, "reset");
    assert.equal(await peekToken(older), null, "an earlier link still works");
    assert.equal((await peekToken(newer))?.purpose, "reset");

    assert.equal((await setPasswordWithToken(newer, "a different long passphrase")).ok, true);
    assert.equal(await findSession(session), null, "the old session outlived the reset");
  });

  it("turning someone off ends their sessions at once, and their password stops working", async () => {
    const owner = await newUser("owner");
    const crew = await newUser("crew");
    await setPasswordWithToken(await issueToken(crew.id, "invite"), PASSWORD);
    const session = await sessionFor(crew.id);

    const before = await findSession(session);
    assert.equal(before?.role, "crew");
    assert.equal(before?.userId, crew.id);

    const pending = await issueToken(crew.id, "reset");
    assert.deepEqual(await deactivateUser(crew.id, owner.id), { ok: true });

    assert.equal(await findSession(session), null);
    const rows = await query("select 1 from admin_session where user_id = $1", [crew.id]);
    assert.equal(rows.length, 0, "the session row survived");
    assert.equal(await findSignInUser(crew.username), undefined);
    assert.equal(await peekToken(pending), null, "an unused link survived");

    // Even a session row written after the switch is refused while they are off.
    const sneaked = await sessionFor(crew.id);
    assert.equal(await findSession(sneaked), null);

    assert.deepEqual(await reactivateUser(crew.id), { ok: true });
    assert.equal((await findSignInUser(crew.username))?.id, crew.id);
  });

  it("nobody turns off or demotes themselves", async () => {
    const owner = await newUser("owner");
    assert.equal((await deactivateUser(owner.id, owner.id)).ok, false);
    assert.equal((await changeRole(owner.id, "crew", owner.id)).ok, false);
  });

  it("a role change applies at once: the person is signed out and comes back with the new role", async () => {
    const owner = await newUser("owner");
    const crew = await newUser("crew");
    await setPasswordWithToken(await issueToken(crew.id, "invite"), PASSWORD);
    const session = await sessionFor(crew.id);

    assert.deepEqual(await changeRole(crew.id, "owner", owner.id), { ok: true });
    assert.equal(await findSession(session), null);
    assert.equal((await findSession(await sessionFor(crew.id)))?.role, "owner");
    await changeRole(crew.id, "crew", owner.id);
  });

  it("the shared password is a session with no user, and owner", async () => {
    const shared = await sessionFor(null);
    const found = await findSession(shared);
    assert.equal(found?.role, "owner");
    assert.equal(found?.userId, null);
    assert.equal(found?.name, SHARED_OWNER_NAME);
  });

  it("the shared password can be turned off only once an owner can sign in, and that ends its sessions", async () => {
    // No usable owner yet (any left by other tests are made unusable here).
    await query("update crew_user set password_hash = null where id = any($1) and role = 'owner'", [users]);
    const others = await query<{ n: number }>(
      "select count(*)::int as n from crew_user where role = 'owner' and active and password_hash is not null",
    );
    if (others[0]!.n === 0) {
      const refused = await disableSharedPassword();
      assert.equal(refused.ok, false);
    }

    const owner = await newUser("owner");
    await setPasswordWithToken(await issueToken(owner.id, "invite"), PASSWORD);
    const shared = await sessionFor(null);
    const mine = await sessionFor(owner.id);

    assert.deepEqual(await disableSharedPassword(), { ok: true });
    assert.equal(await findSession(shared), null, "a shared-password session survived");
    assert.equal(await findSession(await sessionFor(null)), null, "a new shared-password session was let in");
    assert.equal((await findSession(mine))?.userId, owner.id, "the owner's own session was ended");

    // With the shared password off, the last owner who can sign in cannot be removed.
    const crew = await newUser("crew");
    const onlyOwners = await query<{ id: string }>(
      "select id from crew_user where role = 'owner' and active and password_hash is not null",
    );
    if (onlyOwners.length === 1) {
      assert.equal((await deactivateUser(owner.id, crew.id)).ok, false);
      assert.equal((await changeRole(owner.id, "crew", crew.id)).ok, false);
    }

    await query("delete from setting where key = $1", [SHARED_PASSWORD_DISABLED_KEY]);
  });

  it("two owners turning each other off at once cannot leave nobody able to sign in", async () => {
    // Only this test's two owners may be usable, or "the last owner" means nothing.
    await query("update crew_user set password_hash = null where id = any($1) and role = 'owner'", [users]);
    const a = await newUser("owner");
    const b = await newUser("owner");
    await setPasswordWithToken(await issueToken(a.id, "invite"), PASSWORD);
    await setPasswordWithToken(await issueToken(b.id, "invite"), PASSWORD);
    const usable = await query<{ id: string }>(
      "select id from crew_user where role = 'owner' and active and password_hash is not null",
    );
    assert.deepEqual(usable.map((row) => row.id).sort(), [a.id, b.id].sort());

    assert.deepEqual(await disableSharedPassword(), { ok: true });

    try {
      // Both checks used to run before either write, so both passed.
      const results = await Promise.all([deactivateUser(a.id, b.id), deactivateUser(b.id, a.id)]);
      assert.equal(results.filter((result) => result.ok).length, 1, JSON.stringify(results));
      const left = await query<{ n: number }>(
        "select count(*)::int as n from crew_user where role = 'owner' and active and password_hash is not null",
      );
      assert.equal(left[0]!.n, 1);

      // The same race through a demotion and a turn-off.
      await reactivateUser(a.id);
      await reactivateUser(b.id);
      const mixed = await Promise.all([changeRole(a.id, "crew", b.id), deactivateUser(b.id, a.id)]);
      assert.equal(mixed.filter((result) => result.ok).length, 1, JSON.stringify(mixed));
    } finally {
      await query("delete from setting where key = $1", [SHARED_PASSWORD_DISABLED_KEY]);
    }
  });

  it("the order history records who did what, and keeps the name after the account goes", async () => {
    const crew = await newUser("crew");
    const orderId = randomUUID();
    orders.push(orderId);
    await query(
      `insert into "order" (id, email, ship_name, ship_line1, ship_city, ship_state, ship_postal,
                            subtotal_cents, shipping_cents, tax_cents, total_cents,
                            stripe_session_id, stripe_mode)
       values ($1, 'buyer@example.com', 'Sam Fadda', '1 Test Street', 'Los Angeles', 'CA', '90015',
               4000, 700, 0, 4700, $2, 'test')`,
      [orderId, `cs_test_${randomUUID()}`],
    );

    await recordOrderEvent(orderId, "label_bought", { userId: crew.id, name: "Test Maria" }, "6.10 USD");
    await recordOrderEvent(orderId, "tracking_set", { userId: null, name: SHARED_OWNER_NAME }, "USPS 9400");

    await query("delete from crew_user where id = $1", [crew.id]);

    const events = await listOrderEvents(orderId);
    assert.deepEqual(
      events.map((e) => [e.kind, e.actor_name, e.detail]),
      [
        ["label_bought", "Test Maria", "6.10 USD"],
        ["tracking_set", SHARED_OWNER_NAME, "USPS 9400"],
      ],
    );
  });
});
