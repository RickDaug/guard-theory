import { isDatabaseConfigured, query } from "../db/client.ts";
import { getMailProvider, sendEmail } from "../mail/index.ts";
import { contactForward } from "../mail/templates.ts";
import type { EmailTemplate, Email } from "../mail/types.ts";
import { portalUrl } from "../portal/routes.ts";
import { SITE_URL } from "../site.ts";
import type { ContactMessage } from "./store.ts";

/**
 * Tells the owner a contact message arrived.
 *
 * The contact page says a person reads every message (owner-decisions §13 d).
 * Until this existed the message was a row in `contact_message` and nothing
 * told anyone it was there. Now it is emailed to the owner, plain text, with
 * the sender as Reply-To, and what became of that email is recorded on the row
 * in `forward_delivery` — 'sent', 'failed', or 'not-delivered', the same three
 * words the waitlist confirmation uses (src/lib/waitlist/confirm.ts).
 *
 * THE RULES
 *
 * - Forwarding never fails the submission. The message is already saved when
 *   this runs, and it runs after the response (`after()` in the action). This
 *   function does not throw.
 * - The message text and the sender's address never go to a log. A function
 *   log is kept by the host for longer, and read by more people, than the
 *   table is. What is logged is that a forward was skipped or failed.
 */

export type SavedContactMessage = ContactMessage & { id: string };

export type ContactDelivery = "sent" | "failed" | "not-delivered";

const ADDRESS = /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

/**
 * Where the forward goes: `OWNER_ALERT_EMAIL`, else `REPLY_TO_EMAIL` (the
 * address the owner already routes customer replies to), else nobody.
 */
export function readContactRecipient(
  env: Record<string, string | undefined> = process.env,
): string | null {
  for (const name of ["OWNER_ALERT_EMAIL", "REPLY_TO_EMAIL"]) {
    const value = env[name]?.trim();
    if (value && ADDRESS.test(value)) {
      return value;
    }
  }
  return null;
}

async function recordDelivery(id: string, delivery: ContactDelivery): Promise<void> {
  if (!isDatabaseConfigured()) {
    return;
  }
  await query(`update contact_message set forward_delivery = $2 where id = $1`, [id, delivery]);
}

export type ForwardOptions = {
  /** The recipient. Omitted: read from the environment. */
  to?: string | null;
  send?: (template: EmailTemplate, email: Email) => Promise<boolean>;
  /** Whether the connected provider really delivers. Omitted: asks it. */
  delivers?: () => boolean;
  record?: (id: string, delivery: ContactDelivery) => Promise<void>;
};

export async function forwardContactMessage(
  message: SavedContactMessage,
  options: ForwardOptions = {},
): Promise<ContactDelivery> {
  const to = options.to === undefined ? readContactRecipient() : options.to;
  const send = options.send ?? ((template, email) => sendEmail(template, email));
  const delivers = options.delivers ?? (() => getMailProvider().delivers);
  const record = options.record ?? recordDelivery;

  let delivery: ContactDelivery;

  if (!to) {
    console.warn(
      "[guard-theory] a contact message was saved and not forwarded: set OWNER_ALERT_EMAIL " +
        "(or REPLY_TO_EMAIL) so it reaches a person. It is in the portal's Messages.",
    );
    delivery = "not-delivered";
  } else {
    try {
      const ok = await send(
        "contact-forward",
        contactForward(to, message, `${SITE_URL}${portalUrl("/messages")}`),
      );
      delivery = !ok ? "failed" : delivers() ? "sent" : "not-delivered";
    } catch (error) {
      // sendEmail does not throw; this is for anything that one day does. The
      // error text is the provider's, never the message.
      console.error(
        "[guard-theory] forwarding a contact message failed:",
        error instanceof Error ? error.message : error,
      );
      delivery = "failed";
    }
  }

  try {
    await record(message.id, delivery);
  } catch (error) {
    console.error(
      "[guard-theory] could not record a contact forward:",
      error instanceof Error ? error.message : error,
    );
  }

  return delivery;
}
