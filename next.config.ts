import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * Everything here is enforcing, not report-only. The one deliberate compromise
 * is `script-src`, explained below — it is stated rather than hidden, because a
 * CSP that quietly permits what it claims to forbid is worse than none.
 */
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",

      // Fonts are self-hosted through next/font, so no font CDN is reachable.
      "font-src 'self'",

      // No third-party images, no tracking pixels. data: is needed for the
      // inline SVG favicon Next serves.
      "img-src 'self' data:",

      // Tailwind emits a stylesheet; Next injects small inline style blocks for
      // streaming, which cannot carry a hash without dynamic rendering.
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

      // KNOWN COMPROMISE. Next's App Router injects inline bootstrap and
      // hydration scripts. Removing 'unsafe-inline' requires either a
      // per-request nonce from middleware — which forces every page to render
      // dynamically and gives up the static prerendering the performance
      // budget depends on — or build-time hashing of scripts Next generates.
      //
      // Note that <script type="application/ld+json"> is unaffected either way:
      // CSP applies to executable script, and structured data is not executed.
      //
      // Tracked in docs/technical-architecture.md. Do not quietly delete this
      // comment to make the policy look stricter than it is.
      //
      // DEFERRED, 2026-09-29 (security audit S3-1, which found no XSS sink):
      // a nonce policy for the dynamic /crew and /cart routes only. It needs
      // the proxy to mint a nonce and pass the policy as a REQUEST header so
      // Next stamps its own scripts, the proxy matcher widened to /cart (it
      // is narrow on purpose, see src/proxy.ts), and this header dropped for
      // those routes, since two policies are both enforced. Its only real
      // proof is the full Playwright and Lighthouse run, so it ships on its
      // own branch with those runs, not inside a batch of other fixes.
      "script-src 'self' 'unsafe-inline'",

      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // Nothing here uses any of them. Denying them is cheaper than auditing
    // later whether some dependency started asking.
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  {
    // Only meaningful over HTTPS; harmless on localhost. Two years, with
    // subdomains, so a future shop.* cannot be served over plain HTTP.
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
];

/**
 * The one host product photographs are fetched from: NEXT_PUBLIC_BLOB_HOSTNAME
 * when it is set, otherwise the public host of the store named in
 * BLOB_READ_WRITE_TOKEN (`vercel_blob_rw_<store id>_<secret>` →
 * `<store id>.public.blob.vercel-storage.com`). Read at BUILD time, so a store
 * connected after the last deploy needs a redeploy before its photographs show.
 *
 * The same decision as blobHostname() in src/lib/images/host.ts, written out
 * here because this file is loaded before the path aliases exist.
 * tests/unit/images.test.ts runs both against the same inputs.
 */
export function photographHost(env: Record<string, string | undefined> = process.env): string | null {
  const explicit = env.NEXT_PUBLIC_BLOB_HOSTNAME?.trim().toLowerCase();
  if (explicit) return explicit;

  const parts = (env.BLOB_READ_WRITE_TOKEN ?? "").trim().split("_");
  const storeId = parts[3];
  const isToken = parts.length >= 5 && parts[0] === "vercel" && parts[1] === "blob" && parts[2] === "rw";

  return isToken && storeId && /^[A-Za-z0-9]+$/.test(storeId)
    ? `${storeId.toLowerCase()}.public.blob.vercel-storage.com`
    : null;
}

const PHOTOGRAPH_HOST = photographHost();

const nextConfig: NextConfig = {
  poweredByHeader: false,

  experimental: {
    // `next build`'s default type-check step runs inside a forked jest-worker
    // that constructs its own full TypeScript Program/Checker (via the
    // `typescript` API), *while the webpack/Turbopack process from the
    // "Compiled successfully" step immediately before it is still resident*.
    // On a memory-tight machine that second, independent process is where a
    // build has died with V8's "Fatal process out of memory: Zone" — the
    // zone allocator used by V8's own parser/compiler, which `--max-old-space-size`
    // does not govern (that flag only raises the permitted JS *heap* ceiling,
    // not what the OS can actually back), so raising it does not help and can
    // make matters worse by encouraging V8 to grow the heap toward a ceiling
    // that exceeds the machine's physical RAM. `useTypeScriptCli` swaps that
    // in-process Program for a plain spawn of `typescript`'s own `tsc` binary —
    // the same path `npm run typecheck` already uses, measured at ~300MB and
    // ~6s with --extendedDiagnostics on this project, versus a much larger,
    // harder-to-predict footprint for the API path's Program+Checker. Type
    // checking still runs, and still fails the build on a real error; only the
    // mechanism changes. See docs/technical-architecture.md (or AGENTS.md's
    // "Gotchas" section) for how this was diagnosed.
    useTypeScriptCli: true,

    // Product photographs are uploaded through a server action (the Crew
    // Portal's product editor). The default 1 MB would refuse every one; the
    // upload's own limit is 4 MB (src/lib/images/validate.ts), plus room for
    // multipart framing, and 4.5 MB is also Vercel's ceiling for a function's
    // request body, so nothing larger could arrive anyway. This limit is
    // global: the public actions (waitlist, contact, cart) validate and rate
    // limit their own fields and read nothing near this size.
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },

  images: {
    // Measured at matched SSIM rather than matched quality number: AVIF came
    // out 39.1% smaller than WebP across every portrait, with equal or better
    // fidelity on every file. An earlier measurement compared q75 to q75,
    // which is not a comparison across codecs, and concluded the opposite.
    formats: ["image/avif", "image/webp"],

    // Product photography uploaded through the Crew Portal lives in object
    // storage, and this is the list of hosts the optimizer is allowed to fetch
    // from. An unlisted host returns 400 rather than being fetched.
    //
    // NOTE, because it reads like a hole in the CSP and is not one: the browser
    // never requests these hosts. `next/image` fetches the original server-side
    // and serves the optimized result from `/_next/image` on our own origin, so
    // `img-src 'self' data:` stays exactly as strict as it looks, and the
    // "no third-party request" test in tests/e2e/security.spec.ts stays green.
    //
    // That guarantee only holds through `next/image`. A raw <img src="https://…">
    // pointing at the blob host would be a real third-party request and would
    // fail both the CSP and that test — which is the point of the guard in
    // tests/unit/images.test.ts.
    //
    // The hostname is pinned rather than wildcarded: `remotePatterns` treats an
    // omitted pathname as `**`, which Next's own documentation warns against.
    remotePatterns: PHOTOGRAPH_HOST
      ? [
          {
            protocol: "https" as const,
            hostname: PHOTOGRAPH_HOST,
            port: "",
            pathname: "/**",
          },
        ]
      : [],
  },

  async headers() {
    // The second lock on indexing — see `isIndexable` in src/lib/site.ts, which
    // makes the same decision for the robots meta tag and robots.txt. A header
    // also covers what a meta tag cannot: images, the sitemap, anything that is
    // not HTML. Read here, at call time, rather than imported: this file is
    // loaded before the path aliases exist.
    const vercelEnv = process.env.VERCEL_ENV;
    const isNonProductionDeployment = Boolean(vercelEnv) && vercelEnv !== "production";

    return [
      {
        source: "/:path*",
        headers: isNonProductionDeployment
          ? [...securityHeaders, { key: "X-Robots-Tag", value: "noindex" }]
          : securityHeaders,
      },
    ];
  },

  /**
   * The Crew Portal's optional non-obvious URL.
   *
   * The pages live at /crew. Setting PORTAL_PATH serves them from somewhere
   * else instead, and src/proxy.ts then makes /crew itself return 404, so
   * there is only ever one door.
   *
   * This matters because the repository is public: a path written in the
   * source is a path anyone can read. It is still not the security — the
   * password is — but it keeps the door out of opportunistic scans.
   *
   * Read at build time, so changing it needs a redeploy rather than a restart.
   */
  async rewrites() {
    const custom = (process.env.PORTAL_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");

    if (!custom || custom === "crew") {
      return [];
    }

    return [
      { source: `/${custom}`, destination: "/crew" },
      { source: `/${custom}/:path*`, destination: "/crew/:path*" },
    ];
  },

  /**
   * One canonical host.
   *
   * Both the apex and www resolve to the same deployment, so without this the
   * whole site is reachable at two addresses. The canonical tags already point
   * at the apex, but a redirect is the stronger signal and stops the duplicate
   * existing at all.
   *
   * Kept in code rather than in host configuration so it survives a move off
   * Vercel and is visible in review.
   */
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.guardtheory.net" }],
        destination: "https://guardtheory.net/:path*",
        permanent: true,
      },
      {
        // The deployment host answers for the whole site. Without this it is a
        // second complete copy the moment indexing is switched on.
        source: "/:path*",
        has: [{ type: "host", value: "guard-theory.vercel.app" }],
        destination: "https://guardtheory.net/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
