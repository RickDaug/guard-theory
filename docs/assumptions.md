# Assumptions

Every judgement call made without owner input. Each is reversible; each states
what would change it.

---

## Brand and design

**The name is read as a field of study.** "Guard Theory" is treated as though
it named an academic discipline, so the site is built as a technical monograph
for no-gi grappling rather than as a shop with a blog attached.
*Reverse it if:* the owner wants a straight apparel storefront.

**Product imagery will be drawn, not photographed.** Technical flats with seam
and panel callouts, in the language of a tech pack. This satisfies the "no
stock fight photography" veto and the no-fake-product-shots rule by making the
constraint the aesthetic. Real photography becomes an addition, not a
replacement.
*Reverse it if:* the owner shoots product early and wants photography to lead.

**Citrine, not red.** Red was vetoed. Citrine was chosen over the alternatives
because it is rare in a category built on red, black and navy, it reads as
annotation ink on a technical plate, and it clears 11.4:1 on the brand ground.
*Reverse it if:* the owner dislikes the colour — it is a single token change.

**Two grounds, one system.** Ink for brand and commerce, bone for study. Long-
form pages render as a bone sheet laid on the ink ground rather than switching
the whole page, so the header and footer never fight the register.

**Numbered callouts are references, not sequences.** Numbers appear only where
they point at something — a plate legend, the fixed reading order of a
technique entry. They are not used as decorative section markers.

## Content

**Technique entries are concepts, not move lists,** and are definitional rather
than instructional. They make no claim about what beats what, attribute no
technique to a named person unless uncontested, and name terminology disputes
in the text instead of silently resolving them.

**Every entry carries a technique-specific safety note.** Generic warnings are
rejected by an automated test. The coach disclaimer is rendered on every entry.

**No publication dates exist yet.** Nothing is backdated. `datePublished` will
be set only when something is genuinely published.

## Information architecture

**Journal category "Technique" renamed to "Technique notes"** at
`/journal/technique-notes`, to resolve a collision with the Technique Library
at `/technique`. Flagged for owner confirmation in `owner-decisions.md`.

**Sizing and fit are one page, not two.** "Rash guard sizing" and "how a BJJ
rash guard should fit" are the same intent; splitting them would produce two
thin pages competing with each other.

**Repository location.** `C:\Users\RickD\AndroidStudioProjects\guard-theory`,
alongside the owner's other projects. Git identity matches the other repos
(RickDaug / urielruiz2134@gmail.com).

## Engineering

**Next.js 16 App Router, React 19, strict TypeScript, Tailwind v4.** The
version bundled its own docs warning that conventions differ from training
data; those docs were read before writing app code rather than after.

**Fonts are self-hosted via `next/font`,** so no request reaches a font CDN at
runtime and `font-src 'self'` holds. Archivo (width axis), Newsreader (optical
size) and Martian Mono, all open-licensed.

**Contrast is computed, not asserted.** `/design-system` measures ratios on the
page and `tests/unit/contrast.test.ts` fails the suite if a token drops below
AA. This caught two real failures already: `steel` at 3.75:1 while carrying
body copy, and `signal-dim` at 3.45:1 on bone.

**Content registry is explicitly imported, not globbed,** so a renamed or
deleted entry fails the build instead of silently vanishing from the sitemap.

**Screenshots are captured with Playwright against a production build,** not
the dev server, so what is reviewed is what would ship.

**Three high-severity advisories are accepted for now.** They are transitive
dependencies inside Next 16.2.12's own tree (`postcss`, `sharp`/libvips). The
only npm-offered fix downgrades Next to 9.3.3, which is not a fix. To be
revisited on the next Next.js patch release.

**Indexing is opt-in.** `NEXT_PUBLIC_ALLOW_INDEXING` must be explicitly true,
so preview and staging deployments cannot be indexed by accident.
