import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

import { closePool, isDatabaseConfigured, query } from "../../src/lib/db/client.ts";

/**
 * The runner itself, run as a process against throwaway migrations.
 *
 * `migrate-guard.test.ts` proves the judgements; this proves the runner acts on
 * them — above all that a changed migration STOPS the run, which it did not
 * before: it set the exit code and went on to apply everything after it.
 *
 * Order matters here. PGlite serves one connection at a time, so every child
 * process runs BEFORE this process opens its own pool, and the pool is only
 * used at the end to look at what the children did.
 */

const SCRIPT = path.resolve(import.meta.dirname, "..", "..", "scripts", "db", "migrate.mjs");
const configured = isDatabaseConfigured();

function run(dir: string, env: Record<string, string> = {}, args: string[] = []) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    env: { ...process.env, GT_MIGRATIONS_DIR: dir, ...env },
    encoding: "utf8",
    timeout: 60_000,
  });
  return { code: result.status, out: `${result.stdout}\n${result.stderr}` };
}

describe("migration runner: target guard", () => {
  it("refuses a remote host before connecting, and prints the host but not the password", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "gt-migrate-"));
    try {
      // .invalid never resolves (RFC 2606) — and the guard exits before any
      // connection is attempted, which the speed of this test also shows.
      const url = "postgresql://owner:s3cret-pw@db.guardtheory.invalid/neondb";
      const result = run(dir, { DATABASE_URL: url, DATABASE_URL_UNPOOLED: url });
      assert.equal(result.code, 1);
      assert.match(result.out, /database: db\.guardtheory\.invalid/);
      assert.match(result.out, /--production/);
      assert.doesNotMatch(result.out, /s3cret-pw/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("migration runner: against a database", { skip: !configured }, () => {
  const dir = mkdtempSync(path.join(tmpdir(), "gt-migrate-"));
  const A = "zz_runner_test_a.sql";
  const B = "zz_runner_test_b.sql";
  const bodyA = "create table if not exists _gt_runner_a (\n  id int\n);\n";

  after(async () => {
    await query("drop table if exists _gt_runner_a");
    await query("drop table if exists _gt_runner_b");
    await query("delete from _migration where name like 'zz_runner_test_%'");
    await closePool();
    rmSync(dir, { recursive: true, force: true });
  });

  it("applies, accepts a line-ending change, and stops dead on a content change", async () => {
    writeFileSync(path.join(dir, A), bodyA);
    const first = run(dir);
    assert.equal(first.code, 0, first.out);
    assert.match(first.out, /1 migration\(s\) applied/);

    // The same file as a Windows checkout would write it.
    writeFileSync(path.join(dir, A), bodyA.replace(/\n/g, "\r\n"));
    const second = run(dir);
    assert.equal(second.code, 0, second.out);
    assert.match(second.out, /nothing to apply/);

    // A real edit, with a later migration queued behind it.
    writeFileSync(path.join(dir, A), bodyA.replace("id int", "id bigint"));
    writeFileSync(path.join(dir, B), "create table _gt_runner_b (id int);\n");
    const third = run(dir);
    assert.equal(third.code, 1, third.out);
    assert.match(third.out, /has changed since it was applied/);
    assert.match(third.out, /Stopped/);
    assert.doesNotMatch(third.out, new RegExp(`applying ${B}`));

    const status = run(dir, {}, ["--status"]);
    assert.equal(status.code, 1);
    assert.match(status.out, new RegExp(`CHANGED\\s+${A}`));
    assert.match(status.out, new RegExp(`PENDING\\s+${B}`));

    const probe = await query<{ t: string | null }>("select to_regclass('_gt_runner_b') as t");
    assert.equal(probe[0]?.t, null, "the migration after the changed one must not have run");
  });
});
