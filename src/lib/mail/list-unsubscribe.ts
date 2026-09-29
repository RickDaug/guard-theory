import { SITE_URL } from "../site.ts";

/**
 * One-click unsubscribe in the mail client's own UI (RFC 2369 + RFC 8058).
 *
 * The link at the foot of the announcement is the one a person reads. These
 * headers are the one Gmail, Yahoo and Apple Mail act on: an "Unsubscribe"
 * button beside the sender name that POSTs `List-Unsubscribe=One-Click` to the
 * URL without opening a browser. Gmail and Yahoo require both headers on bulk
 * mail, and a list send without them is the kind that lands in spam.
 *
 * LIST MAIL ONLY. An order confirmation carrying List-Unsubscribe tells the
 * client it is marketing, invites the reader to "unsubscribe" from a receipt
 * that no list sends, and is the confusion the privacy policy's "they are not a
 * mailing list" sentence exists to prevent. `tests/unit/email.test.ts` fails if
 * a transactional template ever carries these headers.
 *
 * The URL is `/api/unsubscribe`, not `/unsubscribe`: one-click POSTs need a
 * route handler, which cannot share a segment with a page. The handler is
 * src/lib/waitlist/one-click.ts (POST acts; GET is sent to the confirm page,
 * because mail scanners follow every link).
 */
export function oneClickUnsubscribeUrl(token: string): string {
  return `${SITE_URL}/api/unsubscribe?t=${encodeURIComponent(token)}`;
}

export function listUnsubscribeHeaders(token: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${oneClickUnsubscribeUrl(token)}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
