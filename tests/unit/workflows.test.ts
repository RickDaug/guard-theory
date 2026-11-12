import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

/**
 * Static checks on .github/workflows. This repository is public, and two of
 * its workflows hold production credentials (BACKUP_DATABASE_URL,
 * NEON_API_KEY). Security audit 2026-09-29, S3-7 and S3-8.
 */

const DIR = path.resolve(import.meta.dirname, "../../.github/workflows");
const workflows = readdirSync(DIR)
  .filter((f) => /\.ya?ml$/.test(f))
  .map((f) => ({ file: f, text: readFileSync(path.join(DIR, f), "utf8") }));

describe("workflows", () => {
  it("are found", () => {
    assert.ok(workflows.length >= 4, `only ${workflows.length} workflows found`);
  });

  it("pin every third-party action to a full commit SHA, with the version beside it", () => {
    // A tag can be moved to any commit by whoever controls the action's
    // repository; a SHA cannot. The comment is what Dependabot updates and
    // what a reader checks.
    const problems: string[] = [];
    for (const { file, text } of workflows) {
      for (const line of text.split("\n")) {
        const m = /^\s*(?:-\s*)?uses:\s*(\S+)(.*)$/.exec(line);
        if (!m) continue;
        const [, ref, rest] = m;
        if (ref!.startsWith("./")) continue;
        if (!/^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/.test(ref!) || !/#\s*v\d+(\.\d+){0,2}\s*$/.test(rest!)) {
          problems.push(`${file}: ${line.trim()}`);
        }
      }
    }
    assert.deepEqual(problems, []);
  });

  it("keep the encrypted production dump for at most fourteen days", () => {
    const backup = workflows.find((w) => w.file === "db-backup.yml");
    assert.ok(backup, "db-backup.yml is missing");
    const days = [...backup.text.matchAll(/retention-days:\s*(\d+)/g)].map((m) => Number(m[1]));
    assert.ok(days.length > 0, "db-backup.yml sets no retention-days, so the repository default (up to 90) applies");
    for (const d of days) assert.ok(d <= 14, `retention-days: ${d}`);
  });
});
