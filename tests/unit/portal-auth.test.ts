import assert from "node:assert/strict";
import { randomBytes, scryptSync } from "node:crypto";
import { before, describe, it } from "node:test";

import { hashPassword, parsePasswordHash, verifyPassword } from "../../src/lib/portal/auth.ts";

/**
 * The portal has one password. These are every way its stored hash can be
 * wrong, and each one has to mean "nobody gets in" — not "everybody does".
 *
 * The first case is the one that was live: a hash with an empty key segment
 * verified ANY password, because the key length was read from the hash, scrypt
 * was asked for zero bytes, and empty equals empty.
 */

const PASSWORD = "correct horse battery staple";
let good = "";

function withParts(edit: (parts: string[]) => void): string {
  const parts = good.split("$");
  edit(parts);
  return parts.join("$");
}

/** A self-consistent hash with arbitrary parameters, so only the bounds refuse it. */
function forge(n: number, r: number, p: number, saltBytes: number, keyBytes: number): string {
  const salt = randomBytes(saltBytes);
  const key =
    keyBytes === 0
      ? Buffer.alloc(0)
      : scryptSync(PASSWORD.normalize("NFKC"), salt, keyBytes, { N: n, r, p, maxmem: 2 ** 28 });
  return ["scrypt", n, r, p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

describe("portal password verification", () => {
  before(async () => {
    good = await hashPassword(PASSWORD);
  });

  it("accepts the right password and refuses a wrong one", async () => {
    assert.equal(await verifyPassword(PASSWORD, good), true);
    assert.equal(await verifyPassword(`${PASSWORD} `, good), false);
    assert.equal(await verifyPassword("", good), false);
  });

  it("refuses every password when the key segment is empty (the truncated paste)", async () => {
    const truncated = withParts((parts) => {
      parts[5] = "";
    });
    assert.match(truncated, /\$$/);
    assert.equal(parsePasswordHash(truncated), null);
    for (const guess of [PASSWORD, "", "anything at all"]) {
      assert.equal(await verifyPassword(guess, truncated), false, JSON.stringify(guess));
    }
  });

  it("refuses every malformed shape, with the right password", async () => {
    const shapes: Record<string, string> = {
      "empty string": "",
      "whitespace": "   ",
      "not a hash": "hunter2",
      "wrong scheme": good.replace(/^scrypt/, "bcrypt"),
      "five parts": good.split("$").slice(0, 5).join("$"),
      "seven parts": `${good}$extra`,
      "empty salt": withParts((p) => void (p[4] = "")),
      "short salt": withParts((p) => void (p[4] = Buffer.alloc(8, 1).toString("base64url"))),
      "key cut in half": withParts((p) => void (p[5] = p[5]!.slice(0, p[5]!.length / 2))),
      "key one byte long": withParts((p) => void (p[5] = "AA")),
      "key too long": withParts((p) => void (p[5] = `${p[5]}AAAA`)),
      "key not base64url": withParts((p) => void (p[5] = `${p[5]!.slice(0, -1)}!`)),
      "salt not base64url": withParts((p) => void (p[4] = "****************")),
      "padding in key": withParts((p) => void (p[5] = `${p[5]}==`)),
      "N empty": withParts((p) => void (p[1] = "")),
      "N zero": withParts((p) => void (p[1] = "0")),
      "N negative": withParts((p) => void (p[1] = "-32768")),
      "N float": withParts((p) => void (p[1] = "32768.5")),
      "N exponent": withParts((p) => void (p[1] = "1e5")),
      "N hex": withParts((p) => void (p[1] = "0x8000")),
      "N padded": withParts((p) => void (p[1] = " 32768")),
      "N not a power of two": withParts((p) => void (p[1] = "32769")),
      "N enormous": withParts((p) => void (p[1] = "4294967296")),
      "r empty": withParts((p) => void (p[2] = "")),
      "r zero": withParts((p) => void (p[2] = "0")),
      "p empty": withParts((p) => void (p[3] = "")),
      "p NaN": withParts((p) => void (p[3] = "NaN")),
      "trailing newline": `${good}\n`,
      "wrapped in quotes": `"${good}"`,
      "absurdly long": `${good}${"A".repeat(600)}`,
    };

    for (const [name, hash] of Object.entries(shapes)) {
      assert.equal(parsePasswordHash(hash), null, `${name} parsed`);
      assert.equal(await verifyPassword(PASSWORD, hash), false, `${name} verified`);
    }
  });

  it("refuses non-strings without throwing", async () => {
    for (const value of [undefined, null, 0, {}, []]) {
      assert.equal(parsePasswordHash(value), null);
      assert.equal(await verifyPassword(PASSWORD, value as unknown as string), false);
    }
  });

  it("refuses a correct hash made with parameters outside the bounds", async () => {
    // Each of these verifies under plain scrypt. They are refused for what they
    // are: too cheap, or too short to be a key at all.
    const weak = forge(2 ** 10, 8, 1, 16, 64);
    const shortKey = forge(2 ** 15, 8, 1, 16, 8);
    const emptyKey = forge(2 ** 15, 8, 1, 16, 0);
    const oddBlock = forge(2 ** 15, 4, 1, 16, 64);
    for (const hash of [weak, shortKey, emptyKey, oddBlock]) {
      assert.equal(await verifyPassword(PASSWORD, hash), false, hash.slice(0, 24));
    }
    // And the control: the same forger inside the bounds is accepted, so the
    // refusals above are the bounds working and not the forger being wrong.
    assert.equal(await verifyPassword(PASSWORD, forge(2 ** 15, 8, 1, 16, 64)), true);
  });
});
