import { createHash } from "node:crypto";

/**
 * The Content-Security-Policy, in one place.
 *
 * Imported by next.config.ts (relative path — the `@/` alias does not exist
 * yet when the config loads), by src/proxy.ts, and by scripts/build.mjs, so it
 * must stay free of path aliases and of anything that is not plain Node.
 *
 * HOW `script-src` STAYS FREE OF 'unsafe-inline'
 *
 * Next's App Router ships every page's RSC payload as inline
 * `self.__next_f.push(...)` scripts. Their text is that page's data, so there
 * is no fixed list of hashes to write down — each page has its own. Two cases:
 *
 *   - Prerendered (static) pages get a per-page policy listing the SHA-256 of
 *     each inline script in that page's HTML. scripts/build.mjs builds once to
 *     collect the hashes, builds again with them in `headers()`, then fails the
 *     build unless every inline script of every page is covered. The pages stay
 *     static and CDN-cached; nothing about how they render changes.
 *
 *   - Pages that already render per request (DYNAMIC_PREFIXES) get a nonce
 *     minted by src/proxy.ts, which Next stamps on its own scripts. They were
 *     dynamic before this change, so the nonce costs them nothing.
 *
 * Nonces for everything would have been simpler, and would have made all ~100
 * content pages render on every request instead of coming off the CDN.
 */

/** Everything except `script-src`. Unchanged from the policy this replaced. */
export const BASE_DIRECTIVES: readonly string[] = [
  "default-src 'self'",

  // Fonts are self-hosted through next/font, so no font CDN is reachable.
  "font-src 'self'",

  // No third-party images, no tracking pixels. data: is needed for the
  // inline SVG favicon Next serves.
  "img-src 'self' data:",

  // Tailwind emits a stylesheet; Next and React inject small inline style
  // attributes/blocks. Left as it was: style injection cannot run script, and
  // hashing every style attribute is not worth its fragility. NOTE: a nonce
  // must never be added here — a nonce in a directive makes the browser ignore
  // 'unsafe-inline' in that same directive, which would break every page.
  "style-src 'self' 'unsafe-inline'",

  // No XHR or WebSocket anywhere in the app. Same-origin only covers the
  // App Router's own RSC payload requests.
  "connect-src 'self'",

  // Nothing on this site is embedded, and nothing embeds this site.
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "object-src 'none'",

  // Forms post to server actions on this origin and nowhere else. This is
  // what stops an injected form from exfiltrating a waitlist submission.
  "form-action 'self'",

  // Prevents a <base> tag injection retargeting every relative URL.
  "base-uri 'self'",

  "upgrade-insecure-requests",
];

/**
 * Path prefixes whose pages render per request. src/proxy.ts matches exactly
 * these (its matcher must be a static literal, so it repeats them — a unit
 * test keeps the two lists equal) and gives them a nonce policy; the static
 * fallback in next.config.ts excludes them so the two never stack.
 *
 * scripts/build.mjs fails the build if a page renders dynamically outside
 * these prefixes (it would have no way to run its scripts), or if a
 * prerendered page sits inside one (it would get two conflicting policies).
 */
export const DYNAMIC_PREFIXES: readonly string[] = [
  "/cart",
  "/crew",
  "/order",
  "/shop",
  "/unsubscribe",
];

export function isDynamicPath(pathname: string): boolean {
  return DYNAMIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** A full policy whose script-src is `'self'` plus the given sources. */
export function buildPolicy(scriptSources: readonly string[] = []): string {
  const unique = [...new Set(scriptSources)];
  const scriptSrc = ["script-src 'self'", ...unique].join(" ");
  return [...BASE_DIRECTIVES, scriptSrc].join("; ");
}

/**
 * The policy for a request-rendered page. In development React needs eval to
 * rebuild server error stacks (Next's own documentation); production never.
 */
export function noncePolicy(nonce: string, isDev = false): string {
  return buildPolicy([`'nonce-${nonce}'`, ...(isDev ? ["'unsafe-eval'"] : [])]);
}

/**
 * `next dev` renders everything on request with no build step to hash, and
 * hot reload injects its own inline script. Development only; the production
 * build never emits this (scripts/build.mjs asserts it).
 */
export function developmentPolicy(): string {
  return buildPolicy(["'unsafe-inline'", "'unsafe-eval'"]);
}

/** The CSP source expression for one inline script's exact text. */
export function scriptHash(text: string): string {
  return `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;
}

const SCRIPT_TAG = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const TYPE_ATTR = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const EXECUTABLE_TYPES = new Set([
  "",
  "text/javascript",
  "application/javascript",
  "module",
]);

export interface InlineScript {
  attributes: string;
  text: string;
}

/**
 * Inline scripts the browser would execute — the ones CSP governs.
 * `<script src>` is covered by 'self'; `application/ld+json` is data, which
 * CSP does not apply to.
 */
export function inlineExecutableScripts(html: string): InlineScript[] {
  const found: InlineScript[] = [];

  for (const match of html.matchAll(SCRIPT_TAG)) {
    const attributes = match[1] ?? "";
    const text = match[2] ?? "";

    if (/\bsrc\s*=/i.test(attributes)) continue;

    const typeMatch = attributes.match(TYPE_ATTR);
    const type = (typeMatch?.[1] ?? typeMatch?.[2] ?? typeMatch?.[3] ?? "")
      .trim()
      .toLowerCase();
    if (!EXECUTABLE_TYPES.has(type)) continue;

    found.push({ attributes, text });
  }

  return found;
}

/** Sorted, de-duplicated hash sources for every inline script in a page. */
export function hashesForHtml(html: string): string[] {
  return [...new Set(inlineExecutableScripts(html).map((s) => scriptHash(s.text)))].sort();
}

/**
 * Shape of the file scripts/build.mjs writes between its two passes.
 * `pages` maps a request path to that page's hashes; `fallback` holds the
 * hashes of the special pages (404, global error) served at any path.
 */
export interface CspHashManifest {
  pages: Record<string, string[]>;
  fallback: string[];
}

export const HASH_MANIFEST_FILE = ".csp-hashes.json";

/**
 * A request path as a literal next.config `source`. Characters that
 * path-to-regexp treats as syntax are escaped so a slug can never widen a
 * rule to other paths.
 */
export function literalSource(pathname: string): string {
  return pathname.replace(/[:()*+?{}\\]/g, (c) => `\\${c}`);
}

/**
 * The `source` for the fallback policy: every path except the dynamic
 * prefixes, which get theirs from the proxy. Two CSP headers on one response
 * are both enforced, so they must not overlap.
 */
export function fallbackSource(extraExcluded: readonly string[] = []): string {
  const names = [...DYNAMIC_PREFIXES, ...extraExcluded.map((p) => `/${p}`)]
    .map((p) => p.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return `/:path((?!(?:${names.join("|")})(?:/|$)).*)`;
}

/** The script-src directive's source list, or null when there is none. */
export function scriptSources(policy: string): string[] | null {
  for (const directive of policy.split(";")) {
    const [name, ...values] = directive.trim().split(/\s+/);
    if (name?.toLowerCase() === "script-src") return values;
  }
  return null;
}
