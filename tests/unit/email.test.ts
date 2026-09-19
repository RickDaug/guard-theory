import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  BANNED_CONSTRUCTIONS,
  BANNED_IN_EMAIL,
  findBannedConstructions,
} from "../../src/content/editorial-voice.ts";
import { announcement } from "../../src/lib/mail/templates.ts";

/**
 * List mail is copy, and it is held to the copy rules.
 *
 * The banned-constructions list used to live inside content.test.ts and could
 * therefore only cover the Journal and the technique library. Email is where
 * "we're thrilled" appears: it is written last, reviewed least, and read by
 * everyone who ever gave us an address.
 *
 * Only the announcement is covered, because only the announcement exists. The
 * three order templates and their tests stay on `feat/commerce`.
 */

const SUBJECT = "The First Edition is open";
const BODY = "Theory 01 is available now. The list gets it first, and this is that message.";

const EMAIL = announcement("someone@example.com", "the-token", SUBJECT, BODY);

describe("list mail keeps the site's voice", () => {
  it("no banned editorial construction", () => {
    const found = findBannedConstructions(
      `${EMAIL.subject}\n${EMAIL.body}`,
      BANNED_CONSTRUCTIONS,
    );
    assert.deepEqual(found, [], `the announcement uses: ${found.join(", ")}`);
  });

  it("no exclamation points and no shop filler", () => {
    const found = findBannedConstructions(`${EMAIL.subject}\n${EMAIL.body}`, BANNED_IN_EMAIL);
    assert.deepEqual(found, [], `the announcement uses: ${found.join(", ")}`);
  });

  it("addressed to someone, with a subject", () => {
    assert.match(EMAIL.to, /@/);
    assert.ok(EMAIL.subject.length > 0, "a message with no subject reads as spam");
    assert.ok(EMAIL.body.trim().length > 0);
  });

  it("carries a working unsubscribe link", () => {
    // Not a setting and not optional: the privacy policy promises a one-click
    // unsubscribe on every message, and /unsubscribe honours exactly this token.
    assert.match(EMAIL.body, /\/unsubscribe\?t=the-token/);
  });

  it("uses the parameter the unsubscribe page actually reads", () => {
    // `?token=` looks right, is wrong, and fails silently: the page answers a
    // token it does not recognise with the "use the link in the email" copy,
    // so a whole send would look delivered and unsubscribe nobody. Caught by
    // hand on 2026-09-17 against the live preview; caught here from now on.
    assert.doesNotMatch(EMAIL.body, /\/unsubscribe\?token=/);
  });

  it("says why the reader is receiving it", () => {
    // A message with no stated provenance is indistinguishable from a list
    // someone bought, which is the thing the privacy policy says we do not do.
    assert.match(EMAIL.body, /because you asked to be/);
  });

  it("passes the body through without editorialising it", () => {
    assert.ok(
      EMAIL.body.startsWith(BODY),
      "the template owns the envelope, not the message",
    );
  });
});
