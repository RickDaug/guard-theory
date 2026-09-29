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
 *                   Resend's free-tier quota, and never more than that.
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
 * Each address is claimed in `email_log` before its message is sent, under a
 * unique index (migration 0005). Two runs at once, or a run killed halfway,
 * therefore cannot send a second copy: the second claim is a conflict. Do not
 * run two at once anyway — it is safe, and it is confusing.
 *
 * WHAT IT WILL NOT DO FOR YOU
 *
 * An address whose send timed out, or whose run died mid-send, is left as
 * `unknown` or `pending` and is never retried: the message may have arrived.
 * Every run lists those addresses. Look each one up in the Resend dashboard
 * (resend.com/emails, search by recipient) and settle it by hand with the
 * statement the script prints.
 *
 * The key is asked for with echo off, for the reasons in `test-send.ts`.
 * RESEND_API_KEY in the environment skips the prompt. A dry run never asks.
 */
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";

import {
  claimRecipient,
  countSentToday,
  loadAlreadySent,
  loadSubscribers,
  loadUnresolved,
  parseMessageFile,
  planAnnouncement,
  problemsWithMessage,
  renderFor,
  runAnnouncement,
  settleClaim,
  type AnnouncementMessage,
  type ResultKind,
} from "../../src/lib/mail/announcement.ts";
import {
  databaseHost,
  isConfirmed,
  parseArgs,
  siteUrlProblem,
} from "../../src/lib/mail/announcement-cli.ts";
import { closePool, databaseUrl, isDatabaseConfigured } from "../../src/lib/db/client.ts";
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

const LABEL: Record<ResultKind, string> = {
  sent: "sent        ",
  failed: "FAILED      ",
  unknown: "UNKNOWN     ",
  unsubscribed: "unsubscribed",
  claimed: "claimed     ",
};

/** The addresses only a person can settle, and how to settle each. */
function printNeedsCheck(addresses: readonly string[]) {
  console.error(
    "\nCHECK BY HAND — these may or may not have received it, and will never be retried:\n",
  );
  for (const address of addresses) {
    console.error(`  ${address}`);
  }
  console.error(
    "\nLook each one up at resend.com/emails (search by recipient), then say which it was:\n\n" +
      "  -- it arrived:\n" +
      "  update email_log set status = 'sent' where template = 'announcement'\n" +
      "    and status in ('pending', 'unknown') and lower(to_email) = '<address>';\n\n" +
      "  -- it did not, and the next run may send it:\n" +
      "  update email_log set status = 'failed' where template = 'announcement'\n" +
      "    and status in ('pending', 'unknown') and lower(to_email) = '<address>';\n",
  );
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
  // nobody, and the page's answer to that is silence. A dry run carries on, so
  // the message can be read anywhere; a send does not.
  const siteProblem = siteUrlProblem(SITE_URL);
  if (siteProblem) {
    console.error(`${siteProblem}\n`);
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
  const unresolved = await loadUnresolved();

  const plan = planAnnouncement({
    subscribers,
    alreadySent,
    dailyCap: options.cap,
    sentToday,
  });

  console.log(options.send ? "SEND" : "DRY RUN — nothing will be sent.");
  console.log("");
  console.log(`  Subscribed, with consent:   ${subscribers.length}`);
  console.log(`  Sent, pending or unknown:   ${plan.alreadySent}`);
  console.log(`  Reserved test domains:      ${plan.reserved.length}`);
  console.log(`  Sent today, any template:   ${sentToday} of ${options.cap}`);
  console.log(`  This run:                   ${plan.send.length}`);
  console.log(`  Left for a later day:       ${plan.deferred}`);
  console.log(`  Unresolved, never retried:  ${unresolved.length}`);
  console.log(`  Database host:              ${databaseHost(databaseUrl())}`);
  console.log(`  Unsubscribe links point at: ${SITE_URL}`);
  console.log("");

  if (unresolved.length > 0) {
    printNeedsCheck(
      unresolved.map((row) => `${row.email}  (${row.status} since ${row.since.toISOString()})`),
    );
  }

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
    return problems.length > 0 || siteProblem ? 1 : 0;
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
  const { getMailProvider } = await import("../../src/lib/mail/index.ts");
  const provider = getMailProvider();

  if (!provider.delivers) {
    console.error("No key given, so this would only log. Nothing sent.");
    return 1;
  }

  // Host only, never the URL. It is here so that a send against a preview
  // branch, or a local database, is something you read before typing the number.
  console.log(`  Database:  ${databaseHost(databaseUrl())}`);
  console.log(`  Links to:  ${new URL(SITE_URL).origin}`);
  console.log(`  From:      ${process.env.RECEIPT_FROM_EMAIL}\n`);

  const typed = await ask(
    `Send to ${plan.send.length} ${plan.send.length === 1 ? "address" : "addresses"}? ` +
      `Type ${plan.send.length} to confirm: `,
  );

  if (!isConfirmed(typed, plan.send.length)) {
    console.log("Not confirmed. Nothing sent.");
    return 1;
  }

  const outcome = await runAnnouncement(plan, message, {
    claim: claimRecipient,
    deliver: (email) => provider.send(email),
    settle: settleClaim,
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    delayMs: options.delayMs,
    onResult: (email, kind, index) => {
      console.log(`  ${index + 1}/${plan.send.length} ${LABEL[kind]} ${email}`);
    },
  });

  console.log("");
  console.log(
    `Sent ${outcome.sent}, failed ${outcome.failed}, skipped ${outcome.skipped}, ` +
      `unknown ${outcome.needsCheck.length}.`,
  );
  if (outcome.stoppedBecause) {
    console.error(`Stopped early. ${outcome.stoppedBecause}`);
  }
  if (outcome.needsCheck.length > 0) {
    printNeedsCheck(outcome.needsCheck);
  }

  const ledgerBroken = outcome.stoppedBecause?.includes("email_log") ?? false;
  if (!ledgerBroken && (plan.deferred > 0 || outcome.failed > 0 || outcome.stoppedBecause)) {
    // Not after a ledger failure: find out why the row could not be written
    // before anything else is sent.
    console.log(
      "Run it again tomorrow to continue. Nobody sent, pending or unknown is sent to again; " +
        "only a refused address is retried.",
    );
  }

  return outcome.stoppedBecause || outcome.failed > 0 || outcome.needsCheck.length > 0 ? 1 : 0;
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
