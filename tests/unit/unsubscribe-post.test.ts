import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { handleOneClickGet, handleOneClickPost } from "../../src/lib/waitlist/one-click.ts";
import { announcement } from "../../src/lib/mail/templates.ts";
import { resendPayload } from "../../src/lib/mail/index.ts";
import type { UnsubscribeResult } from "../../src/lib/waitlist/postgres-store.ts";

/**
 * Unsubscribing happens on POST, never on GET (security audit 2026-09-29,
 * S3-3). Mail scanners fetch every link in a message; a GET that wrote took
 * people off the list without their knowing. One click survives where RFC 8058
 * puts it: the List-Unsubscribe-Post header, which makes the mail client POST.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");

function recorder(result: UnsubscribeResult = "unsubscribed") {
  const calls: string[] = [];
  return {
    calls,
    fn: async (token: string) => {
      calls.push(token);
      return result;
    },
  };
}

describe("the /unsubscribe page does not write on GET", () => {
  it("the page module does not import the write", () => {
    const page = readFileSync(path.join(ROOT, "src/app/unsubscribe/page.tsx"), "utf8");
    assert.doesNotMatch(page, /unsubscribeByToken/, "page.tsx renders on GET and must not unsubscribe");
  });

  it("the write is behind the confirm form's server action", () => {
    const actions = readFileSync(path.join(ROOT, "src/app/unsubscribe/actions.ts"), "utf8");
    assert.match(actions, /^"use server";/);
    assert.match(actions, /unsubscribeByToken\(token\)/);
  });
});

describe("RFC 8058 one-click endpoint", () => {
  const url = "https://guardtheory.net/api/unsubscribe?t=tok_abc123";

  it("unsubscribes on POST", async () => {
    const store = recorder();
    const response = await handleOneClickPost(
      new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "List-Unsubscribe=One-Click",
      }),
      store.fn,
    );
    assert.equal(response.status, 200);
    assert.deepEqual(store.calls, ["tok_abc123"]);
  });

  it("reports an unknown token as unknown, and an outage as an outage", async () => {
    const unknown = await handleOneClickPost(new Request(url, { method: "POST" }), recorder("unknown-token").fn);
    assert.equal(unknown.status, 404);
    const down = await handleOneClickPost(new Request(url, { method: "POST" }), recorder("unavailable").fn);
    assert.equal(down.status, 503);
  });

  it("refuses a POST with no token without touching the store", async () => {
    const store = recorder();
    const response = await handleOneClickPost(
      new Request("https://guardtheory.net/api/unsubscribe", { method: "POST" }),
      store.fn,
    );
    assert.equal(response.status, 400);
    assert.deepEqual(store.calls, []);
  });

  it("sends a GET to the confirm page and writes nothing", () => {
    const response = handleOneClickGet(new Request(url));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("Location"), "https://guardtheory.net/unsubscribe?t=tok_abc123");
  });
});

describe("list mail carries the one-click headers", () => {
  const email = announcement("reader@example.com", "tok_abc123", "Subject", "Body");

  it("List-Unsubscribe points at the POST endpoint, with List-Unsubscribe-Post", () => {
    assert.match(email.headers?.["List-Unsubscribe"] ?? "", /^<https?:\/\/[^>]+\/api\/unsubscribe\?t=tok_abc123>$/);
    assert.equal(email.headers?.["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  });

  it("the body link still goes to the confirm page", () => {
    assert.match(email.body, /\/unsubscribe\?t=tok_abc123/);
  });

  it("the headers reach Resend", () => {
    const payload = resendPayload("hello@guardtheory.net", null, email) as { headers?: Record<string, string> };
    assert.equal(payload.headers?.["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
  });
});
