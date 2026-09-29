import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  MAX_DAILY_CAP,
  databaseHost,
  isConfirmed,
  parseArgs,
  siteUrlProblem,
} from "../../src/lib/mail/announcement-cli.ts";

/**
 * The gates between a typed command and a list send.
 *
 * `scripts/mail/send-announcement.ts` runs on import and ends at a terminal
 * prompt, so none of it can be driven from here. What it DECIDES was moved
 * into `announcement-cli.ts` so that it can: the script is left holding only
 * the prompts and the printing.
 */

describe("the arguments", () => {
  it("is a dry run unless told otherwise", () => {
    assert.deepEqual(parseArgs(["message.txt"]), {
      file: "message.txt",
      send: false,
      cap: 100,
      delayMs: 250,
    });
  });

  it("--send is the only thing that sends, and its position does not matter", () => {
    for (const argv of [["--send", "m.txt"], ["m.txt", "--send"]]) {
      const options = parseArgs(argv);
      assert.equal(typeof options === "object" && options.send, true);
    }
    for (const near of ["-send", "--Send", "--send=true", "--sned"]) {
      const options = parseArgs(["m.txt", near]);
      assert.notEqual(typeof options === "object" && options.send, true, near);
    }
  });

  it("refuses anything it does not recognise rather than ignoring it", () => {
    assert.match(String(parseArgs(["m.txt", "--dry-run"])), /Unknown option/);
    assert.match(String(parseArgs(["a.txt", "b.txt"])), /not two/);
    assert.match(String(parseArgs(["--send"])), /No message file/);
  });

  it("--cap goes down, never above Resend's quota", () => {
    assert.equal(MAX_DAILY_CAP, 100);
    assert.deepEqual(parseArgs(["m.txt", "--cap", "5"]), { file: "m.txt", send: false, cap: 5, delayMs: 250 });
    assert.equal(typeof parseArgs(["m.txt", "--cap", "100"]), "object");
    assert.equal(typeof parseArgs(["m.txt", "--cap", "0"]), "object", "zero is a way to send nothing");
    assert.match(String(parseArgs(["m.txt", "--cap", "101"])), /cannot be more than 100/);
    assert.match(String(parseArgs(["m.txt", "--cap", "1000"])), /cannot be more than 100/);
  });

  it("a number has to be a number somebody typed", () => {
    for (const bad of ["", " ", "-1", "1.5", "1e2", "0x10", "ten", "Infinity", "99999999999999999999"]) {
      assert.match(String(parseArgs(["m.txt", "--cap", bad])), /whole number/, JSON.stringify(bad));
    }
    assert.match(String(parseArgs(["m.txt", "--cap"])), /whole number/, "missing value");
    assert.match(String(parseArgs(["m.txt", "--delay-ms", "fast"])), /whole number/);
    // --cap swallowing --send as its value must not leave a send behind.
    assert.match(String(parseArgs(["m.txt", "--cap", "--send"])), /whole number/);
  });

  it("--delay-ms has no ceiling; slower is always allowed", () => {
    const options = parseArgs(["m.txt", "--delay-ms", "5000"]);
    assert.equal(typeof options === "object" && options.delayMs, 5000);
  });
});

describe("where the unsubscribe links point", () => {
  it("only the live origin, exactly, may be sent from", () => {
    assert.equal(siteUrlProblem("https://guardtheory.net"), null);
  });

  it("everything else is refused, including what merely looks like it", () => {
    for (const url of [
      "http://localhost:3000",
      "http://guardtheory.net",
      "https://www.guardtheory.net",
      "https://guardtheory.net.example.com",
      "https://guardtheory.net:8443",
      "https://guardtheory.net/shop",
      "https://guardtheory.net/",
      "https://GUARDTHEORY.NET",
      "https://guard-theory-git-feat-mail.vercel.app",
      "https://evil.example/?https://guardtheory.net",
      "guardtheory.net",
      "",
    ]) {
      assert.match(siteUrlProblem(url) ?? "", /exactly https:\/\/guardtheory\.net/, url);
    }
  });
});

describe("what the confirmation prompt shows of the database", () => {
  it("the host, and nothing that is a credential", () => {
    const shown = databaseHost(
      "postgresql://neondb_owner:npg_S3cretPassw0rd@ep-cool-name-123-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require",
    );
    assert.equal(shown, "ep-cool-name-123-pooler.us-east-2.aws.neon.tech");
    assert.doesNotMatch(shown, /npg_|neondb_owner|S3cret/);
  });

  it("a local database reads as local, port included", () => {
    assert.equal(databaseHost("postgres://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable"), "127.0.0.1:5433");
  });

  it("never echoes a URL it could not parse", () => {
    const shown = databaseHost("postgres://user:hunter2@@bad host/db");
    assert.doesNotMatch(shown, /hunter2/);
    assert.equal(databaseHost(undefined), "(none)");
    assert.equal(databaseHost(""), "(none)");
  });
});

describe("the typed count", () => {
  it("is confirmed by the number, and only the number", () => {
    assert.equal(isConfirmed("12", 12), true);
    assert.equal(isConfirmed(" 12 ", 12), true);
  });

  it("anything else sends nothing", () => {
    for (const typed of ["", "y", "yes", "11", "13", "120", "1", "12.0", "1e1", "0x0c", "012", "twelve", "12 addresses"]) {
      assert.equal(isConfirmed(typed, 12), false, JSON.stringify(typed));
    }
  });

  it("nothing confirms a send to nobody", () => {
    assert.equal(isConfirmed("0", 0), false);
    assert.equal(isConfirmed("", 0), false);
  });
});
