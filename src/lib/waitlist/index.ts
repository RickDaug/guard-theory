import { LocalFileWaitlistStore } from "./local-store.ts";
import type { WaitlistStore } from "./types.ts";

/**
 * The one place a provider is chosen.
 *
 * No mail provider is configured yet — see docs/owner-decisions.md item 6. Until
 * one is, signups go to a local file so nothing is discarded, and the UI tells
 * the reader the truth about what happened rather than showing a success state
 * that means nothing.
 *
 * To add a provider: implement WaitlistStore, and return it here when its
 * credentials are present. Nothing in the UI needs to change.
 */
export function getWaitlistStore(): WaitlistStore {
  // Example of the shape this takes once a provider exists:
  //
  //   if (process.env.RESEND_API_KEY) {
  //     return new ResendWaitlistStore(process.env.RESEND_API_KEY);
  //   }

  return new LocalFileWaitlistStore();
}

export type {
  ProductInterest,
  SleevePreference,
  StoreResult,
  TrainingExperience,
  WaitlistSignup,
  WaitlistStore,
} from "./types.ts";
