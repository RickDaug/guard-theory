"use server";

import { redirect } from "next/navigation";
import { setPasswordWithToken } from "@/lib/portal/users";
import { portalUrl } from "@/lib/portal/routes";
import { isDatabaseConfigured } from "@/lib/db/client";
import type { PortalFormState } from "@/lib/portal/form-state";

/**
 * Choosing a password from an emailed (or handed-over) link.
 *
 * Reachable without a session by design: the link's single-use token is the
 * authorisation, checked and used up in one statement
 * (src/lib/portal/users.ts). The token is 256 random bits, so there is nothing
 * to rate-limit against guessing, and nothing is hashed until it is known good.
 */
export async function setPassword(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const token = formData.get("token");
  const password = formData.get("password");
  const confirm = formData.get("confirm");

  if (!isDatabaseConfigured() || typeof token !== "string") {
    return { status: "error", message: "This link has been used or has run out. Ask the owner for a new one." };
  }

  if (typeof password !== "string" || password === "") {
    return { status: "error", message: "Choose a password.", field: "password" };
  }

  if (password !== confirm) {
    return { status: "error", message: "The two passwords are not the same. Type it again in both.", field: "confirm" };
  }

  const result = await setPasswordWithToken(token, password);

  if (!result.ok) {
    return { status: "error", message: result.reason, ...(result.field ? { field: result.field } : {}) };
  }

  // Outside any try/catch: redirect() throws to work.
  redirect(`${portalUrl("/sign-in")}?set=1`);
}
