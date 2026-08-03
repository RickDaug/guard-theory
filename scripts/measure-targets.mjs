/**
 * One-off: report the rendered box of every interactive element that WCAG 2.2
 * SC 2.5.8 applies to, so an undersized target is measured rather than guessed.
 *
 * Assumes a server is already running on 3100.
 * Run: node scripts/measure-targets.mjs
 */
import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://127.0.0.1:3100/", { waitUntil: "load" });

const undersized = await page.$$eval("a, button, input, select", (els) =>
  els
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 24),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    })
    .filter((box) => box.w > 0 && (box.w < 24 || box.h < 24)),
);

console.log(
  undersized.length === 0
    ? "every target is at least 24x24"
    : JSON.stringify(undersized, null, 1),
);

await browser.close();
