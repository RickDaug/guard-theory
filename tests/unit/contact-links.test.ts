import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { withContactLinks } from "../../src/content/policies/contact-links.ts";
import { POLICIES } from "../../src/content/policies/index.ts";

const linked = (paragraph: string) =>
  withContactLinks(paragraph).filter((part) => part.href);

describe("withContactLinks", () => {
  it("links the words that ask the reader to reach us", () => {
    const parts = withContactLinks("If a parcel has not moved, contact us and we will open a trace.");
    assert.deepEqual(parts, [
      { text: "If a parcel has not moved, " },
      { text: "contact us", href: "/contact" },
      { text: " and we will open a trace." },
    ]);
    assert.equal(linked("Ask and we will tell you exactly what we hold.")[0]?.text, "Ask");
    assert.equal(linked("If something does not work, tell us and we will fix it.")[0]?.text, "tell us");
    assert.equal(linked("Contact us with your order number.")[0]?.text, "Contact us");
  });

  it("does not link us writing to the reader", () => {
    assert.deepEqual(linked("We will contact you before dispatch rather than cancelling."), []);
    assert.deepEqual(linked("Ask anyone who trains."), []);
  });

  it("links once per paragraph, and loses no text", () => {
    const paragraph = "Tell us, or write to us, or contact us.";
    assert.equal(linked(paragraph).length, 1);
    assert.equal(withContactLinks(paragraph).map((p) => p.text).join(""), paragraph);
  });

  it("round-trips every policy paragraph unchanged", () => {
    for (const policy of POLICIES) {
      for (const section of policy.sections) {
        for (const paragraph of section.paragraphs) {
          assert.equal(
            withContactLinks(paragraph).map((p) => p.text).join(""),
            paragraph,
          );
        }
      }
    }
  });

  /**
   * The finding itself: these policies told the reader to get in touch and
   * offered no way to. If one of them stops producing a link — because the
   * sentence was reworded into a shape the patterns do not know — this says so.
   */
  it("gives every policy that says to get in touch a link to do it", () => {
    const ASKS = /\b(contact us|tell us|write to us|ask us)\b|\bAsk and we will\b/i;
    let found = 0;
    for (const policy of POLICIES) {
      for (const section of policy.sections) {
        for (const paragraph of section.paragraphs) {
          if (!ASKS.test(paragraph)) continue;
          found += 1;
          assert.equal(
            linked(paragraph).length,
            1,
            `policies/${policy.slug}#${section.id} asks the reader to get in touch and links nothing`,
          );
        }
      }
    }
    assert.ok(found >= 6, `expected the six known paragraphs, found ${found}`);
  });
});
