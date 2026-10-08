-- 0020_crew_accounts.sql
--
-- Crew accounts, their roles, their set-password links, and who did what to
-- an order.
--
-- Until now the portal had one shared password (PORTAL_PASSWORD_HASH) and one
-- session at a time. The owner asked (2026-10-05) to give employees their own
-- names and passwords so they can handle orders and print labels. So:
--
--   crew_user    one row per person. `role` is 'owner' or 'crew'; what each may
--                do is enforced in every server action (requireRole). The
--                password hash is scrypt (src/lib/portal/auth.ts) and stays null
--                until the person sets it from their emailed link. No plaintext
--                password is ever stored, emailed or displayed.
--   crew_token   the set-password links: an invite or a reset. Only the SHA-256
--                of the token is stored, single use, 72 hours.
--   order_event  who bought a label, saved tracking, moved, refunded or
--                cancelled an order. `actor_name` is a copy of the name at the
--                time, so the history still reads after a person is removed.
--
-- admin_session gains user_id. NULL means the shared-password owner sign-in,
-- which keeps working during the rollout so the owner is never locked out
-- (docs/provisioning.md, "Adding someone to the crew"). Deleting a user's
-- sessions is how deactivating them takes effect at once; the session lookup
-- also refuses a session whose user is inactive.
--
-- Additive only. Apply BEFORE deploying the code that reads it.

create table if not exists crew_user (
  id            text        primary key,
  -- Lower-cased by the application; the unique index is on lower() as well, so
  -- "Maria" and "maria" cannot both exist whatever wrote the row.
  username      text        not null check (username ~ '^[a-z0-9][a-z0-9._-]{1,31}$'),
  email         text        not null,
  display_name  text        not null check (length(display_name) between 1 and 80),
  role          text        not null check (role in ('owner', 'crew')),
  password_hash text,
  active        boolean     not null default true,
  created_at    timestamptz not null default now(),
  last_sign_in_at timestamptz
);

create unique index if not exists crew_user_username_idx on crew_user (lower(username));
create unique index if not exists crew_user_email_idx on crew_user (lower(email));

create table if not exists crew_token (
  -- sha256 of the token in the emailed link. Never the token itself.
  token_hash  text        primary key,
  user_id     text        not null references crew_user(id) on delete cascade,
  purpose     text        not null check (purpose in ('invite', 'reset')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  -- 'sent', 'failed' or 'not-delivered' (no mail provider: shown on screen once).
  delivery    text        not null check (delivery in ('sent', 'failed', 'not-delivered'))
);

create index if not exists crew_token_user_idx on crew_token (user_id);

alter table admin_session add column if not exists user_id text references crew_user(id) on delete cascade;

create index if not exists admin_session_user_idx on admin_session (user_id);

create table if not exists order_event (
  id            bigint      generated always as identity primary key,
  order_id      text        not null references "order"(id) on delete cascade,
  kind          text        not null check (kind in (
                  'label_bought', 'label_released', 'label_printed', 'tracking_set',
                  'status_changed', 'refunded', 'cancelled', 'restocked',
                  'flag_cleared', 'email_resent')),
  detail        text,
  actor_user_id text        references crew_user(id) on delete set null,
  actor_name    text        not null,
  created_at    timestamptz not null default now()
);

create index if not exists order_event_order_idx on order_event (order_id, created_at);
