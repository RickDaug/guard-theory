-- Phase 4a: a record of every message the site tries to send.
--
-- Split out of 0002_commerce.sql, which defines this table alongside the order
-- tables. Two deliberate differences from that version:
--
--   * No `order_id` column. There is no `"order"` table in this build, so the
--     foreign key it carries there cannot exist here, and a bare nullable
--     column that nothing can ever populate would be a placeholder.
--   * Nothing else. The commerce tables stay on `feat/commerce`.
--
-- WHEN COMMERCE RE-LANDS: its `0002_commerce.sql` must be renumbered past this
-- file, and the `email_log` it creates removed in favour of an alter that adds
-- `order_id` and its foreign key. Its `create table if not exists` would
-- otherwise no-op against this table and silently leave the column missing,
-- which `sendEmail` would then fail on at runtime rather than at migration.

create table if not exists email_log (
  id          text        primary key,
  to_email    text        not null,
  template    text        not null,
  provider_id text,
  status      text        not null check (status in ('sent', 'failed')),
  error       text,
  attempts    integer     not null default 1,
  created_at  timestamptz not null default now()
);

-- Answers "did this address already get the announcement", which is the only
-- question anyone asks of this table before a send.
create index if not exists email_log_to_template_idx
  on email_log (to_email, template, created_at desc);
