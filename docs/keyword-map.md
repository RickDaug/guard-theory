# Guard Theory — Keyword Map

**Owner:** Technical SEO Architect
**Status:** v1, drafted 2026-08-03
**Scope:** every route in the agreed site architecture

---

## 0. Read this before using the table

### No search-volume column — on purpose

This document contains **no search volumes, no keyword difficulty scores, and no competitor
ranking positions.** We do not have a verified data source (Search Console has no data yet — the
site has no impressions; no Ahrefs/Semrush/Keyword Planner account is connected). Inventing those
numbers would make every downstream prioritisation decision wrong in a way nobody could audit.

What the queries below *are* grounded in: real result sets returned by live web search on
**2026-08-03**, i.e. the phrasing that currently has commercial and editorial pages ranking
against it. Sources are listed in §7. When a volume source is connected, add a `Volume` and
`Source/Date` column pair — never a bare number.

### Priority order (owner-named topics first)

The owner named seven priority topics. They resolve to these routes:

| Owner topic | Owning route | Type |
| --- | --- | --- |
| BJJ rash guards | `/shop` | Commercial hub (pre-inventory) |
| No-gi rash guards | `/first-edition` | Commercial / conversion |
| Rash guard sizing | `/size-and-fit` | Commercial-investigation pillar |
| "How a BJJ rash guard should fit" | `/size-and-fit` (same pillar, H2 section + FAQ) | Informational |
| Rash guard care | `/journal/how-to-wash-a-bjj-rash-guard` | Informational |
| Long sleeve vs short sleeve | `/journal/long-sleeve-vs-short-sleeve-rash-guard-bjj` | Commercial investigation |
| What to wear to a first no-gi class | `/journal/what-to-wear-first-no-gi-class` | Informational |

Note the deliberate decision in §1: **"how a BJJ rash guard should fit" does not get its own page.**
It is a section and an FAQ entry on `/size-and-fit`. Splitting sizing and fit into two pages would
produce two thin near-duplicates competing for one intent — the exact thin keyword-variant pattern
we rule out in `seo-strategy.md` §9.

### Title-tag budget and the Next.js template

`src/app/layout.tsx` currently sets `title.template = "%s · Guard Theory"`. That suffix costs
**16 characters**, which is a quarter of the budget. Rules:

- The **Title tag** column below is the **full rendered string** a user sees in the SERP, and every
  one is ≤ 60 characters.
- Where the string ends in `· Guard Theory`, implement it as `title: "<segment>"` and let the
  template add the suffix.
- Where it does not (Home, and pages where the brand is already in the title), implement it as
  `title: { absolute: "<full string>" }`.

Character counts are in the column header note and were machine-verified — see
`docs/agent-handoffs/02-seo.md` §"Tests performed".

### Intent vocabulary

`I` informational · `C` commercial investigation · `T` transactional · `N` navigational.
Pre-inventory, our "transactional" conversion is **joining the First Edition waitlist**, not a
purchase. That is stated in the copy so we are not promising a buy button that does not exist.

---

## 1. Core commercial routes

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | guard theory | guard theory bjj, guard theory apparel, no gi grappling apparel brand | N / C | `Guard Theory — No-Gi Grappling Apparel and Guard Study` | `No-gi grappling apparel and a written study of the guard. First Edition rash guards are in development — join the release list.` | The brand is a thesis about control, not a logo on polyester. Home leads with the guard-system diagram, not a product grid we cannot fill. |
| `/shop` | bjj rash guards | no gi rash guards, bjj rash guard brands, grappling rash guard | C | `Shop — No-Gi Rash Guards, Spats and Shorts` | `Guard Theory apparel: no-gi rash guards first, then spats and shorts. Nothing is in stock yet. See what is coming and join the list.` | Honest empty state. We say plainly that there is no inventory, name what is coming and in what order, and link the reasoning instead of faking a catalogue. |
| `/first-edition` | no gi rash guard | first edition rash guard, long sleeve no gi rash guard, bjj rash guard release | C / T | `First Edition — No-Gi Rash Guard, Release TBA` | `The Guard Theory First Edition no-gi rash guard: construction, fabric and fit decisions. Release date to be announced — join the list.` | Single conversion page. Documents *why* each construction choice was made (flatlock, panel layout, hem length) before a price exists. |
| `/shop/[slug]` | `<product name> rash guard` | `<product name>` review, `<product name>` sizing, `<product name>` long sleeve | C / T | Template: `<Product Name> — <Type> · Guard Theory` (hard cap 60; truncate the product name, never the type) | Template: `<one-sentence construction claim>. <fabric + weight>. <fit note>. <availability status in plain words>.` | Every PDP carries a "How this was made" block and links to the Technique Library page explaining the position the cut was designed for. |
| `/lookbook` | bjj rash guard lookbook | no gi apparel lookbook, grappling apparel photography, rash guard on the mat | I / C | `Lookbook — No-Gi Rash Guards in Training` | `Guard Theory apparel photographed in real training, not a studio. Fit references across body types, with links to the size and fit guide.` | Fit reference, not fashion editorial: each image is captioned with the athlete's height/weight and the size worn. |
| `/size-and-fit` | rash guard sizing | how should a bjj rash guard fit, what size rash guard should i get, how tight should a rash guard be, bjj rash guard size chart | C / I | `Rash Guard Sizing and Fit Guide for No-Gi BJJ` | `How a BJJ rash guard should fit, how to measure chest and torso length, and what to do when you are between sizes. Guard Theory size chart.` | We publish torso-length as a first-class measurement, not just chest/weight — the variable most brands omit and the usual reason a rash guard rides up. |
| `/about` | guard theory brand | who makes guard theory, no gi apparel brand story | N / I | `About Guard Theory — People, Process, Sourcing` | `Who makes Guard Theory, how the apparel is developed and sourced, and how the written work is edited. Names, not stock photography.` | Names real people and real suppliers. This is our primary E-E-A-T surface and it links to the editorial policy. |
| `/manifesto` | guard theory manifesto | position before submission meaning, bjj apparel brand philosophy | I / N | `The Guard Theory Manifesto — Position Before All` | `Why we think the guard is a theory of control rather than a position, and what that means for the apparel we build. The brand argument in full.` | The one page allowed to be pure argument. No product links above the fold; it earns links rather than converts. |

---

## 2. Journal — index and categories

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/journal` | bjj journal | jiu jitsu writing, bjj blog articles, no gi articles | I | `The Guard Theory Journal — Writing on Jiu-Jitsu` | `Long-form writing on jiu-jitsu history, guard systems, competition and gear. Edited, sourced and dated. New pieces listed newest first.` | An edited publication with a corrections policy, not a content-marketing blog. Every piece carries a named author and a sources block. |
| `/journal/bjj-history` | bjj history | history of brazilian jiu jitsu, gracie jiu jitsu history, origins of bjj | I | `BJJ History — Sourced Articles · Guard Theory` | `Articles on the history of Brazilian jiu-jitsu, with primary sources cited and contested claims marked as contested rather than smoothed over.` | We flag disputed lineage claims as disputed. Most BJJ history content online repeats one narrative uncritically. |
| `/journal/influential-practitioners` | influential bjj practitioners | famous bjj black belts, bjj legends, important jiu jitsu figures | I | `Influential Practitioners — Profiles · Guard Theory` | `Profiles of practitioners who changed how the guard is played. Contribution-focused essays, explicitly not a ranked list of the best.` | Explicitly not a ranking. Each profile argues a *technical* contribution, which is checkable, rather than "greatest of all time". |
| `/journal/mma-and-jiu-jitsu` | jiu jitsu in mma | bjj in ufc, grappling in mma, does bjj work in mma | I | `MMA and Jiu-Jitsu — Analysis · Guard Theory` | `How jiu-jitsu actually shows up in mixed martial arts: what transfers, what does not, and what changed once wrestling took over the cage.` | Fight-tape led. Claims are tied to specific bouts and rounds so a reader can verify them. |
| `/journal/guard-systems` | bjj guard systems | types of guard in bjj, guard system explained, open guard systems | I | `Guard Systems — Essays · Guard Theory` | `Essays on the guard as a connected system: how positions feed each other, why frameworks beat move collections, and where systems break.` | The category closest to the brand thesis. Systems-level essays, deliberately not step-by-step instructionals — those live in the Technique Library. |
| `/journal/technique-notes` | bjj technique breakdown | jiu jitsu technique analysis, bjj move breakdown | I | `Technique Notes — Breakdowns · Guard Theory` | `Close readings of single techniques: the mechanics, the common failure, and the counter. Written analysis that pairs with the technique library.` | **Renamed from "Technique"** to avoid a taxonomy collision with `/technique`. See §6 conflicts. |
| `/journal/training-culture` | bjj training culture | jiu jitsu gym etiquette, bjj beginner advice, first bjj class | I | `Training Culture — Gym Life · Guard Theory` | `Mat etiquette, beginner questions, hygiene, injury and the unwritten rules of a jiu-jitsu gym. Practical, not preachy.` | Hosts the highest-intent beginner query in our set ("what to wear to a first no-gi class") without turning it into a product ad. |
| `/journal/equipment-and-apparel` | bjj gear guide | bjj rash guard guide, no gi gear, jiu jitsu equipment advice | C / I | `Equipment and Apparel — Gear Writing · Guard Theory` | `Rash guards, spats, shorts and the rest: fabric, construction, care and what actually wears out. Independent of what we happen to sell.` | Gear writing that will name a competitor's product when it is the right answer, and says so in the editorial policy. |
| `/journal/competition-analysis` | bjj competition analysis | adcc analysis, ibjjf ruleset analysis, no gi competition breakdown | I | `Competition Analysis — Rulesets · Guard Theory` | `How rulesets shape the guard: IBJJF, ADCC and submission-only compared, with match evidence rather than opinion.` | Ruleset-first framing — connects directly to `/first-edition` because IBJJF no-gi uniform rules constrain our design. |
| `/journal/page/[n]` | — (paginated) | — | I | `The Guard Theory Journal — Page <n>` | `Page <n> of the Guard Theory journal archive. Older writing on jiu-jitsu history, guard systems, competition and equipment.` | Self-canonical, indexable, unique title per page. See `seo-strategy.md` §4. |

---

## 3. Journal — article template and the seven priority articles

`/journal/[slug]` is a template. Title pattern: `<Article title trimmed to 44 chars> · Guard Theory`.
Description pattern: the article's own one-sentence thesis + what evidence it uses. Never
auto-generate from the first paragraph.

The first articles to publish, all currently **unpublished** (see §6, dating rules):

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/journal/how-to-wash-a-bjj-rash-guard` | how to wash a bjj rash guard | rash guard care, how to get smell out of rash guard, does rash guard shrink | I | `How to Wash a BJJ Rash Guard (and Keep It)` | `Cold wash, inside out, no fabric softener, no dryer — and the reason each rule exists at the fibre level. Plus what actually kills the smell.` | Explains *why* elastane fails, so the advice survives contact with a reader who wants to argue. Ends at the care label, not at a buy button. |
| `/journal/long-sleeve-vs-short-sleeve-rash-guard-bjj` | long sleeve vs short sleeve rash guard | bjj long sleeve rash guard, short sleeve rash guard no gi, which rash guard sleeve length | C | `Long Sleeve vs Short Sleeve Rash Guard for BJJ` | `Grip friction, heat, skin cover and competition legality compared honestly. Both are IBJJF legal for no-gi; sleeveless is not.` | Gives a decision rule (gym temperature × session length × skin sensitivity) instead of "it depends", and states the competition-legality fact plainly. |
| `/journal/what-to-wear-first-no-gi-class` | what to wear to a no gi bjj class | first no gi class what to wear, no gi bjj clothing beginner, do i need a rash guard for no gi | I | `What to Wear to Your First No-Gi BJJ Class` | `A fitted top with no pockets, zips or buttons, shorts you can move in, and nothing you can be strangled with. You likely own most of it.` | Tells beginners they probably do not need to buy anything yet. That is the trust play, and it is the truth. |
| `/journal/why-guard-is-a-system-not-a-position` | bjj guard system | guard as a system, connecting guards bjj, guard framework | I | `Why the Guard Is a System, Not a Position` | `Positions that do not connect are a move collection. This is the argument for treating the guard as one system with entries and exits.` | The flagship pillar essay for the brand thesis; the hub the Technique Library links up into. |
| `/journal/ibjjf-no-gi-uniform-rules-explained` | ibjjf no gi uniform rules | ibjjf legal rash guard, ibjjf rash guard rules, no gi competition uniform | I / C | `IBJJF No-Gi Uniform Rules, Read Carefully` | `What the IBJJF rule book actually requires of a no-gi rash guard and shorts, quoted and cited, with the parts brands get wrong.` | Quotes and links the official rule book PDF with its version and date rather than paraphrasing a competitor's blog post. |
| `/journal/where-the-guard-came-from` | history of the guard bjj | origin of guard position, guard history jiu jitsu | I | `Where the Guard Came From — A Sourced History` | `Tracing the guard through judo newaza, early Brazilian competition and the modern no-gi era, with sources and the gaps marked as gaps.` | Marks the evidentiary gaps instead of filling them with confident narrative. |
| `/journal/rash-guard-fabric-explained` | rash guard fabric | polyester spandex rash guard, gsm rash guard, best rash guard material | C / I | `Rash Guard Fabric, Explained by Someone Buying It` | `Polyester-elastane ratios, GSM, sublimation vs print, flatlock vs overlock — what each spec changes on the mat, and what it does not.` | Written from the position of someone actually specifying a garment, with the trade-offs we accepted named. |

---

## 4. Technique Library

`/technique` is the library hub. Category pages are `ItemList` indexes with a real explanatory
introduction (300+ words minimum) — never a bare list of links, which would read as a thin
doorway. Entries are `/technique/[category]/[slug]`.

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/technique` | bjj technique library | jiu jitsu positions guide, bjj position index, no gi technique reference | I | `Technique Library — A Map of Grappling Positions` | `A structured reference to guard, passing, escapes and submissions. Organised by position and how positions connect, not by move name.` | Organised by *transitions between* positions. Most libraries are alphabetical lists; ours is a graph. |
| `/technique/closed-guard` | closed guard bjj | closed guard techniques, closed guard no gi, closed guard sweeps | I | `Closed Guard — Control, Sweeps and Attacks` | `How closed guard works without grips: posture breaking, hip control, the sweeps that still function in no-gi and when to let it open.` | Treats closed guard as a no-gi position with the gi crutches removed, which is where most closed-guard content fails. |
| `/technique/open-guard` | open guard bjj | types of open guard, open guard no gi, open guard retention | I | `Open Guard — De La Riva, Spider, Seated and More` | `The open guard families, what each one is trying to control, and the transitions between them. Grouped by control mechanism, not by name.` | Grouped by *what is being controlled* (ankle, knee, hip, collar-tie) rather than by named guard. |
| `/technique/half-guard` | half guard bjj | half guard sweeps, deep half guard, knee shield half guard | I | `Half Guard — Knee Shield, Underhook and Deep Half` | `Half guard as three separate games: knee shield, underhook, and deep half. Which one to play from which body position, and the exits.` | Splits half guard into three distinct games with different rules, rather than treating it as one position. |
| `/technique/butterfly-guard` | butterfly guard | butterfly guard sweeps, butterfly hooks bjj, butterfly guard no gi | I | `Butterfly Guard — Hooks, Elevation and Sweeps` | `Where the hooks go, how elevation actually generates a sweep, and why butterfly is the safest sitting guard against leg entanglements.` | Explains the leg-lock-defensive property of butterfly, which most sweep-focused content ignores. |
| `/technique/guard-retention` | guard retention bjj | how to improve guard retention, guard retention drills, stop getting passed | I | `Guard Retention — Frames, Angles and Recovery` | `Retention as a sequence of decreasing options: frame, re-angle, invert, recover. What to do at each stage before the pass completes.` | A decision ladder keyed to how far the pass has progressed, so a reader knows *when* each answer applies. |
| `/technique/escapes` | bjj escapes | mount escape, side control escape, back escape bjj | I | `Escapes — Mount, Side Control, Back and North-South` | `Escapes ordered by how bad the position is. Framing first, hip movement second, and the small window each escape actually lives in.` | Ordered by urgency and time window rather than by position name. |
| `/technique/passing` | guard passing bjj | how to pass guard, no gi guard passing, pressure passing | I | `Guard Passing — Pressure, Speed and Leg Control` | `The three passing families compared: pressure, movement and leg drag. What each one needs from your grips, base and pace.` | Passing taught as three incompatible strategies you must choose between, not a pile of techniques. |
| `/technique/back-control` | back control bjj | back mount, seat belt grip, back control no gi | I | `Back Control — Seat Belt, Hooks and Retention` | `Taking the back, holding it when they turn, and finishing without gi grips. Chest connection over hooks, and why that ordering matters.` | Prioritises chest connection over hooks — a specific, defensible technical stance. |
| `/technique/submissions` | bjj submissions | no gi submissions, submission techniques bjj, chokes and joint locks | I | `Submissions — Chokes, Joint Locks and Finishes` | `Submissions grouped by the mechanic they exploit: blood, air, lever and rotation. Understanding the mechanic fixes the finish.` | Grouped by physiological/mechanical principle rather than by body part. |
| `/technique/defensive-concepts` | bjj defense | defensive bjj concepts, survival bjj, how to defend submissions | I | `Defensive Concepts — Frames, Posture and Survival` | `Defence before escape: what a frame is structurally, where posture is won, and the difference between surviving and stalling.` | Distinguishes survival from stalling, including the competition-rules consequence of getting it wrong. |
| `/technique/wrestling-for-bjj` | wrestling for bjj | takedowns for bjj, wrestling no gi, single leg bjj | I | `Wrestling for BJJ — Takedowns That Survive Guard` | `Takedowns chosen for grapplers: what stays safe against guard pulls, leg entries and the scramble that follows the shot.` | Selects takedowns by what happens *after* the landing in a submission context, not by wrestling-scoring value. |
| `/technique/no-gi-systems` | no gi bjj system | no gi grappling system, no gi vs gi differences, submission grappling system | I | `No-Gi Systems — Grips, Pace and What Changes` | `What actually changes without a gi: grip duration, pace, friction and the positions that stop working. A systems view of no-gi.` | The category the brand exists for. Links to `/first-edition` on the friction/skin-contact point specifically. |
| `/technique/[category]/[slug]` | `<technique name>` | `<technique name>` bjj, how to `<technique name>`, `<technique name>` no gi | I | Template: `<Technique Name> — <Category>` (cap 60) | Template: `<what it does> from <position>. <the common failure>. <the counter>.` | Every entry names the most common failure and the counter, so it is not a mirror of a YouTube description. |

---

## 5. Figures, support, policies, utility

### Influential Figures

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/figures` | influential bjj figures | important people in bjj, bjj innovators, who changed jiu jitsu | I | `Influential Figures in Jiu-Jitsu — Not a Ranking` | `People who changed how the guard is played, and what each one actually contributed. Presented alphabetically. This is not a ranking.` | The "not a ranking" claim is enforced structurally: alphabetical order, no numbering, no ItemList ordering signal. See `structured-data-map.md`. |
| `/figures/[slug]` | `<person name> bjj` | `<person name>` jiu jitsu, `<person name>` guard, `<person name>` style | I | Template: `<Name> — Contribution to the Guard` (cap 60) | Template: `What <Name> changed technically, when, and the evidence. Sourced profile, not a highlight reel.` | Each profile must cite at least two independent sources and links to the Technique Library entry for the position they influenced. |

### Support

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/faq` | guard theory faq | guard theory shipping, when does guard theory launch, guard theory sizing questions | N / I | `Frequently Asked Questions · Guard Theory` | `Release timing, sizing, shipping, returns and what the First Edition list actually signs you up for. Short answers, no marketing.` | Answers the awkward questions (why there is no stock, what we do with your email) instead of only the easy ones. |
| `/contact` | contact guard theory | guard theory email, guard theory support, guard theory press | N | `Contact Guard Theory` | `Reach a person about sizing, an order, a correction to something we published, or press. Response times stated honestly.` | Separates a general inbox from a corrections inbox, which the editorial policy references. |
| `/search` | — (internal) | — | N | `Search · Guard Theory` | `Search the Guard Theory journal and technique library.` | **noindex, follow.** Search result URLs are never indexable. |

### Policies

All policy pages: `index, follow`. They are trust signals and get crawled; they are not
conversion pages and get no keyword targeting beyond their own name.

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| `/privacy` | guard theory privacy policy | how guard theory uses my email | N | `Privacy Policy · Guard Theory` | `What data we collect, why, how long we keep it, and how to have it deleted. Written to be read, not to be survived.` | Names the actual processors used, in plain language. |
| `/terms` | guard theory terms | guard theory terms of service | N | `Terms of Service · Guard Theory` | `The terms governing use of this site, the First Edition list and any future purchase. Plain-language summary at the top.` | Plain-language summary above the legal text. |
| `/shipping` | guard theory shipping | guard theory delivery times, does guard theory ship internationally | N / I | `Shipping Information · Guard Theory` | `Where we will ship, expected timeframes and duties. Nothing ships yet — this page states what will apply when it does.` | States clearly that nothing ships yet rather than implying live fulfilment. |
| `/returns` | guard theory returns | guard theory exchange policy, rash guard wrong size return | N / I | `Returns and Exchanges · Guard Theory` | `How exchanges will work, especially sizing exchanges, and the window you will get. Written before launch so it cannot be quietly narrowed.` | Published pre-launch on purpose, so the policy cannot be tightened after the fact. |
| `/cookies` | guard theory cookie policy | guard theory cookies | N | `Cookie Policy · Guard Theory` | `Every cookie and similar technology this site sets, what it does, and how to refuse the non-essential ones.` | Enumerated per cookie, not a category hand-wave. |
| `/accessibility` | guard theory accessibility | accessibility statement | N | `Accessibility Statement · Guard Theory` | `Our WCAG target, what currently falls short, and how to report a barrier. Known issues listed rather than hidden.` | Lists known failures. Almost no apparel brand does this. |
| `/editorial-policy` | guard theory editorial policy | how guard theory writes, bjj blog sourcing policy | N / I | `Editorial Policy · Guard Theory` | `How pieces are researched, sourced, edited and dated, who writes them, and what we will never publish. Including our rules on AI.` | States that AI is not used to generate published prose, and what it *is* used for. Directly supports E-E-A-T. |
| `/corrections` | guard theory corrections | report an error guard theory | N | `Corrections · Guard Theory` | `Every correction we have made, dated, with what was wrong and what it now says. Report an error and we will publish the fix.` | A public, dated corrections log. |
| `/affiliate-disclosure` | guard theory affiliate disclosure | does guard theory use affiliate links | N | `Affiliate Disclosure · Guard Theory` | `Whether any link on this site earns us money, which ones, and how that affects what we recommend. Currently: it does not.` | Honest current state ("we have no affiliate relationships") with a commitment to update the date if that changes. |

### Utility pages — all `noindex, follow` unless noted

These need correct titles and descriptions for share previews and browser history even though
they will not be indexed. See `seo-strategy.md` §5.

| Route | Primary query | Secondary queries | Intent | Title tag (≤60) | Meta description (≤155) | Unique angle |
| --- | --- | --- | --- | --- | --- | --- |
| 404 handler (any URL) | — | — | N | `Page Not Found · Guard Theory` | `That page does not exist or has moved. Try the journal, the technique library or search.` | Serves HTTP 404, `noindex`. Offers three real routes plus search rather than dumping the user home. |
| `/maintenance` | — | — | N | `Down for Maintenance · Guard Theory` | `The site is briefly down for maintenance. It will be back shortly.` | Must serve HTTP **503** with `Retry-After`, never 200. `noindex`. |
| `/unsubscribe` | — | — | N | `Unsubscribe · Guard Theory` | `Remove your address from the First Edition list. One click, no retention flow, no guilt screen.` | One click, no dark patterns. `noindex`. |
| `/email-confirmed` | — | — | N | `Email Confirmed · Guard Theory` | `Your address is confirmed and you are on the First Edition list. Here is what you will actually receive, and how often.` | Sets expectations for send frequency. `noindex`. |
| `/form-success` | — | — | N | `Message Sent · Guard Theory` | `Your message reached us. Expected response time is stated on the contact page.` | `noindex`. |
| `/form-error` | — | — | N | `Something Went Wrong · Guard Theory` | `We could not submit that. Nothing was lost — try again, or email us directly.` | Serves an error state without losing the user's input. `noindex`. |
| `/collection-unavailable` | — | — | N | `Collection Unavailable · Guard Theory` | `This collection has no items yet. See what is in development on the First Edition page.` | Empty-collection state at a real route. `noindex` — an empty listing must never be indexable. |
| `/product-unavailable` | — | — | N | `Product Unavailable · Guard Theory` | `This product is not available. It may be sold out or not yet released — the First Edition page has the current status.` | For retired/unreleased SKUs. Serves 404 or 410 as appropriate, `noindex`. **Never** emits Product schema. |

---

## 6. Conflicts and decisions flagged

1. **`/journal/technique` vs `/technique`** — the agreed Journal category list includes
   "Technique", which collides conceptually with the Technique Library. Two routes, one intent,
   near-identical primary queries → guaranteed cannibalisation. **Decision: rename the Journal
   category to "Technique Notes" (`/journal/technique-notes`).** The library is the reference; the
   journal category is the analysis. Needs owner sign-off; it is a content-taxonomy change, not
   just a slug.
2. **`/shop` with no inventory** — `/shop` targets a commercial query (`bjj rash guards`) it
   cannot satisfy. Ranking it now against stocked competitors is unrealistic and, if it were a
   bare "coming soon", it would be thin. **Decision: `/shop` ships as a real page** — what is
   coming, in what order, why rash guards first, with links to `/first-edition` and
   `/size-and-fit`. It is indexable. It carries **no Product schema** (see
   `structured-data-map.md` §4).
3. **Fit vs sizing** — merged into `/size-and-fit`, as explained in §0.
4. **Owner topic "BJJ rash guards" and "no-gi rash guards"** are near-synonyms in intent. Split so
   that `/shop` owns the broad category term and `/first-edition` owns the specific product term.
   If Search Console later shows them swapping, consolidate to `/first-edition` and make `/shop` a
   navigational hub.
5. **Dating** — no article has been published. Every `datePublished` is set at first publish and
   never backdated; see `seo-strategy.md` §11 and `structured-data-map.md` §3.
6. **`/figures` is not a ranking** — this is enforced in markup, not just in copy. If we emit
   `ItemList` there, it must not carry `position` values that imply merit ordering; see
   `structured-data-map.md` §5.

---

## 7. Sources

All observed **2026-08-03** via live web search. These establish that the query phrasings above
have real ranking content behind them; they are **not** volume evidence.

- Fit / tightness phrasing: https://soldiercomplex.com/blogs/soldier-complex-martial-arts-lifestyle/how-should-a-bjj-rash-guard-fit-a-guide-to-finding-the-perfect-fit · https://www.xmartial.com/blogs/articles/how-tight-should-a-rash-guard-be-the-perfect-fit-guide-for-bjj-mma · https://www.gbjj.org/blogs/news/how-should-a-bjj-rash-guard-fit
- Sizing / size-chart phrasing: https://goldbjj.com/pages/rash-guard-size-chart · https://torobjj.com/pages/adult-bjj-rash-guard-size-chart · https://www.infinitudefight.com/what-size-rash-guard-to-buy/
- Sleeve-length phrasing: https://bjjfanatics.com/blogs/news/rashguards-long-sleeve-vs-short-sleeve · https://www.elitesports.com/blogs/news/long-sleeve-vs-short-sleeve-rash-guards-for-bjj
- Care / washing phrasing: https://www.kingz.com/blogs/news/how-to-remove-sweat-odor-from-gis-and-rash-guards · https://heavybjj.com/how-to-wash-a-bjj-rash-guard-full-care-guide/
- First-class / beginner phrasing: https://www.kingz.com/blogs/news/what-to-wear-to-no-gi-bjj-a-complete-beginner-s-clothing-guide · https://www.valorfightwear.com/blogs/news/what-to-wear-for-your-first-no-gi-bjj-class-a-beginners-guide
- Spats phrasing: https://www.kingz.com/blogs/news/what-are-spats-in-bjj-and-do-you-need-them · https://bjjfanatics.com/blogs/news/shorts-vs-spats
- Competition-uniform claims — **use the primary source when writing the article**: IBJJF Rule Book v6.0 (2024JUN, English), linked from https://ibjjf.com/books-videos . Secondary/third-party summaries observed at https://www.bjjheroes.com/bjj-news/ibjjf-no-gi-uniform-requirements are not citable in published copy.
- Technique-taxonomy phrasing: https://bjjgraph.org/Positions/Butterfly-Guard · https://evolve-mma.com/blog/how-to-improve-bjj-guard-retention/
- Category-competitor landscape (for gap analysis only): https://sweetscienceoffighting.com/best-bjj-rash-guards/ · https://bjjequipment.com/best-bjj-rash-guards/
