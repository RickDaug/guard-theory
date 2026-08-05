import { expect, test } from "@playwright/test";

/**
 * Rendered-text defects that only exist after JSX has been compiled.
 *
 * JSX discards whitespace-only text nodes that contain a newline, and a
 * whitespace-only child of a flex container generates no flex item at all.
 * Both have shipped here: the notation key rendered "01Closed guard", and the
 * figures index rendered "This is not a ranking.It is not ordered by...".
 *
 * Neither is visible in the source, neither is caught by a linter, and both
 * survived visual review. They are only findable in the output, so that is
 * where this looks.
 */

const ROUTES = [
  "/",
  "/about",
  "/manifesto",
  "/shop",
  "/shop/theory-01-long-sleeve",
  "/first-edition",
  "/lookbook",
  "/size-and-fit",
  "/faq",
  "/contact",
  "/figures",
  "/figures/oswaldo-fadda",
  "/figures/mitsuyo-maeda",
  "/journal",
  "/journal/maeda-and-the-arrival-of-judo-in-brazil",
  "/technique",
  "/technique/no-gi-systems/inside-position",
  "/policies/privacy",
];

for (const path of ROUTES) {
  test(`${path} has no words fused across an element boundary`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "load" });

    /**
     * Walks the rendered text of every block-level container and looks for a
     * lower-case letter immediately followed by an upper-case one with no
     * space — the signature of a lost word space between two inline elements.
     *
     * Legitimate exceptions are rare and enumerated rather than guessed at.
     */
    const fused = await page.evaluate(() => {
      const ALLOWED = /(?:McG|MacD|DeLa|iPhone|JavaScript|JavaSc|YouTube)/;
      const out: string[] = [];

      for (const el of Array.from(document.querySelectorAll("p, li, dd, h1, h2, h3"))) {
        const text = el.textContent ?? "";
        // A full stop or lower-case letter, then a capital, with nothing between.
        const match = text.match(/[a-z.,;:!?][A-Z][a-z]{2,}/g);
        if (!match) continue;
        for (const hit of match) {
          if (ALLOWED.test(hit)) continue;
          out.push(`${hit} — in: ${text.slice(0, 90)}`);
        }
      }
      return out;
    });

    expect(fused, fused.join("\n")).toEqual([]);
  });
}
