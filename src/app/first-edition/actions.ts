"use server";

import { headers } from "next/headers";
import {
  confirmByToken,
  getWaitlistStore,
  purgeUnconfirmed,
  sendConfirmation,
} from "@/lib/waitlist";
import { parseSignup } from "@/lib/waitlist/validate";
import { callerKey, takeRateLimit } from "@/lib/rate-limit-db";
import {
  CONFIRMATION_MAIL_BUCKET,
  CONFIRM_BUCKET,
  WAITLIST_BUCKET,
  addressMailKey,
} from "@/lib/public-limits";
import type { ConfirmFormState, WaitlistFormState } from "@/lib/waitlist/form-state";

/** A keyed hash of the caller's address, for the Postgres limiter. */
async function clientKey(): Promise<string> {
  const list = await headers();
  // Behind a proxy the first entry is the client.
  return callerKey(list.get("x-forwarded-for")?.split(",")[0]?.trim());
}

/** One signup in this many also deletes pending rows nobody confirmed. */
const PURGE_ONE_IN = 20;

export async function joinWaitlist(
  _previous: WaitlistFormState,
  formData: FormData,
): Promise<WaitlistFormState> {
  // Spam protection that is not a CAPTCHA: a field no human sees. Bots that
  // fill every input give themselves away, and nobody is asked to identify a
  // traffic light.
  if (typeof formData.get("website") === "string" && formData.get("website") !== "") {
    // Reports success without storing anything, so a bot learns nothing.
    return {
      status: "success",
      message: "Check your email.",
      errors: {},
      alreadyOnList: false,
    };
  }

  // Counted in Postgres, which every instance shares. The in-memory limiter it
  // replaces was per instance and emptied by every cold start.
  const limit = await takeRateLimit(WAITLIST_BUCKET, await clientKey());

  if (!limit.allowed) {
    return {
      status: "error",
      message: `That's several attempts in a short time. Try again in ${limit.retryAfterSeconds} seconds.`,
      errors: {},
    };
  }

  const parsed = parseSignup(formData);

  if (!parsed.ok) {
    const count = Object.keys(parsed.errors).length;
    return {
      status: "error",
      message:
        count === 1
          ? "There is one problem with the form."
          : `There are ${count} problems with the form.`,
      errors: parsed.errors,
    };
  }

  const store = getWaitlistStore();
  const result = await store.add({
    ...parsed.value,
    submittedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return {
      status: "error",
      message:
        "We could not save your details just now. Nothing was lost on your side — try again in a moment.",
      errors: {},
    };
  }

  if (result.confirm) {
    // Per address, so a thousand callers cannot mail one inbox, and under a
    // daily ceiling across every address. Refused, the row stays pending and
    // the reader is told the same thing: a link already sent still works.
    const mail = await takeRateLimit(CONFIRMATION_MAIL_BUCKET, addressMailKey(result.confirm.email));

    if (mail.allowed) {
      await sendConfirmation(result.confirm);
    } else {
      console.warn("[guard-theory] waitlist: confirmation email not sent: rate limit");
    }

    if (Math.random() * PURGE_ONE_IN < 1) {
      await purgeUnconfirmed().catch((error: unknown) => {
        console.error(
          "[guard-theory] could not purge unconfirmed signups:",
          error instanceof Error ? error.message : error,
        );
      });
    }
  }

  return {
    status: "success",
    message: result.alreadyOnList
      ? "You were already on the list. Nothing has changed."
      : "Check your email.",
    errors: {},
    alreadyOnList: result.alreadyOnList,
  };
}

/**
 * The Confirm button on /first-edition/confirm. The only place a pending
 * signup becomes confirmed, and a POST: opening the link does nothing.
 */
export async function confirmWaitlist(
  _previous: ConfirmFormState,
  formData: FormData,
): Promise<ConfirmFormState> {
  const limit = await takeRateLimit(CONFIRM_BUCKET, await clientKey());

  if (!limit.allowed) {
    return { status: "busy" };
  }

  const token = formData.get("t");
  return { status: await confirmByToken(typeof token === "string" ? token : "") };
}
