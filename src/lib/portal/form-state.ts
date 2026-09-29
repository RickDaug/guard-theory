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
  /**
   * The `name` of the input an error is about, when it is about one. The form
   * marks that input `aria-invalid` and points its `aria-describedby` at the
   * message, so a screen reader reads the reason with the field rather than
   * only once, as an announcement, and never again.
   */
  field?: string;
};

export const PORTAL_INITIAL_STATE: PortalFormState = { status: "idle", message: "" };
