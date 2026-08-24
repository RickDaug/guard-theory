import { isDatabaseConfigured } from "../db/client.ts";
import {
  ephemeralStoreAllowed,
  MemoryWaitlistStore,
  UnavailableWaitlistStore,
} from "./fallback-stores.ts";
import { PostgresWaitlistStore } from "./postgres-store.ts";
import type { WaitlistStore } from "./types.ts";

/**
 * The one place a provider is chosen.
 *
 * This is the seam docs/owner-decisions.md item 7 asked for, and it has now
 * done its job: the store behind it changed from a local file to Postgres and
 * nothing in the UI moved. The action still calls `add()` and still reads
 * `StoreResult`.
 *
 * The mail provider is a separate concern and arrives in Phase 4. Sending mail
 * is not storing a signup, and conflating them is what made the old comment
 * here read as though one blocked the other.
 */
let store: WaitlistStore | null = null;

export function getWaitlistStore(): WaitlistStore {
  // Held across calls because MemoryWaitlistStore's already-on-the-list check
  // is its own state. A fresh instance per request would report every repeat
  // signup as new, and the branch would never be exercised in development.
  if (store) {
    return store;
  }

  if (isDatabaseConfigured()) {
    store = new PostgresWaitlistStore();
  } else {
    // See fallback-stores.ts: development and the test harness keep working,
    // the real deployment refuses rather than accepting a signup it cannot keep.
    store = ephemeralStoreAllowed()
      ? new MemoryWaitlistStore()
      : new UnavailableWaitlistStore();
  }

  return store;
}

export { unsubscribeByToken, type UnsubscribeResult } from "./postgres-store.ts";

export type {
  ProductInterest,
  SleevePreference,
  StoreResult,
  TrainingExperience,
  WaitlistSignup,
  WaitlistStore,
} from "./types.ts";
