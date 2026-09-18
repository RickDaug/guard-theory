"use server";

import { requireSession } from "@/lib/portal/session";
import { query } from "@/lib/db/client";
import { sendEmail, getMailProvider } from "@/lib/mail";
import { announcement } from "@/lib/mail/templates";
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

type Recipient = { email: string; unsubscribe_token: string };

export async function sendAnnouncement(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const confirm = formData.get("confirm") === "on";
  const testTo = String(formData.get("testTo") ?? "").trim();

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

  // A test send goes to one address and touches nobody on the list.
  if (testTo) {
    const sent = await sendEmail(
      "announcement",
      announcement(testTo, "test-token-not-a-real-unsubscribe", subject, body),
      null,
    );

    return sent
      ? { status: "success", message: `Test sent to ${testTo}. Nobody on the list was emailed.` }
      : { status: "error", message: "The test did not send. Check the logs." };
  }

  if (!confirm) {
    return {
      status: "error",
      message: "Tick the box to confirm you mean to email the whole list.",
    };
  }

  const recipients = await query<Recipient>(
    // unsubscribed_at is null is the whole safety mechanism. Someone who left
    // the list must not receive this, and the check belongs in the query
    // rather than in a filter someone can forget.
    `select email, unsubscribe_token
       from waitlist_signup
      where unsubscribed_at is null
      order by submitted_at asc`,
  );

  if (recipients.length === 0) {
    return { status: "error", message: "There is nobody on the list to email." };
  }

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const ok = await sendEmail(
      "announcement",
      announcement(recipient.email, recipient.unsubscribe_token, subject, body),
      null,
    );

    if (ok) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  const provider = getMailProvider();

  if (!provider.delivers) {
    return {
      status: "error",
      message: `Nothing was actually sent — no mail provider is connected. ${sent} message${sent === 1 ? "" : "s"} were written to the log instead.`,
    };
  }

  return failed === 0
    ? { status: "success", message: `Sent to ${sent}.` }
    : {
        status: "error",
        message: `Sent to ${sent}. ${failed} failed — the reasons are in the logs. Do not send again, or the first ${sent} get it twice.`,
      };
}
