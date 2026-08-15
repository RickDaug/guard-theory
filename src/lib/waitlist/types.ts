/**
 * The waitlist domain, defined independently of any mail provider.
 *
 * Nothing in the UI imports a provider SDK. When a real provider is chosen it
 * implements WaitlistStore and is swapped in at one place — see ./index.ts.
 */

export type SleevePreference = "no-preference" | "short" | "long";

export type TrainingExperience =
  | "not-training-yet"
  | "under-a-year"
  | "one-to-three-years"
  | "three-plus-years";

export type ProductInterest = "rash-guards" | "spats" | "shorts" | "accessories";

export type WaitlistSignup = {
  email: string;
  firstName: string;
  trainingExperience?: TrainingExperience;
  sleevePreference?: SleevePreference;
  productInterest: ProductInterest[];
  /** Must be true. Never defaulted, never pre-checked in the UI. */
  consent: true;
  /** Set server-side. Never accepted from the client. */
  submittedAt: string;
};

export type StoreResult =
  | { ok: true; alreadyOnList: boolean }
  | { ok: false; reason: "storage-unavailable" };

export interface WaitlistStore {
  /** Human-readable name, surfaced in logs and in the health check. */
  readonly name: string;
  /** True when this store actually persists somewhere durable. */
  readonly isDurable: boolean;
  add(signup: WaitlistSignup): Promise<StoreResult>;
}
