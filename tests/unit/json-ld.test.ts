import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, sep } from "node:path";
import { describe, it } from "node:test";

import { serializeJsonLd } from "../../src/lib/json-ld.ts";

const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

describe("serializeJsonLd", () => {
  it("cannot close the script element it is written into", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    assert.ok(!out.includes("<"), `a raw < survived: ${out}`);
    assert.ok(!out.includes(">"), `a raw > survived: ${out}`);
  });

  it("opens neither a comment nor an entity", () => {
    const out = serializeJsonLd({ name: "<!-- &lt; -->" });
    assert.ok(!out.includes("<!--"));
    assert.ok(!out.includes("&"));
  });

  it("escapes the two separators JSON allows raw", () => {
    const out = serializeJsonLd({ name: `a${LS}b${PS}c` });
    assert.ok(!out.includes(LS));
    assert.ok(!out.includes(PS));
    assert.ok(out.includes("\\u2028") && out.includes("\\u2029"));
  });

  it("round-trips to exactly the value it was given", () => {
    const value = {
      "@context": "https://schema.org",
      headline: `Position < submission & "systems" > chaos ${LS} </script>`,
      nested: [{ a: "<b>" }, 1, null, true],
    };
    assert.deepEqual(JSON.parse(serializeJsonLd(value)), value);
  });
});

/**
 * The helper is only worth having if nothing goes round it. Any source file
 * that writes a JSON-LD script must serialise through it.
 */
describe("every JSON-LD emitter uses the shared serialiser", () => {
  const root = join(import.meta.dirname, "..", "..", "src");

  function* walk(dir: string): Generator<string> {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) yield* walk(path);
      else if (/\.tsx?$/.test(entry.name)) yield path;
    }
  }

  const emitters = [...walk(root)].filter((path) =>
    readFileSync(path, "utf8").includes('type="application/ld+json"'),
  );

  it("finds the emitters at all", () => {
    // A guard that matches nothing passes for ever.
    assert.ok(emitters.length >= 6, `only found ${emitters.length} emitters`);
  });

  for (const path of emitters) {
    it(path.slice(root.length + 1).split(sep).join("/"), () => {
      const source = readFileSync(path, "utf8");
      assert.ok(
        source.includes("serializeJsonLd("),
        "writes JSON-LD without serializeJsonLd",
      );
      assert.ok(
        !/__html:\s*JSON\.stringify/.test(source),
        "passes raw JSON.stringify output to dangerouslySetInnerHTML",
      );
    });
  }
});
