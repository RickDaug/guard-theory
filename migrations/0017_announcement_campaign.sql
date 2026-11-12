-- 0017 — the announcement is claimed before it is sent, and the database is
-- what enforces "once".
--
-- Written as 0005_email_log_claim.sql on PR #2, and renumbered when the
-- 2026-09 backend wave landed first (0016 is PR #48's cancel_and_restock).
-- Two reasons, both about email_log's status check, which
-- 0008_email_not_delivered.sql also rewrites:
--
--   1. Filename order. On a fresh database the runner would apply 0005 before
--      0008, and 0008's check ('sent', 'failed', 'not-delivered') would then
--      forbid 'pending' and 'unknown' — every announcement claim would fail.
--   2. Production order. 0008 is applied when its PR merges; a later 0005 is
--      still unapplied, so the runner applies it, and its check would forbid
--      'not-delivered' — every order confirmation logged while no provider is
--      connected would fail to record, or the migration itself would fail on
--      the rows 0008 made legal.
--
-- As 0017 it runs after 0008 in both, and its check is the union of the two.

-- WHAT WAS WRONG
--
-- The send read `email_log`, called the provider, then wrote `email_log`. A
-- process killed between the call and the write left a delivered message with
-- no row, and two runs at once each read the ledger before the other wrote to
-- it. Both end the same way: a second copy in someone's inbox.
--
-- WHAT THIS DOES
--
-- Two new statuses:
--
--   pending — the claim. Written BEFORE the provider is called. If the process
--             dies there, the row stays, and the address is not sent to again
--             until a person has looked.
--   unknown — the provider never answered, or answered ambiguously. The
--             message may have gone. Same rule.
--
-- And one partial unique index, so that for the announcement an address can
-- hold at most one row that is pending, sent or unknown. The second claim —
-- from a second run, or the next day's — is a conflict rather than a second
-- message. `failed` is outside the index on purpose: a refused message did not
-- go, and may be tried again as often as it takes.
--
-- No advisory lock. The application connects through PgBouncer in transaction
-- mode, which cannot hold one across statements. A unique index needs no
-- session.
--
-- Other templates are untouched by the index. An order confirmation may be
-- sent twice deliberately, from the portal's resend button.

-- 0002's inline check was never named, so it carries Postgres's default name;
-- 0008 dropped and re-added it under the same one.
alter table email_log drop constraint email_log_status_check;

alter table email_log
  add constraint email_log_status_check
  check (status in ('pending', 'sent', 'failed', 'unknown', 'not-delivered'));

-- Fails, loudly, if the table already holds two such rows for one address.
-- That would mean a double send has already happened, and it should not be
-- papered over by a migration.
create unique index email_log_announcement_once_idx
  on email_log (lower(to_email))
  where template = 'announcement' and status in ('pending', 'sent', 'unknown');

-- THE CAMPAIGN, AND ONE ROW PER RECIPIENT
--
-- The claim above makes a second copy impossible. It does not say how far a
-- send got, and a send of the whole list does not fit in one function's
-- lifetime: Resend's free tier takes two requests a second and a hundred a
-- day, and a server action is killed long before a list of any size is done.
--
-- So a send is a campaign, written once when the owner confirms it, with a row
-- per recipient written at the same moment. Each call — the portal's "Continue
-- sending" button — takes the next few `queued` rows, sends them, and marks
-- each one. A call that dies part-way leaves the rest `queued` for the next;
-- a row it died holding stays `sending` until it is old enough to be settled
-- against `email_log`, which is still what decides whether a message may go.
--
-- The message text is stored so a later call sends exactly what was
-- confirmed, not whatever is in the form by then.

create table announcement_campaign (
  id          text        primary key,
  subject     text        not null,
  body        text        not null,
  status      text        not null default 'open' check (status in ('open', 'done')),
  recipients  integer     not null default 0,
  last_stop   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  finished_at timestamptz
);

-- One open campaign at a time. A second press of "send", or a re-submitted
-- form, collides here instead of queueing the list twice.
create unique index announcement_campaign_one_open_idx
  on announcement_campaign ((true))
  where status = 'open';

create table announcement_delivery (
  campaign_id  text        not null references announcement_campaign (id) on delete cascade,
  email        text        not null,
  position     integer     not null,
  status       text        not null default 'queued'
               check (status in ('queued', 'sending', 'sent', 'failed', 'unknown', 'unsubscribed', 'skipped')),
  attempts     integer     not null default 0,
  email_log_id text,
  error        text,
  updated_at   timestamptz not null default now(),
  primary key (campaign_id, email),
  check (email = lower(email))
);

create index announcement_delivery_queue_idx
  on announcement_delivery (campaign_id, status, position);
