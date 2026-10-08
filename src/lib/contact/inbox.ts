import { query } from "../db/client.ts";

/**
 * The portal's view of `contact_message`: newest first, with whether the owner
 * has answered it and what became of the email that forwarded it.
 *
 * "Answered" is the one flag. A message nobody has marked is unread as far as
 * the portal can know; there is no separate read state, because opening the
 * list is not the same as dealing with what is on it.
 */

export type InboxRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  received_at: Date;
  forward_delivery: "sent" | "failed" | "not-delivered" | null;
  answered_at: Date | null;
};

/** Newest first. Capped, because this is a working list, not an archive. */
export async function listContactMessages(limit = 200): Promise<InboxRow[]> {
  return query<InboxRow>(
    `select id, name, email, topic, message, received_at, forward_delivery, answered_at
       from contact_message
      order by received_at desc, id
      limit $1`,
    [limit],
  );
}

/** Marks a message answered, or back to unanswered. False when no row matched. */
export async function setAnswered(id: string, answered: boolean): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update contact_message
        set answered_at = case when $2::boolean then coalesce(answered_at, now()) else null end
      where id = $1
      returning id`,
    [id, answered],
  );
  return rows.length === 1;
}
