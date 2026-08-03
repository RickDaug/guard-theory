import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Append-only newline-delimited JSON, under a gitignored .data/ directory.
 *
 * The development fallback for anything that would otherwise be sent to a
 * third-party service. It exists so a submitted form is never silently
 * discarded while a provider is unconfigured — which is both a requirement of
 * the brief and the failure mode that quietly loses real messages in
 * production.
 *
 * Not durable in any deployment sense: serverless filesystems are ephemeral.
 * Callers surface that to the reader rather than hiding it.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

export class NdjsonStore<T extends Record<string, unknown>> {
  constructor(private readonly fileName: string) {}

  get filePath(): string {
    return path.join(DATA_DIR, this.fileName);
  }

  async append(record: T): Promise<boolean> {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      await appendFile(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
      return true;
    } catch {
      // Swallows the underlying error rather than surfacing a filesystem path.
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
      return false;
    }
  }
}
