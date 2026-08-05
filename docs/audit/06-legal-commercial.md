# 06 — Legal and Commercial Risk

**Auditor:** legal & commercial risk (agent 06)
**Date:** 2026-08-04
**Scope:** repo at `C:\Users\RickD\AndroidStudioProjects\guard-theory` + live site `https://guardtheory.net`
**Method:** source read; every Wikimedia Commons file page fetched and read directly; live pages fetched to confirm what is actually published rather than what the repo intends. No build, dev server, Playwright or Lighthouse run.

> **This is not legal advice and I am not a lawyer.** What follows identifies exposure — the places where the site makes a commitment, a claim, or a use of someone else's property that a lawyer should be asked about before money changes hands. Where I name a statute it is to give the owner a search term for that conversation, not to state that it applies.

---

## Verdict in one line

The editorial and image-licensing discipline on this site is genuinely better than most commercial publishers manage — the licence audit came back essentially clean. The exposure is almost entirely on the **commerce** side, and it is concentrated in three places: **a garment specification and size chart published for a product that does not exist and that the project's own decision register says the owner never supplied**; **a set of shipping and returns commitments written as if a fulfilment operation existed**; and **the total absence of a named legal entity, address or contact route**, which is the thing that turns every other promise on the site from a marketing claim into an unenforceable one against nobody.

---

## Findings summary

| # | Finding | Rank | Nature |
|---|---|---|---|
| L1 | Garment specification published for an unmanufactured product, contradicting the owner-decisions register | **BLOCKING** | Legally risky |
| L2 | Size chart published with a fault guarantee, contradicted by the live FAQ on the same site | **BLOCKING** | Legally risky |
| L3 | No legal entity, registered address, contact address, VAT/EIN or governing law anywhere | **BLOCKING** | Legally risky |
| L4 | Terms state "Photographs of people appear with their agreement" — they do not | **BLOCKING** | Legally risky |
| L5 | Shipping/returns commitments no one-person operation can meet as written | **SHOULD FIX** | Both |
| L6 | Right of publicity: five living subjects, no consent, apparel brand | **SHOULD FIX** | Legally risky |
| L7 | CC BY / CC BY-SA attribution incomplete as rendered (no licence link, no modification notice) | **SHOULD FIX** | Legally risky |
| L8 | Privacy policy "that is the entire list" omits IP address and processors | **SHOULD FIX** | Legally risky |
| L9 | "82% recycled polyester" is an unsubstantiated environmental claim | **SHOULD FIX** | Legally risky |
| L10 | FAQ says the Journal is unpublished; 18 articles are live under bylines | **SHOULD FIX** | Commercially unwise |
| L11 | Kyra Gracie credit misstates what the Commons file page says | **NOTE** | Legally risky (low) |
| L12 | No trademark clearance search; `guardtheory.com` is listed for sale by a broker | **NOTE** | Commercially unwise |
| L13 | Policies promise a one-click unsubscribe and a data-access route that do not exist | **NOTE** | Legally risky (low) |

---

## 1. Image licensing

Eight portraits are published. I fetched all eight Commons file pages and read the licence template, author field and permission field on each.

### Verification table

| Figure | File (`sourceUrl`) | Licence claimed in repo | Licence actually on Commons | Credit names the right holder? |
|---|---|---|---|---|
| Carlos Gracie | `File:Carlos_Gracie_(1951)_(cropped).tif` | "Public domain (Arquivo Nacional PD-license)" | `{{PD-Brazil-URAA}}` + Arquivo Nacional PD; author *Unknown*; accession `BR_RJANRIO_PH_0_FOT_24370_001` | ✅ Yes |
| Hélio Gracie | `File:Hélio_Gracie_(1952).tif` | Same | Public domain / Acervo Arquivo Nacional; author *Unknown*; accession `BR_RJANRIO_PH_0_FOT_24373_003` | ✅ Yes |
| Mitsuyo Maeda | `File:Maeda_Mituyo.jpg` | "Public domain (PD-Japan)" | `{{PD-Japan}}`; source 『前田光世 世界柔道武者修行』, 島津書房; no individual author | ✅ Yes |
| Marcelo Garcia | `File:Marcelo_garcia.jpg` | "Public domain (author release)" | `{{PD-user}}` — "released into the public domain by its author, **WilliamBKH**" | ⚠️ Partly — see L11b |
| Rickson Gracie | `File:Rickson_gracie_20080608.jpg` | "Public domain (author release)" | PD self-release "by its author, **Zekerags**, at the English Wikipedia project" | ✅ Yes |
| Roger Gracie | `File:RogerGracie.JPG` | "CC BY-SA 3.0" | CC BY-SA 3.0 Unported + GFDL 1.2; "Photographed by **Kerri Roberts**", uploader **Iwtbf42** | ✅ Yes |
| Royce Gracie | `File:Royce_Gracie_..._by_Shane_Balkowitsch.jpg` | "CC BY 4.0" | CC BY 4.0 International; author **Balkowitsch**; photographed 27 Sept 2025 | ✅ Yes |
| Kyra Gracie | `File:Kyragracie1.jpg` | "CC BY-SA 3.0 (GFDL relicence)" | GFDL 1.2 + CC BY-SA 3.0; author field **"self-made"**, uploader **Veritas~commonswiki**, ticket 2008021310000886 | ⚠️ No — see L11 |

**The eight licence labels are accurate.** After the Kyra credit was corrected, no second wrong-uploader error survives. Both figures without a portrait (`carlson-gracie.ts:3-7`, `oswaldo-fadda.ts:3-8`) document *why* they have none, and both rejected the available candidate for a defensible reason. That is unusually good practice and should be said plainly.

The remaining exposure is not in *which* licence was claimed. It is in **whether the attribution as rendered discharges the licence conditions**, and in what a copyright licence does *not* give you.

### L7 — CC attribution is incomplete as rendered — **SHOULD FIX** (legally risky)

`src/app/figures/[slug]/page.tsx:77-87` renders:

```
{figure.image.credit} · {figure.image.license} · source
```

Confirmed live on `/figures/royce-gracie`:

> "Photograph by Shane Balkowitsch, 2025. Via Wikimedia Commons. · CC BY 4.0 · source"

Three gaps against the licence text itself:

1. **The licence is not linked.** CC BY 4.0 §3(a)(1)(B) requires you to retain "a URI or hyperlink to this Public License to the extent reasonably practicable"; CC BY-SA 3.0 §4(c) requires "the Uniform Resource Identifier, if any, that Licensor specifies to be associated with the Work". On a web page, "reasonably practicable" is an `<a href>`. `CC BY 4.0` is currently plain text (line 78).
2. **No indication that the image was modified.** CC BY 4.0 §3(a)(1)(B) and CC BY-SA 3.0 §4(b) both require you to indicate if you modified the work. Two of the eight sources are `.tif` and are served as `.jpg` (`public/figures/carlos-gracie.jpg`, `helio-gracie.jpg`) — those two are public domain so it does not matter. But **all** portraits are rendered into a 4:5 box with `object-cover object-top` (line 72), which crops them on screen, and the Kyra credit itself states the file used is a crop. For the three CC-licensed images (Roger, Royce, Kyra) a modification notice is a licence condition, not a courtesy.
3. **No share-alike notice on the two BY-SA images.** Roger Gracie and Kyra Gracie are CC BY-SA 3.0. Whether a crop of a photograph is an "Adaptation" that triggers §4(b) is genuinely arguable, but the cheap answer is to state it and stop arguing.

**Fix:** make the licence string a link to the deed (`creativecommons.org/licenses/by/4.0/` etc.), and append "Cropped." (or "Cropped from the original.") to the three CC credits. Ten minutes of work that closes the only live copyright-condition gap on the site. Also consider dropping `nofollow` from the source link (line 81) — attribution links are exactly the thing `nofollow` was not meant for, and a rights holder reading the page will notice.

### L11 — Kyra Gracie credit misstates the file page — **NOTE**

`src/content/figures/entries/kyra-gracie.ts:12-13`:

> "Original uploaded to Wikimedia Commons by Veritas~commonswiki, 13 February 2008, under Wikimedia permission ticket 2008021310000886; cropped by Kimsaka, 2018. **No photographer is named on either file page.**"

Repeated at `kyra-gracie.ts` contested note 4: "Neither Commons file page names a photographer."

The file page's Author field reads **"self-made"**, with source "my files". On Commons that is a positive assertion that the uploader *is* the photographer. So a photographer *is* named — Veritas~commonswiki — and the sentence saying otherwise is wrong. The practical attribution is still correct (the uploader is credited), so nothing is unlicensed; but the site's own credibility position is "we state licences precisely", and this is the one place it does not. Also `kyra-gracie.ts:15` points `sourceUrl` at the **uncropped parent**, while the sources list (`kyra-gracie.ts`, source 3) cites the **cropped** file — one of the two is the file actually served.

**Fix:** "Photograph credited as own work by Wikimedia Commons user Veritas~commonswiki, 13 February 2008 (permission ticket 2008021310000886); cropped by Kimsaka, 2018. No real name is given."

### L11b — Marcelo Garcia credit asserts a real name the source does not give — **NOTE**

`src/content/figures/entries/marcelo-garcia.ts:12-13`:

> "Photograph by **William Burkhardt** (Wikimedia Commons user WilliamBKH), released by the author into the public domain."

The Commons file page names only the account **WilliamBKH**. "William Burkhardt" does not appear on it. Expanding a username into a real name is an inference; if it is wrong, the site has attributed a stranger's photograph to a named individual. Under the project's own editorial rule (`docs/assumptions.md`, "no invented fact") this is the same class of error the `NAC 467.430` incident was. The image is public domain so no licence breaks either way.

**Fix:** credit the account name only, unless the real name is documented on the user page and that page is cited.

---

## 2. Right of publicity

### L6 — Living subjects, no consent, on a site that will sell apparel — **SHOULD FIX** (legally risky)

**Living (5):** Kyra Gracie (b. 1985, Brazil) · Marcelo Garcia (b. 1983, New York) · Rickson Gracie (b. 1958, California) · Roger Gracie (b. 1981, UK) · Royce Gracie (b. 1966, California).
**Deceased (5):** Carlos Gracie (d. 1994) · Hélio Gracie (d. 2009) · Carlson Gracie (d. 2006) · Oswaldo Fadda (d. 2005) · Mitsuyo Maeda (d. 1941). Carlson and Fadda have no portrait.

**The critical point the site does not currently acknowledge anywhere: a Creative Commons licence conveys copyright only.** Creative Commons says so in its own licences — CC BY 4.0 §2(b)(1) expressly excludes moral rights, and §2(b)(2) excludes publicity, privacy and personality rights. The photographer's permission is not the subject's permission. The site has correctly solved the copyright question for all eight portraits and has not touched the publicity question for any of the five living ones.

Why it matters more here than on an ordinary blog: **`guardtheory.net` is an apparel brand.** Every figure page sits inside a site whose header, footer and internal links funnel to `/shop` and `/first-edition`, and whose footer describes the operator as "an independent brand" selling apparel. That is the fact pattern the publicity statutes are written around:

- **California** (Royce, Rickson) — Civil Code §3344 covers knowing use of a photograph "on or in products, merchandise, or goods, or for purposes of advertising or selling", with statutory damages, profits and attorney's fees available. §3344(d) carves out use "in connection with any news, public affairs, or sports account", and the figure pages are genuinely that — sourced, dated, contested-notes and all. Hélio Gracie died in 2009 and California's post-mortem right (§3344.1) runs 70 years, exercisable by heirs.
- **New York** (Marcelo) — Civil Rights Law §§50–51, use of a living person's portrait "for advertising purposes or for the purposes of trade" without **written** consent. Newsworthiness is a recognised defence.
- **Brazil** (Kyra) — Civil Code arts. 20–21, and STJ Súmula 403, under which damages for unauthorised publication of a person's image *for economic or commercial ends* do not require proof of loss. This is the sharpest of the five and the family is not shy about enforcement.
- **UK** (Roger) — no publicity right as such, but passing off / false endorsement (*Irvine v Talksport*) if a reader could think he endorses the brand.

**Does anything currently imply endorsement?** On the pages as built, no — and this is to the site's credit. The portraits sit in a study register with sources, contested notes and an editorial-policy link (`figures/[slug]/page.tsx:180-189`); there is no product adjacency, no "as worn by", no logo lockup, no quote pulled into marketing. `docs/image-production-plan.md` even states the rule explicitly ("Nothing implies a sponsorship that does not exist"). The current posture is defensible as editorial.

**The risk is what happens next, and it is easy to trip:**

- `figures/[slug]/page.tsx:47` puts the portrait into `schema.org/Person.image`, and the site's `Organization` node is the publisher. Harmless now; becomes an advertising signal if a `Product` node ever sits on the same graph.
- The moment a figure portrait appears in an Open Graph card that is shared to promote a drop, in a launch email, on a `/lookbook` page, or beside a garment, the editorial defence weakens sharply.
- A "Figures" print, patch, or capsule named after any of them would be a straight §3344 / Súmula 403 problem.

**Recommended:** (a) write the rule down as a hard constraint — figure portraits never appear on `/shop`, `/first-edition`, `/lookbook`, in any email, or in any social asset promoting a product; (b) put a one-line notice in Terms that images of identifiable people are used editorially under copyright licences that do not convey the subjects' consent, and that removal requests are honoured; (c) ask the lawyer specifically about Kyra Gracie (Brazil) and Royce Gracie (a 2025 photograph of a living, commercially active licensor of his own name) before launch. If any one portrait had to go, it is Royce's — it is the most recent, the subject most actively monetises his own likeness, and the brand's own storefront is the context.

---

## 3. Product claims

### L1 — A specification published for a garment that has never been manufactured — **BLOCKING** (legally risky)

`src/content/products/entries/theory-01-long-sleeve.ts:40-43` and the identical block at `theory-01-short-sleeve.ts:40-43`:

```
{ label: "Fabric composition", value: "82% recycled polyester, 18% elastane" },
{ label: "Fabric weight",      value: "240 gsm" },
{ label: "Seam construction",  value: "Flatlock, four-thread" },
{ label: "Print method",       value: "Full sublimation, dyed into the fibre" },
```

Rendered as a `<table>` headed "Specification" at `src/app/shop/[slug]/page.tsx:97-119`, on the two pages the whole site funnels to.

The project's own decision register contradicts this directly. `docs/owner-decisions.md` item 3, still marked **open**:

> "No garment measurements exist yet. **Needed:** the real size chart (chest, length, sleeve per size), **fabric composition, GSM/fabric weight, construction details (seam type, print method)**, and country of manufacture."

And `docs/agent-handoffs/06-content-strategy.md:111`:

> "**B16 (fabric) cannot be finished** without owner-decision item 3 (measurements, composition, construction). … **Do not publish invented specs.**"

And the content model's own docstring, `src/content/products/types.ts:21-25`:

> "`value` is null until the owner supplies a real figure; the UI renders that as 'to be specified' rather than inventing a number."

Two possibilities. Either the owner supplied these four numbers and the decision register is stale — in which case the register must be closed and the source of the figures recorded, because a spec with no provenance cannot be defended later. Or they were generated, in which case **this is the single most serious item in this audit** and it must come down before the site takes a name and email address on the strength of it, let alone money.

**The exposure if production differs.** These are not puffery; they are the exact class of statement that becomes a contractual term. In the UK, a pre-contract statement about a good's characteristics that the consumer takes into account is an implied term under the Consumer Rights Act 2015 s.11 ("goods to be as described") and s.12 (information provided under the CCRs is a term of the contract). In the EU, Directive (EU) 2019/771 art. 6 does the same. In the US it is a Uniform Commercial Code §2-313 express warranty, and simultaneously an FTC deceptive-advertising question. A mill that delivers 220 gsm instead of 240, or 75% recycled content instead of 82%, converts every unit sold into a misdescription — with a **thirty-day no-reason return window and free return postage already promised**, which is the mechanism by which a small spec miss becomes a run-destroying cost. See §4.

Also note **no country of manufacture** appears anywhere, although `owner-decisions.md` item 3 lists it as needed. For US import it is required on the garment label (19 U.S.C. §1304) and for EU/UK the fibre composition label is mandatory (Regulation (EU) 1007/2011; the Textile Products (Labelling and Fibre Composition) Regulations 2012). Publishing composition on the web page while the label spec is undecided is backwards.

**Fix:** set every unverified `value` to `null` until a mill confirms it against a delivered sample, and let the UI render "to be specified" as it was designed to. If the owner wants the specification to stay visible, label the table **"Target specification — not yet confirmed against a produced garment"** and say what happens if it changes.

### L2 — Size chart with a fault guarantee, contradicted by the live FAQ — **BLOCKING** (legally risky *and* commercially unwise)

`src/content/products/size-chart.ts:25-32` publishes six full rows of garment measurements. `src/app/size-and-fit/page.tsx:41-97` renders them as a table. `src/app/size-and-fit/page.tsx:145-149` then attaches a guarantee:

> "If a garment does not match the measurements on this page, that is a fault. Return postage is ours, both ways, and we will replace it or refund you — whichever you prefer."

Restated as policy at `src/content/policies/index.ts:187`:

> "If the fault is ours — the wrong item, a manufacturing defect, or **a garment that does not match our published measurements** — we pay, and we pay both ways."

Three problems, in ascending order of seriousness.

**(a) The published tolerance is invisible.** `src/content/products/size-chart.ts:8-9` says:

> "These are the specification the first run is made to. **Production tolerance is ±1cm; anything outside that is a fault** and covered by the returns policy."

That is a **code comment**. It is not rendered anywhere — not on `/size-and-fit`, not on the product page, not in the returns policy. As published, the promise is that a garment matches the stated measurement *exactly*. No cut-and-sew garment does. ±1cm on a 68cm body length is already tight for jersey knit; a mill would normally ask for ±1.5–2cm on length and ±1cm on half-chest. **A guarantee with an unpublished tolerance is a guarantee with no tolerance,** and every buyer with a tape measure is a valid claim.

**(b) The FAQ, live right now, says the size chart does not exist.** `src/app/faq/page.tsx:35-36`, confirmed live at `guardtheory.net/faq`:

> **"Why is there no size chart?"** — "Because nothing has been produced and measured. A chart taken from a pattern rather than from finished garments is the kind of thing people buy against and then return."

The site is simultaneously publishing a size chart, guaranteeing it, and explaining that publishing one would be irresponsible because nothing has been produced and measured. Both statements are indexed and in the sitemap; the FAQ answer is also emitted as `FAQPage` structured data (`faq/page.tsx:70-80`), so it is a machine-readable representation as well as a human one. Whichever one a consumer relied on, the other one is evidence against the brand.

**(c) The chart is derived from a pattern that does not exist.** By the FAQ's own reasoning, this chart is exactly the artefact it warns about.

**Fix (pick one, but pick one before launch):** either pull the chart and restore the FAQ's position, or keep the chart, publish the ±1cm tolerance *on the page next to the table*, delete the FAQ answer, and re-word the guarantee to "outside our stated tolerance". Do not ship both.

### L9 — "82% recycled polyester" is an unsubstantiated environmental claim — **SHOULD FIX**

Separate from L1, and worse than the other three specs, because recycled-content claims sit under their own regime. US: the FTC Green Guides, 16 CFR §260.13, require competent and reliable evidence for recycled-content claims and require qualification where the content is not the whole product. EU: Directive (EU) 2024/825 (Empowering Consumers for the Green Transition) is now in national implementation and bans environmental claims that cannot be substantiated. UK: the CMA Green Claims Code. There is no mill named, no GRS or RCS certificate referenced, and no garment. "82%" is a precise number, and a precise number is exactly what a regulator asks you to evidence.

**Fix:** hold the recycled claim until a certificate exists, and then cite it by standard and number ("82% recycled polyester, GRS-certified, certificate ref …"). A brand whose whole positioning is "specification instead of adjectives" cannot afford the one specification that turns out to be an adjective.

### Note — "Competition-legal by default"

`src/app/first-edition/page.tsx:22` headlines a commitment "Competition-legal by default", while `src/app/faq/page.tsx:39-40` says "Specific ruleset compliance will be stated on the product page once the garments are made, **not promised in advance**." The FAQ's position is the right one. The First Edition heading reads as the promise the FAQ refuses to make, and IBJJF/ADCC uniform rules change between editions. Soften the heading to "Designed inside competition rulesets". Low severity, but it is the third live self-contradiction in the same funnel.

---

## 4. Policies as written

The policies are well-drafted prose and read as if written by someone who has been on the wrong end of a bad returns process. That is the problem: **they are written as if a fulfilment operation exists.** Nothing in the repo suggests one does — there is no commerce platform (`owner-decisions.md` item 7, open), no mail provider (item 6, open), no carrier account, and form submissions currently land in a local NDJSON file (`src/lib/storage/ndjson-store.ts`, `.data/waitlist.ndjson`).

### L5 — Commitments a one-person operation cannot meet as written — **SHOULD FIX** (both)

| Line | Commitment | Why it bites |
|---|---|---|
| `policies/index.ts:127` | "Orders are packed and dispatched **within two business days**" | An absolute, not a target. If the run sells 400 units in a launch hour, two business days is a full-time job for a week. In the US the FTC Mail Order Rule (16 CFR 435) already requires shipment within the stated time or a formal delay/consent notice; stating two days converts a 30-day default into a two-day obligation. **Say "usually within two business days, and we tell you if it will be longer."** |
| `policies/index.ts:135` | "We ship **worldwide**" | Worldwide from a garage means IOSS registration for EU orders under €150 (or the buyer gets a surprise VAT bill after being told at `:150` that duties are theirs), sanctions screening (the policy gestures at it without a mechanism), and carrier-specific prohibited-destination lists. **Launch with a short, named country list.** |
| `policies/index.ts:157` | "A parcel **lost in transit is our problem, not yours**. … we will replace the order or refund it in full" | Legally this is the correct position in the UK/EU (risk passes on delivery — CRA 2015 s.29; CRD art. 20) so it costs nothing to say there. Commercially it is an open-ended liability with no stated cap, no signature requirement and no insurance mentioned, and it is the single most abused clause in small-brand e-commerce. **Keep the principle; add "we may ask you to confirm the address and, for high-value orders, require a signature."** |
| `policies/index.ts:158` | Damaged parcel: "We will replace it and **we will not ask you to return the damaged goods**" | Generous, and a straightforward fraud vector on a first run with no order history to pattern-match against. |
| `policies/index.ts:180` | "we will send a return label" and "Refunds … **within five business days** of the return arriving" | A prepaid label on every return — including change-of-mind returns where `:188` says postage is the customer's — is an operational contradiction unless the label cost is deducted. Five business days is tighter than the 14 days the CRD allows. |
| `policies/index.ts:195` | "Size exchanges are **free** within thirty days, one per order. **We dispatch the replacement as soon as the return is scanned by the carrier**" | This is the most expensive sentence on the site. Free two-way postage on an exchange, on a first run, on a garment nobody has ever tried on, with no photography and a size chart derived from a pattern (§3) — the exchange rate on a debut rash guard is routinely 15–30%. Dispatching before the return arrives means paying outbound twice with no goods in hand. On a small international order the postage can exceed the margin. |
| `policies/index.ts:172` | "Return anything within **thirty days** … You do not need to give a reason" | Exceeds the UK/EU statutory 14 days, which is a legitimate commercial choice, but it is now a contractual term and cannot be quietly shortened for existing orders. |
| `policies/index.ts:90` | "Prices are shown in the **currency selected at checkout** and include applicable sales tax or VAT **where we are required to charge it**" | There is no checkout and no currency selector. And "where we are required to charge it" is doing a great deal of work for an operation with no stated tax registration in any jurisdiction. |
| `policies/index.ts:113` | Liability capped at "the amount you paid" | Standard and sensible — but a limitation of liability in a consumer contract is only effective if it is fair under CRA 2015 Part 2 / the Unfair Terms Directive, and its enforceability depends on the governing law, which the site never states (L3). |

**None of these are wrong to want.** The recommendation is not to become a worse shop; it is to hold this level of commitment until there is an operation behind it, and to add the qualifiers ("usually", "we will tell you", "we may require") that make an ambitious promise survive a bad week.

### L4 — Terms assert consent that does not exist — **BLOCKING** (legally risky)

`src/content/policies/index.ts:99`:

> "**Photographs of people appear with their agreement and are credited.** Historical images are used under public domain or Creative Commons terms, with the licence stated alongside each one."

The second sentence is true. The first is not. The only photographs of people on the site are the eight figure portraits, and **none of the five living subjects agreed to anything.** The sentence is a published representation that consent was obtained — which is precisely the representation you least want on file if a subject ever complains, because it converts an arguable editorial use into an apparent misstatement about their consent. It also directly contradicts §2 of this report.

**Fix, urgently and independently of everything else:** replace with something like — "Where the site publishes a photograph of an identifiable person, it is used editorially under a public-domain or Creative Commons licence from the copyright holder, stated alongside the image. Such a licence does not convey the subject's consent, and we do not claim any. If you are pictured and want the image removed, ask and we will remove it." That single paragraph converts the worst sentence on the site into the best one.

### L8 — Privacy policy's completeness claim is inaccurate — **SHOULD FIX**

`src/content/policies/index.ts:35-37`:

> "If you join the First Edition list we collect your first name and email address, and — only if you choose to give them — how long you have been training … **That is the entire list.** We do not ask for a postal address, a phone number or a date of birth."

It is not the entire list.

- `src/app/first-edition/actions.ts:9-16` and `src/app/contact/actions.ts:36-40` read `x-forwarded-for` and use the client **IP address** as a rate-limit key. An IP address is personal data under GDPR (recital 30 / *Breyer*). It is not disclosed.
- The site runs on Vercel, which is a **processor** handling that data plus request logs. `docs/owner-decisions.md` item 6 anticipates a mail provider that will be a second processor. Neither is named. GDPR art. 13(1)(e) requires the categories of recipient at the point of collection, and art. 13(1)(a)/(b) require the **identity and contact details of the controller** — which brings us to L3.
- `:67` — "This site sets no analytics cookies and loads no third-party tracking scripts." Consistent with everything I read in the repo (self-hosted fonts, no analytics import). Accurate today; it is the kind of statement that becomes false the first time someone adds a pixel, so tie it to a checklist.

`:60` — "If you are in the UK, EU or California, you have statutory rights to access, correction, deletion and portability" — correct as far as it goes, but the policy names no controller, no representative, no DPO, no supervisory authority to complain to (art. 13(2)(d)), no legal basis, and no retention period for the IP data it does not mention. And **CCPA/CPRA applies only above revenue and volume thresholds** the brand will not meet; saying "you have these rights" is generous, not inaccurate, but the operator should know he is opting in.

### L13 — Promises the code cannot keep — **NOTE**

- `src/components/waitlist/WaitlistForm.tsx:107` and `policies/index.ts:59`: "Every email we send carries a one-click unsubscribe." No mail provider is connected (`src/lib/waitlist/index.ts:18-19` is a commented-out Resend branch). `/unsubscribe` and `/email-confirmed` are static pages with no mechanism behind them. Nothing is being sent, so nothing is currently breached — but list-unsubscribe headers are a *requirement* under CAN-SPAM/Gmail–Yahoo bulk sender rules, and this must be true on the day the first email goes out, not asserted before.
- `policies/index.ts:59`: "Ask and we will tell you exactly what we hold about you, correct it, or delete it." **There is no way to ask.** The contact form writes to `.data/contact.ndjson` — a local file, which on Vercel's serverless filesystem does not survive between invocations. A GDPR subject-access request submitted through the only channel offered may never reach a human. That is a one-month statutory clock (art. 12(3)) running against a message that was never delivered.

---

## 4b. Missing legal furniture

### L3 — No entity, address, contact or governing law anywhere — **BLOCKING** (legally risky)

I checked the footer (`src/components/site/SiteFooter.tsx:89-92`), the structured data (`src/components/site/SiteStructuredData.tsx:14-41` — deliberately minimal, no `address`, no `founder`, no `contactPoint`), `/about`, `/contact` (a form only, no email address), and every policy page. I confirmed against the live site. **Nowhere does `guardtheory.net` state:**

- a legal entity name (sole trader, Ltd, LLC — anything)
- a geographic/registered address
- a company or VAT registration number, or an EIN
- an email address or telephone number
- a country of establishment
- a **governing law and jurisdiction** clause in the Terms

The footer's only identifying statement is "Guard Theory is an independent brand."

This is the finding that makes the others worse. The site asserts rights ("The articles … are ours", `:98`), limits liability (`:113`), forms contracts (`:89`), takes personal data as a controller, and invokes UK, EU and California statutory regimes (`:60`) — **on behalf of nobody identifiable.**

What is typically required to sell online, in the jurisdictions this site has already named:

- **UK** — the Electronic Commerce (EC Directive) Regulations 2002 reg. 6 require the service provider's name, geographic address, email, and VAT number where registered, "easily, directly and permanently accessible". The Consumer Contracts (ICACR) Regulations 2013 reg. 13 + Sch. 2 require trading name, geographic address, telephone/email, and complaint address **before** the consumer is bound. A company must disclose its registered name and number on its website (Companies Act 2006 s.82 and the 2015 Trading Disclosures Regulations). A sole trader trading under a business name must disclose their own name and a service address.
- **EU** — e-Commerce Directive 2000/31 art. 5 and Consumer Rights Directive 2011/83 art. 6(1)(b)–(d) are the equivalents, plus an ODR/complaint route, plus the imprint duty that German-law claimants in particular enforce commercially against non-compliant shops.
- **US** — no federal imprint duty, but CAN-SPAM §7704(a)(5) requires a **valid physical postal address in every commercial email** (which the First Edition launch email will be), and payment processors (Stripe, Shopify Payments) will require a legal entity, a support email and a refund policy before enabling live charges anyway.
- **Governing law** — with none stated and a "worldwide" shipping promise, the default under Rome I art. 6 (and the equivalents) is that an EU/UK consumer keeps the protection of *their own* law. The brand has effectively agreed to be sued at home by any customer, anywhere, under whichever consumer regime is most favourable to them.

**Fix, before a single sale:** decide and disclose the entity and its country; add name, address and a real monitored email to the footer and to the Terms; add a governing law and jurisdiction clause; add a `ContactPoint` and `address` to the `Organization` schema. This is a half-day of work and it is a hard gate on taking money.

---

## 5. Editorial risk

I read all ten figure profiles in full, grepped the full journal and technique corpora for defamatory-register vocabulary, checked every competitor brand name in the category against the published content, and cross-read the two prior internal reviews (`docs/final-review.md`, `docs/editorial-qc-review.md`).

**This is the strongest part of the site and I found no defamation exposure worth ranking.** Specifically:

- **Nothing disparages a named competitor brand.** The 106 KB of competitor research in `docs/competitor-research.md` names thirteen rivals with pointed commercial criticism ("a $129 anchor charged on **zero** variants"; "Dormant ~4 years"; "permanent overstock and observed 75%-off items"). **None of it reached a published page.** I grepped every competitor name across `src/content` and `src/app`: zero hits. That is a discipline most brands lose; it should be written down as a rule so it survives the next content pass, because those specific claims — particularly the Future Kimonos compare-at pricing observation — would be a malicious-falsehood / comparative-advertising problem if published without the underlying data attached.
- **Claims about living people are sourced and hedged correctly.** Every figure carries a `sources` array with publisher, URL and access date, and a "Where the record is contested" section that survives contact with the actual sources. `rickson-gracie.ts` dismantles the 400-0 record while citing BJJ Heroes' own characterisation of it as a myth and Sherdog's tabulated 11-0, and explicitly declines to assert anything about the Yoji Anjo match — the one episode where a careless sentence would be actionable.
- **The single highest-risk paragraph was deliberately not written.** `royce-gracie.ts` contested note 2: "This entry **omits a doping allegation** … Only a single accessible source for it was found, and no primary commission record or established news report could be retrieved. It should be reinstated … only if a primary source becomes available." A doping allegation about a living athlete sourced to one community wiki is a textbook libel claim in England and Wales, and it was correctly refused. That decision is worth more than the rest of the editorial policy combined.
- **The sharpest characterisations are of the dead or of institutions.** Carlson Gracie's fee arrangement and the 2000 walk-out (`carlson-gracie.ts`), the Gracie Diet's non-verifiability (`carlos-gracie.ts:22`) — subjects deceased, sources named. `what-the-early-ufc-tournaments-demonstrated.ts:55` explicitly disclaims bad faith: "Neither point requires anybody to have been dishonest."

**Two residual notes, both minor:**

1. **Bylines are partial names.** `src/content/authors.ts:22-35` publishes "Rick R" and "Steven P". No legal problem — but `src/app/faq/page.tsx:47-48` says live that articles are "**held in draft** until they can carry a real named author with real credentials", and `docs/owner-decisions.md` item 2 is still open with the note "nothing will be published under a fabricated name". Eighteen articles are live under these bylines right now. Either the bylines are real and the FAQ and register are stale, or they are not. **(L10 — SHOULD FIX, commercially unwise rather than legally risky:** it costs the site the one asset it is built on. Fix the FAQ answer and close register item 2.)
2. **Nominative use of "Gracie".** The name appears in six of ten figure slugs and throughout the corpus. "Gracie", "Gracie Barra", "Gracie Jiu-Jitsu" and related marks are registered for instruction and apparel. Editorial reference is classic nominative fair use and I see no infringement. The commercial-strategy angle is worth one sentence with the lawyer: an apparel brand deliberately ranking for those names is the fact pattern in which a mark owner raises initial-interest confusion. **NOTE only.**

---

## 6. Consumer law

**Are the site's statements about statutory rights accurate?**

- `policies/index.ts:202` — "Your statutory rights are not affected by anything on this page." **Accurate and correctly placed.** It sits under "Faults after thirty days", which is exactly where a consumer's non-waivable rights (UK: CRA 2015 s.19–24, six-year limitation in England & Wales; EU: two-year conformity period under Directive 2019/771) outlive the voluntary 30-day window.
- `policies/index.ts:113` — the liability carve-out for death/personal injury and fraud is drafted the way UK counsel would draft it (UCTA/CRA s.65). Good.
- `policies/index.ts:172` — a 30-day no-reason return exceeds the 14-day statutory minimum. Legitimate; now contractual.
- `policies/index.ts:188` — "If you have simply changed your mind, return postage is yours." **Lawful in the UK/EU only if the trader told the consumer so before the order** (CCRs 2013 reg. 13 + Sch. 2 para (m); CRD art. 6(1)(i)) — otherwise the trader bears it. The statement exists on the returns page; it must also be surfaced pre-contract at checkout, not only in a policy the buyer may never open.
- `policies/index.ts:89` — "An order is an offer to buy … accepted when we send a dispatch confirmation." Standard and correct in UK/EU practice. Note it does not disapply the consumer's separate 14-day cancellation right, and it should not be read as doing so.
- **The size-chart commitment (`size-and-fit/page.tsx:145-149`, `policies/index.ts:187`) is the one place where the site gives away more than the law requires and gives it away without a limit.** See L2(a): a guarantee against published measurements, with the tolerance only in a code comment, is unbounded. Under CRA 2015 s.11 the measurements are already an implied term whether or not the guarantee exists — so the guarantee's only *added* effect is to promise **two-way postage on every dimensional deviation, however small**, on a first production run. Publish the tolerance and the promise becomes both honest and survivable.
- **Missing:** any pre-contract information summary, a model cancellation form (CRD Annex I(B)), a complaints route or ADR/ODR information, and — again — the trader identity that all of the above must name (L3). None of these can be finished until the entity is decided.

---

## Legally risky vs. commercially unwise

**Legally risky** — could produce a claim, a regulator letter, or an unenforceable contract:
L1 (unsubstantiated specification) · L2 (guaranteed size chart with hidden tolerance) · L3 (no identifiable trader, no governing law) · L4 (asserting subject consent that does not exist) · L6 (living subjects' publicity rights) · L7 (incomplete CC attribution) · L8 (privacy policy omits IP and processors) · L9 (recycled-content claim) · L13 (unsubscribe and SAR routes that do not function).

**Commercially unwise** — costs money, credibility or optionality, but is not a legal problem:
L5 (free two-way exchange postage, pre-arrival dispatch, worldwide shipping, two-day absolute dispatch — this is where a first run's margin disappears) · L10 (three live self-contradictions in the main funnel: the FAQ denying the size chart, the FAQ denying the Journal, "competition-legal by default" against "not promised in advance" — each one hands a sceptical reader a reason to disbelieve the *accurate* claims) · L12 (no trademark clearance search — `docs/competitor-research.md:720` says so explicitly: "**This is not a trademark search** and should not be relied on"; and `guardtheory.com` currently 301s to a BrandBucket listing, meaning the matching `.com` is for sale to anyone including a competitor).

---

## Score: **58 / 100** for launch-readiness from a risk standpoint

The number is low relative to the quality of the work, and the reason is that this audit scores *readiness to sell*, not craft. On the axes the brand chose to compete on the site is exceptional: eight image licences verified against their Commons file pages with zero mismatches, two portraits deliberately withheld because the only available candidates carried licences that could not be true, a doping allegation about a living athlete refused for want of a primary source, and 106 KB of pointed competitor research kept entirely out of published copy. If the score covered editorial and copyright hygiene alone it would be in the high eighties, and the attribution gaps that remain (L7, L11) are twenty minutes of work. What holds it down is that the commerce layer has been written to the same confident register as the editorial layer **without the underlying facts existing** — a four-line fabric specification and a six-row size chart published for a garment that has never been cut, in flat contradiction of the project's own still-open decision register and its own instruction not to publish invented specs; a guarantee attached to those measurements whose only tolerance lives in a code comment; a returns and shipping regime generous enough to be expensive and absolute enough to be binding, with no fulfilment operation behind it; a Terms page asserting that photographed people agreed to appear when five living subjects were never asked; and, underneath all of it, no legal entity, no address, no contact route and no governing law, so that every one of those commitments is currently made by nobody to anybody. None of this is hard to fix and none of it requires abandoning the site's voice — the honest register is an asset, it has simply been extended to cover facts that are not yet in hand. **Do not take money until L1, L2, L3 and L4 are closed;** the rest can follow in the fortnight after, and the lawyer's review that `docs/owner-decisions.md` item 9 already anticipates should be booked with this document in hand rather than after the first sale.
