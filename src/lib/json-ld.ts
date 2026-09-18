/**
 * Serialises structured data for a `<script type="application/ld+json">`.
 *
 * JSON.stringify does not escape `<`, and the HTML parser ends a script element
 * at the first `</script` it sees, whatever the script's type. A product name
 * or summary containing that string would close the block early and the rest
 * would be parsed as markup. `\u003c` is the same character to a JSON parser
 * and nothing at all to the HTML one.
 */
export function serialiseJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
