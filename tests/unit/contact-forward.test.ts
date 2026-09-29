import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { after, describe, it, mock } from "node:test";

import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../src/content/editorial-voice.ts";
import { resendPayload } from "../../src/lib/mail/index.ts";
import { contactForward } from "../../src/lib/mail/templates.ts";
import {
  forwardContactMessage,
  readContactRecipient,
  type SavedContactMessage,
} from "../../src/lib/contact/forward.ts";
import { getContactStore } from "../../src/lib/contact/store.ts";
import {
  listContactMessages,
  setAnswered,
} from "../../src/lib/contact/inbox.ts";
import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * "A person reads every message" — owner-decisions §13 d.
 *
 * Before this, a contact message was a row nobody was told about. Now each one
 * is emailed to the owner with the sender as Reply-To, and the portal lists
 * them with an answered flag. What a test can check is that the message leaves
 * the building, that the submission never depends on it, and that the message
 * text never lands in a log. Whether somebody then reads it is still the
 * owner's promise.
 */

const SECRET = "the-message-body-must-not-reach-a-log-7f3a";

const MESSAGE: SavedContactMessage = {
  id: "c0ffee00-0000-4000-8000-000000000001",
  name: "Pat Rivera",
  email: "pat@example.com",
  topic: "product",
  message: `Does the long sleeve run small? ${SECRET}`,
  receivedAt: "2026-09-29T10:15:00.000Z",
};

describe("who the contact form forwards to", () => {
  it("prefers OWNER_ALERT_EMAIL", () => {
    assert.equal(
      readContactRecipient({ OWNER_ALERT_EMAIL: " owner@example.com ", REPLY_TO_EMAIL: "reply@example.com" }),
      "owner@example.com",
    );
  });

  it("falls back to REPLY_TO_EMAIL", () => {
    assert.equal(readContactRecipient({ REPLY_TO_EMAIL: "reply@example.com" }), "reply@example.com");
  });

  it("skips a malformed value rather than mailing it", () => {
    assert.equal(
      readContactRecipient({ OWNER_ALERT_EMAIL: "not an address", REPLY_TO_EMAIL: "reply@example.com" }),
      "reply@example.com",
    );
  });

  it("is nobody when neither is set", () => {
    assert.equal(readContactRecipient({}), null);
  });
});

describe("the forwarded message", () => {
  const email = contactForward("owner@example.com", MESSAGE);

  it("goes to the owner and replies go to the sender", () => {
    assert.equal(email.to, "owner@example.com");
    assert.equal(email.replyTo, "pat@example.com");
    const payload = resendPayload("shop@guardtheory.net", "reply@example.com", email);
    assert.equal(payload.reply_to, "pat@example.com", "the sender, not the site's reply-to, must win");
  });

  it("names the site in the subject and carries the whole message", () => {
    assert.match(email.subject, /Guard Theory/);
    assert.ok(email.body.includes(MESSAGE.message));
    assert.ok(email.body.includes("pat@example.com"));
    assert.ok(email.body.includes("Pat Rivera"));
  });

  it("keeps the message text out of the subject", () => {
    assert.ok(!email.subject.includes(SECRET));
  });

  it("drops a Reply-To that is not a single address", () => {
    const odd = contactForward("owner@example.com", { ...MESSAGE, email: "a@b.co\r\nBcc: x@y.z" });
    assert.equal(odd.replyTo, undefined);
  });

  it("keeps the site's voice in the envelope", () => {
    const envelope = contactForward("owner@example.com", { ...MESSAGE, message: "Hello." });
    const text = `${envelope.subject}\n${envelope.body}`;
    assert.deepEqual(findBannedConstructions(text, BANNED_CONSTRUCTIONS), []);
    assert.deepEqual(findBannedConstructions(text, BANNED_IN_EMAIL), []);
  });
});

describe("forwarding never fails the submission", () => {
  const record = async () => {};

  it("sends, and says so", async () => {
    const send = mock.fn(async (_template: string, _email: unknown) => true);
    const delivery = await forwardContactMessage(MESSAGE, {
      to: "owner@example.com",
      send,
      delivers: () => true,
      record,
    });
    assert.equal(delivery, "sent");
    assert.equal(send.mock.callCount(), 1);
    assert.equal(send.mock.calls[0]?.arguments[0], "contact-forward");
  });

  it("with nowhere to send, records not-delivered and sends nothing", async () => {
    const send = mock.fn(async () => true);
    const recorded: string[] = [];
    const delivery = await forwardContactMessage(MESSAGE, {
      to: null,
      send,
      delivers: () => true,
      record: async (_id, d) => void recorded.push(d),
    });
    assert.equal(delivery, "not-delivered");
    assert.equal(send.mock.callCount(), 0);
    assert.deepEqual(recorded, ["not-delivered"]);
  });

  it("with no mail provider connected, records not-delivered", async () => {
    const delivery = await forwardContactMessage(MESSAGE, {
      to: "owner@example.com",
      send: async () => true,
      delivers: () => false,
      record,
    });
    assert.equal(delivery, "not-delivered");
  });

  it("a failed or throwing send is 'failed', not an exception", async () => {
    assert.equal(
      await forwardContactMessage(MESSAGE, { to: "o@example.com", send: async () => false, delivers: () => true, record }),
      "failed",
    );
    const errors = mock.method(console, "error", () => {});
    try {
      assert.equal(
        await forwardContactMessage(MESSAGE, {
          to: "o@example.com",
          send: async () => {
            throw new Error("boom");
          },
          delivers: () => true,
          record: async () => {
            throw new Error("db down");
          },
        }),
        "failed",
      );
    } finally {
      errors.mock.restore();
    }
  });

  it("never writes the message text to a log", async () => {
    const lines: string[] = [];
    const capture = (...args: unknown[]) => void lines.push(args.map(String).join(" "));
    const warn = mock.method(console, "warn", capture);
    const error = mock.method(console, "error", capture);
    const log = mock.method(console, "log", capture);
    try {
      await forwardContactMessage(MESSAGE, { to: null, record });
      await forwardContactMessage(MESSAGE, {
        to: "o@example.com",
        send: async () => {
          throw new Error("boom");
        },
        record,
      });
    } finally {
      warn.mock.restore();
      error.mock.restore();
      log.mock.restore();
    }
    assert.ok(lines.length > 0, "the skipped forward should say so");
    for (const line of lines) {
      assert.ok(!line.includes(SECRET), `a log line carried the message: ${line}`);
      assert.ok(!line.includes("pat@example.com"), `a log line carried the sender: ${line}`);
    }
  });

  it("the action forwards only after the message is saved, and after the response", () => {
    const source = readFileSync("src/app/contact/actions.ts", "utf8");
    const saved = source.indexOf(".save(");
    const forwarded = source.indexOf("forwardContactMessage(");
    assert.ok(saved > 0 && forwarded > saved, "forward after the row exists, never instead of it");
    assert.match(source, /after\(/, "the send runs after the response, so a slow provider cannot hold the form");
  });
});

const configured = isDatabaseConfigured();
const tag = randomUUID();

describe("the contact inbox, in Postgres", { skip: !configured && "no DATABASE_URL" }, () => {
  after(async () => {
    if (!configured) return;
    await query("DELETE FROM contact_message WHERE email LIKE $1", [`inbox-%-${tag}@example.com`]);
    await closePool();
  });

  it("records the delivery, lists newest first, and marks answered", async () => {
    const email = `inbox-a-${tag}@example.com`;
    const older = await getContactStore().save({
      name: "Older",
      email,
      topic: "other",
      message: "first",
      receivedAt: "2026-09-01T00:00:00.000Z",
    });
    const newer = await getContactStore().save({
      name: "Newer",
      email,
      topic: "other",
      message: "second",
      receivedAt: "2026-09-02T00:00:00.000Z",
    });
    assert.ok(older && newer);

    await forwardContactMessage(
      { id: newer, name: "Newer", email, topic: "other", message: "second", receivedAt: "2026-09-02T00:00:00.000Z" },
      { to: null },
    );

    const mine = (await listContactMessages()).filter((row) => row.email === email);
    assert.deepEqual(mine.map((row) => row.id), [newer, older]);
    assert.equal(mine[0]?.forward_delivery, "not-delivered");
    assert.equal(mine[0]?.answered_at, null);

    assert.equal(await setAnswered(newer, true), true);
    const again = (await listContactMessages()).find((row) => row.id === newer);
    assert.notEqual(again?.answered_at, null);

    assert.equal(await setAnswered(newer, false), true);
    const undone = (await listContactMessages()).find((row) => row.id === newer);
    assert.equal(undone?.answered_at, null);
  });
});
