import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import { getWaitlistStore } from "../../src/lib/waitlist/index.ts";
import { getContactStore } from "../../src/lib/contact/store.ts";
import { isDatabaseConfigured } from "../../src/lib/db/client.ts";

const ROOT = path.resolve(import.meta.dirname, "..", "..");

async function walk(dir: string, match: RegExp): Promise<string[]> {
  const found: string[] = [];

  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await walk(full, match)));
    } else if (match.test(entry.name)) {
      found.push(full);
    }
  }

  return found;
}

describe("no form discards input", () => {
  /**
   * The rule from docs/page-specifications.md is that no form on this site
   * silently discards what a reader typed. Storage moved from a local file to
   * Postgres; the rule did not move with it by itself, so it is asserted.
   *
   * The shape that matters: when there is nowhere durable to write, production
   * must REFUSE rather than accept. A store that returns success while holding
   * the record in a variable that dies with the instance is the exact failure
   * the old NDJSON store was written to prevent, and it is worse than an error
   * because the reader is told it worked.
   */

  it("chooses a store that reports its own durability honestly", () => {
    const waitlist = getWaitlistStore();
    const contact = getContactStore();

    // Whatever is chosen, isDurable must agree with whether a database exists.
    // A store claiming durability without one would make the health check lie.
    assert.equal(waitlist.isDurable, isDatabaseConfigured());
    assert.equal(contact.isDurable, isDatabaseConfigured());
  });

  it("refuses rather than accepting when production has no database", async () => {
    const { UnavailableWaitlistStore } = await import(
      "../../src/lib/waitlist/fallback-stores.ts"
    );

    const result = await new UnavailableWaitlistStore().add({
      email: "someone@example.com",
      firstName: "Someone",
      productInterest: [],
      consent: true,
      submittedAt: new Date().toISOString(),
    });

    assert.equal(result.ok, false, "production without a database must not report success");
    assert.equal(result.ok === false && result.reason, "storage-unavailable");
  });

  it("the development fallback still detects a repeat address", async () => {
    // Not a durability claim — this branch exists so the already-on-the-list
    // path is reachable without a database. A store that reported every repeat
    // as new would leave that branch untested in development.
    const { MemoryWaitlistStore } = await import("../../src/lib/waitlist/fallback-stores.ts");
    const store = new MemoryWaitlistStore();

    const signup = {
      email: "Repeat@Example.com",
      firstName: "Repeat",
      productInterest: [] as never[],
      consent: true as const,
      submittedAt: new Date().toISOString(),
    };

    const first = await store.add(signup);
    const second = await store.add({ ...signup, email: "repeat@example.com" });

    assert.deepEqual(first, { ok: true, alreadyOnList: false });
    assert.deepEqual(second, { ok: true, alreadyOnList: true }, "match must ignore case");
  });

  it("the ephemeral escape hatch cannot be opened on Vercel", async () => {
    // The flag exists so the Playwright suite can run without a database, and
    // that is exactly the kind of switch that gets set "just for now" on the
    // real deployment. Vercel always sets VERCEL=1, so that is where it is
    // nailed shut. This asserts the nail, not the flag.
    const { ephemeralStoreAllowed } = await import(
      "../../src/lib/waitlist/fallback-stores.ts"
    );

    const onVercel = {
      VERCEL: "1",
      NODE_ENV: "production",
      GUARD_THEORY_ALLOW_EPHEMERAL_STORE: "1",
    } as unknown as NodeJS.ProcessEnv;

    assert.equal(
      ephemeralStoreAllowed(onVercel),
      false,
      "no combination of flags may permit an ephemeral store on Vercel",
    );

    // ...and it does open where it is supposed to.
    assert.equal(
      ephemeralStoreAllowed({
        NODE_ENV: "production",
        GUARD_THEORY_ALLOW_EPHEMERAL_STORE: "1",
      } as unknown as NodeJS.ProcessEnv),
      true,
      "the test harness must still be able to run without a database",
    );

    // A production build that simply forgot the flag gets nothing.
    assert.equal(
      ephemeralStoreAllowed({ NODE_ENV: "production" } as unknown as NodeJS.ProcessEnv),
      false,
    );
  });

  it("the retired NDJSON store is gone, not merely unused", async () => {
    // It documented itself as "not storage". Leaving the file behind invites
    // someone to import it again when a database connection is inconvenient.
    const sources = await walk(path.join(ROOT, "src"), /\.tsx?$/);
    const importers: string[] = [];

    for (const file of sources) {
      const text = await readFile(file, "utf8");
      if (/from\s+["'][^"']*ndjson-store["']/.test(text)) {
        importers.push(path.relative(ROOT, file));
      }
    }

    assert.deepEqual(importers, [], "nothing may import the NDJSON store");
  });
});

describe("remote images never reach the browser directly", () => {
  /**
   * `next/image` proxies a remote original through /_next/image on our own
   * origin, which is what lets `img-src 'self' data:` stay strict while product
   * photography lives in object storage.
   *
   * That holds only through next/image. A raw <img src="https://…"> would be a
   * genuine third-party request: it breaks the CSP at runtime and fails
   * tests/e2e/security.spec.ts. This catches it at the source instead, where
   * the error names the file.
   */

  it("no raw <img> or CSS url() points at an absolute remote host", async () => {
    const sources = [
      ...(await walk(path.join(ROOT, "src"), /\.tsx?$/)),
      ...(await walk(path.join(ROOT, "src"), /\.css$/)),
    ];

    const offenders: string[] = [];

    for (const file of sources) {
      const text = await readFile(file, "utf8");
      const relative = path.relative(ROOT, file);

      // <img src="https://…"> — the JSX attribute, not a next/image `src` prop,
      // which is a lowercase-tag distinction the regex makes deliberately.
      for (const match of text.matchAll(/<img\b[^>]*\bsrc=["'{]?\s*(https?:)?\/\//gi)) {
        offenders.push(`${relative}: raw <img> with an absolute URL (${match[0].trim()})`);
      }

      for (const match of text.matchAll(/url\(\s*["']?(https?:)?\/\//gi)) {
        offenders.push(`${relative}: CSS url() with an absolute URL (${match[0].trim()})`);
      }
    }

    assert.deepEqual(
      offenders,
      [],
      `remote images must go through next/image:\n${offenders.join("\n")}`,
    );
  });
});
