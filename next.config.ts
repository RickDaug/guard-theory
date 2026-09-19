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
  },

  images: {
    // Measured at matched SSIM rather than matched quality number: AVIF came
    // out 39.1% smaller than WebP across every portrait, with equal or better
    // fidelity on every file. An earlier measurement compared q75 to q75,
    // which is not a comparison across codecs, and concluded the opposite.
    formats: ["image/avif", "image/webp"],
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
