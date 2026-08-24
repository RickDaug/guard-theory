-- 0003 — the Crew Portal's sessions.
--
-- Server-side sessions rather than a self-contained signed token, for one
-- reason: logging out, and revoking a stolen cookie, have to actually work. A
-- stateless JWT cannot be withdrawn before it expires, and "wait for it to time
-- out" is not an answer when the thing behind the door is the order book.
--
-- Only the SHA-256 of the token is stored. A leaked database backup then does
-- not hand anyone a working session, and there is nothing to decrypt because
-- nothing was encrypted — the row simply cannot produce the cookie.

create table if not exists admin_session (
  -- sha256 of the opaque token held in the cookie. Never the token itself.
  token_hash text        primary key,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen  timestamptz not null default now(),
  -- For "somebody signed in and it was not me". Truncated in the portal UI.
  ip         text,
  user_agent text
);

create index if not exists admin_session_expiry_idx on admin_session (expires_at);
