# 02 — Accessibility

Auditor: accessibility. Scope: live site (https://guardtheory.net), source at
`src/`, committed screenshots at `docs/screenshots/{mobile,tablet,desktop,wide}`.
No build, dev server, Playwright or Lighthouse run was started.

## How to read this

The automated suite reports zero axe violations across 21 routes and Lighthouse
accessibility 100. Everything below sits outside what those tools inspect, and
most of it sits outside what they *can* inspect. Where a finding is one an
automated tool would have caught if configured differently, it says so. Where
something is genuinely fine and merely looks alarming, it is listed under
[What is actually fine](#what-is-actually-fine) rather than padded into the
defect list.

Contrast figures are computed with the project's own
`src/lib/color/contrast.ts` maths, so they are directly comparable to the
numbers on `/design-system`.

---

## BLOCKING

### B1. The focus ring is invisible on the bone ground — 1.31:1

`src/app/globals.css:124-128`

```css
:focus-visible {
  outline: 2px solid var(--color-signal);
  outline-offset: 3px;
}
```

One focus treatment, in citrine, everywhere. Citrine against ink is 11.49:1 and
excellent. Citrine against **bone** is **1.31:1**, and against bone-raised
1.39:1.

The bone ground is not a corner case — it is the study register, the panel every
long-form page is set on:

- `src/app/technique/[category]/[slug]/page.tsx:97` — `bg-bone` article
- `src/app/journal/[slug]/page.tsx:135` — `bg-bone` article
- `src/app/figures/[slug]/page.tsx:102` — `bg-bone` article

Every focusable element inside those panels takes an effectively invisible
focus indicator, and `outline-offset: 3px` guarantees the ring is drawn on the
bone, not on the element. Affected controls, per page:

| Template | Focusables on bone |
|---|---|
| `journal/[slug]` | ~6 source links + up to 3 related-reading links + editorial-policy link |
| `figures/[slug]` | ~5 source links + editorial-policy link |
| `technique/[category]/[slug]` | up to 3 related links + editorial-policy link |

Across 18 articles, 10 figures and 12 technique entries, that is the majority of
the site's reading surface. A keyboard user tabbing through an article's Sources
list has no idea which link they are on.

**WCAG 2.2 SC 1.4.11 Non-text Contrast (AA)** — focus indicators are explicitly
in scope (Understanding 1.4.11, technique G195). Also fails SC 2.4.13 Focus
Appearance (AAA), which the project is not claiming.

axe has no focus-indicator contrast rule at any tag, and axe's `color-contrast`
rule only samples text. Lighthouse does not check it either. This is invisible
to the entire existing gate.

The palette already contains the fix: `--color-signal-dim: #6b5c1b` is
**5.16:1 on bone** and is already used as the bone-ground accent (the safety
rule at `technique/[category]/[slug]/page.tsx:141`, the eyebrow at
`journal/[slug]/page.tsx:137`). A scoped override —
`.bg-bone :focus-visible { outline-color: var(--color-signal-dim); }` — costs
two lines and is consistent with the design language rather than fighting it.

`tests/unit/contrast.test.ts` should gain a non-text pairing table alongside
`TEXT_ON_GROUND`, or this regresses the next time a ground is added.

### B2. Submitting the waitlist announces nothing and drops focus to `<body>`

`src/components/waitlist/WaitlistForm.tsx:97-111`, and identically
`src/components/contact/ContactForm.tsx:57-71`

```tsx
if (state.status === "success") {
  return (
    <div role="status" className="border border-steel-dim p-8">
```

On success the entire `<form>` is unmounted and this `<div role="status">` is
mounted in the same React commit. Two things go wrong at once:

1. **Focus is destroyed.** The user's focus was on the submit button, which no
   longer exists. Focus reverts to `<body>`. A keyboard user's next Tab starts
   from the skip link at the top of the document; a screen-reader user's virtual
   cursor is reset to the start of the page. There is no navigation, no URL
   change and no `<title>` change to give them a landmark.
2. **The live region is created at the same instant as its content.** A live
   region must exist in the accessibility tree *before* its contents change for
   reliable announcement. Regions inserted together with their text are
   announced inconsistently — NVDA/Chrome usually does, VoiceOver/Safari
   frequently does not.

The net effect for a subset of AT users on the site's single conversion point:
they press "Join the First Edition list", hear nothing, find themselves at the
top of the document, and have no way to tell whether it worked. The likely
behaviour is to submit again — which the server treats as `alreadyOnList` and
which they also will not hear.

SC 4.1.3 Status Messages (AA) is *nominally* satisfied by the presence of
`role="status"`, which is why axe passes it. In practice it is a dead end, and
SC 2.4.3 Focus Order ("preserves meaning and operability") is not met.

The error path, by contrast, is done correctly —
`WaitlistForm.tsx:57-66` mounts the summary *and* moves focus to it, so the
content is read regardless of live-region timing. Applying the same treatment to
the success state (a `tabIndex={-1}` container that receives focus, with
`role="status"` kept as a belt-and-braces) fixes it. Rendering the success panel
*in place of* the form while keeping the surrounding `<h2>Join the list</h2>`
heading also means the page's heading now contradicts its content — worth
resolving in the same change.

---

## SHOULD FIX

### S1. Non-text contrast: every form control and outline button is below 3:1

`src/components/ui/Field.tsx:68-69, 94-96, 128-130, 162-164`
`src/components/ui/Button.tsx:27`
`src/components/search/SearchClient.tsx:42`

| Element | Colours | Ratio | Required |
|---|---|---|---|
| Input / select / textarea border | `steel-dim` on `ink` | **1.94:1** | 3:1 |
| Input fill vs page ground | `graphite` on `ink` | **1.12:1** | — |
| `intent="outline"` button border | `steel-dim` on `ink` | **1.94:1** | 3:1 |
| Search input border | `steel-dim` on `ink` | **1.94:1** | 3:1 |

The input's fill (`graphite`, 1.12:1 against `ink`) is visually indistinguishable
from the page. The 1.94:1 hairline is therefore the *only* visual information
that says a text field exists there at all — which is precisely what SC 1.4.11
requires to reach 3:1. The same applies to the header's "Join the list" button
(`SiteHeader.tsx:42`) and every `intent="outline"` button, where an unfilled box
of chalk text is identified as a control only by its border.

The comment at `globals.css:29-31` says steel-dim "reads 2.4:1" — that number
does not correspond to steel-dim against any ground actually used
(ink 1.94, ink-raised 1.81, graphite 1.73). Worth correcting whichever way this
is resolved.

**SC 1.4.11 Non-text Contrast (AA).** axe has no rule for this at all.

Note this does *not* extend to the diagram strokes — see
[What is actually fine](#what-is-actually-fine).

### S2. Numbered lists lose their numbers for screen-reader users

`src/app/technique/[category]/[slug]/page.tsx:52-68` (`OrderedNotes`),
`src/app/journal/[slug]/page.tsx:206`, `src/app/figures/[slug]/page.tsx:153`

```tsx
<ol className="m-0 flex list-none flex-col gap-5 p-0">
  <li className="flex gap-5">
    <span className="notation … " aria-hidden="true">
      {String(index + 1).padStart(2, "0")}
    </span>
```

The ordinal is drawn, and then hidden from assistive technology. The `<ol>` is
given `list-style: none`, which strips the CSS marker, so there is no
alternative source of the number either. Two consequences:

- In **Safari/VoiceOver**, `list-style: none` removes the list role entirely
  (long-standing, deliberate WebKit behaviour). "Key mechanics" and "Training
  progression" are announced as an undifferentiated run of six sentences — no
  list boundary, no item count, no ordinals.
- In NVDA/JAWS the list role survives, but with no marker rendered there is no
  ordinal to announce either.

For "Common errors" and "Where the record is contested" this costs nothing — the
hidden `×` and `?` are genuinely decorative and correctly hidden. But
**"Training progression" is a sequence, and the sequence is the content.** Read
aloud, step 05's "from a shield that is already being smashed" arrives with no
indication that four steps preceded it. The same applies to numbered Sources,
where "01" is the citation handle.

`list-none` is applied to 24 files' worth of lists site-wide. The cheap global
fix is `role="list"` on the `<ul>`/`<ol>` (restores the Safari role); the
ordinals additionally need either a visually-hidden "Step 1." or removal of
`aria-hidden` from the number span.

**SC 1.3.1 Info and Relationships (A).** Not detectable by axe — the markup is
correct, it is the CSS that erases it.

### S3. The size chart scrolls by pointer only

`src/app/size-and-fit/page.tsx:41-42`

```tsx
<div className="max-w-[70rem] overflow-x-auto">
  <table className="w-full min-w-[44rem] …">
```

The scroll container has `tabindex` nowhere and contains no focusable
descendants. A keyboard-only user cannot scroll it. Chrome shipped
keyboard-focusable scrollers, but Safari has not, and this is the only route to
the site's garment measurements — six columns, four of which are off-screen at
mobile width and at 400% zoom.

**SC 2.1.1 Keyboard (A).** Fix: `tabIndex={0}` plus `role="region"` and
`aria-labelledby="chart"` on the wrapper, so it is both reachable and announced
as a scrollable region.

(The horizontal scroll itself is *not* a 1.4.10 Reflow failure — data tables are
explicitly exempted.)

### S4. "Two fields are required" — there are three

`src/app/first-edition/page.tsx:71-74` vs
`src/lib/waitlist/validate.ts:104-107`

The page says:

> Two fields are required. Everything else helps us plan the run and is
> genuinely optional.

The validator rejects the form on three: `firstName`, `email` **and**
`consent`. The consent checkbox at `WaitlistForm.tsx:201-206` carries no
`required` attribute, no visible required marker, and — because the form marks
*optional* fields with an "Optional" badge and says nothing about the rest — is
actively presented as one of the optional ones. A user discovers it is mandatory
only by failing to submit.

**SC 3.3.2 Labels or Instructions (A).** The instruction is present but wrong,
which is worse than absent.

`/contact` has the inverse problem: `src/app/contact/page.tsx` has no statement
about required fields at all, and three of its four controls are required
(`ContactForm.tsx:77-117`). Sighted users get no indication until submit.

### S5. `/lookbook` renders ten buttons, eight of which share four names

`src/app/lookbook/page.tsx:47-51` × 2, with
`src/content/products/entries/theory-01-long-sleeve.ts:12` and
`…short-sleeve.ts:12`

Both garments' construction points are labelled "Crew neck", "Raglan sleeve
seam", "Side seam" and "Hem". Two `GarmentFlat` instances on one page therefore
produce two buttons named "Crew neck", two named "Hem", and so on, with nothing
in their accessible names distinguishing the long sleeve from the short. A
screen-reader user pulling up the elements list, or tabbing without reading the
surrounding prose, cannot tell which garment they are inspecting. Both figures'
default captions are also byte-identical ("Front view, production flat…").

`GarmentFlat` already receives a `title` prop carrying the garment name; passing
it through to an `aria-label` on the `<figure>` (or an `aria-label` on the key
`<ul>`) resolves it.

**SC 4.1.2 / 2.4.6 territory.** axe's `duplicate-*` rules cover ids and landmarks,
not control names, so this passes clean.

### S6. Reading order puts the figure key ahead of the page's own identity

`src/app/shop/[slug]/page.tsx:55-64` (flat) precedes `:70` (`<h1>`)
`src/app/lookbook/page.tsx:43-52` (flat) precedes `:55` (`<h2>`)

Linearised, `/shop/theory-01-long-sleeve` reads:

```
Home / Shop / Theory 01 — Long sleeve rash guard
Fig. 02 — Theory 01, long sleeve, front
[svg hidden]
01 Crew neck · 02 Raglan sleeve seam · 03 Cuff · 04 Side seam · 05 Hem   ← five buttons
Front view, production flat. Hover or tab through the key…
Theory 01                                                                ← the h1
```

Five interactive controls and a construction key arrive before the product's
`<h1>`. The e2e assertion at `tests/e2e/accessibility.spec.ts:71-93` ("the first
heading is an h1") passes, because the figure contains no headings at all —
which is exactly why the test did not catch it.

The same shape appears on `/figures/[slug]`. There the first content after the
breadcrumb is the licence credit:

> Unknown photographer, Fundo Correio da Manha, Arquivo Nacional (Brazil),
> accession BR_RJANRIO_PH_0_FOT_24373_003. Via Wikimedia Commons. · Public
> domain (Arquivo Nacional PD-license) · source

`BR_RJANRIO_PH_0_FOT_24373_003` is read character-by-character by most screen
readers. Every figure page opens with roughly forty seconds of catalogue
metadata before the reader learns whose page they are on. Because the
`<figcaption>` also supplies the `<figure>`'s accessible name, the same string is
announced twice.

This is not a formal 1.3.2 failure — DOM order matches visual order at every
breakpoint, and the credit legitimately belongs with the image. It is a quality
failure, and the fix (grid `order` on the desktop layout only, or moving the
accession string into a `title`/`<abbr>`-style aside) is small.

### S7. Card links have fifty-word accessible names

`src/app/journal/page.tsx:53-70`, `src/app/shop/page.tsx`,
`src/app/figures/page.tsx:60-98`,
`src/app/technique/[category]/page.tsx`,
`src/components/search/SearchClient.tsx:79-90`

Every index card on the site is a single `<Link>` wrapping category, heading,
standfirst, byline, reading time and source count. One journal card's accessible
name:

> "Influential Practitioners De la Riva, and the guard that took his name A hook
> behind one leg solved a specific problem in a specific room in Rio in the early
> 1980s, and the widely repeated account of when it happened does not agree with
> itself. Rick R · 8 min · 5 sources"

That is 55 words, and `/journal` has eighteen of them. Tab-through and
links-list navigation both become unusable; nothing announces where one card ends
and the next begins beyond the `<li>`.

SC 2.4.4 is technically met (the name *is* descriptive). The remedy is
`aria-labelledby` pointing at the card's own `<h3>`, leaving the rest as
non-linked content inside the `<li>` with a stretched pseudo-element for the hit
area — or, more simply, `aria-label={article.title}` on the `Link`.

The same over-naming affects the `<figure>` elements: with no `aria-label`, a
`<figure>`'s accessible name is computed from its `<figcaption>`, so the home
page's guard map is announced as *"Closed guard Open guard Half guard Butterfly
guard De la Riva Five families, one structure. Hover or tab through the key…"*
on entry. `aria-label="Fig. 01 — the guard, as a system"` on the `<figure>`
(`GuardSystemMap.tsx:127`) fixes it and matches the label already rendered above
the drawing at `src/app/page.tsx:47-49`.

### S8. `aria-describedby` and `aria-live` point at the same node

`src/components/notation/GuardSystemMap.tsx:201` + `:221-224`
`src/components/product/GarmentFlat.tsx:198` + `:217-220`

```tsx
<button aria-describedby={captionId} onFocus={() => setActiveCode(family.code)} …>
…
<p id={captionId} aria-live="polite">
```

Focusing a key button does three things simultaneously: announces the button's
name, announces its description (the paragraph), and mutates that same paragraph
— firing a polite live announcement of the new text. Depending on the screen
reader and the order the mutation lands relative to the focus event, the user
hears the *previous* family's definition as the description followed by the
*new* one from the live region, or the same sentence twice.

Pick one. `aria-describedby` alone is correct here: focus already changes the
content, so the description is read at exactly the right moment and the live
region is redundant. `aria-live` is only needed for the pointer path, which is
not a screen-reader path.

Related, same components (`GuardSystemMap.tsx:202`, `GarmentFlat.tsx:199`):
`aria-pressed` is set from `activeCode`, but `onBlur` resets `activeCode` to
`null`. A keyboard user who presses Space to "pin" a family and then tabs away
has the state silently revert — `aria-pressed="true"` becomes `false` with no
user action. Either drop `aria-pressed` (this is a hover/focus preview, not a
toggle) or stop resetting on blur.

### S9. The accessibility statement claims two things the code does not do

`src/content/policies/index.ts:245-246`

> "Every interactive element is reachable by keyboard and shows a visible focus
> ring."

Contradicted by **B1** (the ring is 1.31:1 on every article panel) and **S3**
(the size-chart scroller is not keyboard-reachable).

> "No information is conveyed by colour alone: the active state in a diagram
> changes stroke weight as well as colour."

True of the rings (`GuardSystemMap.tsx:173`, `GarmentFlat.tsx:172` both vary
`strokeWidth`). **False of the connectors**, which are the part that carries the
figure's argument:

- `GuardSystemMap.tsx:135` — `<g strokeWidth={2}>` wraps every transition line;
  only `stroke` changes at `:148`.
- `GarmentFlat.tsx:150-158` — leader lines are `strokeWidth={1.25}` constant;
  only `stroke` and `fill` change.

This is not a 1.4.1 failure, because the drawing is `aria-hidden` and the key
carries the state in text. But a published accessibility statement is the one
page on a site that has to be exactly true, and this one over-claims in the
brand's own idiom ("what we know is not perfect"). Either vary the connector
stroke weight — three characters — or narrow the sentence.

### S10. Skip link and in-page anchors target non-focusable elements

`src/app/layout.tsx:50` → `#main` on `<main>` (23 templates, none with
`tabindex`)
`src/app/journal/[slug]/page.tsx:119-130` → `#{section.id}` on `<section>`

Chrome and Firefox now move the sequential-focus starting point to a non-focusable
fragment target, so Tab continues correctly; the e2e test at
`accessibility.spec.ts:58-69` verifies that much. What does not reliably follow
is the screen-reader **virtual cursor**, particularly in VoiceOver — the user
presses Enter on "Skip to content", Tab now works from the right place, but the
reading cursor is still in the header.

`tabIndex={-1}` on `<main>` and on each article `<section>` makes it
deterministic everywhere. It is a one-attribute change in `UtilityPage.tsx` plus
22 page files, or a shared `<PageMain>` wrapper.

The article Contents nav is otherwise exemplary — the comment at
`journal/[slug]/page.tsx:106-113` documents a CSS-`order` approach that was
tried and reverted precisely because it desynchronised focus order from paint
order. That is the right call and rare to see written down.

---

## TASTE

### T1. The 16px checkboxes pass SC 2.5.8 on a technicality

`src/components/ui/Field.tsx:200` (`size-4`),
`src/components/waitlist/WaitlistForm.tsx:188` (`size-4`, ×4)

`AGENTS.md` states the rule as "interactive targets need 24×24 CSS px minimum",
and `Button.tsx:18-20` honours it with a comment. The five checkboxes on
`/first-edition` are 16×16. They survive because SC 2.5.8's *spacing* exception
applies: a 24px circle centred on each does not intersect another target (the
`gap-3` to the label is 12px — exactly tangent — and `gap-x-8` separates the
interest options). So this is conformant, not a violation. It is still the
smallest hit area on the site, on the site's only form, and it is the one place
the project's own stated 24px rule is not followed.

### T2. Middle-dot metadata reads as a run-on

`technique/[category]/[slug]/page.tsx:99-101`, `journal/[slug]:137`,
`figures/[slug]:77` and `:172`

`{category.name} · {entry.difficulty} · {entry.relevance}` is announced by NVDA
at default punctuation as *"Half Guard Intermediate Gi and no-gi"* — three
unrelated facts with no separation. `VoiceOver` says "middle dot" for each,
which is worse. Commas, or `aria-hidden` separators with visually-hidden
alternatives, read correctly in both.

Same file family: source dates are raw ISO —
`{source.publisher} · consulted {source.accessed}` renders "BJJ Heroes ·
consulted 2026-08-04", announced as "two thousand twenty six dash zero eight
dash zero four". The journal's byline already does this properly with
`toLocaleDateString` and a `<time dateTime>` at `journal/[slug]:149-157`; the
sources lists should borrow it.

### T3. "Hover or tab through the key" excludes the majority of visitors

`GuardSystemMap.tsx:238-240`, `GarmentFlat.tsx:228-230`

Tapping works — `onClick` toggles — but the instruction names only the two input
methods a phone user does not have. The mobile screenshot
(`docs/screenshots/mobile/home.png`) shows this sitting directly under the key
on a 390px viewport.

### T4. Source links open in a new tab with no warning

`figures/[slug]/page.tsx:80, 165`, `journal/[slug]/page.tsx:218`

`target="_blank"` with `rel="noopener noreferrer nofollow"` — the security half
is right, the notice half is missing. SC 3.2.5 is AAA and this is a defensible
choice for citations, but a visually-hidden "(opens in a new tab)" costs nothing
and the site's register (a document with a reference apparatus) suits it.

### T5. Notation type at 11px is doing a lot of load-bearing work

`--text-2xs: 0.6875rem` (`globals.css:50`) carries breadcrumbs, footer column
headings, image credits, the source metadata, the "First Edition — release date
to be announced" line and every size-chart column header. All of it clears AA on
contrast; none of it is a violation. It is still 11px monospace with
`letter-spacing: 0.02em` as the site's entire secondary-navigation layer, and it
is the first thing a low-vision user will zoom past.

### T6. `/design-system` has two fields both named "Email address"

`src/app/design-system/page.tsx:272-285`. A demonstration page, `noindex`, and
the duplication is the point (one clean, one errored). Worth an `aria-label`
distinguishing them so the page models the behaviour it documents.

---

## What is actually fine

Listed because each of these looks like a defect and is not, and because a later
reviewer should not spend time re-deriving it.

**The `aria-hidden` diagram + keyed-legend pattern genuinely works.** I went
looking for meaning stranded in the drawings and mostly did not find it. The
guard map's key does not merely list five names — `connectionsFor()` at
`GuardSystemMap.tsx:103-109` derives the adjacency text from the same `EDGES`
array the lines are drawn from, so "Connects to Butterfly guard, De la Riva and
Half guard" cannot drift from the picture. That is the *argument* of a plate
titled "the guard, as a system", not a caption, and it is the single best piece
of accessibility work in this codebase. The `GarmentFlat` key does the same for
construction. The comment at `:94-102` shows this was reasoned about rather than
stumbled into.

**Diagram strokes at 1.94:1 are exempt, not a failure.** `steel-dim` plate
chrome, grid dots and registration marks are well under 3:1, but SC 1.4.11
exempts graphics whose information is available in text — which, because of the
key, it is. The `aria-hidden` declaration earns the exemption honestly. (Compare
S1, where the form borders are *not* redundant with anything.)

**Reflow and text spacing hold up.** Nothing on the site sets a fixed height —
the reserved slots at `GuardSystemMap.tsx:224` and `GarmentFlat.tsx:220` are
`min-h`, so they grow under a user's line-height and paragraph-spacing
overrides. Layout is grid/flex with `max-w` in rem and `clamp()` type; the only
horizontal-scroll region is a data table, which 1.4.10 exempts. SC 1.4.4, 1.4.10
and 1.4.12 all look clean by inspection.

**Reduced motion is handled once, globally and correctly.** `globals.css:142-154`
collapses transitions to 0.01ms rather than shortening them, disables
`scroll-behavior: smooth`, and applies to `*`, `::before` and `::after` — so the
420ms grayscale-to-colour portrait transition at `figures/page.tsx:71` is covered
without the component knowing about it. `accessibility.spec.ts:155-167` asserts
it. This is the right architecture and `AGENTS.md` protects it.

**The grayscale→colour portrait hover conveys nothing.** No state, no meaning, no
text sits on the image; the card's own text and heading colour change too. Not a
1.4.1 concern.

**No sticky header.** `SiteHeader.tsx:13` is in normal flow. SC 2.4.11 Focus Not
Obscured (Minimum, new at AA in 2.2) is the most commonly missed 2.2 criterion
and this site cannot fail it. The two sticky elements (`journal/[slug]:116`,
`figures/[slug]:62`) are in-flow grid columns that cannot overlap their sibling.

**No dialogs, no modals, no popovers anywhere** — grepped. Therefore no focus
traps, and nothing to escape from.

**Error message copy is better than most professionally audited sites.**
`src/lib/waitlist/validate.ts:75-107` — "Enter an email address that includes an
@ symbol and a domain", "Tick the box to confirm we can email you about the
First Edition. We cannot add you to the list without it." Every message names
the action, not just the fault. The error summary takes focus
(`WaitlistForm.tsx:60-62`), links to the offending fields, and is ordered to
match the visual field order via an explicit `FIELD_ORDER` array. The rate-limit
message even includes the retry interval. This is SC 3.3.3 done properly, and
nothing automated verifies any of it.

**The honeypot is implemented without breaking anything.**
`WaitlistForm.tsx:221-226` — `display:none` container, `aria-hidden`,
`tabIndex={-1}`, `autoComplete="off"`, and a real `<label>` for the field so it
is not an unlabelled control if the CSS ever fails. Textbook.

**Field wiring is correct.** `Field.tsx:34-36` composes `aria-describedby` from
hint and error ids in that order and drops the attribute entirely when both are
absent, rather than emitting `aria-describedby=""`. `aria-invalid` is set to
`true` or omitted, never `"false"`.

**Tables are right.** `scope="col"`/`scope="row"` throughout, `<caption
className="sr-only">` on both the size chart (`size-and-fit:43`) and the spec
table (`shop/[slug]:101`), row headers as `<th scope="row">`.

**Breadcrumbs are right.** `nav[aria-label="Breadcrumb"]`, `<ol>`,
`aria-current="page"` on the non-linked final crumb, `aria-hidden` separators,
`min-h-[24px]` targets, and the JSON-LD generated from the same array so the
rendered trail and the crawled trail cannot disagree.

**Heading structure is clean.** Exactly one `h1` per template, no skipped levels
anywhere (checked all 23 page files), section headings tied to their sections
with `aria-labelledby`, and the footer's four `<nav>` landmarks each labelled by
their own heading. The comment at `accessibility.spec.ts:81-83` shows the team
already found and closed the `heading-order` blind spot the brief mentions.

**`Monogram.tsx:44-45`** switches between `role="img"` + `<title>` and
`aria-hidden` based on whether a title was passed — so the header and footer
logo links (which carry `aria-label="Guard Theory, home"`) do not double up.

---

## Summary of findings

| # | Finding | Rank | SC |
|---|---|---|---|
| B1 | Focus ring 1.31:1 on the bone ground | BLOCKING | 1.4.11 AA |
| B2 | Form success: no announcement, focus lost to `<body>` | BLOCKING | 4.1.3 / 2.4.3 |
| S1 | Form-control and outline-button borders 1.73–1.94:1 | SHOULD FIX | 1.4.11 AA |
| S2 | `list-none` + `aria-hidden` ordinals erase sequence | SHOULD FIX | 1.3.1 A |
| S3 | Size-chart scroll container is pointer-only | SHOULD FIX | 2.1.1 A |
| S4 | "Two fields are required" — there are three; `/contact` says nothing | SHOULD FIX | 3.3.2 A |
| S5 | `/lookbook`: eight buttons with duplicate accessible names | SHOULD FIX | 4.1.2 A |
| S6 | Figure key / image credit precedes the page's `h1` | SHOULD FIX | quality |
| S7 | Card links and `<figure>` names run to 50+ words | SHOULD FIX | 2.4.4 A (marginal) |
| S8 | `aria-describedby` + `aria-live` on one node; `aria-pressed` reverts on blur | SHOULD FIX | 4.1.2 A |
| S9 | Accessibility statement over-claims on two points | SHOULD FIX | accuracy |
| S10 | Skip link and jump links target non-focusable elements | SHOULD FIX | 2.4.3 A |
| T1–T6 | Target size, separators, instructions, new-tab, 11px type | TASTE | — |

---

## Score: 73 / 100

Two of the three blocking-tier problems are the same problem in different
clothing: the project verified its colour system exhaustively for *text* — a
computed table on `/design-system`, a unit test that fails the build, a comment
on every token stating its measured ratio — and then never extended any of that
to *non-text*. The result is a site that cannot ship a 4.4:1 body colour but
happily ships a 1.31:1 focus ring across forty content pages and a 1.73:1
border on every form control. It is a clean, well-drawn boundary in the wrong
place, and it is worth roughly fifteen points on its own because a keyboard user
genuinely cannot see where they are on the site's primary reading surface.
Everything else is comparatively cheap to close: the `list-none` ordinals, the
pointer-only table scroller, the wrong "two fields are required", the duplicate
button names on `/lookbook`. What holds the score up rather than down is that
the hard, judgement-dependent work — the parts no tool and no checklist would
have produced — is genuinely done. The guard map derives its spoken adjacency
from the same array that draws its lines. The error copy tells you what to do.
Reduced motion is architectural rather than per-component. The article Contents
nav has a comment explaining why a CSS-`order` layout was tried and reverted for
focus-order reasons. Sites that score 90 on automated accessibility almost never
have any of that, and sites that have it almost never leave the focus ring at
1.31:1. This one has done the two-thirds axe cannot see and then dropped the
third it easily could have — which is an unusual and, on the evidence of the
codebase's own comments, a fixable failure mode.
