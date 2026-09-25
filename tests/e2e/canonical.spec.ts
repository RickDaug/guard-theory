import { expect, test } from "@playwright/test";

/**
 * Every URL the sitemap offers must name itself as canonical.
 *
 * The metadata suite's own header says every indexable page "needs a unique
 * title and description, a canonical, and structured data that parses" — and
 * then never looked at a canonical. A page whose canonical is missing, relative
 * or pointing at a different page is a page the sitemap submits and the markup
 * withdraws, and nothing about it shows in a browser.
 *
 * Driven off the sitemap rather than a sample list, so a new route is covered
 * the day it is listed.
 */

/** What is wrong with this page's canonical, or null. Pure, so it can be proved. */
function canonicalProblem(html: string, loc: string): string | null {
  const tags = html.match(/<link\b[^>]*\brel="canonical"[^>]*>/gi) ?? [];
  if (tags.length === 0) return "has no canonical";
  if (tags.length > 1) return `has ${tags.length} canonicals`;

  const href = /\bhref="([^"]*)"/i.exec(tags[0]!)?.[1];
  if (!href) return "has a canonical with no href";
  if (!/^https?:\/\//.test(href)) return `has a relative canonical (${href})`;

  const strip = (url: string) => url.replace(/\/$/, "");
  if (strip(href) !== strip(loc)) return `is canonical to ${href}, not to itself`;
  return null;
}

test("the canonical check can fail", () => {
  const loc = "https://example.test/journal/a";
  const page = (head: string) => `<html><head>${head}</head></html>`;

  expect(canonicalProblem(page(""), loc)).toBe("has no canonical");
  expect(canonicalProblem(page('<link rel="canonical" href="/journal/a"/>'), loc)).toContain("relative");
  expect(canonicalProblem(page('<link rel="canonical" href="https://example.test/"/>'), loc)).toContain("not to itself");
  expect(
    canonicalProblem(
      page('<link rel="canonical" href="https://example.test/journal/a"/>'.repeat(2)),
      loc,
    ),
  ).toContain("2 canonicals");
  expect(canonicalProblem(page('<link rel="canonical" href="https://example.test/journal/a"/>'), loc)).toBeNull();
  // The home page: with and without the trailing slash are the same address.
  expect(canonicalProblem(page('<link rel="canonical" href="https://example.test"/>'), "https://example.test/")).toBeNull();
});

test("every sitemap URL is canonical to itself, absolutely", async ({ request }) => {
  test.setTimeout(180_000);

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  expect(locs.length, "the sitemap lists nothing").toBeGreaterThan(20);

  const problems: string[] = [];
  for (const loc of locs) {
    // The sitemap's origin is the build's NEXT_PUBLIC_SITE_URL, not the port
    // this server is on. Fetch the path; compare against the full URL.
    const path = new URL(loc).pathname;
    const response = await request.get(path);
    if (response.status() !== 200) {
      problems.push(`${path} is in the sitemap and answers ${response.status()}`);
      continue;
    }
    const problem = canonicalProblem(await response.text(), loc);
    if (problem) problems.push(`${path} ${problem}`);
  }

  expect(problems, problems.join(" | ")).toEqual([]);
});
