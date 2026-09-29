import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  metaDescriptionFor,
  metaTitleFor,
  outcomeForLookup,
  tokenFromSearchParams,
  type UnsubscribeOutcome,
} from "../../src/app/unsubscribe/copy.ts";

/**
 * The regression this guards: `/unsubscribe` used to carry a static
 * `title: "Unsubscribed"` regardless of what actually happened — a missing or
 * unrecognised token still claimed success in the tab and to a screen reader,
 * even though the page beneath it explained the address had not been touched.
 * These are unit-testable because `copy.ts` has no JSX and does not touch the
 * database, unlike the page component itself.
 */

const OUTCOMES: UnsubscribeOutcome[] = [
  "unsubscribed",
  "already",
  "confirm",
  "no-token",
  "unknown-token",
  "unavailable",
];

describe("tokenFromSearchParams", () => {
  it("returns an empty string when no token was given", () => {
    assert.equal(tokenFromSearchParams(undefined), "");
  });

  it("trims a single token", () => {
    assert.equal(tokenFromSearchParams("  abc123  "), "abc123");
  });

  it("takes the first value when the param repeats", () => {
    assert.equal(tokenFromSearchParams(["first", "second"]), "first");
  });

  it("treats a blank string the same as no token", () => {
    assert.equal(tokenFromSearchParams("   "), "");
  });
});

describe("metaTitleFor", () => {
  it("only claims Unsubscribed when a row was actually changed", () => {
    assert.equal(metaTitleFor("unsubscribed"), "Unsubscribed");
    assert.equal(metaTitleFor("already"), "Unsubscribed");

    for (const outcome of ["confirm", "no-token", "unknown-token", "unavailable"] as const) {
      assert.notEqual(
        metaTitleFor(outcome),
        "Unsubscribed",
        `${outcome} did not unsubscribe anyone and must not say it did`,
      );
    }
  });

  it("gives every outcome a non-empty title", () => {
    for (const outcome of OUTCOMES) {
      assert.ok(metaTitleFor(outcome).length > 0, `${outcome} has no title`);
    }
  });
});

describe("metaDescriptionFor", () => {
  it("only claims removal when a row was actually changed", () => {
    for (const outcome of ["unsubscribed", "already"] as const) {
      assert.match(metaDescriptionFor(outcome), /removed/i);
    }

    for (const outcome of ["confirm", "no-token", "unknown-token", "unavailable"] as const) {
      assert.doesNotMatch(
        metaDescriptionFor(outcome),
        /has been removed/i,
        `${outcome} did not remove the address and must not claim it did`,
      );
    }
  });

  it("gives every outcome a non-empty description", () => {
    for (const outcome of OUTCOMES) {
      assert.ok(metaDescriptionFor(outcome).length > 0, `${outcome} has no description`);
    }
  });
});

/**
 * The page is reached by GET, and mail scanners GET every link in a message.
 * So no lookup result may ever render as "unsubscribed" unless the row already
 * says so: a good token on a live subscription gets the button, not the deed.
 */
describe("outcomeForLookup", () => {
  it("a live subscription gets the confirm step, never a success", () => {
    assert.equal(outcomeForLookup("subscribed", false), "confirm");
  });

  it("only a row that is already unsubscribed reads as unsubscribed", () => {
    assert.equal(outcomeForLookup("already", false), "already");
    assert.equal(outcomeForLookup("already", true), "already", "a stale failed flag does not undo it");
  });

  it("a write that failed says so instead of offering the button again in silence", () => {
    assert.equal(outcomeForLookup("subscribed", true), "unavailable");
  });

  it("passes the rest through", () => {
    assert.equal(outcomeForLookup("no-token", false), "no-token");
    assert.equal(outcomeForLookup("unknown-token", false), "unknown-token");
    assert.equal(outcomeForLookup("unavailable", false), "unavailable");
  });
});
