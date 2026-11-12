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

/**
 * A crew form that may have made a set-password link nobody was emailed. The
 * link is in the state only — never stored, never logged — so it is on screen
 * once, for the owner to hand over in person, and gone on the next submit.
 */
export type CrewLinkFormState = PortalFormState & { link?: string };

export const CREW_LINK_INITIAL_STATE: CrewLinkFormState = { status: "idle", message: "" };
