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
  const parsed = parsePasswordHash(stored);

  if (!parsed) {
    console.error("[guard-theory] PORTAL_PASSWORD_HASH is not a usable scrypt hash");
    return false;
  }

  try {
    const actual = await scryptAsync(password.normalize("NFKC"), parsed.salt, KEY_LENGTH, {
      N: parsed.cost,
      r: parsed.blockSize,
      p: parsed.parallelism,
      maxmem: 256 * 1024 * 1024,
    });

    // parsePasswordHash guarantees the stored key is KEY_LENGTH bytes; the
    // length is checked again because timingSafeEqual throws on a mismatch and
    // because an empty-equals-empty comparison is exactly the bug this replaced.
    return (
      actual.length === KEY_LENGTH &&
      parsed.key.length === KEY_LENGTH &&
      timingSafeEqual(actual, parsed.key)
    );
  } catch (error) {
    console.error(
      "[guard-theory] password verification failed:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

type ParsedHash = {
  cost: number;
  blockSize: number;
  parallelism: number;
  salt: Buffer;
  key: Buffer;
};

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const DIGITS = /^[1-9][0-9]{0,9}$/;

// The weakest parameters that will be verified against, and the strongest. The
// floor stops a hand-edited hash from quietly becoming a fast one; the ceiling
// stops a hostile or mistyped N from pinning a function at 100% CPU per guess.
const MIN_COST = 2 ** 14;
const MAX_COST = 2 ** 20;
const MIN_SALT_BYTES = 16;

/**
 * Reads `scrypt$N$r$p$salt$key`, or returns null.
 *
 * THE BUG THIS EXISTS FOR: the key length used to be taken from the stored
 * hash. A hash whose key segment was empty — `scrypt$32768$8$1$<salt>$`, which
 * is what a truncated paste into Vercel looks like — asked scrypt for zero
 * bytes, compared empty with empty, and let ANY password in. So nothing about
 * the comparison is taken from the input any more: the key must be exactly
 * KEY_LENGTH bytes, the salt at least 16, and N, r and p within bounds. Every
 * other shape is refused before scrypt runs.
 */
export function parsePasswordHash(stored: unknown): ParsedHash | null {
  if (typeof stored !== "string" || stored.length > 512) return null;

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;

  const [, n, r, p, saltB64, keyB64] = parts as [string, string, string, string, string, string];

  // Number("") is 0 and Number(" 8 ") is 8; a regex is what "is a number" means here.
  if (!DIGITS.test(n) || !DIGITS.test(r) || !DIGITS.test(p)) return null;
  if (!BASE64URL.test(saltB64) || !BASE64URL.test(keyB64)) return null;

  const cost = Number(n);
  const blockSize = Number(r);
  const parallelism = Number(p);

  // scrypt requires N to be a power of two; checked here so a bad value is a
  // refusal with a reason rather than an exception from inside OpenSSL.
  if (cost < MIN_COST || cost > MAX_COST || (cost & (cost - 1)) !== 0) return null;
  if (blockSize !== BLOCK_SIZE || parallelism !== PARALLELISM) return null;

  const salt = Buffer.from(saltB64, "base64url");
  const key = Buffer.from(keyB64, "base64url");

  if (salt.length < MIN_SALT_BYTES || key.length !== KEY_LENGTH) return null;

  return { cost, blockSize, parallelism, salt, key };
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

/**
 * The cookie's name, which in production carries the `__Host-` prefix.
 *
 * A browser only accepts a `__Host-` cookie if it is Secure, has Path=/ and has
 * NO Domain attribute — so it can only have been set by this exact host over
 * HTTPS, and a sibling subdomain or a plain-HTTP response cannot plant one over
 * it. Both other conditions are already how the cookie is set. Not used in
 * development because `next dev` on http://localhost sets a non-Secure cookie,
 * which a browser would refuse under this name.
 */
export function sessionCookieName(env: NodeJS.ProcessEnv = process.env): string {
  return env.NODE_ENV === "production" ? `__Host-${SESSION_COOKIE}` : SESSION_COOKIE;
}

/** Absolute lifetime: however busy the session, it ends. */
export const SESSION_TTL_HOURS = 12;

/**
 * Idle lifetime: a session nobody has used for this long is over, even inside
 * the twelve hours. `last_seen` was always written on every request and never
 * read; this is what reads it.
 */
export const SESSION_IDLE_MINUTES = 120;
