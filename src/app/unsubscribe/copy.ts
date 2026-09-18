import type { UnsubscribeLookup, UnsubscribeResult } from "@/lib/waitlist";

/**
 * `UnsubscribeResult` plus the two cases that are not database outcomes but
 * are still what the reader sees: the link carried no token at all, or it
 * carried a good one and the page is waiting for them to press the button.
 */
export type UnsubscribeOutcome = UnsubscribeResult | "no-token" | "confirm";

/**
 * What the page shows for what the lookup found.
 *
 * `failed` is the flag the confirm action redirects back with when its write
 * did not happen. It wins over the lookup: the row still reads as subscribed,
 * and offering the button again with no explanation would be the page saying
 * nothing about a failure it knows of.
 */
export function outcomeForLookup(
  lookup: UnsubscribeLookup | "no-token",
  failed: boolean,
): UnsubscribeOutcome {
  if (lookup === "no-token") {
    return "no-token";
  }
  if (lookup === "subscribed") {
    return failed ? "unavailable" : "confirm";
  }
  return lookup;
}

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
export function metaTitleFor(outcome: UnsubscribeOutcome): string {
  switch (outcome) {
    case "unsubscribed":
    case "already":
      return "Unsubscribed";
    case "confirm":
      return "Unsubscribe";
    case "no-token":
      return "Use the link in the email";
    case "unknown-token":
      return "That link is not ours";
    case "unavailable":
      return "We could not do that just now";
  }
}

export function metaDescriptionFor(outcome: UnsubscribeOutcome): string {
  switch (outcome) {
    case "unsubscribed":
    case "already":
      return "You have been removed from the Guard Theory First Edition list.";
    case "confirm":
      return "Confirm that this address should leave the Guard Theory First Edition list.";
    case "no-token":
      return "This link removes an address from the Guard Theory First Edition list, and none was given.";
    case "unknown-token":
      return "This link does not match an address on the Guard Theory First Edition list.";
    case "unavailable":
      return "Something failed on our side and your address was not removed from the list.";
  }
}
