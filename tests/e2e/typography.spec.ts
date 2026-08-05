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
      /**
       * Enumerated, never widened into a looser pattern. Each entry is a real
       * name that genuinely has no space in it:
       *   eMag    — from GracieMag, which brands itself as one word
       *   :Maeda  — from "File:Maeda Mituyo.jpg", a Wikimedia filename quoted
       *             exactly in a source line
       *
       * These are matched against the HIT, not the surrounding sentence, so an
       * entry has to be written in the form the pattern actually captures:
       * one leading character, then the capital and what follows.
       */
      const ALLOWED =
        /(?:McG|MacD|DeLa|iPhone|JavaScript|JavaSc|YouTube|eMag|:Maeda)/;
      const out: string[] = [];

      for (const el of Array.from(
        document.querySelectorAll<HTMLElement>("p, li, dd, h1, h2, h3"),
      )) {
        /**
         * innerText, NOT textContent.
         *
         * textContent concatenates across nested block elements with no
         * separator, so a card built as <li><h3>…submission</h3><p>The finish…
         * reads as "submissionThe" and trips this check on ten pages where
         * nothing is actually fused. innerText is the text as rendered, which
         * is the only thing this file claims to test.
         */
        const text = el.innerText ?? "";
        /**
         * A full stop or lower-case letter, then a capital, with nothing
         * between.
         *
         * The quantifier is `+`, not `{2,}`. With `{2,}` the capitalised word
         * had to be at least three letters, so "This is not a ranking.It is
         * not ordered by…" — the exact defect that shipped to production and
         * the reason this file was written — did not match, because "It" is
         * two letters. The guard was green against the bug it was created for.
         * Verified by reintroducing it: `{2,}` passes, `+` fails.
         */
        const match = text.match(/[a-z.,;:!?][A-Z][a-z]+/g);
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
