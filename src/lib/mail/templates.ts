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
 *
 * TWO WAYS OUT, FOR TWO KINDS OF READER
 *
 * The link in the body is for a person, and it lands on a page with a button:
 * mail scanners and link prefetchers follow every URL in a message, and a link
 * that unsubscribes on GET lets them unsubscribe people who never clicked.
 *
 * The headers are for the mail client. `List-Unsubscribe` with
 * `List-Unsubscribe-Post: List-Unsubscribe=One-Click` is RFC 8058: the client
 * shows its own unsubscribe button and, when it is pressed, POSTs to the URL.
 * A scanner does not POST. Gmail and Yahoo have required both headers of bulk
 * senders since February 2024, and a list message without them is more likely
 * to be filed as spam however few of them there are.
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
    headers: {
      "List-Unsubscribe": `<${oneClickUnsubscribeUrl(unsubscribeToken)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
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

/** Where a mail client POSTs. `src/app/unsubscribe/one-click/route.ts` answers. */
export function oneClickUnsubscribeUrl(unsubscribeToken: string): string {
  return `${SITE_URL}/unsubscribe/one-click?t=${encodeURIComponent(unsubscribeToken)}`;
}
