"use server";

import { headers } from "next/headers";
import { getWaitlistStore } from "@/lib/waitlist";
import { parseSignup } from "@/lib/waitlist/validate";
import { checkRateLimit } from "@/lib/rate-limit";
import type { WaitlistFormState } from "@/lib/waitlist/form-state";

async function clientKey(): Promise<string> {
  const list = await headers();
  // Behind a proxy the first entry is the client. Falls back to a shared bucket
  // rather than to something spoofable-but-trusted.
  const forwarded = list.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip && ip.length > 0 ? `waitlist:${ip}` : "waitlist:unknown";
}

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
      message: "You're on the list.",
      errors: {},
      alreadyOnList: false,
    };
  }

  const limit = checkRateLimit(await clientKey(), {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

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

  return {
    status: "success",
    message: result.alreadyOnList
      ? "You were already on the list. Nothing has changed."
      : "You're on the list.",
    errors: {},
    alreadyOnList: result.alreadyOnList,
  };
}
