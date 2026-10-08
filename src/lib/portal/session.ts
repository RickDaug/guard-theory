import { cookies, headers } from "next/headers";
import { isDatabaseConfigured, query } from "../db/client.ts";
import { cache } from "react";
import {
  SESSION_IDLE_MINUTES,
  SESSION_TTL_HOURS,
  sessionCookieName,
  hashSessionToken,
  newSessionToken,
} from "./auth.ts";
import { findSession, insertSession, type Session } from "./session-store.ts";
import { authorise, NotAuthorised, type Role } from "./roles.ts";

export { NotAuthorised };
export type { Session };

/**
 * Portal sessions.
 *
 * THE RULE THAT MATTERS MOST HERE
 *
 * `requireRole()` is called inside every portal page and every portal server
 * action — not only in the proxy. Server Actions are POSTs to the page route
 * rather than routes of their own, so a proxy matcher is a convenience, not a
 * security boundary: change the matcher and the actions quietly stop being
 * covered while still working. The bundled Next 16 docs say this outright, and
 * it is the single easiest way to build an admin area that is wide open.
 *
 * The proxy check is an optimistic redirect so a signed-out visitor sees a
 * login screen instead of a flash of the dashboard. It is not the lock.
 */

/**
 * Starts a session for a person (`userId`), or for the shared owner password
 * (`null`). A new token every time: signing in never reuses a session.
 */
export async function createSession(userId: string | null): Promise<string> {
  const token = newSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  const headerList = await headers();

  await insertSession({
    tokenHash,
    userId,
    expiresAt,
    ip: headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: headerList.get("user-agent")?.slice(0, 300) ?? null,
  });

  const store = await cookies();

  store.set(sessionCookieName(), token, {
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
/**
 * Wrapped in React's `cache` so the layout and the page asking in the same
 * request share one lookup rather than racing two UPDATEs.
 */
export const getSession = cache(async function getSession(): Promise<Session | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;

  if (!token) {
    return null;
  }

  try {
    return await findSession(hashSessionToken(token));
  } catch (error) {
    // A database that cannot be reached is not an authenticated session.
    console.error(
      "[guard-theory] session lookup failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
});

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(sessionCookieName())?.value;

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
  //
  // Not `store.delete()`: that sends a bare expiring cookie with no Secure
  // attribute, and a browser ignores any `__Host-` cookie set without Secure —
  // so in production the delete was silently dropped and the cookie outlived
  // the sign-out. Expire it with the same attributes it was set with.
  store.set(sessionCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Expired rows are rubbish, not history. Swept opportunistically on login, and
 * by the scheduled run in src/lib/orders/cron.ts. Returns how many went.
 */
export async function sweepExpiredSessions(): Promise<number> {
  try {
    const rows = await query<{ token_hash: string }>(
      `delete from admin_session
        where expires_at < now() or last_seen < now() - make_interval(mins => $1)
        returning token_hash`,
      [SESSION_IDLE_MINUTES],
    );
    return rows.length;
  } catch {
    // Housekeeping. Never worth failing a sign-in over.
    return 0;
  }
}

/**
 * The actual lock. The first statement of every portal server action:
 * `await requireRole("crew")` for what anyone signed in may do, and
 * `await requireRole("owner")` for everything else (src/lib/portal/roles.ts
 * says which is which). Throws without a session, and throws when the
 * session's role does not cover `needs`.
 */
export async function requireRole(needs: Role): Promise<Session> {
  return authorise(await getSession(), needs);
}
