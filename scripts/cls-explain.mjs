/**
 * Why is a route shifting? `npm run cls` gives a number; this says which element
 * moved and what it looked like on both sides of the font swap.
 *
 * Run: npm run cls:why [route]   (expects a production server on port 3100)
 *
 * WHY THIS EXISTS
 *
 * `cls.mjs` reported 0.1787 on the product page — a failing Core Web Vital,
 * identical across five runs — and there was no way to tell from that number
 * what had moved. Reading the layout-shift entries' `sources` named the plate,
 * but the plate had not changed size; measuring every box before and after
 * `document.fonts.ready` found the actual cause one line above it, a notation
 * label that fits on one line in the metric fallback and needs two in Martian
 * Mono. A wrap point cannot be calibrated away, so the fix was structural.
 *
 * Both halves are here because neither alone was enough: the sources said where
 * the damage showed, the geometry table said where it started.
 */
import { chromium } from "@playwright/test";
import path from "node:path";

const BASE = "http://127.0.0.1:3100";
const route = process.argv[2] ?? "/shop/theory-01-long-sleeve";
const SHOTS = process.env.CLS_SHOTS;

/** Same conditions as cls.mjs: cold, 390px, slow-4G, 4x CPU. Unthrottled on
 *  localhost the fonts land before first paint and there is nothing to see. */
const THROTTLE = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
};

const OBSERVE = () => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__shifts.push({
        value: entry.value,
        time: Math.round(entry.startTime),
        sources: entry.sources.map((s) => ({
          tag: s.node?.tagName ?? "#text",
          cls: typeof s.node?.className === "string" ? s.node.className.slice(0, 80) : "",
          text: (s.node?.textContent ?? "").trim().slice(0, 52),
          from: `${Math.round(s.previousRect.y)} ${Math.round(s.previousRect.width)}x${Math.round(s.previousRect.height)}`,
          to: `${Math.round(s.currentRect.y)} ${Math.round(s.currentRect.width)}x${Math.round(s.currentRect.height)}`,
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
};

const MEASURE = () =>
  [...document.querySelectorAll("header, nav, ol, h1, h2, p, figure")]
    .slice(0, 26)
    .map((el) => {
      const r = el.getBoundingClientRect();
      if (r.height === 0) return null;
      return {
        tag: el.tagName.toLowerCase(),
        y: Math.round(r.y),
        h: Math.round(r.height),
        text: (el.textContent ?? "").trim().slice(0, 40),
      };
    })
    .filter(Boolean);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
await page.addInitScript(OBSERVE);
const cdp = await context.newCDPSession(page);
await cdp.send("Network.emulateNetworkConditions", THROTTLE);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.goto(BASE + route, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(600);
const before = await page.evaluate(MEASURE);
if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "cls-before.png") });

await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(3000);
const after = await page.evaluate(MEASURE);
if (SHOTS) await page.screenshot({ path: path.join(SHOTS, "cls-after.png") });

console.log(`\n${route}\n`);
console.log("WHAT GREW — every box above the fold, before and after the fonts arrived");
console.log(`${"".padEnd(8)}${"y".padStart(6)}${"h".padStart(5)} ->${"y".padStart(6)}${"h".padStart(5)}   element`);
for (let i = 0; i < Math.max(before.length, after.length); i += 1) {
  const b = before[i];
  const a = after[i];
  if (!b || !a) continue;
  const moved = b.y !== a.y || b.h !== a.h;
  const grew = b.h !== a.h;
  console.log(
    `${grew ? "GREW  " : moved ? "moved " : "      "}  ${String(b.y).padStart(5)}${String(b.h).padStart(5)} ->${String(a.y).padStart(6)}${String(a.h).padStart(5)}   <${b.tag}> ${b.text}`,
  );
}

const shifts = await page.evaluate(() => window.__shifts);
console.log("\nWHERE IT SHOWED — the elements the browser blamed");
let total = 0;
for (const s of shifts) {
  total += s.value;
  console.log(`\n  ${s.value.toFixed(4)} at ${s.time}ms`);
  for (const src of s.sources) {
    console.log(`     <${src.tag}> ${src.cls}`);
    console.log(`        "${src.text}"`);
    console.log(`        y/size ${src.from}  ->  ${src.to}`);
  }
}
console.log(`\ntotal ${total.toFixed(4)}`);
await browser.close();
