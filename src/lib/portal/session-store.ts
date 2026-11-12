import { query, queryOne } from "../db/client.ts";
import { SESSION_IDLE_MINUTES } from "./auth.ts";
import { SHARED_PASSWORD_DISABLED_KEY } from "./users.ts";
import { SHARED_OWNER_NAME, isRole, type Actor } from "./roles.ts";

/**
 * The session rows, without the cookie. session.ts reads the cookie and calls
 * these; tests call them directly.
 */

export type Session = Actor & { tokenHash: string; expiresAt: Date };

/**
 * The live session for a token hash, or null. Slides `last_seen`.
 *
 * Refused, in the same statement that slides it: a session past its absolute
 * or idle lifetime; a person's session once their account is turned off; and
 * a shared-password session once the shared password is turned off. The role
 * and name are read from the account on every request, so a change of role
 * applies at once.
 */
export async function findSession(tokenHash: string): Promise<Session | null> {
  const row = await queryOne<{
    token_hash: string;
    expires_at: Date;
    user_id: string | null;
    role: string | null;
    display_name: string | null;
  }>(
    `with live as (
       update admin_session s
          set last_seen = now()
        where s.token_hash = $1
          and s.expires_at > now()
          and s.last_seen > now() - make_interval(mins => $2)
          and (
            (s.user_id is null and not exists (
               select 1 from setting where key = $3 and value = 'true'))
            or exists (
               select 1 from crew_user u where u.id = s.user_id and u.active)
          )
       returning s.token_hash, s.expires_at, s.user_id
     )
     select live.token_hash, live.expires_at, live.user_id, u.role, u.display_name
       from live left join crew_user u on u.id = live.user_id`,
    [tokenHash, SESSION_IDLE_MINUTES, SHARED_PASSWORD_DISABLED_KEY],
  );

  if (!row) {
    return null;
  }

  if (row.user_id === null) {
    return {
      tokenHash: row.token_hash,
      expiresAt: row.expires_at,
      userId: null,
      role: "owner",
      name: SHARED_OWNER_NAME,
    };
  }

  if (!isRole(row.role)) {
    return null;
  }

  return {
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    userId: row.user_id,
    role: row.role,
    name: row.display_name ?? "",
  };
}

/**
 * Writes a new session row. One person, one session: signing in ends every
 * other session of the same person (or of the shared password), so a cookie
 * lifted from another machine stops working the moment its owner signs in
 * again. Other people's sessions are untouched.
 */
export async function insertSession(row: {
  tokenHash: string;
  userId: string | null;
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
}): Promise<void> {
  await query("delete from admin_session where user_id is not distinct from $1", [row.userId]);
  await query(
    `insert into admin_session (token_hash, expires_at, ip, user_agent, user_id)
     values ($1, $2, $3, $4, $5)`,
    [row.tokenHash, row.expiresAt.toISOString(), row.ip, row.userAgent, row.userId],
  );
}
