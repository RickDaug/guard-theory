-- 0018_contact_message_handling.sql
--
-- Contact messages reach a person. Before this a message was a row in
-- contact_message and nothing told anyone it had arrived (owner-decisions
-- §13 d). Two columns, both additive and nullable, so this applies in any
-- order relative to the other open migrations (0014-0017 are taken or
-- reserved by other work in the same backlog):
--
--   forward_delivery  what became of the email forwarding the message to the
--                     owner: 'sent', 'failed', or 'not-delivered' (no
--                     recipient configured, or no mail provider connected so it
--                     was only logged) — the same three words
--                     waitlist_signup.confirmation_delivery uses. Null for
--                     every message received before this migration.
--   answered_at       set when the owner marks the message answered in the
--                     portal; null means nobody has.

alter table contact_message
  add column if not exists forward_delivery text
    check (forward_delivery in ('sent', 'failed', 'not-delivered'));

alter table contact_message add column if not exists answered_at timestamptz;

-- The portal's "what still needs an answer".
create index if not exists contact_message_unanswered_idx
  on contact_message (received_at desc)
  where answered_at is null;
