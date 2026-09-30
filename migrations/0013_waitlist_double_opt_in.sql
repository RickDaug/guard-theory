-- 0013_waitlist_double_opt_in.sql
--
-- Double opt-in for the First Edition list. A signup is now 'pending' until the
-- address clicks a signed, expiring link we email to it and presses Confirm;
-- only 'confirmed' (and, until the owner decides otherwise, 'legacy') rows are
-- sent the announcement. Before this, anyone could put anyone's address on the
-- list, and the announcement would have gone to people who never asked.
--
-- Numbered 0013: 0005 and 0008-0012 are taken or reserved by other work in the
-- same backlog. Additive only — it touches no table but waitlist_signup, and
-- no column that already exists.
--
-- EXISTING ROWS ARE MARKED 'legacy', NOT 'confirmed'. They joined under the
-- single opt-in form, ticked the consent box, and were never asked to confirm
-- the address. That is a real state and it is recorded as what it is; nothing
-- here claims they confirmed. Whether they are asked to re-confirm before the
-- announcement is the owner's decision (see the PR that added this file).

-- 'legacy' fills every existing row, then the default becomes 'pending' for
-- every row written from here on.
alter table waitlist_signup
  add column if not exists consent_state text not null default 'legacy'
    check (consent_state in ('pending', 'confirmed', 'legacy'));

alter table waitlist_signup alter column consent_state set default 'pending';

-- When the address pressed Confirm. Null for pending and legacy rows.
alter table waitlist_signup add column if not exists confirmed_at timestamptz;

-- When the latest confirmation link was issued, and what became of the email:
-- 'sent', 'failed', or 'not-delivered' (no mail provider connected, so it was
-- written to the log instead of sent — the same distinction email_log draws).
alter table waitlist_signup add column if not exists confirmation_sent_at timestamptz;
alter table waitlist_signup
  add column if not exists confirmation_delivery text
    check (confirmation_delivery in ('sent', 'failed', 'not-delivered'));

-- The announcement's recipient query, and the sweep of stale pending rows.
create index if not exists waitlist_signup_consent_idx
  on waitlist_signup (consent_state)
  where unsubscribed_at is null;
