import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../content/editorial-voice.ts";
import { query } from "../db/client.ts";
import { announcement } from "./templates.ts";
import type { Email } from "./types.ts";

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
 * `email_log` is the ledger. An address with a `sent` row under the
 * `announcement` template is done, whatever else is true of it. That is why the
 * mail test script logs under "test" and not here, and why the send loop below
 * checks the ledger after every message rather than trusting `sendEmail`'s
 * return value: `sendEmail` deliberately swallows a failed log write, which is
 * right for an order and wrong for a list send, where a message that went out
 * unrecorded is a message the next run sends again.
 *
 * WHY THE DAILY CAP COUNTS EVERY TEMPLATE
 *
 * Resend's free tier is 100 messages a day, and the day is the UTC calendar
 * day — it resets at midnight UTC, not 24 hours after the first send. The quota
 * is the account's, not the announcement's: a mail test earlier in the day
 * spends it too. So the remaining allowance is the cap minus every `sent` row
 * since UTC midnight, not the cap minus this run's sends. Running the script
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

/** Every address `email_log` says already has the announcement. */
export async function loadAlreadySent(): Promise<Set<string>> {
  const rows = await query<{ to_email: string }>(
    `select distinct lower(to_email) as to_email
       from email_log
      where template = $1
        and status = 'sent'`,
    [TEMPLATE],
  );
  return new Set(rows.map((row) => row.to_email));
}

/**
 * Messages of any kind sent since midnight UTC — the window Resend's daily
 * quota is counted over.
 */
export async function countSentToday(): Promise<number> {
  const rows = await query<{ n: number }>(
    `select count(*)::int as n
       from email_log
      where status = 'sent'
        and created_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'`,
  );
  return rows[0]?.n ?? 0;
}

/** Whether the ledger now holds a `sent` announcement row for this address. */
export async function hasSentRow(email: string): Promise<boolean> {
  const rows = await query<{ n: number }>(
    `select count(*)::int as n
       from email_log
      where lower(to_email) = lower($1)
        and template = $2
        and status = 'sent'`,
    [email, TEMPLATE],
  );
  return (rows[0]?.n ?? 0) > 0;
}

export function renderFor(subscriber: Subscriber, message: AnnouncementMessage): Email {
  return announcement(subscriber.email, subscriber.unsubscribeToken, message.subject, message.body);
}

export type RunOutcome = {
  sent: number;
  failed: number;
  /** Why the run ended early, or null if it reached the end of the plan. */
  stoppedBecause: string | null;
};

/**
 * The loop, with every side effect passed in so a test can drive it.
 *
 * Stops, rather than carrying on, in three cases:
 *
 *   * A 429. That is either the per-second limit or the daily quota, and
 *     neither is improved by asking again. The next run resumes cleanly.
 *   * Three failures in a row — see MAX_CONSECUTIVE_FAILURES.
 *   * A message reported as sent with no `sent` row behind it. The ledger is
 *     the only thing preventing a double send, so a run that cannot write to it
 *     must not send one more message.
 */
export async function runAnnouncement(
  plan: Pick<AnnouncementPlan, "send">,
  message: AnnouncementMessage,
  deps: {
    send: (email: Email) => Promise<{ ok: boolean; error?: string }>;
    recorded: (email: string) => Promise<boolean>;
    sleep: (ms: number) => Promise<void>;
    delayMs: number;
    onResult?: (email: string, ok: boolean, index: number) => void;
  },
): Promise<RunOutcome> {
  let sent = 0;
  let failed = 0;
  let consecutiveFailures = 0;

  for (const [index, subscriber] of plan.send.entries()) {
    if (index > 0) {
      await deps.sleep(deps.delayMs);
    }

    const result = await deps.send(renderFor(subscriber, message));
    deps.onResult?.(subscriber.email, result.ok, index);

    if (result.ok) {
      sent += 1;
      consecutiveFailures = 0;

      if (!(await deps.recorded(subscriber.email))) {
        return {
          sent,
          failed,
          stoppedBecause:
            `${subscriber.email} was sent but no 'sent' row was recorded in email_log. ` +
            "Stopped: without that row the next run would send it again.",
        };
      }
      continue;
    }

    failed += 1;
    consecutiveFailures += 1;

    if (result.error?.startsWith("429")) {
      return {
        sent,
        failed,
        stoppedBecause: `Resend refused with 429 (rate limit or daily quota): ${result.error}`,
      };
    }

    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      return {
        sent,
        failed,
        stoppedBecause: `${MAX_CONSECUTIVE_FAILURES} failures in a row. Last: ${result.error ?? "unknown"}`,
      };
    }
  }

  return { sent, failed, stoppedBecause: null };
}
