"use server";

import { requireSession } from "@/lib/portal/session";
import { findBannedConstructions, BANNED_IN_EMAIL } from "@/content/editorial-voice";
import type { PortalFormState } from "@/lib/portal/form-state";

/**
 * The one composed message the owner sends to the list.
 *
 * Deliberately not a campaign tool. There is no scheduling, no segmentation and
 * no template gallery, because sending more than a handful of messages to this
 * list is not the plan — the First Edition page promises "one message, no
 * newsletter", and a tool that makes it easy to send twenty is a tool that
 * eventually sends twenty.
 */

export async function sendAnnouncement(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject) {
    return { status: "error", message: "Give it a subject line." };
  }

  if (body.length < 20) {
    return { status: "error", message: "Write the message first." };
  }

  // The same voice rules the Journal is held to, checked before it goes out
  // rather than after. A test would catch this in CI; the owner writing at
  // eleven at night is not running CI.
  const problems = findBannedConstructions(`${subject}\n${body}`, BANNED_IN_EMAIL);

  if (problems.length > 0) {
    return {
      status: "error",
      message:
        "That reads like marketing rather than like us. Check for exclamation points and filler, then try again.",
    };
  }

  // This form used to send: a test to one address, or a loop over the whole
  // list through `sendEmail`. That path sends first and logs afterwards, so a
  // second press, a retry after a timeout, or a run of the script alongside it
  // sends second copies — and the First Edition page promises one message.
  // `sendAndRecord` now refuses the announcement for exactly that reason, so
  // the loop would report "0 sent, N failed" for a list nobody had emailed.
  //
  // The announcement has one way out: scripts/mail/send-announcement.ts, which
  // claims each address in email_log before the provider is called, paces
  // itself, caps the day, and is a dry run unless told otherwise. Whether the
  // portal should drive that same loop is the owner's call and is not made
  // here. Until it is, this says what is true instead of pretending to send.
  return {
    status: "error",
    message:
      "Nothing was sent. The draft passes the voice check, but the announcement does not go out from this form — " +
      "it is sent with scripts/mail/send-announcement.ts, which records each address before sending so that nobody can get it twice.",
  };
}
