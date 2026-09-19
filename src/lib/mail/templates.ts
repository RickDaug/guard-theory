import { SITE_URL } from "../site.ts";
import type { Email } from "./types.ts";

/**
 * List mail.
 *
 * The voice is the site's voice: technical, restrained, no exclamation points,
 * no marketing filler. `tests/unit/email.test.ts` greps every message this
 * produces against the same banned-constructions list the Journal is held to.
 *
 * Only the announcement lives here. The three order templates — confirmation,
 * in-process, shipped — stay on `feat/commerce` with the orders they describe,
 * because each one states a total, a shipping method and a tracking number, and
 * none of those exist in this build.
 */

/**
 * The one message the First Edition list was collected for.
 *
 * The subject and body are passed in rather than written here. This template
 * owns the envelope — who it goes to, why they are receiving it, and how they
 * leave — and nothing about the release, which is not known yet and is not this
 * file's to invent.
 *
 * The unsubscribe line is not optional and is not a setting. Every message to
 * the list carries a working one-click link, which is what the privacy policy
 * promises and what the law requires. It points at `?t=`, which is the
 * parameter `src/app/unsubscribe/page.tsx` actually reads.
 */
export function announcement(
  to: string,
  unsubscribeToken: string,
  subject: string,
  body: string,
): Email {
  return {
    to,
    subject,
    body: [
      body.trim(),
      "",
      "—",
      "",
      "You are on the Guard Theory First Edition list because you asked to be.",
      `Unsubscribe: ${SITE_URL}/unsubscribe?t=${unsubscribeToken}`,
      "",
      "Guard Theory",
    ].join("\n"),
  };
}
