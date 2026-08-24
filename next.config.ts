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
    remotePatterns: process.env.NEXT_PUBLIC_BLOB_HOSTNAME
      ? [
          {
            protocol: "https" as const,
            hostname: process.env.NEXT_PUBLIC_BLOB_HOSTNAME,
            port: "",
            pathname: "/**",
          },
        ]
      : [],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
