/**
 * Post-deploy check: does the policy a server SENDS allow the inline scripts
 * the same response CONTAINS?
 *
 * Run: node scripts/csp-probe.mjs https://guardtheory.net
 *
 * This exists because the build's own verification reads the manifest the
 * build wrote, and on 2026-11-11 that was not what Vercel served (issue #85):
 * every prerendered page went out with `script-src 'self'` and no hashes, the
 * bootstrap scripts were blocked, and no page hydrated. Nothing before the
 * deploy could see it. This reads the deployed response instead.
 *
 * It exits non-zero if any inline script on any probed page is not covered by
 * a hash or the response's nonce, or if a page answers with no policy at all.
 */
import { createHash } from "node:crypto";

const base = (process.argv[2] ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("usage: node scripts/csp-probe.mjs <origin>");
  process.exit(2);
}

/** One of each kind of page: prerendered, on-demand, proxied (nonce), 404. */
const PATHS = [
  "/",
  "/technique",
  "/technique/no-gi-systems/inside-position",
  "/journal",
  "/journal/maeda-and-the-arrival-of-judo-in-brazil",
  "/figures",
  "/figures/marcelo-garcia",
  "/search",
  "/first-edition",
  "/policies/editorial",
  "/shop",
  "/shop/theory-01-long-sleeve",
  "/cart",
  "/csp-probe-no-such-page",
];

let failed = false;

for (const path of PATHS) {
  const response = await fetch(`${base}${path}`, { redirect: "manual" });
  const body = await response.text();
  const policy = response.headers.get("content-security-policy") ?? "";
  const directive = policy
    .split(";")
    .map((d) => d.trim())
    .find((d) => d.startsWith("script-src"));
  const sources = new Set((directive ?? "").split(/\s+/));
  const nonce = [...sources].find((s) => s.startsWith("'nonce-"))?.slice(7, -1);

  let inline = 0;
  let blocked = 0;

  for (const match of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const [, attributes, content] = match;
    if (/\bsrc=/.test(attributes)) continue;
    // Data blocks are not executed, so script-src does not apply to them.
    if (/type="application\/(?:ld\+)?json"/.test(attributes)) continue;
    inline += 1;

    if (sources.has("'unsafe-inline'")) continue;
    const hash = `'sha256-${createHash("sha256").update(content, "utf8").digest("base64")}'`;
    const carriesNonce = Boolean(nonce) && attributes.includes(`nonce="${nonce}"`);
    if (!sources.has(hash) && !carriesNonce) blocked += 1;
  }

  const problem = !directive ? "NO script-src" : blocked > 0 ? `${blocked} BLOCKED` : "ok";
  if (problem !== "ok") failed = true;

  console.log(
    `${String(response.status).padEnd(4)} ${path.padEnd(52)} inline ${String(inline).padStart(2)}  ${problem}${sources.has("'unsafe-inline'") ? "  (unsafe-inline)" : ""}`,
  );
}

process.exit(failed ? 1 : 0);
