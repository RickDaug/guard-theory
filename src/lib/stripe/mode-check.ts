import { createHash } from "node:crypto";
import { stripe, stripeKeyRefusal, stripeMode, type StripeMode } from "./client.ts";

/**
 * Does Stripe agree with the key about which mode we are in?
 *
 * `stripeMode()` reads the key's prefix, which cannot disagree with the key —
 * but a prefix is still our reading of a string, and commerce-plan §7 promises
 * it is cross-checked against Stripe itself. `balance.retrieve()` is the
 * cheapest authenticated call there is, and every Stripe object carries
 * `livemode`, so one call answers the only question that matters: will money
 * really move?
 *
 * It is asked once per CACHE_MINUTES per server instance, not on every portal
 * page: the answer only changes when the key does, and the key's hash is part
 * of the cache so a rotated key is asked about at once. A failed call is kept
 * for a minute only, so a blip does not hide the answer for ten.
 *
 * It never throws, and it never logs or returns the key. With no key, or with a
 * live key refused on a preview, it does not call Stripe at all and says
 * "not-connected" — that state already has its own loud banner.
 */

export const CACHE_MINUTES = 10;
export const FAILURE_CACHE_MINUTES = 1;
/** A portal page waits on this. Stripe's default client may wait 8s × 3. */
export const CHECK_TIMEOUT_MS = 3_000;

export type ModeCheck =
  | { state: "not-connected" }
  | { state: "match"; mode: "test" | "live"; checkedAt: Date }
  | { state: "mismatch"; keyMode: StripeMode; stripeSays: "test" | "live"; checkedAt: Date }
  | { state: "unreachable"; keyMode: StripeMode; error: string; checkedAt: Date };

export type ModeCheckDeps = {
  env: NodeJS.ProcessEnv;
  now: () => Date;
  /** Resolves to Stripe's `livemode` for the configured key. */
  livemode: () => Promise<boolean>;
};

const REAL: ModeCheckDeps = {
  env: process.env,
  now: () => new Date(),
  livemode: async () =>
    (await stripe().balance.retrieve({}, { timeout: CHECK_TIMEOUT_MS, maxNetworkRetries: 0 }))
      .livemode,
};

let cached: { fingerprint: string; until: number; result: ModeCheck } | null = null;
let inFlight: { fingerprint: string; promise: Promise<ModeCheck> } | null = null;

/** For tests. */
export function resetModeCheckCache(): void {
  cached = null;
  inFlight = null;
}

/** The error's name, never its message: a Stripe auth error can echo the key. */
function errorName(error: unknown): string {
  if (error && typeof error === "object") {
    const record = error as { type?: unknown; name?: unknown };
    if (typeof record.type === "string" && record.type) return record.type;
    if (typeof record.name === "string" && record.name) return record.name;
  }
  return "Error";
}

export async function checkStripeMode(overrides: Partial<ModeCheckDeps> = {}): Promise<ModeCheck> {
  const deps: ModeCheckDeps = { ...REAL, ...overrides };
  const key = deps.env.STRIPE_SECRET_KEY?.trim() ?? "";

  if (!key || stripeKeyRefusal(deps.env) !== null) {
    return { state: "not-connected" };
  }

  const keyMode = stripeMode(deps.env);
  const fingerprint = createHash("sha256").update(key).digest("hex");
  const nowMs = deps.now().getTime();

  if (cached && cached.fingerprint === fingerprint && nowMs < cached.until) {
    return cached.result;
  }

  // Concurrent renders share one call rather than each asking Stripe.
  if (inFlight && inFlight.fingerprint === fingerprint) {
    return inFlight.promise;
  }

  const promise = (async (): Promise<ModeCheck> => {
    const checkedAt = deps.now();
    let result: ModeCheck;

    try {
      const live = await deps.livemode();
      const stripeSays = live ? "live" : "test";
      result =
        stripeSays === keyMode
          ? { state: "match", mode: stripeSays, checkedAt }
          : { state: "mismatch", keyMode, stripeSays, checkedAt };
    } catch (error) {
      result = { state: "unreachable", keyMode, error: errorName(error), checkedAt };
      console.warn(`[guard-theory] could not ask Stripe which mode the key is in: ${result.error}`);
    }

    const minutes = result.state === "unreachable" ? FAILURE_CACHE_MINUTES : CACHE_MINUTES;
    cached = { fingerprint, until: checkedAt.getTime() + minutes * 60_000, result };
    return result;
  })();

  inFlight = { fingerprint, promise };

  try {
    return await promise;
  } finally {
    if (inFlight?.promise === promise) {
      inFlight = null;
    }
  }
}

/** One line for the Settings screen. */
export function describeModeCheck(check: ModeCheck): { value: string; problem: boolean } {
  switch (check.state) {
    case "not-connected":
      return { value: "Not connected", problem: false };
    case "match":
      return { value: `Stripe says: ${check.mode} — matches the key`, problem: false };
    case "mismatch":
      return {
        value: `MISMATCH — the key reads as ${check.keyMode}, Stripe says ${check.stripeSays}`,
        problem: true,
      };
    case "unreachable":
      return { value: `Could not ask Stripe (${check.error})`, problem: true };
  }
}
