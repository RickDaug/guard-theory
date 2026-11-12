"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/portal/session";
import { portalUrl } from "@/lib/portal/routes";
import {
  TOKEN_TTL_HOURS,
  changeRole,
  createCrewUser,
  deactivateUser,
  disableSharedPassword,
  getCrewUser,
  issueToken,
  reactivateUser,
  recordTokenDelivery,
} from "@/lib/portal/users";
import { isRole } from "@/lib/portal/roles";
import { getMailProvider, sendAndRecord } from "@/lib/mail";
import { crewSetPassword } from "@/lib/mail/templates";
import { SITE_URL } from "@/lib/site";
import type { CrewLinkFormState, PortalFormState } from "@/lib/portal/form-state";

/**
 * The crew: adding people, sending their set-password links, turning them off
 * and on, and changing what they may do. Owner only, every one of them.
 *
 * No password is chosen, stored, emailed or shown here. A new person gets a
 * one-time link to choose their own (src/lib/portal/users.ts). When there is no
 * mail provider, or the send fails, the link is shown to the owner once, in
 * this action's answer, to hand over in person — and the page says so.
 */

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function revalidateUsers(): void {
  revalidatePath(portalUrl("/users"));
}

/** Makes a link for a person, emails it, and says what happened. Never throws. */
async function deliverLink(
  userId: string,
  purpose: "invite" | "reset",
  done: string,
): Promise<CrewLinkFormState> {
  const user = await getCrewUser(userId);

  if (!user) {
    return { status: "error", message: "That person no longer exists." };
  }

  const token = await issueToken(user.id, purpose);
  const link = `${SITE_URL}${portalUrl("/set-password")}?t=${token}`;

  const result = await sendAndRecord(
    purpose === "invite" ? "crew-invite" : "crew-reset",
    crewSetPassword(user.email, user.display_name, user.username, link, purpose, TOKEN_TTL_HOURS),
  );
  const delivers = getMailProvider().delivers;
  const delivery = !result.ok ? "failed" : delivers ? "sent" : "not-delivered";
  await recordTokenDelivery(token, delivery).catch(() => {});

  if (delivery === "sent") {
    return {
      status: "success",
      message: `${done} The link is on its way to ${user.email}. It works once, for ${TOKEN_TTL_HOURS} hours.`,
    };
  }

  return {
    status: "success",
    message:
      delivery === "failed"
        ? `${done} The email did not send. Give ${user.display_name} this link yourself. It works once, for ${TOKEN_TTL_HOURS} hours, and will not be shown again.`
        : `${done} No email provider is connected, so nothing was sent. Give ${user.display_name} this link yourself. It works once, for ${TOKEN_TTL_HOURS} hours, and will not be shown again.`,
    link,
  };
}

export async function addCrewMember(
  _previous: CrewLinkFormState,
  formData: FormData,
): Promise<CrewLinkFormState> {
  await requireRole("owner");

  const role = text(formData, "role");

  if (!isRole(role)) {
    return { status: "error", message: "Choose Crew or Owner.", field: "role" };
  }

  const created = await createCrewUser({
    displayName: text(formData, "displayName"),
    username: text(formData, "username"),
    email: text(formData, "email"),
    role,
  });

  if (!created.ok) {
    return { status: "error", message: created.reason, ...(created.field ? { field: created.field } : {}) };
  }

  revalidateUsers();
  return deliverLink(created.id, "invite", "Added.");
}

/** A new link: the invite again if they never set a password, a reset if they did. */
export async function sendPasswordLink(
  _previous: CrewLinkFormState,
  formData: FormData,
): Promise<CrewLinkFormState> {
  await requireRole("owner");

  const user = await getCrewUser(text(formData, "id"));

  if (!user) {
    return { status: "error", message: "That person no longer exists." };
  }

  if (!user.active) {
    return { status: "error", message: "Turn this account on before sending it a link." };
  }

  const answer = await deliverLink(
    user.id,
    user.has_password ? "reset" : "invite",
    user.has_password
      ? "Reset started. Their current password keeps working until they choose a new one."
      : "A new invite replaces the old link.",
  );
  revalidateUsers();
  return answer;
}

export async function setCrewMemberActive(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const session = await requireRole("owner");

  const id = text(formData, "id");
  const turnOn = text(formData, "active") === "true";
  const result = turnOn ? await reactivateUser(id) : await deactivateUser(id, session.userId);

  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  revalidateUsers();
  return {
    status: "success",
    message: turnOn
      ? "Turned on. They can sign in with their password again."
      : "Turned off. They were signed out everywhere, and their password no longer opens the portal.",
  };
}

export async function setCrewMemberRole(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const session = await requireRole("owner");

  const role = text(formData, "role");

  if (!isRole(role)) {
    return { status: "error", message: "Choose Crew or Owner.", field: "role" };
  }

  const result = await changeRole(text(formData, "id"), role, session.userId);

  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  revalidateUsers();
  return {
    status: "success",
    message: "Role changed. They were signed out, and see the new role when they sign in.",
  };
}

export async function turnOffSharedPassword(
  _previous: PortalFormState,
  _formData: FormData,
): Promise<PortalFormState> {
  const session = await requireRole("owner");

  if (session.userId === null) {
    return {
      status: "error",
      message: "You are signed in with the shared password. Sign in with your own owner account first, then turn it off.",
    };
  }

  const result = await disableSharedPassword();

  if (!result.ok) {
    return { status: "error", message: result.reason };
  }

  revalidateUsers();
  return { status: "success", message: "The shared password is off. Only crew accounts open the portal now." };
}
