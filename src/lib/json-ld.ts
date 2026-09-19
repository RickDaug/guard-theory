/**
 * The one way structured data reaches the page.
 *
 * `JSON.stringify` is not an HTML serialiser. It leaves `<` alone, so a string
 * containing a closing script tag ends the element it is sitting in and the
 * rest of the value is parsed as markup. Nothing on the site carries one today
 * — every emitter serialises registry content, not reader input — which is
 * exactly why it would be missed on the day a headline, a quotation or a
 * search term did.
 *
 * The six-character `u003c` escape is the same character to a JSON parser and
 * inert to an HTML one. `>` and `&` go with `<` so no comment or entity can open either.
 * U+2028 and U+2029 are legal raw inside a JSON string and were line
 * terminators in JavaScript before ES2019; escaping them costs nothing and
 * removes the question.
 *
 * The characters are built from their code units rather than typed, so the
 * separators never appear in this file as raw bytes — see AGENTS.md on
 * control characters in source.
 *
 * Six emitters used the raw call. `tests/unit/json-ld.test.ts` fails if a
 * seventh appears.
 */
/** `<`, `>`, `&`, U+2028, U+2029 — by code unit, so no literal is in this file. */
const UNSAFE = [0x3c, 0x3e, 0x26, 0x2028, 0x2029];

const PATTERN = new RegExp(
  `[${UNSAFE.map((code) => String.fromCharCode(code)).join("")}]`,
  "g",
);

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(
    PATTERN,
    (character) =>
      `${String.fromCharCode(0x5c)}u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}
