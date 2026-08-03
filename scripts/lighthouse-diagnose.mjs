/**
 * Diagnostic: print every audit that is not passing, per category, so a low
 * score can be acted on rather than guessed at.
 *
 * Run: node scripts/lighthouse-diagnose.mjs [path]
 */
import { spawn } from "node:child_process";
import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

const PORT = 3100;
const BASE = `http://127.0.0.1:${PORT}`;
const target = process.argv[2] ?? "/";

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("server did not start");
}

const server = spawn(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["next", "start", "--port", String(PORT)],
  { stdio: "ignore", shell: process.platform === "win32" },
);

let chrome;
try {
  await waitForServer();
  chrome = await launch({
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
  });

  const result = await lighthouse(
    `${BASE}${target}`,
    { port: chrome.port, output: "json", logLevel: "error" },
    undefined,
  );

  const lhr = result.lhr;

  for (const [key, category] of Object.entries(lhr.categories)) {
    console.log(`\n=== ${category.title}: ${Math.round((category.score ?? 0) * 100)} ===`);

    for (const ref of category.auditRefs) {
      const audit = lhr.audits[ref.id];
      if (!audit) continue;
      const failing =
        audit.score !== null && audit.score < 0.9 && audit.scoreDisplayMode !== "notApplicable";
      const informative =
        audit.scoreDisplayMode === "informative" && (audit.details?.items?.length ?? 0) > 0;

      if (!failing && !informative) continue;

      const weight = ref.weight ? ` [weight ${ref.weight}]` : "";
      const value = audit.displayValue ? ` — ${audit.displayValue}` : "";
      console.log(`  ${audit.score === null ? "info" : audit.score.toFixed(2)} ${audit.id}${weight}${value}`);
      if (audit.title && failing) console.log(`       ${audit.title}`);
    }
    void key;
  }
} finally {
  await chrome?.kill();
  server.kill();
}
