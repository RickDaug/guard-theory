import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";
import {
  HASH_MANIFEST_FILE,
  buildPolicy,
  developmentPolicy,
  fallbackSource,
  literalSource,
  type CspHashManifest,
} from "./src/lib/csp.ts";

/**
 * The per-page CSP rules.
 *
 * `npm run build` (scripts/build.mjs) runs `next build` twice. The first pass,
 * GT_CSP_PASS=collect, emits no per-page rules; the script then hashes every
 * inline script in the prerendered HTML into HASH_MANIFEST_FILE, and the second
 * pass turns that into one rule per page. A plain `next build` without the
 * manifest refuses to proceed rather than ship pages whose scripts are blocked.
 *
 * Order matters: when two rules set the same header, the later one wins, so the
 * fallback comes first and each page's own rule overrides it.
 */
function contentSecurityPolicyRules(isDev: boolean) {
  if (isDev) {
    return [
      {
        source: fallbackSource(),
        headers: [{ key: "Content-Security-Policy", value: developmentPolicy() }],
      },
    ];
  }

  const collecting = process.env.GT_CSP_PASS === "collect";
  const manifestPath = join(process.cwd(), HASH_MANIFEST_FILE);

  if (!collecting && !existsSync(manifestPath)) {
    throw new Error(
      `${HASH_MANIFEST_FILE} is missing. Build with \`npm run build\` (scripts/build.mjs), not \`next build\` directly: the CSP needs each page's script hashes.`,
    );
  }

  const manifest: CspHashManifest = collecting
    ? { pages: {}, fallback: [] }
    : JSON.parse(readFileSync(manifestPath, "utf8"));

  // A custom portal path is served by rewrite, which the proxy never sees, so
  // it cannot get a nonce. Those pages keep the old 'unsafe-inline' policy —
  // an explicit, portal-only exception rather than a broken portal.
  const portal = (process.env.PORTAL_PATH ?? "").trim().replace(/^\/+|\/+$/g, "");
  const customPortal = portal && portal !== "crew" ? portal : null;

  const rules = [
    {
      source: fallbackSource(customPortal ? [customPortal] : []),
      headers: [
        { key: "Content-Security-Policy", value: buildPolicy(manifest.fallback) },
      ],
    },
    ...Object.entries(manifest.pages).map(([pathname, hashes]) => ({
      source: literalSource(pathname),
      headers: [{ key: "Content-Security-Policy", value: buildPolicy(hashes) }],
    })),
  ];

  if (customPortal) {
    const legacy = buildPolicy(["'unsafe-inline'"]);
    rules.push(
      { source: `/${customPortal}`, headers: [{ key: "Content-Security-Policy", value: legacy }] },
      {
        source: `/${customPortal}/:path*`,
        headers: [{ key: "Content-Security-Policy", value: legacy }],
      },
    );
  }

  return rules;
}


/**
 * Security headers.
 *
 * Everything here is enforcing, not report-only. The Content-Security-Policy is
 * not in this list: it differs per page and is assembled in `headers()` below
 * from src/lib/csp.ts, which explains how `script-src` manages without
 * 'unsafe-inline' while the content pages stay static.
 */
const securityHeaders = [
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

  // Both build passes must produce byte-identical pages, or the hashes the first
  // collects will not match what the second ships. The build ID is inside every
  // page's RSC payload, so scripts/build.mjs fixes it for both passes.
  generateBuildId: async () => process.env.GT_BUILD_ID || null,

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
      ...contentSecurityPolicyRules(process.env.NODE_ENV === "development"),
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
