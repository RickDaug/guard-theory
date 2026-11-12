-- 0008_email_not_delivered.sql
--
-- A third `email_log.status`: 'not-delivered', for a message the log-only
-- provider wrote down instead of sending (no RESEND_API_KEY, or no
-- RECEIPT_FROM_EMAIL). It used to be recorded as 'sent', and the confirmation
-- path treats 'sent' as done — so every order taken while mail was not
-- configured was permanently "confirmed" and never emailed once it was.
--
-- Numbered 0008: 0005 is reserved for the announcement send (PR #2), and
-- 0009-0011 for other work in the same backlog. Independent of all of them — it
-- touches only the check 0002_email_log.sql put on this one column.
--
-- Rows already written as 'sent' by the log-only provider are not rewritten:
-- nothing in the row says which provider wrote it (provider_id is null for both
-- a log-only row and a Resend reply without an id). If mail was ever live
-- without a provider, find them by hand — see the PR that added this file.

alter table email_log drop constraint email_log_status_check;

alter table email_log
  add constraint email_log_status_check
  check (status in ('sent', 'failed', 'not-delivered'));

-- The retry sweep's question: which orders have a confirmation that never went.
create index if not exists email_log_unsent_confirmation_idx
  on email_log (order_id)
  where template = 'order-confirmation' and status in ('not-delivered', 'failed');
