import { appendFile, mkdir, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/**
 * Append-only newline-delimited JSON.
 *
 * WHY THIS IS NOT `process.cwd()/.data` ANY MORE
 *
 * It was, and it meant every waitlist signup and every contact message failed
 * in production. A serverless filesystem is read-only outside the temp
 * directory, so `mkdir` threw, the catch swallowed it, and the reader was told
 * "we could not save your details just now". The only conversion point on the
 * site had a zero per cent success rate and nothing reported it, because there
 * was no logging anywhere.
 *
 * So: write under the OS temp directory when the working directory is not
 * writable, and say loudly in the logs which one is in use.
 *
 * THIS IS STILL NOT DURABLE. A temp directory does not survive a cold start or
 * a redeploy, and there is no second instance sharing it. It is a floor that
 * stops submissions being lost *silently and immediately*; it is not storage.
 * Connect a real provider before advertising the site — see
 * docs/owner-decisions.md item 6.
 */

function resolveDataDir(): string {
  // Vercel and most serverless runtimes expose exactly one writable path.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return path.join(os.tmpdir(), "guard-theory-data");
  }
  return path.join(process.cwd(), ".data");
}

export class NdjsonStore<T extends Record<string, unknown>> {
  private readonly dataDir: string;

  constructor(private readonly fileName: string) {
    this.dataDir = resolveDataDir();
  }

  get filePath(): string {
    return path.join(this.dataDir, this.fileName);
  }

  /** True only when the destination survives a restart. It does not, yet. */
  get isDurable(): boolean {
    return false;
  }

  async append(record: T): Promise<boolean> {
    try {
      await mkdir(this.dataDir, { recursive: true });
      await appendFile(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
      return true;
    } catch (error) {
      // Never swallow this again. A submission failing in silence is how the
      // original defect survived to production.
      console.error(
        `[guard-theory] failed to append to ${this.filePath}:`,
        error instanceof Error ? error.message : error,
      );
      return false;
    }
  }

  /** True when any stored record has `field` equal to `value`, case-insensitively. */
  async hasMatch(field: keyof T & string, value: string): Promise<boolean> {
    try {
      const contents = await readFile(this.filePath, "utf8");
      const needle = value.toLowerCase();

      return contents
        .split("\n")
        .filter(Boolean)
        .some((line) => {
          try {
            const parsed = JSON.parse(line) as Record<string, unknown>;
            const stored = parsed[field];
            return typeof stored === "string" && stored.toLowerCase() === needle;
          } catch {
            return false;
          }
        });
    } catch {
      // A missing file is the normal first-write case, not an error.
      return false;
    }
  }
}
