"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { callerKey, takeRateLimit } from "@/lib/rate-limit-db";
import { CONTACT_BUCKET } from "@/lib/public-limits";
import { forwardContactMessage } from "@/lib/contact/forward";
import { getContactStore } from "@/lib/contact/store";
import { parseContact } from "@/lib/contact/validate";
import type { ContactFormState } from "@/lib/contact/form-state";

/** A keyed hash of the caller's address, for the Postgres limiter. */
async function clientKey(): Promise<string> {
  const list = await headers();
  return callerKey(list.get("x-forwarded-for")?.split(",")[0]?.trim());
}

export async function sendMessage(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot. Reports success without storing, so a bot learns nothing.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return { status: "success", message: "Message received.", errors: {} };
  }

  // Counted in Postgres, which every instance shares. The in-memory limiter it
  // replaces was per instance and emptied by every cold start.
  const limit = await takeRateLimit(CONTACT_BUCKET, await clientKey());

  if (!limit.allowed) {
    return {
      status: "error",
      message: `That's several messages in a short time. Try again in ${limit.retryAfterSeconds} seconds.`,
      errors: {},
    };
  }

  const parsed = parseContact(formData);

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

  const message = { ...parsed.value, receivedAt: new Date().toISOString() };
  const stored = await getContactStore().save(message);

  if (!stored) {
    return {
      status: "error",
      message:
        "We could not save your message just now. Nothing was lost on your side — try again in a moment.",
      errors: {},
    };
  }

  // Email it to the owner once the reader has their answer. After the
  // response, so a slow or failing provider cannot hold or fail the form;
  // forwardContactMessage does not throw, and records what happened on the row.
  after(() => forwardContactMessage({ id: stored, ...message }));

  return { status: "success", message: "Message received.", errors: {} };
}
