import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isIPv4, isIPv6 } from "node:net";
import { query } from "../db/client.ts";

/**
 * Sign-in attempt limiting, kept in Postgres.
 *
 * It used to be a Map in the function's memory. On Vercel every instance has
 * its own, a cold start empties it, and an attacker who spreads requests across
 * instances never meets the limit at all — while each guess still costs ~100ms
 * of CPU and 32MB for scrypt. Postgres is the one thing every instance shares,
 * and it is already a hard requirement for signing in, so this adds no vendor.
 *
 * TWO LIMITS
 *
 * Per address, to stop one client guessing. And across ALL addresses, because a
 * per-address limit alone is no limit against a botnet.
 *
 * The global one, on its own, hands a botnet the owner's key: about a dozen
 * addresses failing five times each every quarter hour keep EVERYONE out,
 * indefinitely. So a browser the owner has already signed in from carries a
 * signed "known device" cookie (knownDeviceCookieName), and that browser is
 * exempt from the global cap. It is still held to its own per-address cap.
 *
 * THE TRADE-OFF, stated plainly: whoever holds that cookie can guess at five
 * per quarter hour per address even while the site is under attack, instead of
 * zero. It is only obtainable by signing in with the password, or by stealing
 * it from the owner's browser — where it is httpOnly and __Host- scoped, and
 * whoever can read it has the session cookie beside it anyway. It does not sign
 * anyone in; the password is still required. It dies with the password: it is
 * an HMAC keyed on the password hash, so changing the password revokes every
 * known device at once. A NEW browser, while the global cap is being saturated,
 * still has to wait — an edge rate limit (the Vercel WAF) is the layer for that.
 *
 * Addresses are keyed by network, not host: an IPv4 address as itself (/32),
 * an IPv6 address by its /64. One ISP customer is handed a whole /64, so keying
 * by the full IPv6 address would let a single host rotate through 2^64 fresh
 * "addresses" and never meet its per-address limit.
 *
 * No address is stored. The key is a SHA-256 of the address and a server-side
 * secret, which is enough to count by and useless to read.
 */

export const LOGIN_WINDOW_MINUTES = 15;
export const LOGIN_MAX_FAILURES_PER_ADDRESS = 5;
export const LOGIN_MAX_FAILURES_GLOBAL = 60;
/** Rows older than this are deleted on the way past. */
export const LOGIN_ATTEMPT_RETENTION_HOURS = 24;

export type AttemptGate =
  | { allowed: true; attemptId: string }
  | { allowed: false; retryAfterSeconds: number };

/**
 * The network an address is counted as: an IPv4 address itself (/32), an IPv6
 * address its /64, as the first four groups written out in full. An IPv4-mapped
 * IPv6 address (::ffff:203.0.113.9) is the IPv4 address it maps. Anything that
 * is not an address is returned trimmed and lower-cased, unchanged otherwise.
 */
export function addressNetwork(address: string | null | undefined): string {
  let value = (address ?? "").trim().toLowerCase();
  // "[2001:db8::1]" and "2001:db8::1%eth0" are the same host as 2001:db8::1.
  if (value.startsWith("[") && value.endsWith("]")) value = value.slice(1, -1);
  const zone = value.indexOf("%");
  if (zone !== -1 && isIPv6(value.slice(0, zone))) value = value.slice(0, zone);

  if (isIPv4(value) || !isIPv6(value)) return value;

  // Expand "::" and any trailing dotted quad into eight 16-bit groups.
  let text = value;
  const quad = /(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(text);
  if (quad) {
    const [a, b, c, d] = quad.slice(1).map(Number) as [number, number, number, number];
    text = `${text.slice(0, quad.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const split = text.indexOf("::");
  const left = (split === -1 ? text : text.slice(0, split)).split(":").filter(Boolean);
  const right = split === -1 ? [] : text.slice(split + 2).split(":").filter(Boolean);
  const groups = [
    ...left,
    ...Array<string>(Math.max(0, 8 - left.length - right.length)).fill("0"),
    ...right,
  ].map((g) => g.padStart(4, "0"));

  // ::ffff:a.b.c.d is an IPv4 caller reached over IPv6; count it as that caller.
  if (groups.slice(0, 5).every((g) => g === "0000") && groups[5] === "ffff") {
    const hi = parseInt(groups[6]!, 16);
    const lo = parseInt(groups[7]!, 16);
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }

  return `${groups.slice(0, 4).join(":")}::/64`;
}

export function addressKey(address: string | null | undefined, secret: string): string {
  return createHash("sha256")
    .update(`${secret}|${addressNetwork(address) || "unknown"}`)
    .digest("hex");
}

/**
 * THE KNOWN-DEVICE COOKIE
 *
 * Set after a successful sign-in; exempts that browser from the global cap (see
 * the top of this file for why, and what it costs). The value is
 * `v1.<issued-at seconds>.<HMAC-SHA256>`, keyed on a server secret. The sign-in
 * action passes the portal password hash, the same secret its address key is
 * derived from, so no new environment variable exists and a password change
 * revokes them all.
 */
export const KNOWN_DEVICE_DAYS = 90;
const KNOWN_DEVICE_COOKIE = "gt_crew_device";

/** `__Host-` in production, like the session cookie: Secure, Path=/, no Domain. */
export function knownDeviceCookieName(env: NodeJS.ProcessEnv = process.env): string {
  return env.NODE_ENV === "production" ? `__Host-${KNOWN_DEVICE_COOKIE}` : KNOWN_DEVICE_COOKIE;
}

function knownDeviceMac(issuedAt: number, secret: string): string {
  return createHmac("sha256", `known-device|${secret}`)
    .update(`v1|${issuedAt}`)
    .digest("base64url");
}

export function signKnownDevice(secret: string, now: number = Date.now()): string {
  const issuedAt = Math.floor(now / 1000);
  return `v1.${issuedAt}.${knownDeviceMac(issuedAt, secret)}`;
}

/** True only for an unexpired value this server signed with this secret. */
export function isKnownDevice(
  value: string | null | undefined,
  secret: string,
  now: number = Date.now(),
): boolean {
  if (!value || !secret || value.length > 200) return false;
  const match = /^v1\.(\d{1,12})\.([A-Za-z0-9_-]{43})$/.exec(value);
  if (!match) return false;

  const issuedAt = Number(match[1]);
  const age = now / 1000 - issuedAt;
  // Five minutes of clock skew between instances; nothing from the future beyond it.
  if (!(age >= -300 && age <= KNOWN_DEVICE_DAYS * 24 * 60 * 60)) return false;

  const expected = Buffer.from(knownDeviceMac(issuedAt, secret));
  const given = Buffer.from(match[2]!);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export type LoginAttemptOptions = {
  /** A verified known-device cookie (isKnownDevice): the global cap does not apply. */
  knownDevice?: boolean;
};

/**
 * Records the attempt as a failure and decides, in one statement.
 *
 * Recorded BEFORE the password is looked at: a check-then-record sequence lets
 * a burst of parallel guesses all pass the check before any of them is counted.
 * A success is marked afterwards (markAttemptSucceeded) and stops counting. A
 * refused attempt is not kept, so waiting out a lockout actually ends it.
 *
 * A known device (options.knownDevice) is held to the per-address cap only. Its
 * failures are still recorded, and still count towards everyone's global total.
 */
export async function beginLoginAttempt(
  key: string,
  options: LoginAttemptOptions = {},
): Promise<AttemptGate> {
  const rows = await query<{
    id: string;
    by_address: number;
    overall: number;
    oldest_seconds: number | null;
    oldest_by_address_seconds: number | null;
  }>(
    `with recent as (
       select key_hash, attempted_at from login_attempt
        where not succeeded
          and attempted_at > now() - make_interval(mins => $2)
     ),
     added as (
       insert into login_attempt (key_hash) values ($1) returning id
     )
     select (select id::text from added) as id,
            (select count(*)::int from recent where key_hash = $1) as by_address,
            (select count(*)::int from recent) as overall,
            (select extract(epoch from now() - min(attempted_at))::int from recent) as oldest_seconds,
            (select extract(epoch from now() - min(attempted_at))::int from recent
              where key_hash = $1) as oldest_by_address_seconds`,
    [key, LOGIN_WINDOW_MINUTES],
  );

  const row = rows[0]!;
  const byAddress = row.by_address >= LOGIN_MAX_FAILURES_PER_ADDRESS;
  const overall = !options.knownDevice && row.overall >= LOGIN_MAX_FAILURES_GLOBAL;

  if (!byAddress && !overall) {
    return { allowed: true, attemptId: row.id };
  }

  await query("delete from login_attempt where id = $1::bigint", [row.id]);

  const windowSeconds = LOGIN_WINDOW_MINUTES * 60;
  return {
    allowed: false,
    // Until the oldest failure doing the blocking ages out of the window.
    retryAfterSeconds: Math.max(
      1,
      windowSeconds - ((overall ? row.oldest_seconds : row.oldest_by_address_seconds) ?? 0),
    ),
  };
}

export async function markAttemptSucceeded(attemptId: string): Promise<void> {
  await query("update login_attempt set succeeded = true where id = $1::bigint", [attemptId]);
}

/** Housekeeping. Never worth failing a sign-in over. Returns how many went. */
export async function sweepLoginAttempts(): Promise<number> {
  try {
    const rows = await query<{ id: string }>(
      "delete from login_attempt where attempted_at < now() - make_interval(hours => $1) returning id::text as id",
      [LOGIN_ATTEMPT_RETENTION_HOURS],
    );
    return rows.length;
  } catch {
    // Deliberately quiet.
    return 0;
  }
}
