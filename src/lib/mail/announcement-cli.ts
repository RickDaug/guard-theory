import { PRODUCTION_ORIGIN } from "../site.ts";
import { DEFAULT_DAILY_CAP, DEFAULT_DELAY_MS } from "./announcement.ts";

/**
 * The send script's decisions that are not about the list: what it was asked
 * to do, where it is pointed, and whether the person at the keyboard agreed.
 *
 * They live here, not in `scripts/mail/send-announcement.ts`, for the reason
 * the list rules live in `announcement.ts` — the script runs on import, so
 * nothing inside it can be tested, and a gate that cannot be tested is a
 * comment.
 */

/**
 * The most `--cap` will accept.
 *
 * Resend's free tier is 100 a day. `--cap` exists to go LOWER — a first run of
 * five, to see them land — and a typo that adds a zero should be an error
 * rather than a thousand requests into a quota of a hundred. Raise this when
 * the plan changes, in a commit that says so.
 */
export const MAX_DAILY_CAP = 100;

export type Options = { file: string; send: boolean; cap: number; delayMs: number };

export function parseArgs(argv: readonly string[]): Options | string {
  let file: string | undefined;
  let send = false;
  let cap = DEFAULT_DAILY_CAP;
  let delayMs = DEFAULT_DELAY_MS;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;

    if (arg === "--send") {
      send = true;
    } else if (arg === "--cap" || arg === "--delay-ms") {
      // `Number("")` and `Number(" ")` are 0, and a missing value is
      // `undefined`; none of them is a number anybody typed.
      const raw = argv[i + 1];
      const value = raw !== undefined && /^\d+$/.test(raw) ? Number(raw) : Number.NaN;
      i += 1;
      if (!Number.isSafeInteger(value)) {
        return `${arg} needs a whole number.`;
      }
      if (arg === "--cap") {
        if (value > MAX_DAILY_CAP) {
          return `--cap cannot be more than ${MAX_DAILY_CAP}, Resend's daily quota.`;
        }
        cap = value;
      } else {
        delayMs = value;
      }
    } else if (arg.startsWith("--")) {
      return `Unknown option ${arg}.`;
    } else if (file === undefined) {
      file = arg;
    } else {
      return `One message file, not two (${file}, ${arg}).`;
    }
  }

  return file === undefined ? "No message file given." : { file, send, cap, delayMs };
}

/**
 * Why this SITE_URL must not be in a real send's unsubscribe links, or null.
 *
 * Compared whole, exactly. A pattern match lets through
 * `https://guardtheory.net.example.com`, a preview deployment, and `www.` —
 * every one of which is an unsubscribe link that may not work in a message
 * that cannot be recalled. A trailing slash or a path would also double up in
 * the link, so SITE_URL has to BE the origin, not merely sit on it.
 */
export function siteUrlProblem(siteUrl: string): string | null {
  if (siteUrl !== PRODUCTION_ORIGIN) {
    return (
      `Unsubscribe links would point at ${siteUrl}. A real send requires ` +
      `NEXT_PUBLIC_SITE_URL to be exactly ${PRODUCTION_ORIGIN}.`
    );
  }

  return null;
}

/**
 * The database's host, for the confirmation prompt — and nothing else from
 * the URL. The rest of a connection string is a password.
 */
export function databaseHost(url: string | undefined): string {
  if (!url) {
    return "(none)";
  }
  try {
    const { hostname, port } = new URL(url);
    return port ? `${hostname}:${port}` : hostname;
  } catch {
    // Never echo what could not be parsed: it may still contain the password.
    return "(unreadable DATABASE_URL)";
  }
}

/**
 * Whether what was typed is the recipient count.
 *
 * Digits only, compared as text: "12 " is a slip of the thumb and passes once
 * trimmed; "12.0", "1e1", "0x0c" and "twelve" are not what was asked for. And
 * nothing confirms a send to nobody.
 */
export function isConfirmed(typed: string, count: number): boolean {
  return count > 0 && typed.trim() === String(count);
}
