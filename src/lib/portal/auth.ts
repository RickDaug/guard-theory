import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * One password, one admin, no library.
 *
 * `docs/technical-architecture.md` asks for no dependency that solves a problem
 * the site does not have. Auth.js and Better Auth solve OAuth providers,
 * account linking, multi-user roles, password reset and email verification.
 * There is one admin, one password, no reset flow and no third party, so nearly
 * all of that surface would be unused — and unused auth surface is still
 * attack surface.
 *
 * What is genuinely hard about passwords is the hashing, and Node's standard
 * library already has the right primitive.
 *
 * WHY SCRYPT AND NOT BCRYPT OR ARGON2
 *
 * Both of those are native modules that have to compile. `scrypt` is in
 * `node:crypto`, is memory-hard, and is a NIST-approved KDF. For one password
 * on one account it is the right tool, and it adds nothing to install.
 */

/**
 * `promisify(scrypt)` drops the overload that takes options, so the cost
 * parameters would be silently ignored and every hash would use Node's
 * defaults. Wrapped by hand instead, with the options kept.
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derived) => {
      if (error) {
        reject(error);
      } else {
        resolve(derived);
      }
    });
  });
}

// N=2^15. Roughly 100ms and 32MB per verification on a warm serverless
// instance — slow enough to make guessing expensive, fast enough that signing
// in does not feel broken. The parameters are stored in the hash string, so
// raising them later does not invalidate existing hashes.
const COST = 2 ** 15;
const BLOCK_SIZE = 8;
const PARALLELISM = 1;
const KEY_LENGTH = 64;

export type PasswordHash = string;

/** `scrypt$N$r$p$salt$key`, all base64url. Self-describing, so it can evolve. */
export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELISM,
    maxmem: 256 * 1024 * 1024,
  });

  return [
    "scrypt",
    COST,
    BLOCK_SIZE,
    PARALLELISM,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

/**
 * Constant-time verification.
 *
 * Returns false rather than throwing on a malformed hash: a misconfigured
 * PORTAL_PASSWORD_HASH must fail closed, not 500 with a stack trace that
 * describes the format.
 */
export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const parts = stored.split("$");

  if (parts.length !== 6 || parts[0] !== "scrypt") {
    console.error("[guard-theory] PORTAL_PASSWORD_HASH is not a recognised scrypt hash");
    return false;
  }

  const [, n, r, p, saltB64, keyB64] = parts;
  const cost = Number(n);
  const blockSize = Number(r);
  const parallelism = Number(p);

  if (!Number.isInteger(cost) || !Number.isInteger(blockSize) || !Number.isInteger(parallelism)) {
    console.error("[guard-theory] PORTAL_PASSWORD_HASH has unreadable parameters");
    return false;
  }

  try {
    const salt = Buffer.from(saltB64!, "base64url");
    const expected = Buffer.from(keyB64!, "base64url");

    const actual = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N: cost,
      r: blockSize,
      p: parallelism,
      maxmem: 256 * 1024 * 1024,
    });

    // Lengths are equal by construction above, but timingSafeEqual throws on a
    // mismatch rather than returning false, so it is still checked.
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch (error) {
    console.error(
      "[guard-theory] password verification failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

/** The opaque value the cookie carries. 256 bits, never derived from anything. */
export function newSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * What goes in the database.
 *
 * A plain SHA-256 rather than a slow KDF, deliberately: the token is already
 * 256 bits of entropy from a CSPRNG, so there is nothing to brute-force and a
 * slow hash would only add latency to every request. The point of hashing here
 * is that a leaked backup cannot be replayed as a session.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const SESSION_COOKIE = "gt_crew";
export const SESSION_TTL_HOURS = 12;
