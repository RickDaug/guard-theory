import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import {
  acceptedChecksums,
  checkTarget,
  checksumMatches,
  checksumOf,
  describeTarget,
} from "../../scripts/db/guard.mjs";

/**
 * The migration runner's two judgements, without a database.
 *
 * The old runner hashed raw bytes. These reproduce exactly what it would have
 * recorded on a CRLF checkout and on an LF one, and require both to still be
 * recognised as the same migration — and an edit to be recognised as an edit.
 */

const LF = "create table t (\n  id int\n);\n";
const CRLF = LF.replace(/\n/g, "\r\n");
const legacy = (raw: string) => createHash("sha256").update(raw).digest("hex").slice(0, 16);

describe("migration checksums", () => {
  it("records the same checksum whichever line endings are on disk", () => {
    assert.equal(checksumOf(LF), checksumOf(CRLF));
    assert.equal(checksumOf(LF), legacy(LF));
  });

  it("accepts a checksum recorded from an LF checkout, read from either form", () => {
    assert.equal(checksumMatches(legacy(LF), LF), true);
    assert.equal(checksumMatches(legacy(LF), CRLF), true);
  });

  it("accepts a checksum recorded from a CRLF checkout, read from either form", () => {
    assert.notEqual(legacy(CRLF), legacy(LF));
    assert.equal(checksumMatches(legacy(CRLF), LF), true);
    assert.equal(checksumMatches(legacy(CRLF), CRLF), true);
  });

  it("still rejects a genuine change to the content", () => {
    const edited = LF.replace("id int", "id bigint");
    assert.equal(checksumMatches(legacy(LF), edited), false);
    assert.equal(checksumMatches(legacy(CRLF), edited), false);
    assert.equal(checksumMatches(legacy(LF), edited.replace(/\n/g, "\r\n")), false);
    // Whitespace other than the line ending is content.
    assert.equal(checksumMatches(legacy(LF), LF + "\n"), false);
    assert.equal(checksumMatches(legacy(LF), LF.replace("  id", "\tid")), false);
  });

  it("accepts exactly two checksums, not a family of them", () => {
    assert.equal(acceptedChecksums(LF).length, 2);
    assert.deepEqual(acceptedChecksums(LF), acceptedChecksums(CRLF));
  });
});

describe("database target guard", () => {
  const remote = "postgresql://owner:s3cret-pw@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require";

  it("lets loopback hosts through without a flag", () => {
    for (const url of [
      "postgresql://u:p@127.0.0.1:5433/postgres?sslmode=disable",
      "postgresql://u:p@localhost:5432/guardtheory_test?sslmode=disable",
      "postgresql://u:p@[::1]:5432/x",
      "postgresql://u:p@127.0.0.2/x",
    ]) {
      assert.equal(checkTarget(url, []).ok, true, url);
    }
  });

  it("refuses a remote host unless --production is passed", () => {
    assert.equal(checkTarget(remote, []).ok, false);
    assert.equal(checkTarget(remote, ["--status"]).ok, false);
    assert.equal(checkTarget(remote, ["--production"]).ok, true);
  });

  it("is not fooled by a loopback-looking name or userinfo", () => {
    for (const url of [
      "postgresql://u:p@localhost.evil.example/x",
      "postgresql://u:p@127.0.0.1.evil.example/x",
      "postgresql://localhost:p@db.example.com/x",
      "postgresql://u:p@1270.0.0.1/x",
      "not a url",
    ]) {
      assert.equal(checkTarget(url, []).ok, false, url);
    }
  });

  it("never puts credentials in what it prints", () => {
    const result = checkTarget(remote, []);
    const printed = `${result.target.label}\n${result.reason}`;
    assert.match(printed, /ep-cool-name-123\.us-east-2\.aws\.neon\.tech/);
    assert.doesNotMatch(printed, /s3cret-pw/);
    assert.doesNotMatch(printed, /owner/);
    assert.equal(describeTarget(remote).label.includes("neondb"), true);
  });
});
