# Security and Privacy audit

**Target.** Guard Theory — repo `C:\Users\RickD\AndroidStudioProjects\guard-theory`, public at
`github.com/RickDaug/guard-theory`, live at `https://guardtheory.net`.
**Date.** 2026-08-05. **Method.** Full source read, full git-history secret scan, and live probing of
production (headers, both server actions driven directly over the RSC wire protocol, image optimiser,
redirect and 404 behaviour). No build, dev server or Playwright run was started.
**Authorisation.** Defensive audit of the owner's own site, at the owner's request. Every submission
sent during probing used `@example.invalid` addresses and was marked as an audit probe; every probe
that could have written a record was deliberately constructed to fail validation, except the two that
were needed to prove the storage finding below.

---

## Summary

The shipped attack surface is small and defended better than most sites this size. There are no
secrets in the repository or its history, no cookies, no third-party requests, no reachable injection
path, and the security headers in production are byte-identical to `next.config.ts`. Next's own
origin check and body limit hold on both server actions.

What is wrong is on the data side, not the perimeter. **Both public forms fail in production and
throw the submission away silently**, which is proven below, and the privacy policy describes a
retention practice that does not happen. The rate limiter that will matter the day a mail provider is
connected does not survive concurrency, which is also proven below.

| Severity | Count |
|---|---|
| S0 critical | 0 |
| S1 high | 1 |
| S2 medium | 3 |
| S3 low | 6 |

---

## S1 — High

### S1-1. Both public forms fail in production and discard the submission with no operator signal

**Proven live.** A valid waitlist submission and a valid contact submission were sent to production
and both were rejected by the store:

```
POST https://guardtheory.net/first-edition  (Next-Action: 608f9efaa647b7223cfa5cb274c2bd29ae46f6ae1e)
→ {"status":"error","message":"We could not save your details just now. …"}

POST https://guardtheory.net/contact        (Next-Action: 60a53d14bcaf96cdf243da7f6bc4722a128e3783cb)
→ {"status":"error","message":"We could not save your message just now. …"}
```

**Mechanism.** Both stores write to a directory under the deployment root:

- `src/lib/storage/ndjson-store.ts:17` — `const DATA_DIR = path.join(process.cwd(), ".data")`
- `src/lib/waitlist/local-store.ts:17-18` — the same path, plus `waitlist.ndjson`

On Vercel's Node runtime the deployment filesystem is read-only; only `/tmp` is writable. `mkdir` at
`src/lib/storage/ndjson-store.ts:28` and `src/lib/waitlist/local-store.ts:26` therefore throws
`EROFS` on every request, and both `catch` blocks swallow it:

- `src/lib/storage/ndjson-store.ts:31-34` — `catch { return false; }`
- `src/lib/waitlist/local-store.ts:35-39` — `catch { return { ok: false, … } }`

**Why this is high, not medium.**

1. There is no logging anywhere in `src/` — `grep -rn "console\.\(log\|error\|warn\)" src/` returns
   nothing. The failure produces no log line, no alert, and no metric. The owner cannot know it is
   happening.
2. `/first-edition` is the site's only conversion point, and the site publishes **no email address
   anywhere** — a grep of `src/`, `content/` and the live HTML finds no `mailto:` and no
   `@guardtheory.net`. The contact form is the only channel in or out. Both are dead.
3. The failure mode is exactly the one the codebase says it was built to prevent. The comment at
   `src/lib/waitlist/local-store.ts:8-11` states the store exists "so that a form submitted during
   development is never silently discarded — the brief forbids that, and it is the kind of thing that
   quietly loses real signups if a provider is misconfigured in production." It is doing precisely
   that, in production, today.

**Fix.** The store must either persist somewhere that survives (a mail provider, a KV store, or at
minimum `/tmp` plus an out-of-band copy), or the failure must be surfaced — log the error server-side
and change the user-facing copy from "try again in a moment" (which is false; retrying will never
work) to a statement that the list is not yet open. `WaitlistStore.isDurable` already exists at
`src/lib/waitlist/types.ts:38` and is not read by any page; wiring the UI to it would make the state
honest.

---

## S2 — Medium

### S2-1. The rate limiter does not survive concurrency; the honeypot is a no-op against a deliberate attacker

**Rate limiter, proven live.** `src/lib/rate-limit.ts:12` holds windows in a module-level `Map`, so
each serverless instance has its own counter. Sequentially, the limiter works — twenty sequential
POSTs to `/first-edition` were all blocked with "That's several attempts in a short time." Fired
**concurrently**, twenty identical POSTs produced:

```
TOTAL: 20 · RATE-LIMITED: 15 · PASSED TO VALIDATION: 5
```

Five requests reached the validator from an IP that was already fully blocked, because Vercel fanned
them out to a second instance holding a fresh window. The effective limit is `5 × (live instances)`,
and an attacker controls the instance count by controlling concurrency. The file's own header comment
at `src/lib/rate-limit.ts:1-8` is honest that this is what it is; the concurrency multiplier is the
part not stated.

**`x-forwarded-for` is *not* spoofable here — this part is fine.** `src/app/first-edition/actions.ts:13-15`
and `src/app/contact/actions.ts:38` take `x-forwarded-for.split(",")[0]`. Tested with
`X-Forwarded-For: 203.0.113.1|.2|.3` against an already-blocked IP: all three were still blocked.
Vercel normalises the header to the real client IP before the function sees it, so the first entry
cannot be attacker-chosen on this platform. Worth recording, because the comment at
`src/app/first-edition/actions.ts:11-12` asserts this without the platform dependency being written
down — the code becomes spoofable the moment it is deployed behind anything other than Vercel.

**Honeypot.** `src/app/first-edition/actions.ts:25` and `src/app/contact/actions.ts:47` read
`formData.get("website")`. Omitting the field entirely makes `get` return `null`, `typeof null !== "string"`,
and execution falls through to the normal path. Every probe in this audit omitted it and reached the
validator. The honeypot stops naive form-fillers only, which is what it was designed for — the point
is that it contributes nothing to the ceiling on abuse.

**Net.** After the honeypot, the only real controls on these two public POST endpoints are Next's
1 MB body limit and its origin check. Today the impact is nil because nothing is stored (S1-1). On
the day a mail provider is wired in at `src/lib/waitlist/index.ts:22` this becomes the control that
decides whether the list can be poisoned with arbitrary addresses at machine speed, and it will not
hold. **Fix it before connecting a provider, not after.**

### S2-2. Consent is asserted for an address whose owner never confirmed it

`src/lib/waitlist/validate.ts:73` reads a checkbox, and `:123` writes `consent: true` into the stored
record. There is no confirmation email and no double opt-in — `getWaitlistStore()`
(`src/lib/waitlist/index.ts:15-23`) has no verification step, and `/email-confirmed` exists as a page
with nothing routing to it. Anyone can submit any third party's address; the resulting record asserts
a consent that address never gave. Combined with S2-1, a script can enrol arbitrary addresses in bulk.

The type comment at `src/lib/waitlist/types.ts:25` — "Must be true. Never defaulted, never pre-checked
in the UI" — is careful about the checkbox and silent about the address. Under GDPR/UK GDPR the
controller must be able to demonstrate consent; a tick from an unverified submitter does not
demonstrate anything about the address owner. Double opt-in closes both this and the list-poisoning
half of S2-1 in one change, and `/email-confirmed` is already built for it.

### S2-3. The privacy policy describes retention that does not occur, and omits the parts that do

`src/content/policies/index.ts:52`: *"Waitlist details are kept until the First Edition has been
released and you have been told, or until you ask us to delete them. Messages sent through the contact
form are kept for twelve months and then deleted."*

In production nothing is kept at all (S1-1), and if the store is ever fixed, nothing in the codebase
deletes anything — there is no retention job, no TTL, and `NdjsonStore` is append-only by design
(`src/lib/storage/ndjson-store.ts:26-35`). Both halves of that sentence are unsupported: the first
overstates what happens, the second promises a deletion that no code performs.

To the policy's credit, the claims that *are* testable check out. `src/content/policies/index.ts:67`
— "This site sets no analytics cookies and loads no third-party tracking scripts" — was verified live
and is exactly true; see Privacy below. `:35-37`'s list of collected fields matches
`src/lib/waitlist/validate.ts:114-124` and `src/app/contact/actions.ts:103-109` field for field, with
nothing collected that is not listed.

**Fix.** Either implement retention or state what actually happens. Also missing, and needed before
the list holds a real address: who the controller is, and which processor the data is handed to once
one is chosen.

---

## S3 — Low

### S3-1. Owner's personal email and local filesystem path published in the public repo

`docs/assumptions.md:76-77`:

> **Repository location.** `C:\Users\RickD\AndroidStudioProjects\guard-theory`, alongside the owner's
> other projects. Git identity matches the other repos (RickDaug / urielruiz2134@gmail.com).

This is the only personal identifier the project exposes, and it is exposed in a repo that is public
and in a site that deliberately publishes no contact address — so the scrapeable address for Guard
Theory is the owner's personal Gmail. The Windows username and the local directory layout are also
disclosed. The commit-author email is the same address and is unavoidable in git history, but the
prose mention is deliberate content and can simply be cut. If the address itself is to be rotated,
that requires a history rewrite; more practical is to publish a real business address on `/contact`
so the personal one stops being the path of least resistance.

### S3-2. JSON-LD is serialised without escaping `<` — safe today, one data source away from not being

Six `dangerouslySetInnerHTML` sites, all `JSON.stringify(...)` into `<script type="application/ld+json">`:

- `src/components/site/SiteStructuredData.tsx:47`
- `src/components/site/Breadcrumbs.tsx:63`
- `src/app/journal/[slug]/page.tsx:276`
- `src/app/figures/[slug]/page.tsx:215`
- `src/app/figures/page.tsx:106`
- `src/app/faq/page.tsx:118`

**Every one is currently safe, and I checked the path rather than trusting the comments.** All seven
dynamic routes resolve their slug against an explicit registry and call `notFound()` on a miss —
`src/app/journal/[slug]/page.tsx:48`, `src/app/journal/category/[slug]/page.tsx:34`,
`src/app/technique/[category]/[slug]/page.tsx:73,76`, `src/app/technique/[category]/page.tsx:28`,
`src/app/shop/[slug]/page.tsx:38`, `src/app/policies/[slug]/page.tsx:28`,
`src/app/figures/[slug]/page.tsx:33` — so no attacker-controlled string reaches a graph. Confirmed
live: `GET /journal/"><script>alert(1)</script>` → **404**. There is no `searchParams` read anywhere
in `src/`, no `redirect()`, no `window.location`, no `innerHTML`, no `eval`.

The latent problem is that `JSON.stringify` does not escape `<`, `>` or `\u2028`, so a value
containing `</script>` breaks out of the block, and `script-src 'unsafe-inline'` means what follows
executes. Today the only way to get such a value in is to type it into a `src/content/**` entry, which
is a build-time authoring act, not an attack. But the day any of this data comes from a CMS, a
submitted correction, or a slug that is no longer registry-bound, this becomes a stored XSS with no
further mistakes required. A four-character fix — `.replace(/</g, "\\u003c")` on the serialised
string — removes the category permanently. The comments at `Breadcrumbs.tsx:62` and
`SiteStructuredData.tsx:46` ("no user input reaches it") are accurate now and are exactly the kind of
comment that outlives the condition it describes.

### S3-3. The whitespace honeypot silently discards a genuine signup

`src/app/first-edition/actions.ts:25` tests `formData.get("website") !== ""` **without trimming**, so
a `website` value of a single space triggers the honeypot. The contact action does trim
(`src/app/contact/actions.ts:47` via `readString`), so the two differ. The honeypot input at
`src/components/waitlist/WaitlistForm.tsx:225` is `name="website"` — a name some autofill extensions
and password managers will populate. A real person whose browser fills it gets
`{status:"success", message:"You're on the list."}` (lines 27-32) and is never stored. That is the
project's "never silently discard" rule broken for the exact class of user least able to notice.
Trim before comparing, and rename the field to something no autofill heuristic targets.

### S3-4. No CSP reporting, so a violation in production is invisible

`next.config.ts:11-70` sets an enforcing policy with no `report-uri` and no `report-to`. Verified on
the live header. The consequence is that the project has no way to find out whether the policy is
blocking something real, and no way to detect an injection attempt that the policy stopped. For a
codebase whose stated position is that "a CSP that quietly permits what it claims to forbid is worse
than none" (`next.config.ts:4-8`), not being able to observe the policy is the matching blind spot.

### S3-5. `Access-Control-Allow-Origin: *` on all responses; no CORP

Vercel adds `Access-Control-Allow-Origin: *` to page HTML and static assets — confirmed on `/` and on
`/figures/royce-gracie.jpg`. Any origin can `fetch()` and read the full HTML and RSC payloads.
`Cross-Origin-Resource-Policy` is not set (`Cross-Origin-Opener-Policy: same-origin` is). **Impact
today is nil** — there are no cookies (verified: no `Set-Cookie` on any response), no sessions and no
per-user content, so cross-origin reading yields exactly what a plain GET yields. It matters only if
authenticated or personalised content is ever added. Recorded so it is a decision rather than an
oversight. The server actions themselves do *not* carry the header and are origin-checked: a POST with
`Origin: https://evil.example.com` was rejected with `500 · digest 1386071799@E80`. CSRF is closed.

### S3-6. `robots.txt` in production disallows everything

`https://guardtheory.net/robots.txt` returns `User-Agent: * / Disallow: /`, meaning
`NEXT_PUBLIC_ALLOW_INDEXING` is not set in the Vercel production environment
(`src/lib/site.ts:35-36`; `src/app/robots.ts:11-15`). The mechanism is correct and deliberately
fail-closed; the production value is missing. Flagged here because it is an environment-configuration
gap found while probing — the commercial consequence belongs to the SEO auditor. Related: the default
alias `https://guard-theory.vercel.app/` serves the same deployment and is reachable, with identical
headers; the `www → apex` redirect at `next.config.ts:97-105` does not cover it. No security impact,
since the origin serves the same public content under the same CSP.

---

## Verified clean

These were checked and found sound; recording them so a later reader does not re-litigate them.

**Secrets — the repository history is clean.** 34 commits, all paths ever added enumerated with
`git log --all --diff-filter=A --name-only`. `.env*`, `.vercel/*` and `.data/*` have **never** been
tracked — `git log --all -- '.vercel*' '.data*' '*.env*'` returns empty, so commit `edd89a2` ("chore:
ignore the Vercel project link") was preventive, not remedial. A content scan across all history
(`git log --all -p -G'(sk-|api[_-]?key|secret|token|password|prj_|team_|Bearer |AKIA|ghp_|-----BEGIN)'`)
returns only prose and Tailwind design-token names. No key, credential, submission or personal record
has ever been committed. `.data/waitlist.ndjson` on the working copy holds 26 local test records and
is correctly gitignored (`.gitignore:35`).

**Headers — production matches `next.config.ts` exactly**, verified on `/`, `/first-edition`, a 404
and a static asset. All present and enforcing: CSP, `Strict-Transport-Security: max-age=63072000;
includeSubDomains; preload`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, the nine-entry
`Permissions-Policy`, and no `X-Powered-By` (`next.config.ts:73`).

**The `script-src 'unsafe-inline'` compromise, assessed honestly.** It is real and it is the weakest
part of the policy: it means the CSP would not stop an injected inline script from executing. But
exploiting it requires an injection point, and there is none. There is no user-generated content
rendered anywhere on this site; there is no `searchParams` read, no `redirect()`, no `innerHTML`, no
`eval`; the only raw-HTML sinks are the six JSON-LD blocks covered in S3-2, all fed from module-level
literals behind registry lookups that 404 on a miss. In the shipped state the compromise is
**unexploitable**, and the rest of the policy is doing the load-bearing work regardless of it:
`form-action 'self'` is what actually stops an injected form exfiltrating a waitlist submission,
`base-uri 'self'` blocks `<base>` retargeting, `connect-src 'self'` blocks beaconing, and
`frame-ancestors 'none'` blocks framing. The stated reasoning at `next.config.ts:52-64` is accurate:
a nonce requires middleware and forfeits static prerendering. **Accepting this is the right call for
this site**, and the comment should not be deleted to make the policy look stricter than it is. The
condition to re-open it is the arrival of user-generated content, not a Next.js upgrade.

**Injection surfaces.** `next/image` is used at `src/app/figures/page.tsx:67` and
`src/app/figures/[slug]/page.tsx:67` with local `/figures/*.jpg` paths only. No `images.remotePatterns`
is configured, so the optimiser default-denies remote hosts — confirmed live:
`/_next/image?url=https%3A%2F%2Fexample.com%2Fa.jpg` → **400**, `/_next/image?url=%2F..%2F..%2Fpackage.json`
→ **400**, local figure → **200**. The `www` redirect (`next.config.ts:97-105`) has a fixed
destination and takes no user input; it cannot be turned into an open redirect. Source maps are not
served (**403**). The 404 page does not reflect the requested path.

**Privacy — the policy's testable claims are true.** Every page fetched (`/`, `/first-edition`,
`/contact`, `/journal`, `/figures`, `/search`) contains exactly one external URL: the string
`https://schema.org`, which is a JSON-LD `@context` identifier and not a network request. Zero
third-party origins, zero cookies (no `Set-Cookie` on any response), zero analytics, zero
fingerprinting, no `Google Fonts` (`next/font` self-hosts, so `font-src 'self'` genuinely holds), no
beacons. `interest-cohort=()` is denied. Search is entirely client-side over an index built at
`src/lib/search/index.ts` — the copy at `src/app/search/page.tsx:24-25` claiming no query leaves the
browser is accurate. **This is the cleanest part of the audit**, and it is a stronger privacy position
than the policy page even bothers to claim.

**Server-action hardening that does hold.** Cross-origin POST rejected (Next's origin check). A 3 MB
body rejected with a bare digest — Next's 1 MB `bodySizeLimit` default; a 900 KB body is accepted and
then rejected by `MAX_MESSAGE` at `src/app/contact/actions.ts:83-85`. No error path leaks internals:
every failure returns either a written sentence or an opaque digest such as `{"digest":"3379654745"}`,
never a stack, a path or a provider name — `src/lib/storage/ndjson-store.ts:31` and
`src/lib/waitlist/local-store.ts:35` deliberately swallow the filesystem path, and that part works as
designed. Contact input is validated for presence, email shape, topic allow-list
(`src/app/contact/actions.ts:87-89`, unknown topics collapse to `"other"` rather than erroring) and
length; control characters are stripped at `:32-34` and `src/lib/waitlist/validate.ts:58-60`; the
waitlist enforces `MAX_EMAIL 254`, `MAX_NAME 80`, `MAX_SIZE 24` and allow-lists all three enum fields
(`validate.ts:93-103`), silently dropping unknown values rather than storing them.

**CI.** `.github/workflows/ci.yml` uses `pull_request`, not `pull_request_target`, so a fork PR from
the public repo cannot obtain write permissions or secrets. No secret is referenced by any step.

**Dependencies — 3 high advisories, all unreachable in this app.** `npm audit`: 3 high, 0 critical,
across 22 production and 514 dev dependencies, all transitive through `next`.

- **postcss** (XSS via unescaped `</style>` in stringify output; arbitrary `.map` read via
  attacker-controlled `sourceMappingURL`). postcss runs at **build time only**, over CSS authored in
  this repo (`globals.css` plus Tailwind v4 through `@tailwindcss/postcss`). Both advisories require
  attacker-controlled CSS input. There is none, and no path by which any could appear. **Not
  reachable.**
- **sharp** → libvips (CVE-2026-33327/33328/35590/35591). sharp is a devDependency used by
  `scripts/brand/raster.mjs`, and by image optimisation at runtime. The only images it ever decodes
  are the eight repo-owned JPEGs in `public/figures/` and the brand PNGs; remote images are rejected
  at the optimiser (**400**, verified above) because no `remotePatterns` exists. Every input is
  first-party and fixed at build. **Not reachable.**

Accepting all three is correct. The one that would change is sharp, the moment user-uploaded or
remote imagery is ever introduced.

---

## Score: 78 / 100

The perimeter is genuinely well built and I could not get through it: no secrets have ever touched
the history, the live headers match the source exactly, CSRF and body limits hold, the image
optimiser and every dynamic route are registry-bound and reject everything I threw at them, and the
privacy story — zero cookies, zero third parties, zero analytics — is not merely compliant but
better than the policy page bothers to claim. The documented `'unsafe-inline'` compromise is real but
unexploitable in the shipped state, and stating it plainly is worth more than hiding it. The
deductions are almost entirely on the data side. One S1 costs the most: both public endpoints fail on
every production request and throw the submission away with no log, no alert and a message telling the
user to retry something that will never work — on a site that publishes no other way to reach it, and
in a codebase whose own comments say this is the exact failure it was written to prevent. Beneath that
sit an abuse ceiling that concurrency demonstrably removes, a consent record that asserts something no
address owner ever confirmed, and a privacy policy making a retention promise that no code keeps. None
of those is an intrusion path; all three are the difference between a site that is safe because it is
defended and one that is safe because it currently holds nothing. Fix S1-1 and S2-1 before a mail
provider is connected and this is a high-eighties posture; connect a provider first and the same
findings become the top of the list.
