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
  // Category pages, added because the guard could not see them: the list above
  // was written before they carried any composed text, and the "Closed Guard1
  // entry" fusion rendered only here. A route list is a blind spot with a date
  // on it.
  "/technique/back-control",
  "/journal/category/bjj-history",
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

/**
 * Word spaces that exist only in CSS.
 *
 * A `gap` on a flex container separates two boxes visually while the text
 * itself stays fused: "Closed Guard1 entry" to anything that reads the markup
 * rather than the painting — an accessible-name computation, a copied line, a
 * page whose stylesheet has not arrived, a text-only client.
 *
 * This has now shipped here three times, in three components, and neither of
 * the checks above can see it: `innerText` blockifies flex items and helpfully
 * inserts the separator that is missing from the document.
 *
 * The rule is deliberately narrow — two ADJACENT CHILDREN OF A FLEX OR GRID
 * CONTAINER, with no whitespace text node between them, where the first ends in
 * a word character and the second begins with one. Broader versions were tried
 * and rejected: `textContent` re-flags every nested block, and loading the page
 * with stylesheets blocked flags every legitimate `display: block` span. Both
 * turn into guards that people silence rather than read.
 */
for (const path of ROUTES) {
  test(`${path} has no word space that exists only in a flex gap`, async ({
    page,
  }) => {
    await page.goto(path, { waitUntil: "load" });

    const fused = await page.evaluate(() => {
      const out: string[] = [];

      /**
       * Only containers whose contents are read as ONE phrase.
       *
       * A `<ul class="flex">` of navigation links is not: "Shop" and "Journal"
       * are separate destinations and no word space is missing between them.
       * The first version of this check had no such restriction and flagged
       * every nav bar and every card grid on the site — a guard that fires on
       * correct markup gets switched off, so it is scoped to the case that
       * actually broke: a single link or label built out of two spans.
       */
      const PHRASE = "a, button, label, p, h1, h2, h3, dt, dd, summary";

      for (const parent of Array.from(document.querySelectorAll(PHRASE))) {
        const style = getComputedStyle(parent);
        const display = style.display;
        if (!["flex", "inline-flex"].includes(display)) continue;

        /**
         * Rows only.
         *
         * A `flex-col` card stacks its pieces on separate lines, which is a
         * line break rather than a missing word space, and every product card
         * on the site is built that way. Only a row puts two runs of text on
         * the same line with nothing but a gap between them.
         */
        if (style.flexDirection.startsWith("column")) continue;

        const children = Array.from(parent.childNodes);
        for (let i = 0; i < children.length - 1; i += 1) {
          const a = children[i];
          const b = children[i + 1];
          if (!(a instanceof HTMLElement) || !(b instanceof HTMLElement)) continue;

          // A decorative marker is not a word, so no word space is missing.
          if (
            a.getAttribute("aria-hidden") === "true" ||
            b.getAttribute("aria-hidden") === "true"
          ) {
            continue;
          }

          const left = a.textContent ?? "";
          const right = b.textContent ?? "";
          if (!/\w$/.test(left) || !/^\w/.test(right)) continue;

          out.push(
            `"${left.slice(-30)}" + "${right.slice(0, 30)}" — inside a ${display} container`,
          );
        }
      }

      return out;
    });

    expect(fused, fused.join("\n")).toEqual([]);
  });
}
