/**
 * Site-wide constants.
 *
 * SITE_URL is the canonical origin. It is read from the environment so preview
 * deployments do not emit canonicals and structured data pointing at
 * production, and it falls back to localhost in development rather than to a
 * guessed domain.
 *
 * The production domain is an owner decision and is not yet fixed — see
 * docs/owner-decisions.md. Nothing in the codebase should hard-code one
 * anywhere other than here.
 */

const FALLBACK = "http://localhost:3000";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : FALLBACK)
).replace(/\/$/, "");

export const SITE_NAME = "Guard Theory";

export const SITE_TAGLINE =
  "Position before submission. Systems before chaos.";

export const SITE_DESCRIPTION =
  "Guard Theory makes no-gi grappling apparel and publishes a technical study of the guard.";

/**
 * Staging and preview environments must never be indexed. Production is the
 * only place robots are allowed, and it has to say so explicitly.
 */
export const IS_INDEXABLE =
  process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
