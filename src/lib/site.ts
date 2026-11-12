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

/**
 * The live origin, written down once.
 *
 * SITE_URL above is wherever this build happens to be served from. This is the
 * one place a message that cannot be recalled is allowed to point: the list
 * send refuses to run unless SITE_URL is exactly this, so an unsubscribe link
 * can never carry a preview deployment's hostname or localhost.
 */
export const PRODUCTION_ORIGIN = "https://guardtheory.net";

export const SITE_NAME = "Guard Theory";

export const SITE_TAGLINE =
  "Position before submission. Systems before chaos.";

export const SITE_DESCRIPTION =
  "Guard Theory makes no-gi grappling apparel and publishes a technical study of the guard.";

/**
 * Staging and preview environments must never be indexed. Production is the
 * only place robots are allowed, and it has to say so explicitly.
 */
export const IS_INDEXABLE = isIndexable({
  // Read as literals: `NEXT_PUBLIC_*` is inlined by name at build time, and an
  // indirect read (`process.env[key]`, or passing `process.env` whole) is not.
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING,
  vercelEnv: process.env.VERCEL_ENV,
});

/**
 * The decision, as a function so it can be tested without a build.
 *
 * Two locks rather than one. The opt-in has always been the rule, and it is
 * scoped to Production in the Vercel project — so a preview is noindex today.
 * But that is a dashboard setting, and ticking one more box on it would put
 * every preview URL in play with nothing in the code objecting. So when Vercel
 * says what kind of deployment this is and it is not production, the answer is
 * no, whatever the opt-in says.
 *
 * `VERCEL_ENV` unset is not a refusal: that is a local build, CI, or a host
 * other than Vercel, and the opt-in alone decides there, as it always did.
 */
export function isIndexable({
  allowIndexing,
  vercelEnv,
}: {
  allowIndexing: string | undefined;
  vercelEnv: string | undefined;
}): boolean {
  if (vercelEnv && vercelEnv !== "production") return false;
  return allowIndexing === "true";
}

/**
 * The language the site is written in, once.
 *
 * It is British English — "colour", "self-defence", dates as 14 September —
 * and three places used to say only "en": the `lang` attribute, `og:locale`
 * and the WebSite node. `og:locale` is not even well-formed without a
 * territory; the protocol's format is language_TERRITORY.
 */
export const SITE_LANGUAGE = "en-GB";
export const OG_LOCALE = "en_GB";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
