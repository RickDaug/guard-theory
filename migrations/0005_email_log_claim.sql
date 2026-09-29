-- 0005 — the announcement is claimed before it is sent, and the database is
-- what enforces "once".
--
-- Numbered 0005 with no 0003 or 0004 beside it on this branch. Those two belong
-- to the commerce re-land (`0003_commerce`, `0004_admin_session`), which merges
-- first. The runner applies whatever is unapplied in filename order and does
-- not care about gaps, and nothing here depends on anything in them.
--
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

-- The inline check in 0002 was never named, so it carries Postgres's default.
alter table email_log drop constraint email_log_status_check;

alter table email_log
  add constraint email_log_status_check
  check (status in ('pending', 'sent', 'failed', 'unknown'));

-- Fails, loudly, if the table already holds two such rows for one address.
-- That would mean a double send has already happened, and it should not be
-- papered over by a migration.
create unique index email_log_announcement_once_idx
  on email_log (lower(to_email))
  where template = 'announcement' and status in ('pending', 'sent', 'unknown');
