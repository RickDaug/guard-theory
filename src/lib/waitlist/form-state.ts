import type { FieldErrors } from "./validate.ts";

/**
 * The waitlist form's state shape.
 *
 * This lives outside the "use server" module on purpose: every export from a
 * server-actions file must be an async function, so a plain constant exported
 * from there is stripped and arrives as undefined on the client. That failure
 * is silent until something reads a property off it.
 */
export type WaitlistFormState = {
  status: "idle" | "success" | "error";
  /** Shown above the form and announced. Empty when idle. */
  message: string;
  errors: FieldErrors;
  /** True when the address was already on the list. Changes the wording only. */
  alreadyOnList?: boolean;
};

export const INITIAL_STATE: WaitlistFormState = {
  status: "idle",
  message: "",
  errors: {},
};

/**
 * The confirmation page's state: "idle" until the button is pressed, then one
 * of `ConfirmResult` (src/lib/waitlist/confirm.ts), or "busy" when the caller
 * has pressed it too often. Spelled out here rather than imported, so the
 * client component that reads it pulls in nothing from the server side.
 */
export type ConfirmFormState = {
  status: "idle" | "busy" | "confirmed" | "already" | "expired" | "invalid" | "unavailable";
};

export const INITIAL_CONFIRM_STATE: ConfirmFormState = { status: "idle" };
