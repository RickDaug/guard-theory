import { redirect } from "next/navigation";
import { getSession } from "./session.ts";
import { portalUrl } from "./routes.ts";

/**
 * The guard a portal PAGE uses.
 *
 * Redirects rather than throwing, and redirects rather than returning 401.
 *
 * That last part is deliberate and it is not only politeness. `links.spec.ts`
 * fails on any crawled page returning 400 or above, and `console.spec.ts` fails
 * on any response of 400 or above anywhere on a listed route. A 401 on a browser
 * navigation would break both — and a redirect to a sign-in screen is the
 * correct thing for a navigation regardless. The tests and the right answer
 * agree here, which is usually a sign the tests are right.
 */
export async function requirePortalPage(next?: string): Promise<void> {
  const session = await getSession();

  if (session) {
    return;
  }

  const target = next ? `?next=${encodeURIComponent(next)}` : "";
  redirect(`${portalUrl("/sign-in")}${target}`);
}
