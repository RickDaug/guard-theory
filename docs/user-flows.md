# User flows

The paths that matter, as built. Each states where it starts, what the person
is trying to do, and what happens when it goes wrong — because the failure
branch is the part that usually gets skipped.

---

## 1. Joining the First Edition list

**The only conversion on the site.**

```
Any page → "Join the First Edition list" → /first-edition
  → two required fields (first name, email)
  → four optional (experience, sleeve, size, interests)
  → unchecked consent box
  → Submit
      ├─ valid   → in-place confirmation: "You're on the list"
      ├─ already → "Already on the list. Nothing has changed."
      ├─ invalid → error summary takes focus, links to each field
      ├─ rate-limited → "Try again in N seconds"
      └─ storage failed → "Nothing was lost on your side"
```

**Design notes.** The confirmation uses the same words as the button that
produced it. Nothing on this page manufactures urgency: no countdown, no stock
counter, no discount wheel, no invented date. Consent is never pre-checked and
cannot be defaulted — the type requires literal `true`.

**Currently degraded, and stated on the page.** No mail provider is connected,
so submissions append to a local file. The page says so rather than showing a
success screen that means nothing.

**Without JavaScript** the form posts and lands on `/form-success` or
`/form-error`. Neither is a blank screen.

## 2. Finding out how a rash guard should fit

The single highest-intent question in the category, and the one most often
answered by an advert.

```
/shop/<product> → "size and fit guide" → /size-and-fit
  → four-line summary
  → "Read the full piece" → /journal/how-a-bjj-rash-guard-should-fit
```

The two pages are split by audience, not keyword: `/size-and-fit` covers Guard
Theory's own sizing, the article covers the general question on anyone's
garment. The article contains **no call to action**, because its thesis is that
you should know this whether or not you buy anything.

**Currently degraded.** No measurements exist. The page says so and commits to
covering the cost of a return caused by a wrong chart.

## 3. Reading the guard system map

The hero, and the site's argument in one interaction.

```
/ → Fig. 01
  ├─ pointer: hover a position → its transitions light, definition swaps in
  └─ keyboard: tab through the key → same behaviour, same content
```

The drawing is `aria-hidden`; the key beneath is the real control. Keyboard
users tab through buttons rather than SVG nodes. The definition slot has a
reserved height, so swapping content moves nothing below it. With reduced
motion the state change is instant rather than merely faster.

## 4. Using the Technique Library

```
/technique → 12 categories → category → entry
  entry reads in a fixed order:
    problem → objective → concept → mechanics → errors → safety →
    progression → related
  → related entries, editorial policy, corrections
```

The order is identical in every entry, which is why the numbering is real
structure rather than decoration. Every entry carries a safety note specific to
that technique and the statement that this does not replace a coach.

**Empty category** shows what it is and links back, rather than a bare list.

## 5. Reporting a correction

The flow that makes the editorial policy credible.

```
Any article footer → "Corrections" → /policies/corrections
  → /contact → topic: "A correction to something we published"
  → message → Submit
      ├─ valid   → "Message received. A person reads every message."
      └─ invalid → error summary takes focus
```

The corrections policy tells the reader they do not need to be polite about it,
and that a factual error gets a dated note in the article rather than a quiet
edit.

## 6. Searching

```
/search → type → results filter live
  ├─ nothing typed → "N pages indexed. Start typing to filter them."
  ├─ no match      → explains that fewer words find more, offers the Library
  └─ matches       → grouped cards, kind labelled
```

No query leaves the page. The index is built at build time and filtered in the
browser, so it works offline and cannot drift out of sync with the site.

## 7. Landing on something that does not exist

```
404 → "This page does not exist"
  → what probably happened (a typo, not a rename)
  → home · Technique Library · Journal
```

Three destinations, because a 404 with only a home link makes the reader start
over.

---

## Flows that deliberately do not exist

- **Checkout.** Nothing is for sale. A checkout that cannot take money would be
  a lie in the navigation.
- **Account creation.** There is nothing to sign in to.
- **Newsletter, separate from the waitlist.** One list, one message.
- **Live chat.** A person reads the contact form. Pretending otherwise with a
  bot would be worse.
