import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

/**
 * The weekly restore check's shell, run for real against stand-ins for `curl`
 * (the Neon API) and `docker` (the postgres container).
 *
 * .github/workflows/db-restore-check.yml cannot be run from here: it restores
 * production's backup into a branch of production's project. What can be run
 * is everything else — the checks on the file, the four checks that the
 * scratch branch is not the default before anything is written to it, the
 * comparison of what came back with what the archive holds, the branch limit,
 * and a cleanup that deletes only restore-check/* branches.
 *
 * Needs bash, gpg, sha256sum and jq, which CI's ubuntu runner has. It skips
 * without them, by name, rather than passing on nothing.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const SCRIPT = path.join(ROOT, "scripts/db/restore-verify-ci.sh");
const CLEANUP = path.join(ROOT, "scripts/db/restore-verify-cleanup.sh");
const FAKE_BIN = path.join(ROOT, "tests/fixtures/fake-neon");

function has(tool: string): boolean {
  return spawnSync("bash", ["-c", `command -v ${tool}`], { encoding: "utf8" }).status === 0;
}

const CAN_RUN = has("gpg") && has("sha256sum") && has("jq");
const SKIP = !CAN_RUN && "bash, gpg, sha256sum or jq is not available";

const posix = (p: string) => p.replace(/\\/g, "/");

const API_KEY = "napi_fake_key_for_tests";
const PASSPHRASE = randomBytes(32).toString("hex");
const SCRATCH_PASSWORD = "scratch-password-hunter2";
const SCRATCH_HOST = "ep-scratch-456.us-east-1.aws.neon.tech";
const SCRATCH_URI = `postgresql://neondb_owner:${SCRATCH_PASSWORD}@${SCRATCH_HOST}/neondb?sslmode=require`;
const MAIN_HOST = "ep-main-123.us-east-1.aws.neon.tech";
const BRANCH_NAME = "restore-check/42-1";

const TOC = [
  "210; 1259 16390 TABLE public _migration neondb_owner",
  "211; 1259 16400 TABLE public waitlist_signup neondb_owner",
  "212; 1259 16410 TABLE public order neondb_owner",
  "215; 0 16390 TABLE DATA public _migration neondb_owner",
  "216; 0 16400 TABLE DATA public waitlist_signup neondb_owner",
  "217; 0 16410 TABLE DATA public order neondb_owner",
].join("\n");

// What pg_restore --data-only prints: COPY blocks, one line per row.
const COPY = [
  "SET statement_timeout = 0;",
  "COPY public._migration (name, checksum) FROM stdin;",
  "0001_waitlist_and_contact.sql\tabc",
  "0002_email_log.sql\tdef",
  "\\.",
  "",
  "COPY public.waitlist_signup (id, email) FROM stdin;",
  "1\ta@example.com",
  "2\tb@example.com",
  "3\tc@example.com",
  "\\.",
  "",
  'COPY public."order" (id) FROM stdin;',
  "\\.",
  "",
].join("\n");

const RESTORED = ["_migration|2", "order|0", "waitlist_signup|3"].join("\n");

const branch = (id: string, name: string, isDefault = false) => ({ id, name, default: isDefault });
const MAIN = branch("br-main", "main", true);

function branches(...extra: object[]) {
  return JSON.stringify({ branches: [MAIN, ...extra] });
}

const ENDPOINTS = JSON.stringify({
  endpoints: [{ id: "ep-main", branch_id: "br-main", host: MAIN_HOST }],
});

function created(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    branch: { id: "br-scratch", name: BRANCH_NAME, default: false, parent_id: "br-main" },
    endpoints: [{ id: "ep-scratch", branch_id: "br-scratch", host: SCRATCH_HOST }],
    connection_uris: [{ connection_uri: SCRATCH_URI }],
    ...overrides,
  });
}

const tmp = mkdtempSync(path.join(os.tmpdir(), "gt-restore-"));
const copyFile = path.join(tmp, "copy.sql");
writeFileSync(copyFile, COPY);

const wrapper = path.join(tmp, "with-fakes.sh");
writeFileSync(wrapper, 'export PATH="$(cd "$FAKE_BIN" && pwd):$PATH"\nexec bash "$@"\n');

function stamp(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z`;
}

let artifactCount = 0;

/** An artifact directory as the nightly job leaves it: encrypted file + checksum. */
function artifact(opts: { hoursAgo?: number; passphrase?: string; tamper?: boolean } = {}): string {
  const dir = path.join(tmp, `artifact-${artifactCount++}`);
  mkdirSync(dir, { recursive: true });
  const plain = path.join(dir, "plain.pgc");
  writeFileSync(plain, Buffer.concat([Buffer.from("PGDMP"), randomBytes(5000)]));
  const name = `guard-theory-${stamp(opts.hoursAgo ?? 3)}-pg17.pgc.gpg`;

  const made = spawnSync(
    "bash",
    [
      "-c",
      'cd "$1" && gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 3 --symmetric --cipher-algo AES256 --output "$2" plain.pgc 3<<<"$PP" && rm plain.pgc && sha256sum "$2" > "$2.sha256"',
      "_",
      posix(dir),
      name,
    ],
    { encoding: "utf8", env: { ...process.env, PP: opts.passphrase ?? PASSPHRASE } },
  );
  assert.equal(made.status, 0, made.stderr);

  if (opts.tamper) {
    const file = path.join(dir, name);
    const bytes = readFileSync(file);
    bytes[bytes.length - 1] ^= 0xff;
    writeFileSync(file, bytes);
  }
  return dir;
}

function run(script: string, env: Record<string, string>) {
  const log = path.join(tmp, `log-${randomBytes(4).toString("hex")}`);
  writeFileSync(log, "");
  const result = spawnSync("bash", [posix(wrapper), posix(script)], {
    encoding: "utf8",
    env: {
      ...process.env,
      FAKE_BIN: posix(FAKE_BIN),
      FAKE_LOG: posix(log),
      FAKE_EXPECT_KEY: API_KEY,
      NEON_API_KEY: API_KEY,
      NEON_PROJECT_ID: "cold-resonance-test",
      GITHUB_ENV: "",
      GITHUB_STEP_SUMMARY: "",
      ...env,
    },
  });
  const output = `${result.stdout}${result.stderr}`;
  return { status: result.status, output, calls: readFileSync(log, "utf8") };
}

function check(env: Record<string, string> = {}) {
  return run(SCRIPT, {
    RESTORE_IN_DIR: posix(artifact()),
    BACKUP_PASSPHRASE: PASSPHRASE,
    RESTORE_BRANCH_NAME: BRANCH_NAME,
    RESTORE_CONNECT_WAIT: "0",
    FAKE_BRANCHES: branches(branch("br-p1", "preview/feat/x")),
    FAKE_ENDPOINTS: ENDPOINTS,
    FAKE_CREATED: created(),
    FAKE_TOC: TOC,
    FAKE_COPY: posix(copyFile),
    FAKE_RESTORED: RESTORED,
    ...env,
  });
}

/** Everything but ::add-mask:: lines, which the runner never shows. */
function visible(output: string): string {
  return output
    .split("\n")
    .filter((line) => !line.startsWith("::add-mask::"))
    .join("\n");
}

function assertNoSecret(output: string): void {
  const shown = visible(output);
  assert.ok(!shown.includes(SCRATCH_PASSWORD), "the scratch password is in the log");
  assert.ok(!shown.includes(SCRATCH_HOST), "the scratch host is in the log");
  assert.ok(!shown.includes(MAIN_HOST), "production's host is in the log");
  assert.ok(!shown.includes(PASSPHRASE), "the passphrase is in the log");
  assert.ok(!shown.includes(API_KEY), "the Neon key is in the log");
  assert.ok(!shown.includes("a@example.com"), "a row is in the log");
}

function assertNothingWritten(calls: string): void {
  assert.ok(!calls.includes("drop schema"), "the scratch branch was emptied");
  assert.ok(!calls.includes("pg_restore into"), "something was restored");
}

after(() => rmSync(tmp, { recursive: true, force: true }));

describe("the weekly restore check", { skip: SKIP }, () => {
  it("restores into a new restore-check branch off the default, and finds every count matching", () => {
    const summary = path.join(tmp, "summary.md");
    const envFile = path.join(tmp, "github-env");
    writeFileSync(summary, "");
    writeFileSync(envFile, "");

    const result = check({ GITHUB_STEP_SUMMARY: posix(summary), GITHUB_ENV: posix(envFile) });

    assert.equal(result.status, 0, result.output);
    assertNoSecret(result.output);
    assert.match(result.output, /3 tables restored, every row count matches the archive \(5 rows in all\), 2 migrations recorded/);

    // Masked, in every form.
    assert.ok(result.output.includes(`::add-mask::${SCRATCH_URI}`));
    assert.ok(result.output.includes(`::add-mask::${SCRATCH_PASSWORD}`));
    assert.ok(result.output.includes(`::add-mask::${SCRATCH_HOST}`));

    const post = result.calls.split("\n").find((l) => l.startsWith("POST /branches"));
    assert.ok(post, result.calls);
    const body = JSON.parse(post.slice("POST /branches ".length));
    assert.equal(body.branch.name, BRANCH_NAME);
    assert.equal(body.branch.parent_id, "br-main");
    const expires = Date.parse(body.branch.expires_at);
    assert.ok(expires > Date.now() + 3 * 3600_000 && expires < Date.now() + 5 * 3600_000);

    // Every write went to the scratch host, and none anywhere else.
    const writes = result.calls.split("\n").filter((l) => l.startsWith("docker "));
    assert.ok(writes.some((l) => l.includes("drop schema")));
    assert.ok(writes.some((l) => l.includes("pg_restore into")));
    for (const line of writes) assert.ok(line.includes(SCRATCH_HOST), line);

    assert.equal(readFileSync(envFile, "utf8").trim(), "RESTORE_BRANCH_ID=br-scratch");
    assert.match(readFileSync(summary, "utf8"), /Restore check passed/);
  });

  const refusals: [string, Record<string, string>, RegExp][] = [
    [
      "a branch name outside restore-check/",
      { RESTORE_BRANCH_NAME: "main" },
      /must be named restore-check/,
    ],
    [
      "when all ten branches are taken",
      {
        FAKE_BRANCHES: branches(
          ...Array.from({ length: 9 }, (_, i) => branch(`br-p${i}`, `preview/feat/${i}`)),
        ),
      },
      /no free Neon branch: 10 of 10 are in use \(9 of them preview/,
    ],
    [
      "a new branch that comes back as the default",
      {
        FAKE_CREATED: created({
          branch: { id: "br-scratch", name: BRANCH_NAME, default: true },
        }),
      },
      /says the new branch is the default/,
    ],
    [
      "a new branch with the default's id",
      { FAKE_CREATED: created({ branch: { id: "br-main", name: BRANCH_NAME, default: false } }) },
      /default branch's id/,
    ],
    [
      "a connection string for production's host",
      {
        FAKE_CREATED: created({
          endpoints: [{ id: "ep-main", branch_id: "br-scratch", host: MAIN_HOST }],
          connection_uris: [{ connection_uri: SCRATCH_URI.replace(SCRATCH_HOST, MAIN_HOST) }],
        }),
      },
      /points at the default branch/,
    ],
    [
      "a connection string that is not the new endpoint's",
      {
        FAKE_CREATED: created({
          connection_uris: [{ connection_uri: SCRATCH_URI.replace(SCRATCH_HOST, "ep-other.neon.tech") }],
        }),
      },
      /not for the new branch's endpoint/,
    ],
    [
      "an existing branch with the same name",
      { FAKE_BRANCHES: branches(branch("br-old", BRANCH_NAME)) },
      /already exists/,
    ],
    [
      "a Neon error, saying what Neon said",
      { FAKE_CREATE_STATUS: "422", FAKE_CREATED: '{"message":"branches limit exceeded"}' },
      /Neon answered 422 to POST .*branches limit exceeded/,
    ],
  ];

  refusals.forEach(([name, env, message]) => {
    it(`refuses ${name}, before writing anything`, () => {
      const result = check(env);

      assert.equal(result.status, 1, result.output);
      assert.match(result.output, message);
      assert.match(result.output, /::error::/);
      assertNoSecret(result.output);
      assertNothingWritten(result.calls);
    });
  });

  it("creates nothing when the branch limit is reached", () => {
    const result = check({
      FAKE_BRANCHES: branches(...Array.from({ length: 9 }, (_, i) => branch(`b${i}`, `preview/${i}`))),
    });
    assert.equal(result.status, 1);
    assert.ok(!result.calls.includes("POST"), result.calls);
  });

  it("refuses a backup older than three days: the nightly job has stopped", () => {
    const result = check({ RESTORE_IN_DIR: posix(artifact({ hoursAgo: 80 })) });
    assert.equal(result.status, 1);
    assert.match(result.output, /80 hours old/);
    assert.ok(!result.calls.includes("/branches"), "Neon was called for a stale backup");
  });

  it("refuses a file that does not match its checksum", () => {
    const result = check({ RESTORE_IN_DIR: posix(artifact({ tamper: true })) });
    assert.equal(result.status, 1);
    assert.match(result.output, /does not match its checksum/);
  });

  it("refuses a file encrypted with another passphrase, and says why that matters", () => {
    const result = check({
      RESTORE_IN_DIR: posix(artifact({ passphrase: randomBytes(32).toString("hex") })),
    });
    assert.equal(result.status, 1);
    assert.match(result.output, /did not decrypt with BACKUP_PASSPHRASE/);
    assertNoSecret(result.output);
  });

  it("fails when a restored table's row count differs from the archive's, naming only the table", () => {
    const result = check({ FAKE_RESTORED: ["_migration|2", "order|0", "waitlist_signup|2"].join("\n") });
    assert.equal(result.status, 1);
    assert.match(result.output, /row counts differ from the archive for: waitlist_signup/);
    assertNoSecret(result.output);
  });

  it("fails when a table did not come back", () => {
    const result = check({ FAKE_RESTORED: ["_migration|2", "waitlist_signup|3"].join("\n") });
    assert.equal(result.status, 1);
    assert.match(result.output, /Missing: order/);
  });

  it("fails when pg_restore fails, without repeating the connection string", () => {
    const result = check({
      FAKE_RESTORE_ERROR: `pg_restore: error: connection to "${SCRATCH_HOST}" failed for ${SCRATCH_URI}`,
    });
    assert.equal(result.status, 1);
    assert.match(result.output, /The backup does not restore/);
    assertNoSecret(result.output);
  });

  it("fails when _migration records more migrations than the repository has", () => {
    const dir = path.join(tmp, "one-migration");
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "0001_only.sql"), "");
    const result = check({ RESTORE_MIGRATIONS_DIR: posix(dir) });
    assert.equal(result.status, 1);
    assert.match(result.output, /records 2 migrations but the repository has 1/);
  });
});

describe("the restore check's cleanup", { skip: SKIP }, () => {
  const all = branches(
    branch("br-p1", "preview/feat/x"),
    branch("br-old", "restore-check/7-1"),
    branch("br-scratch", BRANCH_NAME),
    // Named like ours, but the default. Never deleted.
    branch("br-weird", "restore-check/default", true),
  );

  it("deletes every restore-check branch that is not the default, and nothing else", () => {
    const result = run(CLEANUP, { FAKE_BRANCHES: all, RESTORE_BRANCH_ID: "br-scratch" });

    assert.equal(result.status, 0, result.output);
    const deletes = result.calls
      .split("\n")
      .filter((l) => l.startsWith("DELETE"))
      .map((l) => l.trim());
    assert.deepEqual(deletes.sort(), ["DELETE /branches/br-old", "DELETE /branches/br-scratch"]);
  });

  it("refuses to delete an id that is not a restore-check branch", () => {
    const result = run(CLEANUP, { FAKE_BRANCHES: all, RESTORE_BRANCH_ID: "br-main" });

    assert.equal(result.status, 1);
    assert.match(result.output, /not a restore-check branch/);
    assert.ok(!result.calls.includes("DELETE"), result.calls);
  });

  it("is quiet when there is nothing to do", () => {
    const result = run(CLEANUP, { FAKE_BRANCHES: branches() });
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /no restore-check branches/);
  });

  it("warns and fails, rather than pretending, when a delete keeps being refused", () => {
    const result = run(CLEANUP, {
      FAKE_BRANCHES: all,
      FAKE_DELETE_STATUS: "423",
      CLEANUP_TRIES: "2",
      CLEANUP_WAIT: "0",
    });
    assert.equal(result.status, 1);
    assert.match(result.output, /::warning::.*expires_at will remove it/);
  });
});
