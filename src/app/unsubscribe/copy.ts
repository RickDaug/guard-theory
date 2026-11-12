import type { UnsubscribeResult } from "@/lib/waitlist";

/**
 * `UnsubscribeResult` plus the case where the link carried no token at all —
 * not a database outcome, but still an outcome the reader sees.
 */
export type UnsubscribeOutcome = UnsubscribeResult | "no-token";

/**
 * What a GET can show. A link with a token shows "confirm" and changes
 * nothing: email security scanners follow every link in a message, and a GET
 * that unsubscribed used to take people off the list without them knowing
 * (security audit 2026-09-29, S3-3). The change happens on the POST — the
 * button on that page, or a mail client's own one-click button (RFC 8058,
 * src/app/api/unsubscribe/route.ts).
 */
export type UnsubscribePageState = UnsubscribeOutcome | "confirm";

/**
 * Kept free of JSX so a unit test can import it directly with `node --test`,
 * without pulling in the page component or a browser.
 */
export function tokenFromSearchParams(raw: string | string[] | undefined): string {
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
}

/**
 * The `<title>` for each outcome, in plain text.
 *
 * The page used to claim "Unsubscribed" in the title no matter what happened
 * on the page beneath it — a missing or unrecognised token still read as
 * success to anyone scanning a tab or a screen reader's document title. Every
 * outcome now gets a title that is true of it.
 */
export function metaTitleFor(outcome: UnsubscribePageState): string {
  switch (outcome) {
    case "confirm":
      return "Leave the First Edition list";
    case "unsubscribed":
    case "already":
      return "Unsubscribed";
    case "no-token":
      return "Use the link in the email";
    case "unknown-token":
      return "That link is not ours";
    case "unavailable":
      return "We could not do that just now";
  }
}

export function metaDescriptionFor(outcome: UnsubscribePageState): string {
  switch (outcome) {
    case "confirm":
      return "Confirm to remove your address from the Guard Theory First Edition list.";
    case "unsubscribed":
    case "already":
      return "You have been removed from the Guard Theory First Edition list.";
    case "no-token":
      return "This link removes an address from the Guard Theory First Edition list, and none was given.";
    case "unknown-token":
      return "This link does not match an address on the Guard Theory First Edition list.";
    case "unavailable":
      return "Something failed on our side and your address was not removed from the list.";
  }
}
