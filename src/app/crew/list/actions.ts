"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/portal/session";
import { portalUrl } from "@/lib/portal/routes";
import { findBannedConstructions, BANNED_IN_EMAIL } from "@/content/editorial-voice";
import type { PortalFormState } from "@/lib/portal/form-state";
import { isDatabaseConfigured } from "@/lib/db/client";
import { getMailProvider } from "@/lib/mail";
import { problemsWithMessage } from "@/lib/mail/announcement";
import { isConfirmed } from "@/lib/mail/announcement-cli";
import {
  advanceCampaign,
  createCampaign,
  draftCampaign,
  openCampaignId,
  realSendProblem,
  type AdvanceOutcome,
} from "@/lib/mail/campaign";
import { SITE_URL } from "@/lib/site";

/**
 * The one composed message the owner sends to the list.
 *
 * Deliberately not a campaign tool in the marketing sense. There is no
 * scheduling, no segmentation and no template gallery, because sending more
 * than a handful of messages to this list is not the plan — the First Edition
 * page promises "one message, no newsletter".
 *
 * A dry run is the default: the form reports who would receive it and sends
 * nothing. A real send needs the box ticked AND the recipient count typed back,
 * the same gate as scripts/mail/send-announcement.ts. It then writes a
 * campaign — one row per recipient — and sends the first batch. The rest goes
 * out a batch per press of "Continue sending", so no single call has to live
 * long enough to reach the whole list. `src/lib/mail/campaign.ts` has the why.
 */

function sendNow(campaignId: string): Promise<AdvanceOutcome> {
  const provider = getMailProvider();
  return advanceCampaign(campaignId, {
    deliver: (email) => provider.send(email),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  });
}

function describe(outcome: AdvanceOutcome): string {
  const progress = outcome.progress;
  const done = progress?.status === "done";
  const left = progress ? progress.queued + progress.sending : 0;
  const parts = [
    `${outcome.sent} sent in this batch.`,
    done ? "Every recipient has been reached." : `${left} still to send.`,
  ];
  if (outcome.stoppedBecause) {
    parts.push(`Stopped: ${outcome.stoppedBecause}`);
  }
  return parts.join(" ");
}

export async function sendAnnouncement(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!subject) {
    return { status: "error", message: "Give it a subject line.", field: "subject" };
  }

  if (body.length < 20) {
    return { status: "error", message: "Write the message first.", field: "body" };
  }

  // The same voice rules the Journal is held to, checked before it goes out
  // rather than after. A test would catch this in CI; the owner writing at
  // eleven at night is not running CI.
  if (findBannedConstructions(`${subject}\n${body}`, BANNED_IN_EMAIL).length > 0) {
    return {
      status: "error",
      message:
        "That reads like marketing rather than like us. Check for exclamation points and filler, then try again.",
    };
  }

  const problems = problemsWithMessage({ subject, body });
  if (problems.length > 0) {
    return { status: "error", message: `Nothing was sent. ${problems.join(" ")}` };
  }

  if (!isDatabaseConfigured()) {
    return { status: "error", message: "Nothing was sent. There is no database connected." };
  }

  const open = await openCampaignId();
  if (open) {
    return {
      status: "error",
      message: "Nothing new was queued. A send is already under way — use Continue sending below.",
    };
  }

  const draft = await draftCampaign();
  const summary =
    `${draft.due} ${draft.due === 1 ? "person is" : "people are"} due it` +
    ` (${draft.today} within today's quota; the rest go on later days).` +
    ` ${draft.alreadySent} already have it or may have it; ${draft.reserved} test addresses are skipped.`;

  if (formData.get("send") !== "on") {
    return { status: "success", message: `Dry run — nothing was sent. ${summary}` };
  }

  if (!isConfirmed(String(formData.get("confirm") ?? ""), draft.due)) {
    return {
      status: "error",
      message: `Nothing was sent. To send for real, type the number of recipients (${draft.due}). ${summary}`,
      field: "confirm",
    };
  }

  const gate = realSendProblem({ siteUrl: SITE_URL, delivers: getMailProvider().delivers });
  if (gate) {
    return { status: "error", message: `Nothing was sent. ${gate}` };
  }

  const created = await createCampaign({ subject, body });
  if ("problems" in created) {
    return { status: "error", message: `Nothing was sent. ${created.problems.join(" ")}` };
  }
  if ("open" in created) {
    return {
      status: "error",
      message: "Nothing new was queued. A send is already under way — use Continue sending below.",
    };
  }

  const outcome = await sendNow(created.created);
  revalidatePath(portalUrl("/list"));
  return { status: outcome.stoppedBecause ? "error" : "success", message: describe(outcome) };
}

export async function continueAnnouncement(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const campaignId = String(formData.get("campaign") ?? "");
  if (!campaignId || !isDatabaseConfigured()) {
    return { status: "error", message: "There is no send to continue." };
  }

  const gate = realSendProblem({ siteUrl: SITE_URL, delivers: getMailProvider().delivers });
  if (gate) {
    return { status: "error", message: `Nothing was sent. ${gate}` };
  }

  const outcome = await sendNow(campaignId);
  revalidatePath(portalUrl("/list"));
  return { status: outcome.stoppedBecause ? "error" : "success", message: describe(outcome) };
}
