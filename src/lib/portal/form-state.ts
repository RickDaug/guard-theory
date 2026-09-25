/**
 * Portal form state.
 *
 * Kept out of every "use server" file on purpose: a constant exported from one
 * of those is stripped and arrives `undefined` on the client, with no error
 * until something reads a property off it. That has cost this codebase time
 * before — see AGENTS.md.
 */

export type PortalFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const PORTAL_INITIAL_STATE: PortalFormState = { status: "idle", message: "" };
