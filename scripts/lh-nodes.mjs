/**
 * One-off: print the offending nodes for a single Lighthouse audit, plus the
 * robots meta tag actually served. Diagnosis, not part of the suite.
 *
 * Run: node scripts/lh-nodes.mjs target-size
 */
import { spawn } from "node:child_process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
const auditId = process.argv[2] ?? "target-size";
const routePath = process.argv[3] ?? "/";

const env = {
  ...process.env,
  NEXT_PUBLIC_ALLOW_INDEXING: "true",
  NEXT_PUBLIC_SITE_URL: BASE,
};

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (r.ok) return;
    } catch {
      /* not up */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

const server = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "start", "--port", String(PORT)],
  { stdio: "ignore", shell: process.platform === "win32", env },
);

let chrome;
try {
  await waitForServer();

  const html = await (await fetch(`${BASE}${routePath}`)).text();
  const robots = html.match(/<meta name="robots"[^>]*>/)?.[0] ?? "(no robots meta)";
  console.log(`robots meta served: ${robots}\n`);

  chrome = await launch({
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });

  const result = await lighthouse(
    `${BASE}${routePath}`,
    { port: chrome.port, output: "json", logLevel: "error" },
    undefined,
  );

  const audit = result.lhr.audits[auditId];
  console.log(`${auditId}: score ${audit?.score}`);
  console.log(`${audit?.title}\n`);

  for (const item of audit?.details?.items ?? []) {
    const node = item.node ?? item;
    if (node.selector) {
      console.log(`  - ${node.selector}`);
      if (node.snippet) console.log(`      ${node.snippet.slice(0, 120)}`);
      if (item.explanation) console.log(`      ${item.explanation}`);
    } else {
      // Insight audits nest their nodes differently; dump the item so the
      // culprit can be read rather than guessed at.
      console.log(JSON.stringify(item, null, 1).slice(0, 1800));
    }
  }
} finally {
  await chrome?.kill();
  server.kill();
}
