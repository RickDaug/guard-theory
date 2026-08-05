# 01 — Engineering correctness

Audit date: 2026-08-04 · Commit state: working tree at `main` (last commit
`feat(journal): six submission and transition articles, and the QC fixes`)
Live target: <https://guardtheory.net> (Vercel, `Server: Vercel`, prerendered)

## Method

Read `src/lib/`, `src/components/`, both `actions.ts` files, every content
registry, all seven Playwright spec files and both unit test files. Ran
`npx tsc --noEmit` (clean), `npx eslint --max-warnings 0` (clean),
`npm run test:unit` (27/27 pass), `npx playwright test --list` (93 tests in 7
files; 49 of those are `tests/e2e`, 44 are screenshot captures). Did not run
`build`/`dev`/`start`/Playwright/Lighthouse, per instruction.

Runtime behaviour was established against production by driving the real server
actions over the no-JavaScript progressive-enhancement path — extracting the
`$ACTION_REF_1` / `$ACTION_1:0` / `$ACTION_KEY` hidden fields from the rendered
HTML and POSTing a multipart form with a correct `Origin` header. That is the
same request path a browser with JS disabled takes, so the results below are
what a real visitor gets.

Summary: **3 BLOCKING, 16 SHOULD FIX, 8 TASTE.** The static quality of this
codebase is high — strict TypeScript with no `any` in `src/`, clean adapter
seams, genuinely thoughtful accessibility, all gates green. The problem is that
the deployed artefact does not currently do either of the two things it exists
to do, and nothing in the system is capable of noticing.

---

## BLOCKING

### B1. Every waitlist signup and every contact message fails in production

**Files:** `src/lib/storage/ndjson-store.ts:17,26-35` ·
`src/lib/waitlist/local-store.ts:17-18,24-40` ·
`src/app/first-edition/actions.ts:62-75` · `src/app/contact/actions.ts:103-118`

Both stores resolve their directory as `path.join(process.cwd(), ".data")` and
call `mkdir(DATA_DIR, { recursive: true })` on every write. On Vercel's Node
runtime the deployment filesystem is read-only except `/tmp`, and `.data/` is
gitignored so it is not in the bundle either. `mkdir` throws, both `catch`
blocks swallow it, `add()` returns `{ ok: false, reason: "storage-unavailable" }`
and `append()` returns `false`.

Confirmed live, not inferred. A fully valid waitlist submission
(`firstName=AuditProbe`, a syntactically valid address, `consent=on`, empty
honeypot) returns HTTP 200 rendering the error branch at
`first-edition/actions.ts:68-75`:

```
POST https://guardtheory.net/first-edition  →  200
body contains: "We could not save your details just now."
```

The same for contact (`contact/actions.ts:111-118`):

```
POST https://guardtheory.net/contact  →  200
body contains: "We could not save your message just now."
```

The failure scenario is therefore not hypothetical: it is the only outcome. The
site's single stated conversion point — `/first-edition`, the destination of the
home hero CTA, the header CTA, both product pages and the sitemap — has a 0%
success rate, and the accessibility feedback channel the `/contact` page
explicitly solicits ("that is a bug, and we would rather hear about it than
not", `src/app/contact/page.tsx:33-37`) discards every report.

The error copy is at least honest ("Nothing was lost on your side — try again in
a moment"), which is better than a fake success, but "try again in a moment"
promises a transient fault. It is permanent.

Fix: this does not need the mail provider. `NdjsonStore` and
`LocalFileWaitlistStore` should resolve their directory from an env-overridable
base that defaults to `process.cwd()` and is set to `/tmp` (or `os.tmpdir()`) on
Vercel — `/tmp` is writable and survives within a warm instance, which is no
worse than the "not durable" contract already documented. That converts a
guaranteed failure into the documented best-effort behaviour. Better still, ship
the provider; the seam at `src/lib/waitlist/index.ts:15-23` is ready for it and
the contact path needs the same seam (see S8).

### B2. Production is `Disallow: /` — the entire site is blocked from search

**Files:** `src/lib/site.ts:35-36` · `src/app/robots.ts:11-16` ·
`src/app/layout.tsx:24-26`

```
GET https://guardtheory.net/robots.txt
User-Agent: *
Disallow: /

GET https://guardtheory.net/first-edition
<meta name="robots" content="noindex, nofollow">
```

`NEXT_PUBLIC_SITE_URL` *is* set in Vercel Production (the sitemap emits
`https://guardtheory.net/...` rather than the localhost fallback), but
`NEXT_PUBLIC_ALLOW_INDEXING` is not `"true"`. Eighteen full-length sourced
articles, twelve technique entries, ten figure profiles, a keyword map, an
internal-linking map and an SEO strategy document are all invisible to crawlers.

The opt-in design is correct and I would not change it. But the failure mode it
was built to prevent — "a preview deployment cannot be indexed by forgetting a
rule" — has an exact mirror that nothing guards: production cannot be indexed by
forgetting the same rule, and because `NEXT_PUBLIC_*` is inlined at build time,
setting it now also requires a redeploy. There is no test, no CI check and no
runtime assertion that the production origin is indexable.

Fix (config, not code): set `NEXT_PUBLIC_ALLOW_INDEXING=true` in the Vercel
Production environment and redeploy. Then add a cheap guard so this cannot
recur silently — e.g. a CI step that fetches `https://guardtheory.net/robots.txt`
after a production deploy and fails if it contains `Disallow: /`.

### B3. Nothing anywhere logs, and the one health signal that exists is never read

**Files:** `src/lib/storage/ndjson-store.ts:31-34,55-57` ·
`src/lib/waitlist/local-store.ts:35-39,57-59` · `src/lib/waitlist/types.ts:36-39`

`grep -rn "console\.\|logger" src/` returns **zero matches**. Four separate
`catch {}` blocks discard the underlying error object entirely. B1 has therefore
been failing on every submission since the first production deploy with no
trace: no log line, no metric, no alert, no difference in HTTP status.

`WaitlistStore.isDurable` is declared at `types.ts:38-39` with the comment
"Human-readable name, surfaced in logs and in the health check" above `name` —
there is no health check anywhere in the repo, and `isDurable` and `name` are
referenced by nothing outside their own declaration and the `local-store.ts`
comment that claims "the UI says so plainly". The UI says nothing of the sort:
`WaitlistForm.tsx:97-111` and `ContactForm.tsx:57-71` render unqualified success
copy ("You will hear from us once…", "A person reads every message, usually
within a working day"), and neither `/first-edition` nor `/contact` mentions the
interim store. `README.md:122-123` and `docs/technical-architecture.md:79-80`
both assert that they do.

This is the reason B1 shipped, and it will be the reason the next storage bug
ships. The comment at `ndjson-store.ts:32` — "Swallows the underlying error
rather than surfacing a filesystem path" — conflates *not showing the path to
the user* with *not knowing about it at all*. Log `err` server-side (Vercel
captures stderr) and keep returning the opaque result to the caller. Either read
`isDurable` somewhere real or delete it and the comment.

---

## SHOULD FIX

### S1. The `category` segment of a technique URL is ignored entirely

**File:** `src/app/technique/[category]/[slug]/page.tsx:17-27,70-80`

`generateMetadata` and the page component both call `getEntry(slug)` and never
look at `params.category`. `getCategory(entry.category)` then resolves the
entry's *real* category, so the `notFound()` at line 76 is unreachable. With
`dynamicParams` at its default of `true`, any string in the category slot
renders a complete 200 page:

```
/technique/no-gi-systems/inside-position   → 200  (correct)
/technique/half-guard/inside-position      → 200  (wrong category, same page)
/technique/not-a-real-category/inside-position → 200
```

All three verified live. The breadcrumb trail on the bogus URLs shows the
entry's real category, so the address bar and the page disagree. This is an
unbounded set of URLs — a crawl trap once B2 is fixed. The canonical tag limits
the SEO damage but does not stop the crawl, and it makes the comment at
`src/app/sitemap.ts:13-14` ("a page cannot exist without being listed or be
listed without existing") false in one direction.

Fix is two lines: `const { category, slug } = await params;` then
`if (!entry || entry.category !== category) notFound();`.

### S2. `Specification.value: null` renders an empty cell, not "to be specified"

**Files:** `src/content/products/types.ts:21-29` vs
`src/app/shop/[slug]/page.tsx:105-117`

The type comment states: "`value` is null until the owner supplies a real figure;
the UI renders that as 'to be specified' rather than inventing a number or hiding
the row." No such rendering exists — `grep -rn "to be specified" src/` matches
only that comment. `{spec.value}` with `value: null` renders nothing, producing a
`<th scope="row">Fabric weight</th><td></td>` row: a labelled specification with
a blank value, which reads as a rendering bug rather than as a disclosure.

No entry currently sets `null`, which is why nobody has seen it — but the type
invites it and the doc promises behaviour that does not exist. Either implement
`{spec.value ?? "To be specified"}` or narrow the type to `string` and delete
the comment.

### S3. The suite's most-praised test is vacuous against the current content

**Files:** `tests/e2e/metadata.spec.ts:88-105` · `tests/unit/content.test.ts:154-180`

`metadata.spec.ts:96` navigates to `/journal/how-to-wash-a-rash-guard` under the
comment "Uses a piece that is still a draft" and asserts its robots meta contains
`noindex`. That article is **published**:
`src/content/journal/entries/how-to-wash-a-rash-guard.ts:10-12` has
`status: "published"`, `publishedAt: "2026-08-04"`, `authorId: "steven-p"`. All
18 articles are published — there are no drafts left in the registry.

The assertion still passes for a reason that has nothing to do with what it
claims to test: Playwright's `webServer` runs `npx next start` with no
`NEXT_PUBLIC_ALLOW_INDEXING`, so `IS_INDEXABLE` is `false` and
`src/app/layout.tsx:24-26` makes *every page on the site* `noindex, nofollow`.
The `for (const path of NOINDEX)` loop above it passes for the same reason:
delete the page-level `robots: { index: false }` from `/design-system`,
`/search`, `/maintenance` and `/unsubscribe` and the test still goes green,
while production (once B2 is fixed) starts indexing all four.

The test named "indexable pages are indexable and the rest are not" never
asserts the first half — the `INDEXABLE` array is not iterated in that test at
all.

The same erosion hit the unit suite. `content.test.ts:166-171` — the `else`
branch asserting `!("publishedAt" in article)` — is now dead code, because
`isPublished(article)` is true for all 18. The headline guarantee of the whole
architecture ("backdating is unrepresentable", `docs/technical-architecture.md:29-30`)
has zero executing coverage.

Fix: run the metadata suite against a build with `NEXT_PUBLIC_ALLOW_INDEXING=true`
(add `env` to `playwright.config.ts`'s `webServer`), assert the positive case for
`INDEXABLE`, and keep at least one genuine draft fixture in the registry — or
assert the guarantee at the type level in a unit test with a synthetic
`DraftArticle` rather than relying on real content staying in draft.

Credit where due: the publish dates are honest. All 18 are `2026-08-04` and the
first commit is `2026-08-03`. Nothing was backdated.

### S4. `contrast.test.ts` contains a test that cannot fail

**File:** `tests/unit/contrast.test.ts:43-61`

"keeps the hairline colour out of the text pairings" iterates `TEXT_ON_GROUND`,
`continue`s for every token that is not a hairline, and for any token that *is*
both a hairline and a text pairing asserts `meetsAA(contrastRatio(...))` — which
the parameterised test at lines 33-41 already asserts for every entry in the
same array. There is no input for which this test fails and the block above
passes. Its own comment concedes it ("the assertions above already enforce"),
and its name promises exclusion while the body permits inclusion.

If the intent is "a hairline token must not appear in `TEXT_ON_GROUND`", assert
that: `assert.equal(textTokens.filter(t => hairlines.has(t)).length, 0)`.

### S5. Rate-limit quota is consumed by validation failures

**Files:** `src/app/contact/actions.ts:51-101` · `src/app/first-edition/actions.ts:35-60`

`checkRateLimit` is called and increments the counter *before* `parseSignup` and
before the contact field validation. Contact's limit is 3 per 10 minutes.

Scenario: a keyboard user reports that a control is unreachable. They submit with
a typo in the email (attempt 1, rejected), fix it but the message field was
cleared by the re-render so they resubmit empty (attempt 2, rejected), fix that
(attempt 3). Attempt 4 — the first correct one — returns "That's several messages
in a short time. Try again in 10 minutes." They have made zero successful
submissions and are locked out. Verified live: attempts 1-2 returned the storage
error, attempt 3 onward returned the rate-limit message.

Charge the limiter only after validation passes (or use a much higher pre-
validation limit and a low post-validation one).

### S6. The honeypot silently discards real submissions

**Files:** `src/app/first-edition/actions.ts:24-33` · `src/app/contact/actions.ts:46-49`

Both actions return a full success state — "You're on the list.", "Message
received." — without storing anything when the hidden `website` field is
non-empty. That is a standard honeypot and I am not arguing against honeypots.
But `docs/technical-architecture.md:80` states flatly "no form on this site
silently discards input", and this is the one code path that does exactly that,
undocumented. Password managers and some autofill extensions do fill inputs
marked `autocomplete="off"`; a human who trips it gets a confirmation screen for
a submission that never happened.

Also note the waitlist check is `formData.get("website") !== ""` (untrimmed)
while contact uses `readString` (trimmed) — inconsistent, and the waitlist one
trips on a single space. Pick one, and add the exception to the doc.

### S7. Contact `sanitise` leaves CR/LF in the `name` field

**Files:** `src/app/contact/actions.ts:32-34,64` vs
`src/lib/waitlist/validate.ts:57-60`

Waitlist strips every character in the class U+0000-U+001F plus U+007F from
every string. Contact strips only U+0000-U+0008, U+000B, U+000C, U+000E-U+001F
and U+007F — deliberately preserving tab, LF and CR so a multi-line `message`
survives — but applies that same relaxed function to `name` and `email` too.
`email` is saved by the regex (`[^\s@]+` rejects newlines); `name` is not.

Today the only consumer is `JSON.stringify` into NDJSON, which escapes newlines,
so nothing breaks. The moment the mail adapter lands — the documented next step,
`docs/owner-decisions.md:56-62` — a `name` of `Sam\r\nBcc: victim@example.com`
becomes header-injection material in a reply-to or a subject line. Strip control
characters from `name` and `email`; keep the message-specific allowance for
`message` only.

### S8. Contact has no adapter; the architecture claim covers only the waitlist

**Files:** `src/app/contact/actions.ts:22` · `src/lib/contact/` (only
`form-state.ts`) vs `docs/technical-architecture.md:76-78`

"Commerce and mail sit behind adapters. Nothing in the UI imports a provider
SDK. `getWaitlistStore()` is the single place a provider is chosen." The contact
action constructs `new NdjsonStore<StoredMessage>("contact.ndjson")` directly at
module scope, with no interface, no `getContactStore()`, and no `isDurable`.
`README.md:70` lists `src/lib/` as containing "storage adapters" plural and
`src/lib/contact/` contains no adapter at all. When the provider arrives, the
waitlist swap is one line and the contact swap is a rewrite of the action.

### S9. `SITE_URL` uses `??`, so an empty env var crashes the build

**File:** `src/lib/site.ts:16-21`

`process.env.NEXT_PUBLIC_SITE_URL ?? (...)`. An env var defined-but-empty (a
very common Vercel state — a variable added to the dashboard and left blank) is
`""`, which `??` passes through. `SITE_URL` becomes `""`,
`new URL(SITE_URL)` at `src/app/layout.tsx:15` throws `TypeError: Invalid URL`,
and every page fails to build with no indication of the cause.
`Breadcrumbs.tsx:24` and `absoluteUrl` fail the same way. Use `||`, or
`process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallback`.

### S10. Two `as` casts defeat the one guarantee the content model exists for

**File:** `src/app/journal/[slug]/page.tsx:149,151`

```ts
const published = isPublished(article);
// ...
<time dateTime={(article as { publishedAt: string }).publishedAt}>
  {new Date((article as { publishedAt: string }).publishedAt).toLocaleDateString(...)}
```

TypeScript does not narrow a union through a `const` holding a user-defined type
predicate, so the cast is there to silence the resulting error. It is correct
*today* because it sits inside `published && author`. It is also the single place
the publication date reaches the page, and it is exactly the place the type
system was supposed to be load-bearing
(`docs/technical-architecture.md:28-30`). Change the guard at line 145 to
`isPublished(article) && author ? ...` and both casts delete themselves —
narrowing works when the predicate is called inline. If someone later loosens
the condition, the cast yields `undefined` and the page renders
`<time dateTime={undefined}>Invalid Date</time>` with no error.

### S11. Check-then-append race in the waitlist dedupe

**File:** `src/lib/waitlist/local-store.ts:26-34`

`await this.has(signup.email)` then `await appendFile(...)`. Two concurrent
submissions of the same address both read the file before either writes, both
see `false`, both append, and both report `alreadyOnList: false`. On a warm
serverless instance handling concurrent requests this is reachable. The record
is duplicated and the user is told they are newly on a list they were already
on. Low blast radius while nothing durable exists; worth fixing now because the
same check-then-act shape will be copied into the provider adapter.

### S12. `NdjsonStore.hasMatch` is dead code

**File:** `src/lib/storage/ndjson-store.ts:37-58`

Never called. Contact has no deduplication, so the only implemented use of the
method does not exist. Twenty-two lines including a nested try/catch. Delete it,
or wire it into the contact action if repeat-submission suppression is wanted.

### S13. Journal and Figures are absent from the search index while the page says otherwise

**Files:** `src/lib/search/index.ts:38-82` · `src/app/search/page.tsx:23-26` ·
`src/components/search/SearchClient.tsx:61-65`

`buildSearchIndex()` covers technique entries, technique categories, products
and policies. It omits all 18 Journal articles and all 10 Figure profiles — the
largest body of content on the site.

`/search` tells the reader "Everything on the site is indexed in the page you
are reading". The zero-results state tells them "The Journal is not indexed yet
— its articles are still in draft." Both statements are false; the second was
true when it was written and is now contradicted by the registry. A reader
searching "Maeda" or "triangle" gets "No matches" for content that exists.

### S14. FAQ tells search engines there is no size chart, next to the page carrying one

**Files:** `src/app/faq/page.tsx:34-37,46-49,69-78` ·
`src/content/products/size-chart.ts:25-32` · `src/app/size-and-fit/page.tsx`

The FAQ answers "Why is there no size chart?" with "Because nothing has been
produced and measured." `/size-and-fit` publishes a six-row chart with body
length, long-sleeve and short-sleeve measurements in centimetres, is linked from
both product pages, is in the header of the sitemap set, and its own metadata
description advertises "garment measurements in inches and centimetres". The
FAQ also states "Articles are finished but held in draft until they can carry a
real named author" — all 18 are published under named authors.

Both answers are serialised into `FAQPage` structured data at lines 69-78, so
they are asserted to search engines as facts, on a page in the same sitemap as
the pages that contradict them. `docs/owner-decisions.md:32-40` still lists the
size chart, fabric composition and GSM as unsupplied, while
`theory-01-long-sleeve.ts:40-41` ships "82% recycled polyester, 18% elastane"
and "240 gsm". Whatever the resolution, three sources currently disagree.

### S15. Playwright starts a server against whatever build happens to be on disk

**File:** `playwright.config.ts:28-38`

`command: "npx next start --port 3100"` with `reuseExistingServer: false`. The
comment explains at length why reusing a *server* is dangerous — a server
started before the last build serves stale asset hashes. But `next start` does
not build; it serves `.next/` as found. Run locally without a preceding
`npm run build`, the suite tests the previous build's output, which is the same
class of false result the comment says is "now impossible". CI happens to be
safe because `npm run build` precedes it in `ci.yml`, but that is an accident of
step ordering, not a property of the config. Make the command
`npm run build && npx next start --port 3100`, or document that `npx playwright
test` must never be run standalone.

### S16. The registries and behaviour that have no tests at all

**Files:** `tests/unit/*.test.ts`

The 27 unit tests cover the technique registry, the journal registry, editorial
voice greps, and the colour maths. Nothing else has a unit test:

- `src/lib/waitlist/validate.ts` — 126 lines of the only server-side input
  validation on the site. No test asserts that `consent` is required, that
  `productInterest` filters unknown values, that `email` is lower-cased, that
  the 254/80/24 length caps hold, or that `sanitise` strips control characters.
- `src/lib/rate-limit.ts` — no test for window expiry, for the `> limit`
  boundary (is the 5th request allowed or the 6th?), or for `retryAfterSeconds`.
  `resetRateLimits` is labelled "Test seam" and is called by no test.
- `src/lib/search/index.ts` — no test for `searchDocuments` term conjunction,
  and no test that would have caught S13.
- `src/lib/storage/ndjson-store.ts` — no test for round-trip, malformed-line
  tolerance, or the failure path that is currently the only path in production.
- The **figures**, **products** and **policies** registries — no dangling-slug
  check, no slug-uniqueness check, no source-URL parse check, no
  section-anchor-uniqueness check. `content.test.ts` gives journal and technique
  all four; the other three registries get none, and figures carries the same
  `sources` shape the journal test validates.

`tests/e2e/console.spec.ts:10-23` covers 12 routes out of roughly 60; the
"Zero console errors" row in `AGENTS.md:41` reads as site-wide.
`tests/e2e/metadata.spec.ts:9-31` checks title/description uniqueness across 21
hand-listed paths — 1 of 18 articles, 1 of 12 technique entries, 0 of 10 figures
— under the test name "titles and descriptions are unique across the site".

---

## TASTE

1. **React keys are content strings.** `journal/[slug]/page.tsx:174` (`key={paragraph}`),
   `:190` (`key={note}`), `:208` (`key={source.url}`);
   `figures/[slug]/page.tsx:117,137,155`; `technique/[category]/[slug]/page.tsx:56,127`.
   Two identical paragraphs, two identical contested notes, or the same source
   URL cited twice in one article produce a React duplicate-key `console.error`.
   `console.spec.ts` would catch it only on the one article route it visits.
   Nothing in `content.test.ts` checks for duplicate paragraphs or source URLs.

2. **`sweep()` is O(n) per request above the threshold.**
   `src/lib/rate-limit.ts:15-20` returns early below 5,000 entries; at or above
   it iterates the entire map on *every* call. If 5,000 entries are live and
   unexpired, nothing is deleted and the full scan repeats per request. A size-
   bounded eviction or a periodic timer would be steadier.

3. **`[byCode.get(to)?.name ?? []].flat()`** —
   `GuardSystemMap.tsx:105-106`. An array-wrap-and-flatten used as a
   filter-undefined. `const n = byCode.get(to)?.name; return n ? [n] : [];`
   says the same thing.

4. **`FIGURES_ALPHABETICAL` comment does not match the sort.**
   `src/content/figures/index.ts:34-37` says "Alphabetical by surname-last
   display name" and sorts on the full name, i.e. by given name. The result is
   defensible (it is not a ranking, which is the stated concern) but the comment
   describes something else.

5. **The reduced-motion assertion ignores units.**
   `accessibility.spec.ts:160-165` does `Number.parseFloat("0.01ms") < 0.05`.
   `"0.04s"` — 40ms, plainly animated — also passes. Compare against the string,
   or normalise.

6. **`robots.ts:37` emits `host: absoluteUrl("/")`**, i.e.
   `https://guardtheory.net/` with a trailing slash. The `Host` directive
   expects a bare hostname.

7. **`links.spec.ts` drops query strings and never checks fragment targets.**
   Line 52 queues `resolved.pathname` only; line 43 skips every `href`
   beginning `#`. Article tables of contents are entirely fragment links, so a
   renamed `section.id` breaks every TOC entry on the page and the crawl reports
   clean. `content.test.ts:108-123` proves anchors are *unique*, not that the
   links point at them.

8. **`StoredMessage`'s index signature defeats its own type.**
   `contact/actions.ts:13-20` adds `[key: string]: unknown` purely to satisfy
   `NdjsonStore<T extends Record<string, unknown>>`. Any misspelled field now
   type-checks. Loosen the constraint on `NdjsonStore` instead
   (`T extends object`) and keep `StoredMessage` exact.

---

## The four questions asked directly

**The adapters — what actually happens to a submission in production?**
It is lost, and the visitor is told so. `getWaitlistStore()` returns
`LocalFileWaitlistStore` unconditionally; that store writes to
`<cwd>/.data/waitlist.ndjson`; on Vercel `<cwd>` is read-only, `mkdir` throws,
the error is swallowed, and the user sees an error state. Nothing is written to
`/tmp`, nothing is emailed, nothing is logged. Contact is identical via
`NdjsonStore`. So the data is not silently lost — it is loudly refused — but the
practical outcome is that the site has collected zero signups and zero messages
since deployment, and no one could have known from the outside. The adapter
*seam* is well designed; the fallback implementation is unshippable to
serverless and was documented as "not durable" when it is in fact "not
functional".

**Rate limiting — real exposure on a serverless deployment.**
Better than the docs fear, and worse than a shared store, in specific ways I
measured. Six sequential POSTs to `/contact` from one IP: attempts 1-2 passed
the limiter, 3-6 were blocked — so on the current single warm instance the
limiter genuinely works. Ten *concurrent* POSTs were all blocked, meaning Vercel
served them from one instance with one shared `Map`. The `x-forwarded-for` key
is also not spoofable here: two requests carrying forged `X-Forwarded-For:
203.0.113.7` and `198.51.100.42` remained rate-limited, so Vercel is overwriting
the header rather than appending to it. The comment at
`first-edition/actions.ts:12-13` ("Behind a proxy the first entry is the
client") is true on Vercel and false in general — the XFF spec appends, so the
leftmost entry is normally the *client-supplied* one. Move off Vercel to a
plain reverse proxy and the limiter becomes bypassable by one header.
Residual exposure: state dies on every deploy and on every cold start, and any
scale-out gives an attacker a fresh quota per instance. A distributed attack
gets `5 × instances` per window. The honest summary in
`docs/technical-architecture.md:91-94` is accurate; it just understates how well
it happens to work at this traffic level and overstates the header's
trustworthiness.

**Type-safety honesty.** Genuinely good. `tsc --noEmit` and
`eslint --max-warnings 0` are both clean, there is no `any` in `src/`, and there
are exactly two `as` casts that hide a real possibility — both at
`journal/[slug]/page.tsx:149,151`, both removable by restructuring one
conditional (S10). The narrowing casts in `validate.ts:93-103` and
`contact/actions.ts:87-89` are `X as Y` inside `includes()` checks whose result
then gates the assignment; they are safe and idiomatic. The one place types are
weaker than they read is `StoredMessage`'s index signature (T8). The content
types do enforce most of what their comments claim — a `TechniqueEntry` really
cannot compile without a safety note, and `DraftArticle` really has no
`publishedAt` — but see S3: the guarantees are now untested because no draft
remains to exercise them.

**Test quality.** The suite is above average and three specific tests are
excellent — `accessibility.spec.ts:95-117` (asserting the *relationships* in the
diagram key, not just that definitions appear), `:119-153` (asserting computed
`column-gap` because `textContent` cannot distinguish the bug), and
`:71-93` (first-heading-is-h1, added because axe's tag selection skips
heading-order). Those were written by someone who had been burned and understood
why. Against that: S3 (the draft/noindex test is vacuous and its unit
counterpart is dead code), S4 (a test that cannot fail), S16 (zero coverage of
validation, rate limiting, search and storage; three of six registries
untested), and the sampling gaps in `metadata.spec.ts` and `console.spec.ts`
that the surrounding prose describes as site-wide. Critically: **nothing in 93
Playwright tests and 27 unit tests would have caught B1**, because
`waitlist.spec.ts:57-76` asserts the success *screen* and never asserts that a
record was written, and it runs on a machine where `.data/` is writable.

---

## Score

**61 / 100**

The craft on display is real. Strict TypeScript with no escape hatches, adapter
seams in the right places, a CSP that names its own compromise rather than
hiding it, accessibility that goes past axe into the things axe cannot see, and
a handful of tests that exist because a specific bug taught someone a specific
lesson. In isolation the source reads like an 80. What drags it down is that
correctness was measured against the test suite and the local filesystem rather
than against production: the site's only conversion point returns an error to
every visitor, its accessibility feedback channel discards every report, the
entire content library is `Disallow: /`, and there is not a single log line
anywhere in `src/` that could have surfaced any of it — the three failures
compound, because the same absent observability that let B1 ship is what would
let its replacement ship too. Layered on that is a slow drift between what the
code does and what the code says about itself: the FAQ tells crawlers there is
no size chart on a site that publishes one, the search page claims to index a
Journal it excludes, the draft-article guarantee is asserted by a test that
cannot fail against content that has no drafts left, and a technique entry
answers on an unbounded set of URLs. None of the individual defects is hard to
fix — B1 is a directory constant, B2 is an environment variable, S1 is two lines
— but a project whose stated thesis is that quality controls must be enforced
rather than aspirational has to be judged by whether its controls caught its own
regressions, and here they did not.
