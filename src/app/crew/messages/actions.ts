"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/portal/session";
import { isDatabaseConfigured } from "@/lib/db/client";
import { setAnswered } from "@/lib/contact/inbox";
import { portalUrl } from "@/lib/portal/routes";
import type { PortalFormState } from "@/lib/portal/form-state";

/** Every action authorises itself. A proxy matcher is not a boundary for these. */
export async function markAnswered(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  await requireSession();

  const id = formData.get("id");
  const answered = formData.get("answered") === "true";

  if (typeof id !== "string" || !id || !isDatabaseConfigured()) {
    return { status: "error", message: "That message could not be identified." };
  }

  try {
    if (!(await setAnswered(id, answered))) {
      return { status: "error", message: "That message is not there any more." };
    }
  } catch (error) {
    console.error(
      "[guard-theory] could not mark a contact message:",
      error instanceof Error ? error.message : error,
    );
    return { status: "error", message: "That did not save. Try again in a moment." };
  }

  revalidatePath(portalUrl("/messages"));
  return { status: "success", message: answered ? "Marked answered." : "Marked unanswered." };
}
