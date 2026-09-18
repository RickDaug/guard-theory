import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";

/**
 * The scheduled backup's shell, run for real against a stand-in `docker`.
 *
 * .github/workflows/db-backup.yml cannot be run from here, and should not be:
 * it dumps production. What can be run is everything it does apart from
 * talking to Postgres — the refusals, the encryption, the check that the file
 * decrypts, and the guard that stands between a dump and a public download
 * link. tests/fixtures/fake-docker/docker answers for the container.
 *
 * Needs bash and gpg, which CI's ubuntu runner and Git for Windows both have.
 * It skips without them, by name, rather than passing on nothing.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const SCRIPT = path.join(ROOT, "scripts/db/backup-ci.sh");
const GUARD = path.join(ROOT, "scripts/db/backup-ci-guard.sh");
const FAKE_BIN = path.join(ROOT, "tests/fixtures/fake-docker");

function has(tool: string): boolean {
  return spawnSync("bash", ["-c", `command -v ${tool}`], { encoding: "utf8" }).status === 0;
}

const CAN_RUN = has("gpg") && has("sha256sum");
const SKIP = !CAN_RUN && "bash, gpg or sha256sum is not available";

const PASSWORD = "hunter2-the-database-password";
const HOST = "ep-cool-name-123.us-west-2.aws.neon.tech";
const DB_URL = `postgresql://owner:${PASSWORD}@${HOST}/neondb?sslmode=require`;
const PASSPHRASE = randomBytes(32).toString("hex");

const TOC = [
  "215; 0 16400 TABLE DATA public _migration neondb_owner",
  "216; 0 16410 TABLE DATA public waitlist_signup neondb_owner",
  "217; 0 16420 TABLE DATA public order neondb_owner",
].join("\n");

// bash on Windows is given forward slashes everywhere.
const posix = (p: string) => p.replace(/\\/g, "/");

const tmp = mkdtempSync(path.join(os.tmpdir(), "gt-backup-"));
const dump = path.join(tmp, "dump.pgc");
writeFileSync(dump, Buffer.concat([Buffer.from("PGDMP"), randomBytes(20_000)]));

// The stand-in goes first on PATH from INSIDE bash, so the separator and the
// drive-letter form are whatever this bash uses.
const wrapper = path.join(tmp, "with-fake-docker.sh");
writeFileSync(wrapper, 'export PATH="$(cd "$FAKE_BIN" && pwd):$PATH"\nexec bash "$1"\n');

function run(script: string, args: string[], env: Record<string, string>) {
  const result = spawnSync("bash", [posix(script), ...args.map(posix)], {
    encoding: "utf8",
    env: { ...process.env, FAKE_BIN: posix(FAKE_BIN), ...env },
  });

  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

function backup(env: Record<string, string>, outDir: string) {
  return run(wrapper, [SCRIPT], {
    FAKE_VERSION: "170005",
    FAKE_DUMP: posix(dump),
    FAKE_TOC: TOC,
    BACKUP_OUT_DIR: posix(outDir),
    // Inherited values must not decide a test.
    BACKUP_DATABASE_URL: "",
    BACKUP_PASSPHRASE: "",
    ...env,
  });
}

function assertNoSecret(output: string): void {
  assert.ok(!output.includes(PASSWORD), "the database password is in the log");
  assert.ok(!output.includes(HOST), "the database host is in the log");
  assert.ok(!output.includes(PASSPHRASE), "the passphrase is in the log");
}

function sha256(command: string, file: string, env: Record<string, string> = {}): string {
  const result = spawnSync("bash", ["-c", command, "_", posix(file)], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  return result.stdout.trim().split(/\s+/)[0] ?? "";
}

after(() => rmSync(tmp, { recursive: true, force: true }));

describe("the scheduled backup", { skip: SKIP }, () => {
  it("writes one encrypted file that decrypts to the dump, and the guard passes it", () => {
    const out = path.join(tmp, "happy");
    const result = backup({ BACKUP_DATABASE_URL: DB_URL, BACKUP_PASSPHRASE: PASSPHRASE }, out);

    assert.equal(result.status, 0, result.output);
    assertNoSecret(result.output);
    assert.match(result.output, /dumping with postgres:17-alpine/);

    const files = readdirSync(out).sort();
    assert.equal(files.length, 2);
    assert.match(files[0]!, /^guard-theory-.*-pg17\.pgc\.gpg$/);
    assert.match(files[1]!, /\.gpg\.sha256$/);

    const encrypted = readFileSync(path.join(out, files[0]!));
    assert.notEqual(encrypted.subarray(0, 5).toString("latin1"), "PGDMP");
    assert.ok(
      !encrypted.includes(readFileSync(dump).subarray(5, 64)),
      "the dump is not inside it in the clear",
    );

    const decrypted = sha256(
      'gpg --batch --quiet --pinentry-mode loopback --passphrase-fd 3 --decrypt "$1" 3<<<"$PASSPHRASE" | sha256sum',
      path.join(out, files[0]!),
      { PASSPHRASE },
    );
    assert.equal(decrypted.length, 64);
    assert.equal(decrypted, sha256('sha256sum < "$1"', dump));

    const guard = run(GUARD, [out], {});
    assert.equal(guard.status, 0, guard.output);
  });

  it("follows the server's version rather than assuming one", () => {
    const result = backup(
      { BACKUP_DATABASE_URL: DB_URL, BACKUP_PASSPHRASE: PASSPHRASE, FAKE_VERSION: "160009" },
      path.join(tmp, "pg16"),
    );

    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /dumping with postgres:16-alpine/);
  });

  const refusals: [string, Record<string, string>, RegExp][] = [
    ["a missing URL", { BACKUP_PASSPHRASE: PASSPHRASE }, /BACKUP_DATABASE_URL secret is not set/],
    ["a missing passphrase", { BACKUP_DATABASE_URL: DB_URL }, /BACKUP_PASSPHRASE secret is not set/],
    [
      "a short passphrase",
      { BACKUP_DATABASE_URL: DB_URL, BACKUP_PASSPHRASE: "correct horse" },
      /shorter than 32/,
    ],
    [
      "the pooled host",
      {
        BACKUP_DATABASE_URL: DB_URL.replace("-123.", "-123-pooler."),
        BACKUP_PASSPHRASE: PASSPHRASE,
      },
      /POOLED host/,
    ],
    [
      "a server it cannot reach",
      {
        BACKUP_DATABASE_URL: DB_URL,
        BACKUP_PASSPHRASE: PASSPHRASE,
        FAKE_VERSION: "",
        FAKE_CONNECT_ERROR: `connection to server at "${HOST}" (10.0.0.1), port 5432 failed`,
      },
      /could not connect/,
    ],
    [
      "a pg_dump that fails, without repeating the URL it was given",
      {
        BACKUP_DATABASE_URL: DB_URL,
        BACKUP_PASSPHRASE: PASSPHRASE,
        FAKE_DUMP_ERROR: `pg_dump: error: connection to "${HOST}" failed for ${DB_URL}`,
      },
      /pg_dump failed/,
    ],
    [
      "an archive without the tables production has",
      {
        BACKUP_DATABASE_URL: DB_URL,
        BACKUP_PASSPHRASE: PASSPHRASE,
        FAKE_TOC: "215; 0 16400 TABLE DATA public _migration neondb_owner",
      },
      /no data entry for "waitlist_signup"/,
    ],
  ];

  refusals.forEach(([name, env, message], index) => {
    it(`refuses ${name}, and leaves nothing to upload`, () => {
      const out = path.join(tmp, `refuse-${index}`);
      const result = backup(env, out);

      assert.equal(result.status, 1, result.output);
      assert.match(result.output, message);
      assert.match(result.output, /::error::/);
      assertNoSecret(result.output);
      assert.ok(!existsSync(out) || readdirSync(out).length === 0);
    });
  });

  it("refuses a dump that is suspiciously small", () => {
    const tiny = path.join(tmp, "tiny.pgc");
    writeFileSync(tiny, "PGDMP and not much else");

    const out = path.join(tmp, "tiny-out");
    const result = backup(
      { BACKUP_DATABASE_URL: DB_URL, BACKUP_PASSPHRASE: PASSPHRASE, FAKE_DUMP: posix(tiny) },
      out,
    );

    assert.equal(result.status, 1);
    assert.match(result.output, /under the 4096-byte floor/);
    assert.ok(!existsSync(out));
  });
});

describe("the guard before the upload", { skip: SKIP }, () => {
  it("refuses a plaintext dump that has been given a .gpg name, and removes it", () => {
    const dir = path.join(tmp, "guard-renamed");
    mkdirSync(dir, { recursive: true });
    copyFileSync(dump, path.join(dir, "guard-theory.pgc.gpg"));

    const result = run(GUARD, [dir], {});

    assert.equal(result.status, 1);
    assert.match(result.output, /REFUSING TO UPLOAD/);
    assert.ok(!existsSync(dir), "nothing is left where an upload step could find it");
  });

  it("refuses a plaintext file sitting beside a properly encrypted one", () => {
    const dir = path.join(tmp, "guard-stray");
    const made = backup({ BACKUP_DATABASE_URL: DB_URL, BACKUP_PASSPHRASE: PASSPHRASE }, dir);
    assert.equal(made.status, 0, made.output);

    copyFileSync(dump, path.join(dir, "dump.pgc"));

    const result = run(GUARD, [dir], {});
    assert.equal(result.status, 1);
    assert.match(result.output, /dump\.pgc is not a \.gpg file/);
    assert.ok(!existsSync(dir));
  });

  it("refuses a .gpg file that is not what gpg --symmetric writes", () => {
    const dir = path.join(tmp, "guard-junk");
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, "x.gpg"), "name,address\nSam,1 Test Street\n");

    const result = run(GUARD, [dir], {});
    assert.equal(result.status, 1);
    assert.match(result.output, /does not begin like a gpg --symmetric file/);
  });

  it("refuses an empty directory", () => {
    const dir = path.join(tmp, "guard-empty");
    mkdirSync(dir, { recursive: true });

    assert.equal(run(GUARD, [dir], {}).status, 1);
  });
});
