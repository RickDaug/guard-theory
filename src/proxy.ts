import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/portal/auth";
import { PORTAL_ROOT, hasCustomPortalPath, portalUrl } from "@/lib/portal/routes";

/**
 * `proxy.ts`, not `middleware.ts`.
 *
 * Next 16 renamed it; the old filename and the old `middleware` export are
 * deprecated. The runtime is `nodejs` and cannot be configured — the edge
 * runtime is not supported in a proxy at all.
 *
 * WHAT THIS IS FOR, AND WHAT IT IS NOT
 *
 * An optimistic cookie check, so a signed-out visitor gets the login screen
 * rather than a flash of the dashboard. It does no database lookup: proxies run
 * on prefetches too, and the bundled Next docs are explicit that this layer is
 * for optimistic checks only.
 *
 * **It is not the lock.** Server Actions are POSTs to the page route rather
 * than routes of their own, so a matcher that stops covering a path silently
 * stops covering that path's actions while they carry on working. Every portal
 * page and every portal action calls `requireSession()` itself. Delete this
 * file and the portal is still closed; it is just uglier.
 *
 * That is also why the matcher is narrow rather than a negative match over the
 * whole site. A proxy that matches a request makes Next buffer its body in
 * memory, and a truncated body fails Stripe's webhook signature verification
 * with a warning rather than an error. `/api/*` is never matched.
 *
 * When PORTAL_PATH is set, requests arrive on that path and are rewritten to
 * `/crew` by next.config.ts. Proxies run BEFORE rewrites, so this never sees
 * them — which is fine, because the pages do their own checking, and it means
 * the matcher can stay a static literal as Next requires.
 */

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // With a custom path configured, the built-in one is not a second door.
  if (hasCustomPortalPath()) {
    return new NextResponse(null, { status: 404 });
  }

  const signIn = portalUrl("/sign-in");

  if (pathname === signIn) {
    return NextResponse.next();
  }

  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = signIn;
    // Where they were heading, so signing in lands them there rather than on a
    // dashboard they then have to navigate away from.
    url.search =
      pathname === PORTAL_ROOT ? "" : `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Static literals: Next requires a statically analysable matcher, so this
  // cannot be built from PORTAL_PATH. See the note above about rewrites.
  matcher: ["/crew", "/crew/:path*"],
};
