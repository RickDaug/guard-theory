import { expect, test } from "@playwright/test";

/**
 * No page may log an error or a failed request.
 *
 * A console full of noise is how real errors get ignored, so the bar is zero
 * rather than "nothing important".
 */

const ROUTES = [
  "/",
  "/design-system",
  "/technique",
  "/technique/no-gi-systems/inside-position",
  "/journal",
  "/journal/how-a-bjj-rash-guard-should-fit",
  "/shop",
  "/shop/theory-01-long-sleeve",
  "/first-edition",
  "/contact",
  "/search",
  "/lookbook",
];

for (const path of ROUTES) {
  test(`${path} logs no console errors and requests nothing that fails`, async ({
    page,
  }) => {
    const problems: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        problems.push(`console.error: ${message.text()}`);
      }
    });

    page.on("pageerror", (error) => {
      problems.push(`uncaught: ${error.message}`);
    });

    page.on("requestfailed", (request) => {
      problems.push(
        `request failed: ${request.url()} (${request.failure()?.errorText})`,
      );
    });

    page.on("response", (response) => {
      if (response.status() >= 400) {
        problems.push(`${response.status()} for ${response.url()}`);
      }
    });

    await page.goto(path, { waitUntil: "load" });
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    expect(problems, problems.join("\n")).toEqual([]);
  });
}
