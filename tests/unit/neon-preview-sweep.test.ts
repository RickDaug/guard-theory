import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

/**
 * The scheduled preview-branch sweep, run for real against the stand-in `curl`
 * restore-verify-ci.test.ts already uses for the Neon API.
 *
 * Every preview branch is a fork of production's customer data, so this is
 * the job that decides when a copy of it stops existing — and a job that can
 * delete Neon branches. Both halves are checked: what it removes, and that it
 * never touches the default branch, anything outside preview/*, or anything at
 * all when the list of git branches it was handed is not believable.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const SCRIPT = path.join(ROOT, "scripts/db/neon-preview-sweep.sh");
const FAKE_BIN = path.join(ROOT, "tests/fixtures/fake-neon");

function has(tool: string): boolean {
  return spawnSync("bash", ["-c", `command -v ${tool}`], { encoding: "utf8" }).status === 0;
}

const SKIP = !has("jq") && "bash or jq is not available";
const posix = (p: string) => p.replace(/\\/g, "/");
const API_KEY = "napi_fake_key_for_sweep_tests";

const tmp = mkdtempSync(path.join(os.tmpdir(), "gt-sweep-"));
after(() => rmSync(tmp, { recursive: true, force: true }));

const wrapper = path.join(tmp, "with-fakes.sh");
writeFileSync(wrapper, 'export PATH="$(cd "$FAKE_BIN" && pwd):$PATH"\nexec bash "$@"\n');

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

type Branch = { id: string; name: string; default?: boolean; created_at?: string };

function file(lines: string[]): string {
  const p = path.join(tmp, `list-${randomBytes(4).toString("hex")}`);
  writeFileSync(p, lines.length ? `${lines.join("\n")}\n` : "");
  return posix(p);
}

function sweep(opts: {
  branches: Branch[];
  live: string[];
  open?: string[];
  closed?: string[];
  env?: Record<string, string>;
}) {
  const log = path.join(tmp, `log-${randomBytes(4).toString("hex")}`);
  writeFileSync(log, "");
  const body = JSON.stringify({
    branches: opts.branches.map((b) => ({
      default: false,
      created_at: daysAgo(1),
      ...b,
    })),
  });
  const result = spawnSync("bash", [posix(wrapper), posix(SCRIPT)], {
    encoding: "utf8",
    env: {
      ...process.env,
      FAKE_BIN: posix(FAKE_BIN),
      FAKE_LOG: posix(log),
      FAKE_EXPECT_KEY: API_KEY,
      FAKE_BRANCHES: body,
      NEON_API_KEY: API_KEY,
      NEON_PROJECT_ID: "cold-resonance-test",
      LIVE_BRANCHES_FILE: file(opts.live),
      OPEN_PR_FILE: file(opts.open ?? []),
      CLOSED_PR_FILE: file(opts.closed ?? []),
      ...opts.env,
    },
  });
  const deletes = readFileSync(log, "utf8")
    .split("\n")
    .filter((l) => l.startsWith("DELETE"))
    .map((l) => l.trim().replace("DELETE /branches/", ""))
    .sort();
  return { status: result.status, output: `${result.stdout}${result.stderr}`, deletes };
}

describe("neon-preview-sweep.sh", { skip: SKIP }, () => {
  const main: Branch = { id: "br-main", name: "main", default: true };

  it("deletes a preview whose git branch is gone, and one whose pull request closed", () => {
    const result = sweep({
      branches: [
        main,
        { id: "br-gone", name: "preview/feat/deleted-without-pr" },
        { id: "br-closed", name: "preview/feat/merged" },
        { id: "br-open", name: "preview/feat/in-review" },
      ],
      live: ["main", "feat/merged", "feat/in-review"],
      open: ["feat/in-review"],
      closed: ["feat/merged"],
    });

    assert.equal(result.status, 0, result.output);
    assert.deepEqual(result.deletes, ["br-closed", "br-gone"]);
    assert.match(result.output, /deleted preview\/feat\/deleted-without-pr \(the git branch is gone\)/);
    assert.match(result.output, /kept preview\/feat\/in-review/);
  });

  it("keeps an open pull request's preview even when an older pull request from the same branch closed", () => {
    const result = sweep({
      branches: [main, { id: "br-reopened", name: "preview/fix/again" }],
      live: ["main", "fix/again"],
      open: ["fix/again"],
      closed: ["fix/again"],
    });
    assert.equal(result.status, 0, result.output);
    assert.deepEqual(result.deletes, []);
  });

  it("deletes a branch with no pull request only once it is past the age cap", () => {
    const result = sweep({
      branches: [
        main,
        { id: "br-young", name: "preview/spike/new", created_at: daysAgo(2) },
        { id: "br-old", name: "preview/spike/forgotten", created_at: daysAgo(30) },
      ],
      live: ["main", "spike/new", "spike/forgotten"],
    });
    assert.equal(result.status, 0, result.output);
    assert.deepEqual(result.deletes, ["br-old"]);
  });

  it("never touches the default branch or anything outside preview/*", () => {
    const result = sweep({
      branches: [
        main,
        { id: "br-restore", name: "restore-check/42-1" },
        { id: "br-default-preview", name: "preview/odd", default: true },
      ],
      live: ["main"],
    });
    assert.equal(result.status, 0, result.output);
    assert.deepEqual(result.deletes, []);
  });

  it("deletes nothing when the git branch list does not contain the default branch", () => {
    const result = sweep({
      branches: [main, { id: "br-a", name: "preview/feat/a" }],
      live: [],
    });
    assert.equal(result.status, 1);
    assert.match(result.output, /refusing to trust it/);
    assert.deepEqual(result.deletes, []);
  });

  it("says so and fails when Neon refuses a delete", () => {
    const result = sweep({
      branches: [main, { id: "br-a", name: "preview/feat/a" }],
      live: ["main"],
      env: { FAKE_DELETE_STATUS: "423" },
    });
    assert.equal(result.status, 1);
    assert.match(result.output, /::warning::preview sweep: could not delete preview\/feat\/a/);
  });

  it("prints no key", () => {
    const result = sweep({ branches: [main, { id: "br-a", name: "preview/feat/a" }], live: ["main"] });
    assert.ok(!result.output.includes(API_KEY));
  });
});
