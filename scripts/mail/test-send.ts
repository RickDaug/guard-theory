/**
 * Sends one real message through the production mail path, and logs it.
 *
 *   node --env-file-if-exists=.env.local scripts/mail/test-send.ts you@example.com
 *
 * Proves the three things a deploy cannot: the key is accepted, the domain is
 * verified for the From address, and `email_log` records the attempt.
 *
 * The key is asked for with echo off rather than read from `.env.local`,
 * because it is marked Sensitive in Vercel and `vercel env pull` returns it
 * empty — and because a key typed on a command line lands in shell history.
 * RESEND_API_KEY in the environment skips the prompt.
 */
import { createInterface } from "node:readline";

const DEFAULT_FROM = "Guard Theory <hello@guardtheory.net>";

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

const to = process.argv[2]?.trim();
if (!to || !to.includes("@")) {
  console.error("usage: node --env-file-if-exists=.env.local scripts/mail/test-send.ts <to-address>");
  process.exit(2);
}

if (!process.env.RESEND_API_KEY?.trim()) {
  process.env.RESEND_API_KEY = await askHidden("Resend API key (hidden): ");
}
process.env.RECEIPT_FROM_EMAIL ||= DEFAULT_FROM;

// Imported after the environment is set: the provider is chosen on first use.
const { getMailProvider, sendEmail } = await import("../../src/lib/mail/index.ts");
const { isDatabaseConfigured } = await import("../../src/lib/db/client.ts");

const provider = getMailProvider();
if (!provider.delivers) {
  console.error("No key given, so this would only log. Nothing sent.");
  process.exit(1);
}

const sentAt = new Date().toISOString();
const ok = await sendEmail("test", {
  to,
  subject: "Guard Theory mail test",
  body: [
    "This is a test of the Guard Theory mail path.",
    "",
    `From: ${process.env.RECEIPT_FROM_EMAIL}`,
    `Sent: ${sentAt}`,
    "",
    "If it arrived, the key, the domain and the log all work. Nothing to do.",
    "",
    "Guard Theory",
  ].join("\n"),
});

console.log(ok ? `Sent to ${to}.` : `Failed. See the error above.`);
console.log(isDatabaseConfigured() ? "Attempt recorded in email_log." : "No DATABASE_URL, so nothing was recorded.");
process.exit(ok ? 0 : 1);
