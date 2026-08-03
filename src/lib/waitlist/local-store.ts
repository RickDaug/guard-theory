import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { StoreResult, WaitlistStore, WaitlistSignup } from "./types.ts";

/**
 * Development fallback. Appends signups to a newline-delimited JSON file under
 * .data/, which is gitignored.
 *
 * This exists so that a form submitted during development is never silently
 * discarded — the brief forbids that, and it is the kind of thing that quietly
 * loses real signups if a provider is misconfigured in production.
 *
 * It is NOT durable in any deployment sense: serverless filesystems are
 * ephemeral, so `isDurable` is false and the UI says so plainly.
 */

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "waitlist.ndjson");

export class LocalFileWaitlistStore implements WaitlistStore {
  readonly name = "local file (.data/waitlist.ndjson)";
  readonly isDurable = false;

  async add(signup: WaitlistSignup): Promise<StoreResult> {
    try {
      await mkdir(DATA_DIR, { recursive: true });

      const alreadyOnList = await this.has(signup.email);
      if (alreadyOnList) {
        return { ok: true, alreadyOnList: true };
      }

      await appendFile(FILE, `${JSON.stringify(signup)}\n`, "utf8");
      return { ok: true, alreadyOnList: false };
    } catch {
      // Deliberately swallows the underlying error rather than surfacing a
      // filesystem path to the caller.
      return { ok: false, reason: "storage-unavailable" };
    }
  }

  private async has(email: string): Promise<boolean> {
    try {
      const contents = await readFile(FILE, "utf8");
      const needle = email.toLowerCase();
      return contents
        .split("\n")
        .filter(Boolean)
        .some((line) => {
          try {
            const parsed = JSON.parse(line) as { email?: string };
            return parsed.email?.toLowerCase() === needle;
          } catch {
            return false;
          }
        });
    } catch {
      return false;
    }
  }
}
