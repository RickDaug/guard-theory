import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
  BASE_DIRECTIVES,
  DYNAMIC_PREFIXES,
  buildPolicy,
  fallbackSource,
  hashesForHtml,
  inlineExecutableScripts,
  isDynamicPath,
  literalSource,
  noncePolicy,
  scriptHash,
  scriptSources,
} from "../../src/lib/csp.ts";

const require = createRequire(import.meta.url);
const { pathToRegexp } = require("next/dist/compiled/path-to-regexp") as {
  pathToRegexp: (source: string, keys: unknown[], options: object) => RegExp;
};

describe("script-src never allows inline script in production", () => {
  it("static and nonce policies carry no 'unsafe-inline' or 'unsafe-eval'", () => {
    for (const policy of [
      buildPolicy([]),
      buildPolicy([scriptHash("self.__next_f.push([0])")]),
      noncePolicy("abc123=="),
    ]) {
      const sources = scriptSources(policy);
      assert.ok(sources, policy);
      assert.equal(sources[0], "'self'");
      assert.ok(!sources.includes("'unsafe-inline'"), policy);
      assert.ok(!sources.includes("'unsafe-eval'"), policy);
    }
  });

  it("keeps every other directive exactly as it was", () => {
    const policy = buildPolicy([]);
    for (const directive of BASE_DIRECTIVES) assert.ok(policy.includes(directive), directive);
    assert.ok(policy.includes("frame-ancestors 'none'"));
    assert.ok(policy.includes("object-src 'none'"));
    assert.ok(policy.includes("form-action 'self'"));
  });

  it("never puts a nonce in style-src, which would disable its 'unsafe-inline'", () => {
    const style = noncePolicy("n0nce").split(";").find((d) => d.trim().startsWith("style-src"));
    assert.ok(style && !style.includes("nonce-"), style);
  });
});

describe("inline-script hashing", () => {
  it("hashes the exact script text as the browser does (SHA-256, base64)", () => {
    assert.equal(scriptHash(""), "'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='");
    const text = '(self.__next_f=self.__next_f||[]).push([0])';
    const expected = createHash("sha256").update(text).digest("base64");
    assert.equal(scriptHash(text), `'sha256-${expected}'`);
  });

  it("covers executable inline scripts only", () => {
    const html = [
      '<script src="/_next/static/chunks/a.js" async=""></script>',
      '<script type="application/ld+json">{"@type":"Thing"}</script>',
      "<script>self.__next_f.push([1,\"a\"])</script>",
      '<script type="module">import("/x.js")</script>',
      '<script nonce="abc">self.__next_f.push([2,null])</script>',
    ].join("");
    const scripts = inlineExecutableScripts(html).map((s) => s.text);
    assert.deepEqual(scripts, [
      'self.__next_f.push([1,"a"])',
      'import("/x.js")',
      "self.__next_f.push([2,null])",
    ]);
    assert.equal(hashesForHtml(html).length, 3);
  });

  it("the app itself writes no executable inline script — only JSON-LD", () => {
    // Next's own scripts are hashed per page at build time; anything the app
    // adds must be data, or it would need a hash of its own here.
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = join(dir, name);
        if (statSync(file).isDirectory()) walk(file);
        else if (/\.(tsx|jsx)$/.test(name)) {
          const source = readFileSync(file, "utf8");
          for (const match of source.matchAll(/<script\b([^>]*?)(\/?)>/g)) {
            if (!/type="application\/ld\+json"/.test(match[1] ?? "")) {
              offenders.push(`${file}: ${match[0].slice(0, 80)}`);
            }
          }
          if (/from\s+["']next\/script["']/.test(source)) offenders.push(`${file}: next/script`);
        }
      }
    };
    walk(join(import.meta.dirname, "../../src"));
    assert.deepEqual(offenders, []);
  });
});

describe("which paths get which policy", () => {
  it("the proxy matcher covers exactly DYNAMIC_PREFIXES", () => {
    const proxy = readFileSync(join(import.meta.dirname, "../../src/proxy.ts"), "utf8");
    const block = proxy.match(/matcher:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const entries = [...block.matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
    const expected = DYNAMIC_PREFIXES.flatMap((p) => [p, `${p}/:path*`]).sort();
    assert.deepEqual(entries, expected);
  });

  it("the static fallback never matches a proxied path, and matches everything else", () => {
    const regex = pathToRegexp(fallbackSource(), [], {});
    for (const path of ["/cart", "/crew", "/crew/orders/7", "/shop", "/shop/rashguard", "/order/confirmed", "/unsubscribe"]) {
      assert.equal(regex.test(path), false, path);
      assert.equal(isDynamicPath(path), true, path);
    }
    for (const path of ["/", "/about", "/shopping", "/orders", "/technique/guard/x", "/api/health", "/no-such-page"]) {
      assert.equal(regex.test(path), true, path);
      assert.equal(isDynamicPath(path), false, path);
    }
    const withPortal = pathToRegexp(fallbackSource(["back-office"]), [], {});
    assert.equal(withPortal.test("/back-office/list"), false);
  });

  it("a page's rule matches that page and nothing else", () => {
    for (const path of ["/", "/technique/guard/de-la-riva", "/journal/why-no-gi"]) {
      const regex = pathToRegexp(literalSource(path), [], {});
      assert.equal(regex.test(path), true, path);
      assert.equal(regex.test(`${path === "/" ? "" : path}/other`), false, path);
    }
    assert.equal(literalSource("/a:b(c)*"), "/a\\:b\\(c\\)\\*");
  });
});
