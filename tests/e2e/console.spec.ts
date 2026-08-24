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
  "/cart",
  "/order/confirmed",
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
      const reason = request.failure()?.errorText ?? "";

      // An aborted request is not a failed one.
      //
      // Next prefetches the links in the header, and a prefetch of a
      // dynamically-rendered route that is still in flight when the page
      // navigates away is cancelled by the browser — net::ERR_ABORTED. That is
      // the browser doing the right thing, and counting it made this test fail
      // roughly one run in two on whichever dynamic route happened to lose the
      // race, with the failure landing on a different path each time.
      //
      // Narrowed rather than weakened: every other failure reason, including a
      // connection refused, a DNS failure or a blocked request, still counts.
      if (reason === "net::ERR_ABORTED") {
        return;
      }

      problems.push(`request failed: ${request.url()} (${reason})`);
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
