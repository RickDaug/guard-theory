/**
 * `npm run build`: two `next build` passes and a check, so the CSP can list
 * each static page's inline-script hashes instead of allowing 'unsafe-inline'.
 *
 *   1. collect — build with GT_CSP_PASS=collect (next.config.ts emits no
 *      per-page CSP rules), then hash every inline script in every prerendered
 *      page into .csp-hashes.json.
 *   2. ship    — build again; next.config.ts turns the manifest into one CSP
 *      rule per page. This is the build that is served/deployed.
 *   3. verify  — re-read the shipped HTML and the shipped routes-manifest and
 *      fail unless every inline script of every page is allowed by the policy
 *      that page will actually be served with. So if the two passes ever stop
 *      producing identical pages, the build fails — it cannot ship a page whose
 *      scripts the browser would block.
 *
 * Why two builds: `headers()` is evaluated before prerendering, and on Vercel
 * the build adapter packages the output inside `next build` itself, so the
 * manifests cannot be patched afterwards. The build ID is part of every page's
 * RSC payload, so it is fixed across both passes (GT_BUILD_ID).
 *
 * See src/lib/csp.ts for the policy itself.
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  HASH_MANIFEST_FILE,
  hashesForHtml,
  isDynamicPath,
  scriptSources,
} from "../src/lib/csp.ts";

const root = process.cwd();
const nextDir = join(root, ".next");
const manifestPath = join(root, HASH_MANIFEST_FILE);

const buildId =
  process.env.GT_BUILD_ID ||
  (process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? "").slice(0, 12) ||
  randomBytes(8).toString("hex");

function nextBuild(extraEnv) {
  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "build", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, GT_BUILD_ID: buildId, ...extraEnv },
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function readJson(file) {
  return JSON.parse(readFileSync(join(nextDir, file), "utf8"));
}

/** Prerendered HTML pages: request path -> html. */
function prerenderedPages() {
  const prerender = readJson("prerender-manifest.json");
  const pages = new Map();

  for (const pathname of Object.keys(prerender.routes)) {
    const file = join(nextDir, "server", "app", `${pathname === "/" ? "/index" : pathname}.html`);
    if (existsSync(file)) pages.set(pathname, readFileSync(file, "utf8"));
  }

  return pages;
}

/** Special pages (404, global error) are served at arbitrary paths. */
const isSpecial = (pathname) => pathname.startsWith("/_");

function collect() {
  const pages = {};
  const fallback = new Set();

  for (const [pathname, html] of prerenderedPages()) {
    const hashes = hashesForHtml(html);
    if (isSpecial(pathname)) hashes.forEach((h) => fallback.add(h));
    else pages[pathname] = hashes;
  }

  return { pages, fallback: [...fallback].sort() };
}

/** Every CSP the shipped build sends for a path, per routes-manifest. */
function shippedPolicies(pathname) {
  const { headers } = readJson("routes-manifest.json");
  let policy = null;

  for (const rule of headers) {
    if (rule.has || rule.missing) continue;
    if (!new RegExp(rule.regex).test(pathname)) continue;
    for (const { key, value } of rule.headers) {
      // Later rules override earlier ones for the same key.
      if (key.toLowerCase() === "content-security-policy") policy = value;
    }
  }

  return policy;
}

function verify() {
  const problems = [];
  const pages = prerenderedPages();
  let largest = 0;

  for (const [pathname, html] of pages) {
    // Special pages are checked at a path no page claims.
    const probe = isSpecial(pathname) ? "/__csp-probe-no-such-page" : pathname;

    if (!isSpecial(pathname) && isDynamicPath(pathname)) {
      problems.push(`${pathname} is prerendered but under a proxy nonce prefix; it would get two policies`);
      continue;
    }

    const policy = shippedPolicies(probe);
    if (!policy) {
      problems.push(`${pathname}: no Content-Security-Policy rule matches`);
      continue;
    }
    largest = Math.max(largest, policy.length);

    const sources = scriptSources(policy) ?? [];
    if (sources.includes("'unsafe-inline'")) {
      problems.push(`${pathname}: script-src allows 'unsafe-inline'`);
    }
    for (const hash of hashesForHtml(html)) {
      if (!sources.includes(hash)) {
        problems.push(`${pathname}: inline script ${hash} is not in its policy (build output changed between passes?)`);
      }
    }
  }

  // Every page that is not prerendered renders per request and needs the
  // proxy's nonce, which it only gets under DYNAMIC_PREFIXES.
  const appPaths = readJson("app-path-routes-manifest.json");
  const prerender = readJson("prerender-manifest.json");
  const staticPatterns = new Set([
    ...Object.keys(prerender.routes),
    ...Object.keys(prerender.dynamicRoutes ?? {}),
  ]);
  for (const [entry, pathname] of Object.entries(appPaths)) {
    if (!entry.endsWith("/page")) continue; // route handlers serve no HTML
    if (staticPatterns.has(pathname) || isSpecial(pathname)) continue;
    if (!isDynamicPath(pathname)) {
      problems.push(`${pathname} renders per request but is outside DYNAMIC_PREFIXES, so no policy allows its scripts`);
    }
  }

  if (problems.length > 0) {
    console.error(`\nCSP verification failed:\n  ${problems.join("\n  ")}\n`);
    process.exit(1);
  }

  console.log(
    `\nCSP verified: ${pages.size} prerendered pages, every inline script hashed; largest policy ${largest} bytes.\n`,
  );
}

rmSync(manifestPath, { force: true });

console.log(`\n[build 1/2] collecting inline-script hashes (build id ${buildId})\n`);
nextBuild({ GT_CSP_PASS: "collect" });
writeFileSync(manifestPath, `${JSON.stringify(collect(), null, 2)}\n`);

console.log("\n[build 2/2] building with per-page script hashes\n");
nextBuild({ GT_CSP_PASS: "" });

verify();
