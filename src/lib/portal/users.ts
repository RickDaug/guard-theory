import { createHash, randomBytes, randomUUID } from "node:crypto";
import { query, queryOne, transaction } from "../db/client.ts";
import { hashPassword } from "./auth.ts";
import { isRole, type Role } from "./roles.ts";

/**
 * Crew accounts: the people, their set-password links, and the switches that
 * turn them on and off. No request objects here, so all of it is unit-tested
 * against the database directly. The actions in src/app/crew/users/actions.ts
 * and src/app/crew/set-password/actions.ts are the only callers.
 *
 * WHAT IS NEVER STORED, SENT OR SHOWN: a plaintext password. The owner never
 * chooses or sees anyone's password. They create the account, and the person
 * gets a one-time link to choose their own; only its scrypt hash is kept.
 *
 * THE LINK
 *
 * 32 random bytes (256 bits), base64url, in the link's query string. Only the
 * SHA-256 is stored, so a leaked backup cannot be replayed into a password
 * change. It is not an HMAC-signed value because it does not need to be: there
 * is nothing in it to sign, only a lookup key nobody can guess. Single use (one
 * atomic UPDATE claims it), 72 hours, and creating a new link for a person
 * withdraws every earlier unused one.
 */

export const TOKEN_TTL_HOURS = 72;
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

/** The setting that turns off the shared PORTAL_PASSWORD_HASH sign-in. */
export const SHARED_PASSWORD_DISABLED_KEY = "portal_shared_password_disabled";
/** A server-side secret for the sign-in limiter, when there is no shared password to key on. */
const PORTAL_SECRET_KEY = "portal_secret";

/** Reserved: typing it (or nothing) at sign-in means the shared owner password. */
export const SHARED_USERNAME = "owner";

export type CrewUser = {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: Role;
  active: boolean;
  has_password: boolean;
  created_at: Date;
  last_sign_in_at: Date | null;
  /** The newest unused, unexpired link, if any: when it runs out and how it went. */
  pending_purpose: "invite" | "reset" | null;
  pending_expires_at: Date | null;
  pending_delivery: "sent" | "failed" | "not-delivered" | null;
};

export function normaliseUsername(value: string): string {
  return value.trim().toLowerCase();
}

/** Letters, digits, dot, dash, underscore; 2 to 32; starts with a letter or digit. */
export function usernameProblem(username: string): string | null {
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/.test(username)) {
    return "Use 2 to 32 lower-case letters, digits, dots, dashes or underscores, starting with a letter or digit.";
  }
  if (username === SHARED_USERNAME) {
    return "“owner” is kept for the shared password. Choose another username.";
  }
  return null;
}

export function emailProblem(email: string): string | null {
  return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email) && email.length <= 254
    ? null
    : "Enter an email address the link can be sent to.";
}

/**
 * The commonest long passwords. Short ones need no list: the length rule
 * already refuses them. Not a breach corpus — that would mean a dependency or
 * a network call to a third party on every password change — but it catches
 * the keyboard walks and "password" padded out to length that make up most of
 * the long passwords people actually choose.
 */
const COMMON = new Set([
  "123456789012", "1234567890123", "12345678901234", "123456789123", "1234567890qwerty",
  "qwertyuiopasdf", "qwertyuiop123", "qwertyuiop1234", "qwerty123456", "qwerty1234567",
  "1qaz2wsx3edc", "1qaz2wsx3edc4rfv", "zaq12wsxcde3", "asdfghjkl123", "zxcvbnm12345",
  "passwordpassword", "password1234", "password12345", "password123456", "password123!",
  "passw0rd1234", "p@ssw0rd1234", "p@ssword1234", "iloveyou1234", "iloveyou123456",
  "letmein12345", "welcome12345", "welcome123456", "changeme1234", "administrator",
  "abc123456789", "abcdefghijkl", "abcdefgh1234", "aaaaaaaaaaaa", "111111111111",
  "000000000000", "football1234", "baseball1234", "princess1234", "sunshine1234",
  "superman1234", "trustno11234", "monkey123456", "dragon123456", "master123456",
  "guardtheory1", "guardtheory12", "guardtheory123", "guardtheory2026", "jiujitsu1234",
  "brazilianjiujitsu", "jiujitsu123456", "nogijiujitsu", "rashguard123",
]);

/** Why this password will not do, or null. Never echoes the password. */
export function passwordProblem(
  password: string,
  about: { username?: string; email?: string } = {},
): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters. Three or four ordinary words together are easy to remember and hard to guess.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Use at most ${PASSWORD_MAX_LENGTH} characters.`;
  }

  const lower = password.normalize("NFKC").toLowerCase();

  if (COMMON.has(lower) || /^(.)\1+$/.test(lower) || /^(.{1,4})\1+$/.test(lower)) {
    return "That password is one of the first an attacker tries. Choose another.";
  }

  const local = about.email?.split("@")[0]?.toLowerCase();
  for (const part of [about.username?.toLowerCase(), local]) {
    if (part && part.length >= 3 && lower.includes(part)) {
      return "Do not build the password from your username or email address.";
    }
  }

  return null;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/* ------------------------------------------------------------------------ */
/* Reading                                                                   */
/* ------------------------------------------------------------------------ */

export async function listCrewUsers(): Promise<CrewUser[]> {
  return query<CrewUser>(
    `select u.id, u.username, u.email, u.display_name, u.role, u.active,
            (u.password_hash is not null) as has_password, u.created_at, u.last_sign_in_at,
            t.purpose as pending_purpose, t.expires_at as pending_expires_at,
            t.delivery as pending_delivery
       from crew_user u
       left join lateral (
         select purpose, expires_at, delivery from crew_token
          where user_id = u.id and used_at is null and expires_at > now()
          order by created_at desc limit 1
       ) t on true
      order by u.active desc, u.role, lower(u.display_name)`,
  );
}

export async function getCrewUser(id: string): Promise<CrewUser | undefined> {
  return (await listCrewUsers()).find((user) => user.id === id);
}

/** For signing in: an active account with a password, by username. */
export async function findSignInUser(
  username: string,
): Promise<{ id: string; password_hash: string; role: Role } | undefined> {
  const row = await queryOne<{ id: string; password_hash: string; role: string }>(
    `select id, password_hash, role from crew_user
      where lower(username) = $1 and active and password_hash is not null`,
    [normaliseUsername(username)],
  );
  return row && isRole(row.role) ? { id: row.id, password_hash: row.password_hash, role: row.role } : undefined;
}

export async function recordSignIn(userId: string): Promise<void> {
  await query("update crew_user set last_sign_in_at = now() where id = $1", [userId]);
}

/** Active owner accounts that can actually sign in. */
export async function countUsableOwners(exceptId?: string): Promise<number> {
  const row = await queryOne<{ n: number }>(
    `select count(*)::int as n from crew_user
      where role = 'owner' and active and password_hash is not null and id is distinct from $1`,
    [exceptId ?? null],
  );
  return row?.n ?? 0;
}

/* ------------------------------------------------------------------------ */
/* The shared password, and the limiter's secret                              */
/* ------------------------------------------------------------------------ */

export async function isSharedPasswordDisabled(): Promise<boolean> {
  const row = await queryOne<{ value: string }>("select value from setting where key = $1", [
    SHARED_PASSWORD_DISABLED_KEY,
  ]);
  return row?.value === "true";
}

/**
 * Turns the shared PORTAL_PASSWORD_HASH sign-in off, and ends every session it
 * opened. Refused unless an active owner account with a password exists, so
 * the owner cannot lock themselves out. Turning it back on is deliberately not
 * a button: whoever is locked out cannot press it. See docs/provisioning.md.
 */
export async function disableSharedPassword(): Promise<{ ok: true } | { ok: false; reason: string }> {
  if ((await countUsableOwners()) === 0) {
    return {
      ok: false,
      reason:
        "There is no owner account with a password yet. Create one for yourself, set its password from the link, and sign in with it first.",
    };
  }

  await transaction(async (client) => {
    await client.query(
      `insert into setting (key, value, updated_at) values ($1, 'true', now())
       on conflict (key) do update set value = 'true', updated_at = now()`,
      [SHARED_PASSWORD_DISABLED_KEY],
    );
    await client.query("delete from admin_session where user_id is null");
  });

  return { ok: true };
}

/**
 * The secret the sign-in limiter's address keys and the known-device cookie
 * are derived from. The shared password hash while there is one, which is what
 * it always was, so nothing already issued changes; otherwise a random value
 * made once and kept in `setting`.
 */
export async function portalSecret(sharedHash: string | undefined): Promise<string> {
  if (sharedHash) {
    return sharedHash;
  }

  await query(
    `insert into setting (key, value, updated_at) values ($1, $2, now()) on conflict (key) do nothing`,
    [PORTAL_SECRET_KEY, randomBytes(32).toString("base64url")],
  );
  const row = await queryOne<{ value: string }>("select value from setting where key = $1", [
    PORTAL_SECRET_KEY,
  ]);
  return row!.value;
}

/* ------------------------------------------------------------------------ */
/* Changing people                                                            */
/* ------------------------------------------------------------------------ */

export type Change = { ok: true } | { ok: false; reason: string };

export async function createCrewUser(input: {
  username: string;
  email: string;
  displayName: string;
  role: Role;
}): Promise<{ ok: true; id: string } | { ok: false; reason: string; field?: string }> {
  const username = normaliseUsername(input.username);
  const email = input.email.trim();
  const displayName = input.displayName.trim();

  const nameProblem = usernameProblem(username);
  if (nameProblem) return { ok: false, reason: nameProblem, field: "username" };
  const mailProblem = emailProblem(email);
  if (mailProblem) return { ok: false, reason: mailProblem, field: "email" };
  if (displayName.length < 1 || displayName.length > 80) {
    return { ok: false, reason: "Enter the name the order history should show, up to 80 characters.", field: "displayName" };
  }

  const taken = await queryOne<{ username: string; email: string }>(
    "select username, email from crew_user where lower(username) = $1 or lower(email) = lower($2)",
    [username, email],
  );
  if (taken) {
    return taken.username === username
      ? { ok: false, reason: "Someone already has that username.", field: "username" }
      : { ok: false, reason: "Someone already has that email address.", field: "email" };
  }

  const id = randomUUID();
  await query(
    `insert into crew_user (id, username, email, display_name, role) values ($1, $2, $3, $4, $5)`,
    [id, username, email, displayName, input.role],
  );
  return { ok: true, id };
}

/**
 * Makes a set-password link for a person and withdraws any earlier one.
 * Returns the raw token: the caller emails it, or shows it once, and drops it.
 */
export async function issueToken(
  userId: string,
  purpose: "invite" | "reset",
  now: Date = new Date(),
): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await transaction(async (client) => {
    await client.query("delete from crew_token where user_id = $1 and used_at is null", [userId]);
    await client.query(
      `insert into crew_token (token_hash, user_id, purpose, created_at, expires_at, delivery)
       values ($1, $2, $3, $4, $5, 'not-delivered')`,
      [hashToken(token), userId, purpose, now.toISOString(), expires.toISOString()],
    );
  });

  return token;
}

export async function recordTokenDelivery(
  token: string,
  delivery: "sent" | "failed" | "not-delivered",
): Promise<void> {
  await query("update crew_token set delivery = $2 where token_hash = $1", [hashToken(token), delivery]);
}

export type TokenView = {
  userId: string;
  purpose: "invite" | "reset";
  username: string;
  email: string;
  displayName: string;
};

/** What a live link is for, without using it up. For the GET of the form. */
export async function peekToken(token: string): Promise<TokenView | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;

  const row = await queryOne<{
    user_id: string;
    purpose: "invite" | "reset";
    username: string;
    email: string;
    display_name: string;
  }>(
    `select t.user_id, t.purpose, u.username, u.email, u.display_name
       from crew_token t join crew_user u on u.id = t.user_id
      where t.token_hash = $1 and t.used_at is null and t.expires_at > now() and u.active`,
    [hashToken(token)],
  );

  return row
    ? { userId: row.user_id, purpose: row.purpose, username: row.username, email: row.email, displayName: row.display_name }
    : null;
}

/**
 * Uses a link: sets the password and ends every session the person had.
 * One UPDATE claims the token, so two submissions of the same link cannot
 * both succeed, and an expired or used one sets nothing.
 */
export async function setPasswordWithToken(
  token: string,
  password: string,
): Promise<{ ok: true; username: string } | { ok: false; reason: string; field?: string }> {
  const view = await peekToken(token);

  if (!view) {
    return { ok: false, reason: "This link has been used or has run out. Ask the owner for a new one." };
  }

  const problem = passwordProblem(password, { username: view.username, email: view.email });
  if (problem) {
    return { ok: false, reason: problem, field: "password" };
  }

  // Hashed before the claim, so a slow hash cannot leave a claimed token with
  // no password behind it; the claim and the write are then one transaction.
  const hash = await hashPassword(password);

  const done = await transaction(async (client) => {
    const claimed = await client.query<{ user_id: string }>(
      `update crew_token t set used_at = now()
         from crew_user u
        where t.token_hash = $1 and t.used_at is null and t.expires_at > now()
          and u.id = t.user_id and u.active
        returning t.user_id`,
      [hashToken(token)],
    );
    const userId = claimed.rows[0]?.user_id;
    if (!userId) return false;

    await client.query("update crew_user set password_hash = $2 where id = $1", [userId, hash]);
    await client.query("delete from crew_token where user_id = $1 and used_at is null", [userId]);
    await client.query("delete from admin_session where user_id = $1", [userId]);
    return true;
  });

  return done
    ? { ok: true, username: view.username }
    : { ok: false, reason: "This link has been used or has run out. Ask the owner for a new one." };
}

/** Turns a person off. Their sessions end now, and their unused links die. */
export async function deactivateUser(id: string, actingUserId: string | null): Promise<Change> {
  if (id === actingUserId) {
    return { ok: false, reason: "You cannot turn off your own account while signed in to it." };
  }
  const target = await queryOne<{ role: string; active: boolean }>(
    "select role, active from crew_user where id = $1",
    [id],
  );
  if (!target) return { ok: false, reason: "That person no longer exists." };
  if (target.role === "owner" && (await isSharedPasswordDisabled()) && (await countUsableOwners(id)) === 0) {
    return { ok: false, reason: "That is the last owner who can sign in. Make someone else an owner first." };
  }

  await transaction(async (client) => {
    await client.query("update crew_user set active = false where id = $1", [id]);
    await client.query("delete from admin_session where user_id = $1", [id]);
    await client.query("delete from crew_token where user_id = $1 and used_at is null", [id]);
  });
  return { ok: true };
}

export async function reactivateUser(id: string): Promise<Change> {
  const rows = await query("update crew_user set active = true where id = $1 returning id", [id]);
  return rows.length === 1 ? { ok: true } : { ok: false, reason: "That person no longer exists." };
}

export async function changeRole(id: string, role: Role, actingUserId: string | null): Promise<Change> {
  if (id === actingUserId) {
    return { ok: false, reason: "You cannot change your own role. Another owner can." };
  }
  const target = await queryOne<{ role: string }>("select role from crew_user where id = $1", [id]);
  if (!target) return { ok: false, reason: "That person no longer exists." };
  if (
    target.role === "owner" &&
    role === "crew" &&
    (await isSharedPasswordDisabled()) &&
    (await countUsableOwners(id)) === 0
  ) {
    return { ok: false, reason: "That is the last owner who can sign in. Make someone else an owner first." };
  }

  // The role is read from this row on every request, so it takes effect at
  // once; the sessions are ended anyway so nobody keeps a page of controls
  // they no longer have.
  await transaction(async (client) => {
    await client.query("update crew_user set role = $2 where id = $1", [id, role]);
    await client.query("delete from admin_session where user_id = $1", [id]);
  });
  return { ok: true };
}
