import { cookies, headers } from "next/headers";
import { isDatabaseConfigured, query, queryOne } from "../db/client.ts";
import {
  SESSION_COOKIE,
  SESSION_TTL_HOURS,
  hashSessionToken,
  newSessionToken,
} from "./auth.ts";

/**
 * Portal sessions.
 *
 * THE RULE THAT MATTERS MOST HERE
 *
 * `requireSession()` is called inside every portal page and every portal server
 * action — not only in the proxy. Server Actions are POSTs to the page route
 * rather than routes of their own, so a proxy matcher is a convenience, not a
 * security boundary: change the matcher and the actions quietly stop being
 * covered while still working. The bundled Next 16 docs say this outright, and
 * it is the single easiest way to build an admin area that is wide open.
 *
 * The proxy check is an optimistic redirect so a signed-out visitor sees a
 * login screen instead of a flash of the dashboard. It is not the lock.
 */

export type Session = { tokenHash: string; expiresAt: Date };

export async function createSession(): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  const headerList = await headers();

  await query(
    `insert into admin_session (token_hash, expires_at, ip, user_agent)
     values ($1, $2, $3, $4)`,
    [
      tokenHash,
      expiresAt.toISOString(),
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      headerList.get("user-agent")?.slice(0, 300) ?? null,
    ],
  );

  const store = await cookies();

  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // `lax` rather than `strict`: the portal is reached by typing a URL or
    // following a bookmark, and `strict` withholds the cookie on that first
    // top-level navigation, which reads as "logged out" every single time.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

/** The current session, or null. Also slides `last_seen` for the audit trail. */
export async function getSession(): Promise<Session | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const row = await queryOne<{ token_hash: string; expires_at: Date }>(
      `update admin_session
          set last_seen = now()
        where token_hash = $1
          and expires_at > now()
      returning token_hash, expires_at`,
      [hashSessionToken(token)],
    );

    if (!row) {
      return null;
    }

    return { tokenHash: row.token_hash, expiresAt: row.expires_at };
  } catch (error) {
    // A database that cannot be reached is not an authenticated session.
    console.error(
      "[guard-theory] session lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    try {
      await query("delete from admin_session where token_hash = $1", [hashSessionToken(token)]);
    } catch (error) {
      console.error(
        "[guard-theory] could not delete session row:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Cleared even if the delete failed — the cookie is the thing in the
  // browser, and leaving it behind is the worse of the two failures.
  store.delete(SESSION_COOKIE);
}

/** Expired rows are rubbish, not history. Swept opportunistically on login. */
export async function sweepExpiredSessions(): Promise<void> {
  try {
    await query("delete from admin_session where expires_at < now()");
  } catch {
    // Housekeeping. Never worth failing a sign-in over.
  }
}

export class NotAuthorised extends Error {
  constructor() {
    super("Not signed in to the Crew Portal.");
    this.name = "NotAuthorised";
  }
}

/**
 * The actual lock. Call this first in every portal page and every portal action.
 */
export async function requireSession(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new NotAuthorised();
  }

  return session;
}
