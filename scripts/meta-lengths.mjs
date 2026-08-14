/**
 * Meta description length across every route in the sitemap.
 *
 * Google truncates a search snippet around 155-160 characters; social previews
 * often show about 125 and truncate on mobile. Neither is a penalty — a long
 * description is not a ranking problem, it is a *display* problem, and the only
 * cost is that the reader sees an ellipsis instead of the end of the sentence.
 *
 * Run: node scripts/meta-lengths.mjs [origin]   (default: the live site)
 */
const ORIGIN = process.argv[2] ?? "https://guardtheory.net";

const sitemap = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
console.log(`${urls.length} routes in the sitemap\n`);

const rows = [];
const CONCURRENCY = 8;
let i = 0;

async function worker() {
  while (i < urls.length) {
    const url = urls[i++];
    try {
      const html = await (await fetch(url)).text();
      const description =
        html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
      rows.push({ path: new URL(url).pathname, len: description.length, description });
    } catch (error) {
      rows.push({ path: new URL(url).pathname, len: -1, description: String(error) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
rows.sort((a, b) => b.len - a.len);

const OVER = 160;
const over = rows.filter((r) => r.len > OVER);
for (const r of rows) {
  const flag = r.len > OVER ? "OVER" : r.len > 125 ? "  · " : "    ";
  console.log(`${flag} ${String(r.len).padStart(4)}  ${r.path}`);
}
console.log(
  `\n${over.length} of ${rows.length} over ${OVER} chars` +
    ` · ${rows.filter((r) => r.len > 125).length} over 125 (the social-preview limit)`,
);
for (const r of over) console.log(`\nOVER ${r.len}  ${r.path}\n  ${r.description}`);
