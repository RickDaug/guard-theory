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
export function hasCustomPortalPath(): boolean {
  const custom = configured();
  return custom !== "" && custom !== "crew";
}
