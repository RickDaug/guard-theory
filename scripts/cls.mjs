/**
 * Real-browser cumulative layout shift.
 *
 * Run: npm run cls   (expects a production server already on port 3100)
 *
 * WHY THIS EXISTS
 *
 * Lighthouse's CLS under simulated throttling is a model, not an observation.
 * This project acted on that model four separate times — 0.0665 on the home
 * page, 0.166 on long-form, 0.1771 on figure pages, 0.182 on the product page —
 * and rewrote the font configuration each time to chase numbers no browser had
 * ever produced. This script is the second instrument that should have existed
 * before any of that.
 *
 * Cold cache, 390px, slow-4G throttling, 4x CPU, five runs per route, worst run
 * reported. The throttling is the point: unthrottled on localhost the fonts land
 * before first paint and there is nothing to observe.
 *
 * THE SELF-TEST IS NOT OPTIONAL
 *
 * The first version of this script reported 0.0000 for every route. It also
 * reported 0.0000 with the known Archivo fallback defect deliberately
 * reintroduced, and again with `adjustFontFallback: false` disabling metric
 * adjustment altogether. Three zeroes in a row look like a clean site and look
 * exactly the same as a dead PerformanceObserver.
 *
 * So the run begins by forcing a shift on a real page and refusing to continue
 * unless it sees it. A measurement you cannot distinguish from a broken
 * measurement is not a measurement.
 */
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3100";
const ROUTES = [
  "/",
  "/shop/theory-01-long-sleeve",
  "/figures/mitsuyo-maeda",
  "/journal/maeda-and-the-arrival-of-judo-in-brazil",
];
const RUNS = 5;

/** Records every layout shift the browser reports, from before first paint. */
const OBSERVE = () => {
  window.__cls = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
};

const browser = await chromium.launch();

async function newPage({ throttle }) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.addInitScript(OBSERVE);
  if (throttle) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  return { context, page };
}

// Self-test: prove the observer can see a shift before trusting it not to.
{
  const { context, page } = await newPage({ throttle: false });
  await page.goto(BASE, { waitUntil: "load" });
  await page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.style.height = "500px";
    document.body.prepend(spacer);
  });
  await page.waitForTimeout(1000);
  const detected = await page.evaluate(() => window.__cls);
  await context.close();

  if (!(detected > 0.1)) {
    console.error(
      `self-test FAILED: forcing a 500px shift produced ${detected}. The observer is not recording, so every zero below would be meaningless. Not continuing.`,
    );
    await browser.close();
    process.exit(2);
  }
  console.log(`self-test ok — forced shift measured ${detected.toFixed(4)}\n`);
}

let failed = false;

for (const route of ROUTES) {
  const values = [];
  for (let i = 0; i < RUNS; i += 1) {
    const { context, page } = await newPage({ throttle: true });
    await page.goto(BASE + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    values.push(await page.evaluate(() => window.__cls));
    await context.close();
  }

  // Worst run, not the median: a shift a fifth of visitors see is a real one.
  const worst = Math.max(...values);
  if (worst > 0.1) failed = true;
  const verdict = worst > 0.1 ? "FAIL" : worst > 0.05 ? "needs work" : "good";
  console.log(
    `${worst.toFixed(4)}  ${verdict.padEnd(10)} ${route}  [${values
      .map((v) => v.toFixed(3))
      .join(" ")}]`,
  );
}

await browser.close();
process.exit(failed ? 1 : 0);
