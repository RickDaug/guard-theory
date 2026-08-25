import { NdjsonStore } from "@/lib/storage/ndjson-store";
import type { StoreResult, WaitlistStore, WaitlistSignup } from "./types.ts";

/**
 * Development and pre-launch fallback.
 *
 * This used to carry its own copy of the filesystem logic, and its own copy of
 * the bug: it wrote under `process.cwd()/.data`, which is read-only on a
 * serverless runtime, so every signup in production failed and the catch block
 * swallowed the error. Three separate audits proved it by driving the live
 * action. Sharing NdjsonStore means that class of divergence cannot recur.
 *
 * `isDurable` is false and the caller is expected to act on that. It is not
 * storage; it is a floor that stops submissions failing silently until a real
 * provider is connected — see docs/owner-decisions.md item 6.
 */

type StoredSignup = WaitlistSignup & Record<string, unknown>;

export class LocalFileWaitlistStore implements WaitlistStore {
  readonly name = "local file (temp directory)";
  readonly isDurable = false;

  private readonly store = new NdjsonStore<StoredSignup>("waitlist.ndjson");

  async add(signup: WaitlistSignup): Promise<StoreResult> {
    const alreadyOnList = await this.store.hasMatch("email", signup.email);

    if (alreadyOnList) {
      return { ok: true, alreadyOnList: true };
    }

    const written = await this.store.append(signup as StoredSignup);

    if (!written) {
      return { ok: false, reason: "storage-unavailable" };
    }

    return { ok: true, alreadyOnList: false };
  }
}
