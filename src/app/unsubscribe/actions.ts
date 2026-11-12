"use server";

import { unsubscribeByToken } from "@/lib/waitlist";
import { tokenFromSearchParams, type UnsubscribeOutcome } from "./copy";

/**
 * The confirm button on /unsubscribe. The only thing on the page that writes:
 * a GET of the link shows the button and changes nothing, so a mail scanner
 * that follows every link cannot take anyone off the list.
 *
 * Public by design — the token is the authorisation, as it is in the link.
 * Idempotent: `unsubscribeByToken` reports "already" on a second press.
 */
export async function confirmUnsubscribe(
  _previous: UnsubscribeOutcome | null,
  formData: FormData,
): Promise<UnsubscribeOutcome> {
  const raw = formData.get("t");
  const token = tokenFromSearchParams(typeof raw === "string" ? raw : undefined);
  return token ? unsubscribeByToken(token) : "no-token";
}
