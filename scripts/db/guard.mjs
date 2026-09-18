/**
 * The two decisions the database scripts must not get wrong, kept free of I/O
 * so they can be unit-tested: "is this file the one that was applied?" and
 * "is this the database you meant?".
 */

import { createHash } from "node:crypto";

/* -------------------------------------------------------------------------- */
/* Checksums                                                                   */
/* -------------------------------------------------------------------------- */

function sha(text) {
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

export function normaliseLf(sql) {
  return sql.replace(/\r\n/g, "\n");
}

/**
 * The checksum recorded for a NEW application: always of the LF form, so the
 * same migration gets the same checksum on every machine whatever
 * `core.autocrlf` did to the working copy.
 */
export function checksumOf(sql) {
  return sha(normaliseLf(sql));
}

/**
 * Checksums an ALREADY-APPLIED migration may legitimately carry.
 *
 * The runner used to hash the raw bytes on disk. Git stores every migration as
 * LF, but a Windows checkout with `core.autocrlf=true` wrote them out as CRLF,
 * and production was migrated by hand from such a machine. So a recorded
 * checksum may be the hash of either form of the very same file, and which one
 * depends on the machine that ran it, not on the migration. Both are accepted;
 * anything else is a genuine edit and is still refused.
 */
export function acceptedChecksums(sql) {
  const lf = normaliseLf(sql);
  return [sha(lf), sha(lf.replace(/\n/g, "\r\n"))];
}

export function checksumMatches(recorded, sql) {
  return acceptedChecksums(sql).includes(recorded);
}

/* -------------------------------------------------------------------------- */
/* Target guard                                                                */
/* -------------------------------------------------------------------------- */

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Host, port and database name — never the user or the password. */
export function describeTarget(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { host: null, label: "an unparseable connection string", loopback: false };
  }
  const host = parsed.hostname.toLowerCase();
  const port = parsed.port ? `:${parsed.port}` : "";
  const database = parsed.pathname.replace(/^\//, "") || "(default)";
  return {
    host,
    label: `${host}${port} / ${database}`,
    loopback: LOOPBACK.has(host) || /^127\.\d+\.\d+\.\d+$/.test(host),
  };
}

/**
 * `.env.local` points at production, and an exported DATABASE_URL does not
 * override DATABASE_URL_UNPOOLED — so a bare `npm run db:migrate` meant for a
 * local database has reached Neon before. A remote host therefore has to be
 * asked for by name.
 *
 * Returns { ok, target, reason }. Does not print and does not exit; the caller
 * does both, so this stays testable.
 */
export function checkTarget(url, argv) {
  const target = describeTarget(url);
  const production = argv.includes("--production");
  if (target.loopback) return { ok: true, target, reason: null };
  if (production) return { ok: true, target, reason: null };
  return {
    ok: false,
    target,
    reason:
      `refusing to touch ${target.label}: it is not a local database.\n` +
      "  Pass --production if that is the one you mean " +
      "(npm run db:migrate -- --production).\n" +
      "  For local work export BOTH DATABASE_URL and DATABASE_URL_UNPOOLED; see AGENTS.md.",
  };
}
