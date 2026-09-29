import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../content/editorial-voice.ts";
import { createHash, randomUUID } from "node:crypto";
import { query } from "../db/client.ts";
import { announcement } from "./templates.ts";
import type { Email, SendResult } from "./types.ts";

/**
 * Deciding who gets the announcement, and sending it to them exactly once.
 *
 * Everything the send script decides lives here rather than in the script, so
 * the decisions can be tested without a mail provider, a key or a terminal.
 * `scripts/mail/send-announcement.ts` is only argument parsing, prompts and
 * printing; if a rule about who receives the message is not in this file, it is
 * not a rule.
 *
 * THE ONE PROPERTY THAT MATTERS
 *
 * Nobody receives it twice. A reader forgives a late announcement; they do not
 * forgive the same one arriving on Tuesday and again on Wednesday, and the
 * second copy is the one that gets marked as spam and costs the domain its
 * reputation for every message after it.
 *
 * `email_log` is the ledger, and the ledger is written FIRST. Before the
 * provider is called, the address is claimed: a `pending` row, guarded by a
 * partial unique index (migration 0005) that allows one pending, sent or
 * unknown announcement row per address. Whoever inserts it owns the send. A
 * second run — concurrent, or tomorrow's — gets a conflict instead of a row
 * and moves on. After the call the row becomes `sent`, `failed` or `unknown`.
 *
 * So the dangerous window is covered from both sides. Killed between the claim
 * and the call: a `pending` row and no message. Killed between the call and
 * the update: a `pending` row and a message. Either way the row is there, the
 * address is never sent to again automatically, and the script prints it as
 * one for a person to check in the Resend dashboard.
 *
 * `unknown` is the same promise for a send nobody can vouch for — a timeout, a
 * dropped connection, a 5xx. It is NOT retried. The idempotency key on every
 * message would make a retry harmless for 24 hours and no longer, and a run
 * "tomorrow" is by definition about 24 hours later. The run stops on the first
 * one, because an unanswered request usually means the next will be too.
 *
 * Only `failed` — the provider answered, and refused — is tried again.
 *
 * That is also why the mail test script logs under "test" and not here.
 *
 * WHY THE DAILY CAP COUNTS EVERY TEMPLATE
 *
 * Resend's free tier is 100 messages a day, and the day is the UTC calendar
 * day — it resets at midnight UTC, not 24 hours after the first send. The quota
 * is the account's, not the announcement's: a mail test earlier in the day
 * spends it too. So the remaining allowance is the cap minus every row since
 * UTC midnight that did or may have gone out — sent, unknown, pending — not
 * the cap minus this run's sends. Running the script
 * twice in one day therefore cannot overdraw it, and running it once a day for
 * as many days as the list needs picks up exactly where the last run stopped,
 * because the dedupe is the same query that made the first run stop.
 *
 * Received mail also counts against Resend's quota. Nothing receives mail at
 * guardtheory.net through Resend today; if that changes, lower the cap.
 */

/**
 * The token the example message file carries, and which blocks a send.
 *
 * The announcement is the owner's to write, and it has not been written. The
 * example file exists to show the format; this marker is what stops the example
 * — or a half-edited copy of it — from going to the whole list.
 */
export const PLACEHOLDER_MARKER = "[[PLACEHOLDER — NOT WRITTEN YET]]";

/**
 * A blank the owner was meant to fill: `[PRICE]`, `[SHIPPING REGION]`,
 * `[DATE]`, `[ARTICLE COUNT]` — the shapes `docs/announcement-drafts.md` uses.
 *
 * Square brackets around capitals and nothing else, two letters at least, or
 * the opening of a bracketed instruction (`[OPTIONAL, ONLY IF FIXED: ...`).
 * Ordinary prose does not trip it: `[sic]`, `[1]`, `[Theory 01]` and a lone
 * `[A]` all pass, because none of them is a run of uppercase words.
 */
const OWNER_PLACEHOLDER = /\[[A-Z]{2,}(?:[ ,/&-]+[A-Z0-9]+)*(?:\]|:)/g;

/** Every unfilled owner placeholder in the text, once each, as written. */
export function findOwnerPlaceholders(text: string): string[] {
  return [...new Set(text.match(OWNER_PLACEHOLDER) ?? [])];
}

export const TEMPLATE = "announcement" as const;

/** Resend's free-tier daily quota. Overridable, never exceeded by default. */
export const DEFAULT_DAILY_CAP = 100;

/**
 * Pause between messages.
 *
 * Resend allows 10 requests a second per team (checked 2026-09-17 against
 * resend.com/docs/api-reference/rate-limit). A quarter of a second is four a
 * second: well under the limit, with room for anything the site itself sends
 * during the run, and a hundred messages still finish in under a minute.
 */
export const DEFAULT_DELAY_MS = 250;

/**
 * Consecutive failures that end a run.
 *
 * One failure is an address; three in a row is the key, the domain or the
 * provider, and sending on into it only fills the log with the same error.
 */
export const MAX_CONSECUTIVE_FAILURES = 3;

export type AnnouncementMessage = {
  subject: string;
  body: string;
};

/**
 * Reads the message file.
 *
 * The format is a `Subject:` line, a blank line, then the body — the shape of an
 * email, so the file reads as the message it will become. Lines starting with
 * `#` before the subject are notes for whoever edits the file, and are dropped.
 * Nothing after the subject is dropped: a `#` in the body is the body's.
 */
export function parseMessageFile(text: string): AnnouncementMessage {
  const lines = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n");

  let index = 0;
  while (index < lines.length && (lines[index]!.trim() === "" || lines[index]!.startsWith("#"))) {
    index += 1;
  }

  const subjectLine = lines[index] ?? "";
  const match = /^subject:(.*)$/i.exec(subjectLine);

  if (!match) {
    throw new Error(
      'The message file must start with a "Subject:" line, then a blank line, then the body.',
    );
  }

  const rest = lines.slice(index + 1);

  if (rest.length > 0 && rest[0]!.trim() !== "") {
    throw new Error(
      "The subject must be one line, followed by a blank line before the body.",
    );
  }

  return { subject: match[1]!.trim(), body: rest.join("\n").trim() };
}

/**
 * Every reason this message must not go out. Empty means it may.
 *
 * Checks the message as the reader receives it — subject and the rendered body,
 * envelope included — rather than only the part the owner wrote, so the
 * template's own lines are held to the same list.
 */
export function problemsWithMessage(message: AnnouncementMessage): string[] {
  const problems: string[] = [];

  if (!message.subject) {
    problems.push("The subject is empty. A message with no subject reads as spam.");
  }

  if (/[\r\n]/.test(message.subject)) {
    problems.push("The subject spans more than one line.");
  }

  if (!message.body) {
    problems.push("The body is empty.");
  }

  const raw = `${message.subject}\n${message.body}`;

  if (raw.includes(PLACEHOLDER_MARKER)) {
    problems.push(
      `The message still contains the placeholder marker ${PLACEHOLDER_MARKER}. ` +
        "It has not been written yet.",
    );
  }

  for (const placeholder of findOwnerPlaceholders(raw)) {
    problems.push(
      `Unfilled placeholder ${placeholder}${placeholder.endsWith("]") ? "" : " ...]"}. ` +
        "Fill it in, or cut the sentence it is in.",
    );
  }

  const rendered = announcement("reader@example.com", "token", message.subject, message.body);
  const text = `${rendered.subject}\n${rendered.body}`;

  for (const source of findBannedConstructions(text, BANNED_CONSTRUCTIONS)) {
    problems.push(`Banned construction: /${source}/`);
  }

  for (const source of findBannedConstructions(text, BANNED_IN_EMAIL)) {
    problems.push(`Not in email: /${source}/`);
  }

  return problems;
}

/**
 * Addresses that cannot belong to anyone.
 *
 * RFC 2606 and RFC 6761 reserve these, and the August NDJSON store was 55
 * Playwright fixtures at `test-*@example.com`. A preview branch forked from
 * production, or a fixture that slipped through, would otherwise be "sent" —
 * each one a bounce, and bounces are what a new sending domain is judged on.
 */
export function isReservedAddress(email: string): boolean {
  const domain = email.slice(email.lastIndexOf("@") + 1).toLowerCase();
  return (
    /^(?:.+\.)?example\.(?:com|net|org)$/.test(domain) ||
    /(?:^|\.)(?:example|test|invalid|localhost)$/.test(domain)
  );
}

export type Subscriber = {
  email: string;
  unsubscribeToken: string;
};

export type AnnouncementPlan = {
  /** Who this run sends to, in signup order. */
  send: Subscriber[];
  /** Already have it, per `email_log`. Never sent again. */
  alreadySent: number;
  /** Reserved test domains. Never sent at all. */
  reserved: string[];
  /** Due, but over today's allowance. The next day's run takes them. */
  deferred: number;
  /** What was left of today's quota before this run. */
  allowance: number;
};

/**
 * The pure part: given the list, the ledger and the quota, who goes today.
 *
 * `subscribers` must already exclude the unsubscribed and anyone without
 * consent — that is the query's job, below, because it is a fact about the row
 * rather than about this send.
 */
export function planAnnouncement(input: {
  subscribers: readonly Subscriber[];
  alreadySent: ReadonlySet<string>;
  dailyCap: number;
  sentToday: number;
}): AnnouncementPlan {
  const allowance = Math.max(0, input.dailyCap - input.sentToday);
  const seen = new Set<string>();
  const due: Subscriber[] = [];
  const reserved: string[] = [];
  let alreadySent = 0;

  for (const subscriber of input.subscribers) {
    const key = subscriber.email.trim().toLowerCase();

    // The unique index is on the stored address, and the store lowercases on
    // insert, so a duplicate here should be impossible. "Should" is not the
    // standard for a list send.
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    if (input.alreadySent.has(key)) {
      alreadySent += 1;
    } else if (isReservedAddress(key)) {
      reserved.push(key);
    } else {
      due.push({ ...subscriber, email: key });
    }
  }

  return {
    send: due.slice(0, allowance),
    alreadySent,
    reserved,
    deferred: Math.max(0, due.length - allowance),
    allowance,
  };
}

/** Everyone still on the list who said yes, oldest signup first. */
export async function loadSubscribers(): Promise<Subscriber[]> {
  const rows = await query<{ email: string; unsubscribe_token: string }>(
    `select email, unsubscribe_token
       from waitlist_signup
      where unsubscribed_at is null
        and consent = true
      order by submitted_at asc, id asc`,
  );
  return rows.map((row) => ({ email: row.email, unsubscribeToken: row.unsubscribe_token }));
}

/**
 * The statuses that mean "do not send to this address again".
 *
 * The same three the partial unique index in migration 0005 covers, and they
 * must stay the same three: this list is what the plan skips, the index is
 * what the claim collides with, and a status in one and not the other is
 * either a double send or an address nobody ever reaches.
 */
export const BLOCKING_STATUSES = ["pending", "sent", "unknown"] as const;

/**
 * Every address `email_log` says has, or may have, the announcement.
 *
 * A `pending` or `unknown` row counts as done. It is not known to be done —
 * that is the point. Guessing "not sent" is the guess that produces a second
 * copy; guessing "sent" produces, at worst, one person to write to by hand.
 */
export async function loadAlreadySent(): Promise<Set<string>> {
  const rows = await query<{ to_email: string }>(
    `select distinct lower(to_email) as to_email
       from email_log
      where template = $1
        and status = any($2::text[])`,
    [TEMPLATE, BLOCKING_STATUSES],
  );
  return new Set(rows.map((row) => row.to_email));
}

export type Unresolved = { email: string; status: "pending" | "unknown"; since: Date };

/**
 * Addresses a person has to look up in the Resend dashboard.
 *
 * `pending` here means a run died mid-send; `unknown` means the provider never
 * gave a straight answer. Nothing in this codebase resolves either, because
 * nothing in this codebase can know. The script prints these on every run,
 * with the statement that settles each one.
 */
export async function loadUnresolved(): Promise<Unresolved[]> {
  const rows = await query<{ to_email: string; status: "pending" | "unknown"; created_at: Date }>(
    `select lower(to_email) as to_email, status, created_at
       from email_log
      where template = $1
        and status in ('pending', 'unknown')
      order by created_at asc`,
    [TEMPLATE],
  );
  return rows.map((row) => ({ email: row.to_email, status: row.status, since: row.created_at }));
}

/**
 * Messages of any kind since midnight UTC that went out or may have — the
 * window Resend's daily quota is counted over. An `unknown` or `pending` row
 * may have spent quota, so it is counted as if it had.
 *
 * `now` is a parameter so the boundary can be tested without waiting for it.
 */
export async function countSentToday(now: Date = new Date()): Promise<number> {
  const rows = await query<{ n: number }>(
    `select count(*)::int as n
       from email_log
      where status = any($1::text[])
        and created_at >= $2`,
    [BLOCKING_STATUSES, startOfUtcDay(now)],
  );
  return rows[0]?.n ?? 0;
}

/** Midnight UTC at the start of the day `now` falls in, wherever this runs. */
export function startOfUtcDay(now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/**
 * The claim: either a row id, or the reason there is no send.
 *
 *   unsubscribed — they left, or withdrew consent, after the plan was made.
 *   claimed      — another run (or an earlier, killed one) holds the address.
 */
export type Claim = { id: string } | "unsubscribed" | "claimed";

/**
 * Claims one address, immediately before its send.
 *
 * One statement does two jobs. The `select` re-reads the signup, so someone
 * who unsubscribed while the script sat at its confirmation prompt is not sent
 * to — the plan is minutes old by the time the last message goes, and this is
 * milliseconds old. The `insert` is the claim, and the unique index decides
 * who wins it. Being one statement, there is no gap between the two for a
 * pooler in transaction mode to hand to somebody else.
 */
export async function claimRecipient(email: string): Promise<Claim> {
  const id = randomUUID();
  const claimed = await query<{ id: string }>(
    `insert into email_log (id, to_email, template, status)
     select $1, lower(email), $3, 'pending'
       from waitlist_signup
      where lower(email) = lower($2)
        and unsubscribed_at is null
        and consent = true
     on conflict do nothing
     returning id`,
    [id, email, TEMPLATE],
  );

  if (claimed.length > 0) {
    return { id };
  }

  // No row came back, for one of two reasons, and the run reports which.
  const wanted = await query<{ n: number }>(
    `select count(*)::int as n
       from waitlist_signup
      where lower(email) = lower($1)
        and unsubscribed_at is null
        and consent = true`,
    [email],
  );
  return (wanted[0]?.n ?? 0) > 0 ? "claimed" : "unsubscribed";
}

/**
 * Turns the claim into what happened. False if the row was not there to turn.
 *
 * Only ever moves a row OUT of `pending`. A claim somebody has already settled
 * by hand is left as they settled it.
 */
export async function settleClaim(id: string, result: SendResult): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update email_log
        set status = $2, provider_id = $3, error = $4
      where id = $1
        and status = 'pending'
      returning id`,
    [
      id,
      result.ok ? "sent" : result.unknown ? "unknown" : "failed",
      result.ok ? result.providerId : null,
      result.ok ? null : result.error.slice(0, 1000),
    ],
  );
  return rows.length > 0;
}

/**
 * One key per address, and the same one on every run.
 *
 * Hashed so an address is not sitting in a request header in anyone's logs.
 * Lowercased first, or `A@x` and `a@x` are two keys and two messages.
 */
export function idempotencyKeyFor(email: string): string {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `${TEMPLATE}:${hash}`;
}

export function renderFor(subscriber: Subscriber, message: AnnouncementMessage): Email {
  return {
    ...announcement(subscriber.email, subscriber.unsubscribeToken, message.subject, message.body),
    idempotencyKey: idempotencyKeyFor(subscriber.email),
  };
}

export type RunOutcome = {
  sent: number;
  failed: number;
  /** Unsubscribed since the plan was made, or claimed by another run. */
  skipped: number;
  /**
   * Addresses that may or may not have the message. Never retried. Each needs
   * a person to look it up in the Resend dashboard.
   */
  needsCheck: string[];
  /** Why the run ended early, or null if it reached the end of the plan. */
  stoppedBecause: string | null;
};

export type ResultKind = "sent" | "failed" | "unknown" | "unsubscribed" | "claimed";

/**
 * The loop, with every side effect passed in so a test can drive it.
 *
 * For each address: claim, send, settle. Stops, rather than carrying on, when:
 *
 *   * The outcome of a send is unknown. That address goes on the list to check
 *     by hand, and the run ends — see the note at the top of this file.
 *   * The ledger cannot be written, before or after a send. It is the only
 *     thing preventing a double send, so a run that cannot write to it must
 *     not send one more message. A claim that could not be settled stays
 *     `pending`, which still blocks the address.
 *   * A 429. That is either the per-second limit or the daily quota, and
 *     neither is improved by asking again. The next run resumes cleanly.
 *   * Three failures in a row — see MAX_CONSECUTIVE_FAILURES.
 */
export async function runAnnouncement(
  plan: Pick<AnnouncementPlan, "send">,
  message: AnnouncementMessage,
  deps: {
    claim: (email: string) => Promise<Claim>;
    deliver: (email: Email) => Promise<SendResult>;
    settle: (claimId: string, result: SendResult) => Promise<boolean>;
    sleep: (ms: number) => Promise<void>;
    delayMs: number;
    onResult?: (email: string, kind: ResultKind, index: number) => void;
  },
): Promise<RunOutcome> {
  const outcome: RunOutcome = { sent: 0, failed: 0, skipped: 0, needsCheck: [], stoppedBecause: null };
  const stop = (because: string): RunOutcome => ({ ...outcome, stoppedBecause: because });
  const reason = (error: unknown) => (error instanceof Error ? error.message : String(error));
  let consecutiveFailures = 0;
  let delivered = false;

  for (const [index, subscriber] of plan.send.entries()) {
    // Paced on provider calls, not on loop turns: a skipped address cost
    // Resend nothing.
    if (delivered) {
      await deps.sleep(deps.delayMs);
      delivered = false;
    }

    let claim: Claim;
    try {
      claim = await deps.claim(subscriber.email);
    } catch (error) {
      return stop(
        `Could not claim ${subscriber.email} in email_log (${reason(error)}). ` +
          "Nothing was sent to it. Stopped: no claim, no send.",
      );
    }

    if (claim === "unsubscribed" || claim === "claimed") {
      outcome.skipped += 1;
      deps.onResult?.(subscriber.email, claim, index);
      continue;
    }

    let result: SendResult;
    try {
      result = await deps.deliver(renderFor(subscriber, message));
    } catch (error) {
      // A provider is supposed to return, not throw. One that throws has told
      // us nothing about whether the message went.
      result = { ok: false, unknown: true, error: reason(error) };
    }
    delivered = true;

    const kind: ResultKind = result.ok ? "sent" : result.unknown ? "unknown" : "failed";
    deps.onResult?.(subscriber.email, kind, index);

    if (result.ok) {
      outcome.sent += 1;
      consecutiveFailures = 0;
    } else if (result.unknown) {
      outcome.needsCheck.push(subscriber.email);
    } else {
      outcome.failed += 1;
      consecutiveFailures += 1;
    }

    let settled = false;
    let settleError = "the pending row was not there to update";
    try {
      settled = await deps.settle(claim.id, result);
    } catch (error) {
      settleError = reason(error);
    }

    if (!settled) {
      // The claim is still `pending`, so the address is still blocked. But it
      // now says less than is known, and a person has to correct it.
      if (!outcome.needsCheck.includes(subscriber.email)) {
        outcome.needsCheck.push(subscriber.email);
      }
      return stop(
        `${subscriber.email}: the send ${kind === "sent" ? "succeeded" : `ended as ${kind}`} ` +
          `but email_log could not be updated (${settleError}). Its row is still 'pending'. ` +
          "Stopped: a run that cannot write the ledger must not send.",
      );
    }

    if (result.ok) {
      continue;
    }

    if (result.unknown) {
      return stop(
        `No usable answer from Resend for ${subscriber.email} (${result.error}). ` +
          "It may or may not have been delivered, and it will not be retried.",
      );
    }

    if (result.error.startsWith("429")) {
      return stop(`Resend refused with 429 (rate limit or daily quota): ${result.error}`);
    }

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      return stop(`${MAX_CONSECUTIVE_FAILURES} failures in a row. Last: ${result.error}`);
    }
  }

  return outcome;
}
