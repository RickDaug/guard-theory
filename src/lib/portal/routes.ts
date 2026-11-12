/**
 * Where the Crew Portal lives.
 *
 * The pages are at `/crew` in the app directory. `PORTAL_PATH` optionally maps
 * a different, non-obvious URL onto them through a rewrite in next.config.ts,
 * and when it is set `/crew` itself stops answering so there is only ever one
 * door.
 *
 * This matters more than usual because the repository is public: any path
 * written in the source is a path anyone can read. Obscurity is still not the
 * security — the password is — but a door that is not in the source at all
 * stays out of opportunistic scans.
 */

/** The real location in the app directory. Never change this without the rewrite. */
export const PORTAL_ROOT = "/crew";

function configured(): string {
  return (process.env.PORTAL_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
}

/** The path a reader's browser uses. `/crew` when nothing else is configured. */
export function portalBase(): string {
  const custom = configured();
  return custom ? `/${custom}` : PORTAL_ROOT;
}

export function portalUrl(path = ""): string {
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${portalBase()}${suffix}`;
}

/** True when a custom path is in use, so the built-in one must 404. */
/**
 * Where to go after signing in, or null if the request cannot be trusted.
 *
 * `next` arrives in a query string and then in a form field, so it is whatever
 * an attacker's link says it is. The old check — starts with "/", not with "//"
 * — let `/\\evil.example` and `/<tab>/evil.example` through, and the WHATWG URL
 * parser resolves both to `https://evil.example/`: sign in on the real site,
 * land on a copy of it asking for the password again.
 *
 * So this is an allowlist, not a blocklist: the portal's own base, optionally
 * followed by path segments made of letters, digits, `_` and `-`. No backslash,
 * no whitespace, no control character, no `.`, no `%`, no query and no
 * fragment can match, and nothing outside the portal can either.
 */
export function safeNextPath(next: unknown): string | null {
  if (typeof next !== "string" || next.length > 200) {
    return null;
  }

  if (!/^(\/[A-Za-z0-9_-]+)+$/.test(next)) {
    return null;
  }

  const base = portalBase();
  return next === base || next.startsWith(`${base}/`) ? next : null;
}

export function hasCustomPortalPath(): boolean {
  const custom = configured();
  return custom !== "" && custom !== "crew";
}

/**
 * Whether a GET reached a portal route from another site's page.
 *
 * Server actions are POSTs that Next checks for origin; a route handler's GET
 * is not, and the session cookie is SameSite=Lax, so it rides along on a
 * top-level navigation from anywhere. A GET that does something — the label
 * route fetches a fresh Shippo URL and writes "label opened to print, by
 * <name>" into the order's history — must not do it for a link on someone
 * else's page, or anyone can write history in a signed-in person's name.
 *
 * Sec-Fetch-Site is sent by every current browser and cannot be set by a page.
 * `same-origin` is the portal's own link; `none` is a typed address or a
 * bookmark. Anything else, `same-site` included (a sibling subdomain is not
 * this site), is refused. A request without the header (an old browser, curl
 * with a stolen cookie) is let through: the header is a defence against
 * someone else's page, not a substitute for the session.
 */
export function isCrossSiteRequest(headers: Headers): boolean {
  const site = headers.get("sec-fetch-site");
  return site !== null && site !== "same-origin" && site !== "none";
}
