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
// The sitemap carries absolute URLs built from NEXT_PUBLIC_SITE_URL, which in a
// local build points at a port nothing is listening on. Take the paths and put
// them back on the origin being audited — otherwise every fetch fails, every
// length reads -1, and the run reports a clean site because nothing answered.
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  (m) => new URL(new URL(m[1]).pathname, ORIGIN).toString(),
);
console.log(`${urls.length} routes in the sitemap\n`);

const ENTITIES = { "&#x27;": "'", "&#39;": "'", "&quot;": '"', "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };
const decode = (v) =>
  v.replace(/&#x27;|&#39;|&quot;|&amp;|&lt;|&gt;|&nbsp;/g, (e) => ENTITIES[e]);

const rows = [];
const CONCURRENCY = 8;
let i = 0;

async function worker() {
  while (i < urls.length) {
    const url = urls[i++];
    try {
      const html = await (await fetch(url)).text();
      const raw =
        html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
      // Measure what a crawler sees, not what the HTML spells. React escapes
      // apostrophes to &#x27;, six characters for one, so an entity-heavy
      // sentence reads ten characters longer than it is and the run flags a
      // route that is actually fine.
      const description = decode(raw);
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
