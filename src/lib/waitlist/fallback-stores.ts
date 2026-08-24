import type { StoreResult, WaitlistStore, WaitlistSignup } from "./types.ts";

/**
 * What happens when there is no database.
 *
 * There are two honest answers and they are not the same answer, so there are
 * two stores.
 *
 * In development, running the site without a database should not mean the
 * waitlist form is untestable. An in-memory store keeps the flow working for
 * the length of the process and says loudly that it is not storage.
 *
 * In production, there is no honest fallback at all. Accepting a signup into a
 * variable that dies with the instance is precisely the "form that discards
 * input" the page specifications forbid, and it is worse than an error because
 * the reader is told it worked. So production without DATABASE_URL reports the
 * failure to the reader and to the logs, and stores nothing.
 */

/**
 * Whether an ephemeral store is allowed to stand in for a real one.
 *
 * `next start` sets NODE_ENV=production, so the Playwright suite looks exactly
 * like production to this code and would otherwise be unrunnable without a
 * database. This is the opt-in that lets it run — and it is the kind of escape
 * hatch that gets switched on "temporarily" in production, so it is nailed shut
 * in the one place that matters: Vercel always sets VERCEL=1, so on the real
 * deployment the flag cannot take effect no matter who sets it.
 *
 * CI does not use this path. It runs a real Postgres service container, so the
 * code under test there is the code that ships.
 */
export function ephemeralStoreAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.VERCEL) {
    return false;
  }
  return env.NODE_ENV !== "production" || env.GUARD_THEORY_ALLOW_EPHEMERAL_STORE === "1";
}

export class MemoryWaitlistStore implements WaitlistStore {
  readonly name = "in-memory (development only)";
  readonly isDurable = false;

  private readonly emails = new Set<string>();
  private warned = false;

  async add(signup: WaitlistSignup): Promise<StoreResult> {
    if (!this.warned) {
      this.warned = true;
      console.warn(
        "[guard-theory] DATABASE_URL is not set: waitlist signups are being kept " +
          "in memory and will be lost when this process exits. Development only.",
      );
    }

    const email = signup.email.toLowerCase();
    const alreadyOnList = this.emails.has(email);
    this.emails.add(email);

    return { ok: true, alreadyOnList };
  }
}

export class UnavailableWaitlistStore implements WaitlistStore {
  readonly name = "unavailable (no DATABASE_URL)";
  readonly isDurable = false;

  async add(_signup: WaitlistSignup): Promise<StoreResult> {
    console.error(
      "[guard-theory] DATABASE_URL is not set in production. A waitlist signup " +
        "was refused rather than accepted and dropped. Set it and redeploy.",
    );
    return { ok: false, reason: "storage-unavailable" };
  }
}
