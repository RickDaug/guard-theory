/**
 * Sends the First Edition announcement to the waitlist. Dry run unless told
 * otherwise, and asks before it sends.
 *
 *   node --env-file-if-exists=.env.local scripts/mail/send-announcement.ts <message-file>
 *   node --env-file-if-exists=.env.local scripts/mail/send-announcement.ts <message-file> --send
 *
 * Options:
 *   --send          Actually send. Without it nothing leaves the machine.
 *   --cap <n>       Messages per UTC day, all templates counted. Default 100,
 *                   Resend's free-tier quota.
 *   --delay-ms <n>  Pause between messages. Default 250 (Resend allows 10/s).
 *
 * The message file is a `Subject:` line, a blank line and the body — see
 * `scripts/mail/announcement.example.txt`, which is deliberately unsendable.
 *
 * WHY DRY RUN IS THE DEFAULT
 *
 * A list send cannot be taken back. Every other script here that writes
 * something (`db:migrate`, the import) can be re-run or restored from a backup;
 * a message in a reader's inbox cannot be unsent. So the command you type
 * without thinking is the one that prints, and the one that sends needs a flag
 * and then the recipient count typed back — a number you have to read to type,
 * rather than a "y" your fingers supply on their own.
 *
 * SAFE TO RE-RUN, AND MEANT TO BE
 *
 * The run stops at the day's quota, and the next day's run carries on from
 * there: anyone `email_log` shows as already sent is skipped, so the list is
 * worked through across as many days as it takes and nobody gets it twice.
 * The rules live in `src/lib/mail/announcement.ts`, where they are tested.
 *
 * Do not run two at once. Each would read the ledger before the other wrote to
 * it. A lock would need a session-level advisory lock, which the pooled
 * connection this script uses (PgBouncer, transaction mode) cannot hold.
 *
 * The key is asked for with echo off, for the reasons in `test-send.ts`.
 * RESEND_API_KEY in the environment skips the prompt. A dry run never asks.
 */
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";

import {
  DEFAULT_DAILY_CAP,
  DEFAULT_DELAY_MS,
  countSentToday,
  hasSentRow,
  loadAlreadySent,
  loadSubscribers,
  parseMessageFile,
  planAnnouncement,
  problemsWithMessage,
  renderFor,
  runAnnouncement,
  type AnnouncementMessage,
} from "../../src/lib/mail/announcement.ts";
import { closePool, isDatabaseConfigured } from "../../src/lib/db/client.ts";
import { SITE_URL } from "../../src/lib/site.ts";

const DEFAULT_FROM = "Guard Theory <hello@guardtheory.net>";
const USAGE =
  "usage: node --env-file-if-exists=.env.local scripts/mail/send-announcement.ts " +
  "<message-file> [--send] [--cap <n>] [--delay-ms <n>]";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    const writable = rl as unknown as { _writeToOutput: (chunk: string) => void; output: NodeJS.WriteStream };
    writable._writeToOutput = (chunk: string) => {
      if (!muted) writable.output.write(chunk);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer.trim());
    });
    muted = true;
  });
}

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

type Options = { file: string; send: boolean; cap: number; delayMs: number };

function parseArgs(argv: string[]): Options | string {
  let file: string | undefined;
  let send = false;
  let cap = DEFAULT_DAILY_CAP;
  let delayMs = DEFAULT_DELAY_MS;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]!;

    if (arg === "--send") {
      send = true;
    } else if (arg === "--cap" || arg === "--delay-ms") {
      const value = Number(argv[i + 1]);
      i += 1;
      if (!Number.isInteger(value) || value < 0) {
        return `${arg} needs a whole number.`;
      }
      if (arg === "--cap") cap = value;
      else delayMs = value;
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

function printMessage(to: string, rendered: { subject: string; body: string }) {
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${rendered.subject}`);
  console.log("");
  for (const line of rendered.body.split("\n")) {
    console.log(`  | ${line}`);
  }
}

async function main(): Promise<number> {
  const options = parseArgs(process.argv.slice(2));

  if (typeof options === "string") {
    console.error(`${options}\n${USAGE}`);
    return 2;
  }

  let message: AnnouncementMessage;
  try {
    message = parseMessageFile(await readFile(options.file, "utf8"));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return 2;
  }

  const problems = problemsWithMessage(message);
  if (problems.length > 0) {
    console.error(`This message cannot be sent:\n${problems.map((p) => `  - ${p}`).join("\n")}\n`);
    if (options.send) {
      return 1;
    }
  }

  // The unsubscribe link is built from SITE_URL, which falls back to localhost
  // when nothing sets it. A list send carrying localhost links unsubscribes
  // nobody, and the page's answer to that is silence.
  const siteIsReal = /^https:\/\//.test(SITE_URL) && !/localhost|127\.0\.0\.1/.test(SITE_URL);
  if (!siteIsReal) {
    console.error(
      `Unsubscribe links would point at ${SITE_URL}. ` +
        "Set NEXT_PUBLIC_SITE_URL to the live https origin before sending.\n",
    );
    if (options.send) {
      return 1;
    }
  }

  if (!isDatabaseConfigured()) {
    console.error(
      "No DATABASE_URL, so there is no list to read and no email_log to dedupe against.",
    );
    return 1;
  }

  const subscribers = await loadSubscribers();
  const alreadySent = await loadAlreadySent();
  const sentToday = await countSentToday();

  const plan = planAnnouncement({
    subscribers,
    alreadySent,
    dailyCap: options.cap,
    sentToday,
  });

  console.log(options.send ? "SEND" : "DRY RUN — nothing will be sent.");
  console.log("");
  console.log(`  Subscribed, with consent:   ${subscribers.length}`);
  console.log(`  Already sent (email_log):   ${plan.alreadySent}`);
  console.log(`  Reserved test domains:      ${plan.reserved.length}`);
  console.log(`  Sent today, any template:   ${sentToday} of ${options.cap}`);
  console.log(`  This run:                   ${plan.send.length}`);
  console.log(`  Left for a later day:       ${plan.deferred}`);
  console.log(`  Unsubscribe links point at: ${SITE_URL}`);
  console.log("");

  if (plan.reserved.length > 0) {
    console.log(`Skipped, reserved domains: ${plan.reserved.join(", ")}\n`);
  }

  const first = plan.send[0];
  console.log("The message, as the first recipient receives it:\n");
  printMessage(
    first?.email ?? "(nobody)",
    renderFor(first ?? { email: "(nobody)", unsubscribeToken: "<token>" }, message),
  );
  console.log("");

  if (!options.send) {
    if (plan.send.length > 0) {
      console.log(`Would send to:\n${plan.send.map((s) => `  ${s.email}`).join("\n")}\n`);
    }
    console.log("Dry run. Add --send to send.");
    return problems.length > 0 || !siteIsReal ? 1 : 0;
  }

  if (plan.send.length === 0) {
    console.log(
      plan.deferred > 0
        ? "Today's allowance is spent. Run again after midnight UTC."
        : "Nobody left to send to.",
    );
    return 0;
  }

  if (!process.stdin.isTTY) {
    console.error("--send needs an interactive terminal to confirm. Nothing sent.");
    return 1;
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    process.env.RESEND_API_KEY = await askHidden("Resend API key (hidden): ");
  }
  process.env.RECEIPT_FROM_EMAIL ||= DEFAULT_FROM;

  // Imported after the environment is set: the provider is chosen on first use.
  const { getMailProvider, sendAndRecord } = await import("../../src/lib/mail/index.ts");

  if (!getMailProvider().delivers) {
    console.error("No key given, so this would only log. Nothing sent.");
    return 1;
  }

  const typed = await ask(
    `Send to ${plan.send.length} ${plan.send.length === 1 ? "address" : "addresses"} ` +
      `from ${process.env.RECEIPT_FROM_EMAIL}? Type ${plan.send.length} to confirm: `,
  );

  if (typed !== String(plan.send.length)) {
    console.log("Not confirmed. Nothing sent.");
    return 1;
  }

  const outcome = await runAnnouncement(plan, message, {
    send: (email) => sendAndRecord("announcement", email),
    recorded: hasSentRow,
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    delayMs: options.delayMs,
    onResult: (email, ok, index) => {
      console.log(`  ${index + 1}/${plan.send.length} ${ok ? "sent  " : "FAILED"} ${email}`);
    },
  });

  console.log("");
  console.log(`Sent ${outcome.sent}, failed ${outcome.failed}.`);
  if (outcome.stoppedBecause) {
    console.error(`Stopped early. ${outcome.stoppedBecause}`);
  }
  if (!outcome.stoppedBecause?.includes("email_log") && (plan.deferred > 0 || outcome.failed > 0)) {
    // Not after a ledger failure: re-running then is exactly the double send
    // the stop was for. Find out why the row was not written first.
    console.log("Run it again tomorrow to continue; nobody already sent is sent again.");
  }

  return outcome.stoppedBecause || outcome.failed > 0 ? 1 : 0;
}

// closePool, always, and then let the process end by itself rather than
// calling process.exit(). AGENTS.md warns that exiting without closePool
// wedges a local PGlite server for the NEXT run; it turns out exiting straight
// AFTER closePool does too — `pool.end()` resolves before the socket has
// finished closing, and PGlite's one-connection server never sees the
// goodbye. Found building this script: every second dry run failed with
// ECONNRESET until `process.exit(code)` became `process.exitCode = code`.
let code = 1;
try {
  code = await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
} finally {
  await closePool();
}
process.exitCode = code;
