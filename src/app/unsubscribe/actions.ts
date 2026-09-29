"use server";

import { redirect } from "next/navigation";
import { unsubscribeByToken } from "@/lib/waitlist";

/**
 * The button on /unsubscribe.
 *
 * Does the write, then sends the reader back to the page, which looks the
 * token up again and says what is now true of it — so a reload, or the back
 * button, shows the same answer rather than re-submitting a form. `failed` is
 * only set when the write did not happen; the page reads it as "unavailable".
 */
export async function confirmUnsubscribe(formData: FormData): Promise<void> {
  const raw = formData.get("t");
  const token = typeof raw === "string" ? raw.trim() : "";

  if (!token) {
    redirect("/unsubscribe");
  }

  const result = await unsubscribeByToken(token);
  const query = new URLSearchParams({ t: token });

  if (result === "unavailable") {
    query.set("failed", "1");
  }

  redirect(`/unsubscribe?${query.toString()}`);
}
