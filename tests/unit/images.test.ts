import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import ts from "typescript";

import nextConfig, { photographHost } from "../../next.config.ts";
import { blobHostname } from "../../src/lib/images/host.ts";

/**
 * Product photographs reach the browser through next/image, and only through it.
 *
 * next.config.ts has always said this guard existed; until the photograph
 * upload it did not. What it protects: `next/image` fetches the original from
 * the Blob host on the SERVER and serves it from /_next/image on this origin,
 * which is why the Content-Security-Policy's `img-src 'self' data:` never had
 * to name the Blob host and why tests/e2e/security.spec.ts can say the site
 * makes no third-party request. Three things would quietly end that:
 *
 *   - a raw <img> (or createElement("img")) whose src is a stored photograph —
 *     the browser would request the Blob host directly;
 *   - `unoptimized` on an <Image>, which does the same thing through next/image;
 *   - a hard-coded Blob URL anywhere but src/lib/images/host.ts, which is where
 *     the one allowed host is decided.
 *
 * And the host itself must stay pinned: next.config.ts decides it at build
 * time, src/lib/images/host.ts at request time, and the two must agree.
 *
 * Static — no build, no server, no database.
 */

const ROOT = path.resolve(import.meta.dirname, "../..");
const SRC = path.join(ROOT, "src");

function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(directory)) {
    const full = path.join(directory, name);
    if (statSync(full).isDirectory()) files.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(name)) files.push(full);
  }
  return files;
}

/** Every way this source puts an image in front of the browser that is not next/image. */
export function imageProblems(file: string, source: string): string[] {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const problems: string[] = [];
  const line = (node: ts.Node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);

      if (tag === "img") {
        problems.push(`${file}:${line(node)} renders a raw <img>; use next/image`);
      }

      for (const attribute of node.attributes.properties) {
        if (
          ts.isJsxAttribute(attribute) &&
          attribute.name.getText(sf) === "unoptimized" &&
          // unoptimized={false} is harmless; anything else is not.
          !(
            attribute.initializer &&
            ts.isJsxExpression(attribute.initializer) &&
            attribute.initializer.expression?.kind === ts.SyntaxKind.FalseKeyword
          )
        ) {
          problems.push(`${file}:${line(node)} sets unoptimized on <${tag}>, so the browser would fetch the original`);
        }
      }
    }

    if (
      ts.isCallExpression(node) &&
      /(^|\.)createElement$/.test(node.expression.getText(sf)) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      node.arguments[0].text === "img"
    ) {
      problems.push(`${file}:${line(node)} creates an <img> element; use next/image`);
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  if (
    /blob\.vercel-storage\.com/.test(source) &&
    path.normalize(file) !== path.normalize(path.join(SRC, "lib/images/host.ts"))
  ) {
    problems.push(`${file} names the Blob host; decide it in src/lib/images/host.ts and nowhere else`);
  }

  return problems;
}

describe("product photographs go through next/image", () => {
  it("no source file under src renders a raw <img>, sets unoptimized, or names the Blob host", () => {
    const problems = sourceFiles(SRC).flatMap((file) => imageProblems(file, readFileSync(file, "utf8")));
    assert.deepEqual(problems, []);
  });

  it("the gallery and the portal editor use next/image", () => {
    for (const file of [
      "src/components/product/ProductGallery.tsx",
      "src/app/crew/products/ImagesEditor.tsx",
    ]) {
      const source = readFileSync(path.join(ROOT, file), "utf8");
      assert.match(source, /import Image from "next\/image";/, file);
      assert.match(source, /<Image\b/, file);
    }
  });

  it("the product page shows the gallery, and only productPhotographs() feeds it", () => {
    const page = readFileSync(path.join(ROOT, "src/app/shop/[slug]/page.tsx"), "utf8");
    assert.match(page, /const photographs = productPhotographs\(product\)/);
    assert.match(page, /<ProductGallery images=\{photographs\}/);
    // Structured data names images only when there are some.
    assert.match(page, /photographs\.length > 0\s*\?\s*\{ image: photographs\.map/);
  });
});

describe("the Content-Security-Policy and the optimizer's host list", () => {
  it("img-src stays same-origin: the Blob host is never in it", async () => {
    const headers = await nextConfig.headers!();
    const csp = headers[0]!.headers.find((header) => header.key === "Content-Security-Policy")!.value;
    assert.match(csp, /(^|; )img-src 'self' data:(;|$)/);
    assert.doesNotMatch(csp, /vercel-storage/);
  });

  it("remotePatterns is one pinned https host, or nothing", () => {
    const patterns = nextConfig.images?.remotePatterns ?? [];
    assert.ok(patterns.length <= 1);
    for (const pattern of patterns) {
      assert.ok(!(pattern instanceof URL));
      assert.equal(pattern.protocol, "https");
      assert.doesNotMatch(pattern.hostname, /\*/);
      assert.equal(pattern.pathname, "/**");
    }
  });

  it("next.config.ts and src/lib/images/host.ts choose the same host", () => {
    const cases: Record<string, string | undefined>[] = [
      {},
      { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123xyz_s3cr3t" },
      { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123xyz_s3cr3t_with_underscores" },
      { BLOB_READ_WRITE_TOKEN: "  vercel_blob_rw_Store9_secret  " },
      { BLOB_READ_WRITE_TOKEN: "not-a-token" },
      { BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_bad*id_secret" },
      { BLOB_READ_WRITE_TOKEN: "vercel_blob_ro_Store9_secret" },
      { NEXT_PUBLIC_BLOB_HOSTNAME: "Explicit.public.blob.vercel-storage.com" },
      {
        NEXT_PUBLIC_BLOB_HOSTNAME: "explicit.public.blob.vercel-storage.com",
        BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_Other_secret",
      },
    ];

    for (const env of cases) {
      assert.equal(photographHost(env), blobHostname(env), JSON.stringify(env));
    }

    assert.equal(
      blobHostname({ BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_AbC123xyz_s3cr3t" }),
      "abc123xyz.public.blob.vercel-storage.com",
    );
    assert.equal(blobHostname({}), null);
  });
});

describe("the guard can fail", () => {
  // A guard that has only ever been green has not been tested (AGENTS.md).
  const file = path.join(SRC, "components/Fixture.tsx");

  it("catches a raw <img>, self-closing or not", () => {
    assert.equal(imageProblems(file, `export const A = () => <img src={u} alt="" />;`).length, 1);
    assert.equal(imageProblems(file, `export const A = () => <img src={u} alt=""></img>;`).length, 1);
  });

  it("catches createElement('img') and React.createElement('img')", () => {
    assert.equal(imageProblems(file, `createElement("img", { src: u });`).length, 1);
    assert.equal(imageProblems(file, `React.createElement('img', { src: u });`).length, 1);
  });

  it("catches unoptimized, bare or true, and allows unoptimized={false}", () => {
    assert.equal(imageProblems(file, `const A = () => <Image src={u} alt="x" unoptimized />;`).length, 1);
    assert.equal(imageProblems(file, `const A = () => <Image src={u} alt="x" unoptimized={true} />;`).length, 1);
    assert.equal(imageProblems(file, `const A = () => <Image src={u} alt="x" unoptimized={false} />;`).length, 0);
  });

  it("catches the Blob host written anywhere but host.ts", () => {
    assert.equal(imageProblems(file, `const u = "x.public.blob.vercel-storage.com/a.jpg";`).length, 1);
    assert.equal(
      imageProblems(path.join(SRC, "lib/images/host.ts"), `const s = ".public.blob.vercel-storage.com";`).length,
      0,
    );
  });

  it("passes next/image, and an <img> mentioned only in a comment", () => {
    const clean = `import Image from "next/image";\n// a raw <img> would be wrong\nexport const A = () => <Image src={u} alt="x" fill />;`;
    assert.deepEqual(imageProblems(file, clean), []);
  });
});
