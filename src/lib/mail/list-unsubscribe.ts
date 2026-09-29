import { SITE_URL } from "../site.ts";
import type { UnsubscribeResult } from "../waitlist/postgres-store.ts";

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
 * The URL is `/api/unsubscribe`, not `/unsubscribe`: the page unsubscribes on
 * GET because the privacy policy promises one click, and one-click POSTs need
 * a route handler, which cannot share a segment with a page.
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

export type UnsubscribeFn = (token: string) => Promise<UnsubscribeResult>;

/**
 * The POST a mail client sends. Kept out of the route file so the test can
 * drive it with a fake store.
 *
 * Only a failure on our side is a non-2xx: a client that gets an error may
 * retry, which is right for "unavailable" and pointless for an unknown token.
 * An unknown or already-used token answers 200 — nothing about the response
 * should let a caller probe which tokens exist.
 */
export async function handleOneClickUnsubscribe(
  request: Request,
  unsubscribe: UnsubscribeFn,
): Promise<Response> {
  const token = new URL(request.url).searchParams.get("t")?.trim() ?? "";

  if (!token) {
    return new Response("Missing token.", { status: 400 });
  }

  const outcome = await unsubscribe(token);

  if (outcome === "unavailable") {
    return new Response("Try again shortly.", { status: 503 });
  }

  return new Response("Unsubscribed.", { status: 200 });
}
