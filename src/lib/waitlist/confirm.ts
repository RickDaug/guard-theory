import { createHmac, timingSafeEqual } from "node:crypto";
import { databaseUrl, query, queryOne } from "../db/client.ts";
import { getMailProvider, sendEmail } from "../mail/index.ts";
import { waitlistConfirmation } from "../mail/templates.ts";

/**
 * Double opt-in: the signed, expiring link that turns a pending signup into a
 * confirmed one.
 *
 * THE TOKEN
 *
 * `<signup id>.<expiry, unix seconds>.<HMAC-SHA256>`, base64url where it needs
 * to be. The MAC covers the id, the address and the expiry, so a token cannot
 * be forged, moved to another row or extended, and nothing about it is stored:
 * a leaked database dump holds no live links. The secret is the database URL,
 * as for the rate limiter's keys (src/lib/rate-limit-db.ts): always set where
 * this runs, the same on every instance, never sent anywhere. Rotating the
 * database password therefore voids outstanding links, which costs a reader one
 * more signup.
 *
 * THE CLICK
 *
 * Following the link changes nothing. The page it opens shows a Confirm button,
 * and only the POST behind that button writes. Mail scanners fetch every link
 * in a message to check it; a GET that confirmed would let them confirm
 * addresses nobody had looked at, which is the whole thing this exists to stop.
 */

export const CONFIRMATION_TTL_HOURS = 72;

/**
 * A pending signup nobody confirmed is deleted this long after its latest link
 * was issued. The privacy policy says so ("how-long"); keeping an address that
 * never agreed to be kept would be the opposite of the point.
 */
export const PENDING_RETENTION_DAYS = 30;

/** Do not email the same pending address twice inside this. */
export const RESEND_AFTER_MINUTES = 10;

function secret(): string {
  return `waitlist-confirm|${databaseUrl() ?? ""}`;
}

function mac(id: string, email: string, expires: number): string {
  return createHmac("sha256", secret())
    .update(`${id}|${email.trim().toLowerCase()}|${expires}`)
    .digest("base64url");
}

export function signConfirmation(
  id: string,
  email: string,
  now: Date = new Date(),
): string {
  const expires = Math.floor(now.getTime() / 1000) + CONFIRMATION_TTL_HOURS * 3600;
  return `${Buffer.from(id).toString("base64url")}.${expires}.${mac(id, email, expires)}`;
}

export type ParsedToken = { id: string; expires: number; signature: string };

/** Shape only. Says nothing about whether the token is genuine. */
export function parseConfirmation(token: string): ParsedToken | null {
  if (typeof token !== "string" || token.length > 256) return null;
  const parts = token.trim().split(".");
  if (parts.length !== 3) return null;
  const [encodedId, expiresRaw, signature] = parts as [string, string, string];
  if (!/^[A-Za-z0-9_-]{1,120}$/.test(encodedId)) return null;
  if (!/^\d{1,12}$/.test(expiresRaw)) return null;
  if (!/^[A-Za-z0-9_-]{43}$/.test(signature)) return null;
  const id = Buffer.from(encodedId, "base64url").toString("utf8");
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  return { id, expires: Number(expiresRaw), signature };
}

/** True when `parsed` was signed by us for this address. Expiry is separate. */
export function signatureValid(parsed: ParsedToken, email: string): boolean {
  const expected = Buffer.from(mac(parsed.id, email, parsed.expires));
  const given = Buffer.from(parsed.signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function isExpired(parsed: ParsedToken, now: Date = new Date()): boolean {
  return parsed.expires * 1000 < now.getTime();
}

export type ConfirmResult =
  | "confirmed"
  | "already"
  | "expired"
  | "invalid"
  | "unavailable";

/**
 * Confirms the signup a token names. Idempotent: a second press reports
 * "already", because a person clicking twice has done nothing wrong.
 */
export async function confirmByToken(token: string, now: Date = new Date()): Promise<ConfirmResult> {
  const parsed = parseConfirmation(token);
  if (!parsed) return "invalid";

  try {
    const row = await queryOne<{ email: string; consent_state: string; unsubscribed_at: Date | null }>(
      "select email, consent_state, unsubscribed_at from waitlist_signup where id = $1",
      [parsed.id],
    );

    // An unknown id and a bad signature read the same to the reader: the link
    // is not one of ours, or the row it named has been deleted.
    if (!row) return "invalid";

    // The signature first, so a forged token is "invalid" whatever its
    // expiry, and the reader is only ever told "expired" about a link we sent.
    if (!signatureValid(parsed, row.email)) return "invalid";

    if (row.consent_state !== "pending") {
      // Already confirmed, or a legacy row: on the list, nothing to do. If the
      // address has since unsubscribed, an old link must not undo that — it
      // reads as expired, and joining again sends a new one.
      return row.unsubscribed_at === null ? "already" : "expired";
    }

    if (isExpired(parsed, now)) return "expired";

    const updated = await queryOne<{ id: string }>(
      `update waitlist_signup
          set consent_state = 'confirmed',
              confirmed_at = now(),
              unsubscribed_at = null
        where id = $1
          and consent_state = 'pending'
       returning id`,
      [parsed.id],
    );

    return updated ? "confirmed" : "already";
  } catch (error) {
    console.error(
      "[guard-theory] failed to confirm a waitlist signup:",
      error instanceof Error ? error.message : error,
    );
    return "unavailable";
  }
}

export type Delivery = "sent" | "failed" | "not-delivered";

/**
 * Emails the confirmation link and records what became of it on the row.
 *
 * With no mail provider connected the message is written to the log, as every
 * other message is, and recorded as 'not-delivered' rather than 'sent' — the
 * distinction #26 draws in email_log. The reader still sees "check your
 * email"; the owner sees, in the portal's counts, that nothing went.
 */
export async function sendConfirmation(
  signup: { id: string; email: string; firstName: string },
  now: Date = new Date(),
): Promise<Delivery> {
  const link = signConfirmation(signup.id, signup.email, now);
  const ok = await sendEmail(
    "waitlist-confirmation",
    waitlistConfirmation(
      signup.email,
      signup.firstName,
      link,
      CONFIRMATION_TTL_HOURS,
      PENDING_RETENTION_DAYS,
    ),
  );
  const delivery: Delivery = !ok ? "failed" : getMailProvider().delivers ? "sent" : "not-delivered";

  try {
    await query(
      `update waitlist_signup
          set confirmation_sent_at = now(), confirmation_delivery = $2
        where id = $1`,
      [signup.id, delivery],
    );
  } catch (error) {
    console.error(
      "[guard-theory] could not record the confirmation email:",
      error instanceof Error ? error.message : error,
    );
  }

  return delivery;
}

/** Deletes pending signups nobody confirmed. Returns how many went. */
export async function purgeUnconfirmed(): Promise<number> {
  const rows = await query<{ n: number }>(
    `with gone as (
       delete from waitlist_signup
        where consent_state = 'pending'
          and unsubscribed_at is null
          and coalesce(confirmation_sent_at, submitted_at) < now() - make_interval(days => $1)
       returning 1
     )
     select count(*)::int as n from gone`,
    [PENDING_RETENTION_DAYS],
  );
  return rows[0]?.n ?? 0;
}
