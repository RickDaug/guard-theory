#!/usr/bin/env node
/**
 * Turns a password into the value PORTAL_PASSWORD_HASH holds.
 *
 * The plaintext never leaves this machine and is never written anywhere. Run
 * it, copy the line it prints into Vercel, and forget the command.
 *
 *   node scripts/hash-password.mjs
 *
 * It reads from stdin rather than taking an argument, so the password does not
 * end up in your shell history or in the process list where anyone on the
 * machine could read it with `ps`.
 */

import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { hashPassword } = await import(
  pathToFileURL(path.join(ROOT, "src/lib/portal/auth.ts")).href
);

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });

// Nothing echoes. A password on screen is a password on a screenshot.
const original = rl._writeToOutput?.bind(rl);
rl._writeToOutput = function (text) {
  if (rl.stdoutMuted) {
    rl.output.write("");
  } else if (original) {
    original(text);
  }
};

const password = await new Promise((resolve) => {
  process.stdout.write("Password (not echoed): ");
  rl.stdoutMuted = true;
  rl.question("", (answer) => {
    rl.stdoutMuted = false;
    process.stdout.write("\n");
    rl.close();
    resolve(answer);
  });
});

if (password.length < 12) {
  console.error(
    "\n  Refusing: use at least 12 characters. This is the only thing between a\n" +
      "  stranger and the order book, and it is typed once a day at most.",
  );
  process.exit(1);
}

const hash = await hashPassword(password);

console.log("\n  Set this in Vercel, Production and Preview:\n");
console.log(`PORTAL_PASSWORD_HASH=${hash}\n`);
console.log("  The password itself is not stored anywhere. Do not lose it.");
