import assert from "node:assert/strict";
import { describe, it } from "node:test";

import nextConfig from "../../next.config.ts";
import {
  CATEGORIES,
  ENTRIES,
  publishedEntryPaths,
} from "../../src/content/technique/index.ts";

/**
 * Technique Library redirects.
 *
 * An entry that moves category keeps its old address as a 308
 * (docs/information-architecture.md, docs/seo-strategy.md §7). The two ways
 * that goes wrong are both silent: a redirect whose destination is not a live
 * page (a 308 to a 404, or into a chain), and one whose source is a live page
 * again (the entry moved back, and the redirect now shadows it). This checks
 * both, from the registry, for every /technique/ redirect in next.config.ts.
 */

type Redirect = { source: string; destination: string; permanent?: boolean };

async function techniqueRedirects(): Promise<Redirect[]> {
  const all = (await nextConfig.redirects?.()) ?? [];
  return (all as Redirect[]).filter((r) => r.source.startsWith("/technique/"));
}

const LIVE = new Set([
  ...publishedEntryPaths(),
  ...CATEGORIES.map((c) => `/technique/${c.slug}`),
]);
const EVERY_ENTRY_PATH = new Set(
  ENTRIES.map((entry) => `/technique/${entry.category}/${entry.slug}`),
);

function findRedirectProblems(redirects: Redirect[]): string[] {
  const problems: string[] = [];
  const sources = new Set(redirects.map((r) => r.source));
  for (const r of redirects) {
    if (r.permanent !== true) problems.push(`${r.source} is not permanent (308)`);
    if (!LIVE.has(r.destination)) {
      problems.push(`${r.source} points at ${r.destination}, which is not a published page`);
    }
    if (sources.has(r.destination)) {
      problems.push(`${r.source} -> ${r.destination} is a chain: the destination redirects again`);
    }
    if (EVERY_ENTRY_PATH.has(r.source) || LIVE.has(r.source)) {
      problems.push(`${r.source} is a current page, so the redirect shadows it`);
    }
  }
  return problems;
}

describe("technique redirects", () => {
  it("send every moved entry's old address to a live page, in one hop", async () => {
    const redirects = await techniqueRedirects();
    assert.deepEqual(findRedirectProblems(redirects), []);
  });

  it("keep the leg-entanglement entry's pre-leg-locks address", async () => {
    const redirects = await techniqueRedirects();
    const moved = redirects.find(
      (r) => r.source === "/technique/submissions/leg-entanglement-as-control",
    );
    assert.ok(moved, "the old submissions address has no redirect");
    assert.equal(moved.destination, "/technique/leg-locks/leg-entanglement-as-control");
    assert.equal(moved.permanent, true);
  });

  // The guard can fail: each defect it exists for, fed to it on purpose.
  it("refuses a redirect back to the old address, a dead destination and a chain", () => {
    const live = "/technique/leg-locks/leg-entanglement-as-control";
    const old = "/technique/submissions/leg-entanglement-as-control";
    assert.ok(
      findRedirectProblems([{ source: live, destination: old, permanent: true }]).length >= 2,
      "a redirect from the live address to the old one passed",
    );
    assert.ok(
      findRedirectProblems([
        { source: old, destination: "/technique/leg-locks/nothing-here", permanent: true },
      ]).some((p) => p.includes("not a published page")),
      "a redirect to a page that does not exist passed",
    );
    assert.ok(
      findRedirectProblems([
        { source: "/technique/a/b", destination: old, permanent: true },
        { source: old, destination: live, permanent: true },
      ]).some((p) => p.includes("chain")),
      "a two-hop chain passed",
    );
    assert.ok(
      findRedirectProblems([{ source: old, destination: live, permanent: false }]).some((p) =>
        p.includes("not permanent"),
      ),
      "a temporary redirect passed",
    );
  });
});
