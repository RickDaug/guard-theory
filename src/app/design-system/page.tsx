import type { Metadata } from "next";
import Link from "next/link";
import { Monogram, Wordmark } from "@/components/brand/Monogram";
import { Plate } from "@/components/notation/Plate";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import {
  NON_TEXT_ON_GROUND,
  PALETTE,
  TEXT_ON_GROUND,
} from "@/lib/brand/palette";
import { contrastRatio, formatRatio, meetsAA } from "@/lib/color/contrast";

export const metadata: Metadata = {
  title: "Design system",
  description:
    "Live colour, type, spacing and component tokens for Guard Theory, rendered from the same source the site uses.",
  robots: { index: false, follow: false },
};

const MARK_SIZES = [16, 32, 64] as const;

const TYPE_SCALE = [
  { token: "text-5xl", label: "Display" },
  { token: "text-4xl", label: "Page title" },
  { token: "text-3xl", label: "Section" },
  { token: "text-2xl", label: "Subsection" },
  { token: "text-xl", label: "Lead" },
  { token: "text-lg", label: "Large body" },
  { token: "text-base", label: "Body" },
  { token: "text-sm", label: "Small" },
  { token: "text-xs", label: "Meta" },
  { token: "text-2xs", label: "Notation" },
] as const;

/** The hex a token resolves to, read from the palette rather than retyped. */
function hexOf(token: string): string {
  const swatch = PALETTE.find((s) => s.token === token);
  if (!swatch) throw new Error(`No palette token named ${token}`);
  return swatch.hex;
}

/**
 * The three bands, as globals.css declares them. Every class here is a
 * literal so Tailwind emits it; the ratios beside each pair are computed on
 * render from the same hex values the contrast test asserts.
 */
const BANDS = [
  {
    utility: "band-ink",
    ground: "ink",
    text: "chalk",
    caption: "steel",
    link: "signal-lift",
    hairline: "steel-dim",
    ring: "signal-lift",
    linkClass: "text-signal-lift",
    ringClass: "outline-signal-lift",
  },
  {
    utility: "band-graphite",
    ground: "graphite",
    text: "chalk",
    caption: "steel",
    link: "signal-lift",
    hairline: "steel-mid",
    ring: "signal-lift",
    linkClass: "text-signal-lift",
    ringClass: "outline-signal-lift",
  },
  {
    utility: "band-bone",
    ground: "bone",
    text: "ink",
    caption: "slate",
    link: "signal-dim",
    hairline: "steel",
    ring: "signal-dim",
    linkClass: "text-signal-dim",
    ringClass: "outline-signal-dim",
  },
] as const;

type Ground = "ink" | "bone" | "graphite";

const GROUND_CLASS: Record<Ground, string> = {
  ink: "band-ink",
  bone: "band-bone band-edge",
  graphite: "band-graphite",
};

/**
 * A section is a band. The ground sets text, caption and hairline colour
 * together, so the page documents the band system by being built from it.
 */
function Section({
  id,
  title,
  note,
  ground = "ink",
  className = "",
  children,
}: {
  id: string;
  title: string;
  note?: string;
  ground?: Ground;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`${GROUND_CLASS[ground]} border-t border-hairline px-6 pt-16 pb-24 md:px-12 ${className}`}
    >
      <div className="mx-auto max-w-[84rem]">
        <h2 id={id} className="display-condensed mb-3 text-2xl">
          {title}
        </h2>
        <div aria-hidden="true" className="mb-6 h-1 w-12 bg-signal" />
        {note ? (
          <p className="text-caption mb-12 max-w-[42rem] text-base">{note}</p>
        ) : (
          <div className="mb-12" />
        )}
        {children}
      </div>
    </section>
  );
}

/** One measured pair, printed the same way everywhere on the page. */
function Pair({
  fg,
  bg,
  role,
  threshold,
}: {
  fg: string;
  bg: string;
  role: string;
  /** 4.5 for text, 3 for an indicator, null for a decorative hairline. */
  threshold: 4.5 | 3 | null;
}) {
  const ratio = contrastRatio(hexOf(fg), hexOf(bg));
  const verdict =
    threshold === null ? "hairline only" : ratio >= threshold ? "Pass" : "FAIL";
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-2.5">
      <span className="text-caption text-sm">{role}</span>
      <span className="notation text-2xs">
        {fg} on {bg} · {formatRatio(ratio)} · {verdict}
      </span>
    </li>
  );
}

/** A small drawing in the notation, for the plate demonstrations. */
function DemoDrawing({ draw = false }: { draw?: boolean }) {
  const mark = draw ? { "data-draw": true } : {};
  return (
    <>
      <circle cx={120} cy={110} r={34} stroke="var(--color-steel)" strokeWidth={1.5} fill="none" {...mark} />
      <circle cx={320} cy={110} r={34} stroke="var(--color-steel)" strokeWidth={1.5} fill="none" {...mark} />
      <line x1={154} y1={110} x2={286} y2={110} stroke="var(--color-steel)" strokeWidth={1.5} {...mark} />
      <circle cx={220} cy={110} r={5} fill="var(--color-signal-lift)" />
      <text
        x={120}
        y={168}
        textAnchor="middle"
        className="notation text-[12px]"
        fill="var(--color-orchid)"
      >
        01
      </text>
      <text
        x={320}
        y={168}
        textAnchor="middle"
        className="notation text-[12px]"
        fill="var(--color-orchid)"
      >
        02
      </text>
    </>
  );
}

export default function DesignSystemPage() {
  return (
    <main id="main" tabIndex={-1}>
      <header className="band-ink plate-grid corner-ticks px-6 pt-20 pb-24 md:px-12">
        <div className="mx-auto max-w-[84rem]">
          <p className="eyebrow text-caption mb-6">Guard Theory / internal reference</p>
          <h1 className="display-condensed text-4xl leading-[0.95] text-chalk">
            Design system
          </h1>
          <p className="mt-8 max-w-[42rem] text-lg text-chalk">
            Every token below is rendered from the same source the site uses.
            Contrast ratios are computed on this page, not transcribed, so a
            token change that breaks accessibility shows up here immediately.
          </p>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="mark"
        title="The mark"
        note="A ring with the GT driven through it. The G's bowl opens into the T's crossbar, and the pair crosses the ring on both sides, cutting it into two arcs — the ring is not a frame around the letters, the letters break it. Drawn once and traced into one vector source, which the header, the browser tab, the app icons and the link preview are all built from."
      >
        <div className="mb-14 flex flex-wrap items-end gap-14">
          {MARK_SIZES.map((size) => (
            <div key={size} className="flex flex-col items-start gap-4">
              <Monogram size={size} className="text-chalk" />
              <span className="notation text-caption text-2xs">{size}px</span>
            </div>
          ))}
          <div className="flex flex-col items-start gap-4">
            <Monogram size={128} className="text-chalk" />
            <span className="notation text-caption text-2xs">128px</span>
          </div>
        </div>

        <div className="mb-14 flex flex-wrap gap-6">
          <div className="flex size-32 items-center justify-center bg-bone">
            <Monogram size={56} className="text-ink" />
          </div>
          <div className="flex size-32 items-center justify-center bg-signal">
            <Monogram size={56} className="text-chalk" />
          </div>
          <div className="flex size-32 items-center justify-center bg-graphite">
            <Monogram size={56} className="text-orchid" />
          </div>
          <div className="flex size-32 items-center justify-center border border-steel-dim">
            <Monogram size={56} className="text-chalk" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Wordmark size={44} className="text-chalk" />
          <p className="text-caption max-w-[42rem] text-sm">
            The drawn logotype. It appears where the logo appears as a logo —
            the exported lockups, the Open Graph card — while the wordmark
            beside the mark in the header is set in Archivo, which is the
            brand&rsquo;s typeface. Below 32px the ring&rsquo;s stroke is under
            a pixel and the mark reads as haze, so the browser icons redraw it
            at 1.4&times; weight;{" "}
            <code className="notation text-xs text-orchid">
              public/brand/gt-16-magnified.png
            </code>{" "}
            is that render on its real pixel grid.
          </p>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="colour"
        title="Colour"
        note="Five colours are given by the brand and used exactly as given. Everything else is derived from them by mixing in linear-light sRGB, and the mix fractions were solved against the contrast requirement rather than chosen by eye — each swatch says which. Orchid is the annotation layer. Signal is live state and nothing else, and because it is too dark to be text on ink and too light to be text on paper, it is only ever a fill: each ground gets the one tint of it that can carry a word."
      >
        <ul className="m-0 grid list-none gap-px bg-steel-dim p-0 sm:grid-cols-2 lg:grid-cols-3">
          {PALETTE.map((swatch) => (
            <li key={swatch.token} className="card-lift bg-ink p-6">
              <div
                className="mb-5 h-20 w-full border border-steel-dim"
                style={{ backgroundColor: swatch.hex }}
              />
              <p className="notation text-2xs text-orchid">{swatch.token}</p>
              <p className="notation text-caption mt-1 text-2xs">
                {swatch.hex} · {swatch.usage} · {swatch.origin}
              </p>
              <p className="mt-3 text-sm text-chalk">{swatch.role}</p>
            </li>
          ))}
        </ul>

        <h3 className="display-condensed mt-16 mb-6 text-xl text-chalk">
          Measured contrast
        </h3>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Contrast ratios for every text colour against the ground it is used
            on, with the WCAG 2.2 AA result for normal-size text.
          </caption>
          <thead>
            <tr className="border-b border-steel-dim">
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Text
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Ground
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Ratio
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                AA normal
              </th>
            </tr>
          </thead>
          <tbody>
            {TEXT_ON_GROUND.map((pair) => {
              const ratio = contrastRatio(pair.fg, pair.bg);
              const passes = meetsAA(ratio);
              return (
                <tr
                  key={`${pair.fgToken}-on-${pair.bgToken}`}
                  className="border-b border-steel-dim"
                >
                  <td className="notation py-3 text-2xs text-chalk">
                    {pair.fgToken}
                  </td>
                  <td className="notation text-caption py-3 text-2xs">
                    {pair.bgToken}
                  </td>
                  <td className="notation py-3 text-2xs text-chalk">
                    {formatRatio(ratio)}
                  </td>
                  <td
                    className={`notation py-3 text-2xs ${
                      passes ? "text-signal-lift" : "text-chalk"
                    }`}
                  >
                    {passes ? "Pass" : "FAIL"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 className="display-condensed mt-16 mb-3 text-xl text-chalk">
          Indicators that are not text
        </h3>
        <p className="text-caption mb-6 max-w-[42rem] text-base">
          The focus ring, a control border, a filled block against its ground.
          WCAG 2.2 SC 1.4.11 asks 3:1 of each, and the table above says nothing
          about any of them — which is how a focus ring that a keyboard user
          cannot see gets shipped.
        </p>
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Contrast ratios for every non-text indicator against the ground it
            is drawn on, with the WCAG 2.2 SC 1.4.11 result.
          </caption>
          <thead>
            <tr className="border-b border-steel-dim">
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Indicator
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Ground
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Role
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                Ratio
              </th>
              <th scope="col" className="notation text-caption py-3 text-2xs">
                3:1
              </th>
            </tr>
          </thead>
          <tbody>
            {NON_TEXT_ON_GROUND.map((pair) => {
              const ratio = contrastRatio(pair.fg, pair.bg);
              const passes = ratio >= 3;
              return (
                <tr
                  key={`${pair.fgToken}-on-${pair.bgToken}-${pair.role}`}
                  className="border-b border-steel-dim"
                >
                  <td className="notation py-3 text-2xs text-chalk">
                    {pair.fgToken}
                  </td>
                  <td className="notation text-caption py-3 text-2xs">
                    {pair.bgToken}
                  </td>
                  <td className="text-caption py-3 pr-4 text-sm">{pair.role}</td>
                  <td className="notation py-3 text-2xs text-chalk">
                    {formatRatio(ratio)}
                  </td>
                  <td
                    className={`notation py-3 text-2xs ${
                      passes ? "text-signal-lift" : "text-chalk"
                    }`}
                  >
                    {passes ? "Pass" : "FAIL"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="bands"
        title="Bands"
        ground="graphite"
        note="A page is a sequence of bands, each a full-width section with its own ground. band-ink, band-graphite and band-bone set the ground, the default text colour, the caption colour (text-caption), the hairline colour (border-hairline), the link tint and the focus ring together, so a band is always a complete, contrast-tested pairing rather than a bg-* and a text-* composed by hand. Each band below is rendered with its own utility, and every ratio beside it is computed from the palette on render."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {BANDS.map((band) => (
            <div key={band.utility} className={`${band.utility} p-7`}>
              <p className="notation text-2xs">{band.utility}</p>
              <p className="display-condensed mt-4 text-2xl">Body text</p>
              <p className="mt-2 text-base">
                The default text colour, {band.text}, set by the band.
              </p>
              <p className="text-caption mt-2 text-sm">
                A caption in text-caption, which resolves to {band.caption} here.
              </p>
              <p className="mt-2 text-sm">
                <Link href="/design-system#bands" className={`link-rule ${band.linkClass}`}>
                  A link in {band.link}
                </Link>
              </p>
              <div className="my-5 border-t border-hairline" />
              <ul className="m-0 list-none p-0">
                <Pair fg={band.text} bg={band.ground} role="text" threshold={4.5} />
                <Pair fg={band.caption} bg={band.ground} role="caption" threshold={4.5} />
                <Pair fg={band.link} bg={band.ground} role="link" threshold={4.5} />
                <Pair fg={band.ring} bg={band.ground} role="focus ring" threshold={3} />
                <Pair fg={band.hairline} bg={band.ground} role="hairline" threshold={null} />
              </ul>
              <p className="text-caption mt-4 text-xs">
                {TEXT_ON_GROUND.some(
                  (p) => p.fgToken === band.text && p.bgToken === band.ground,
                ) &&
                TEXT_ON_GROUND.some(
                  (p) => p.fgToken === band.caption && p.bgToken === band.ground,
                ) &&
                TEXT_ON_GROUND.some(
                  (p) => p.fgToken === band.link && p.bgToken === band.ground,
                )
                  ? "Every text pair is listed in TEXT_ON_GROUND and asserted by the contrast test."
                  : "A TEXT PAIR IS MISSING FROM TEXT_ON_GROUND."}
              </p>
            </div>
          ))}
        </div>

        <h3 className="display-condensed mt-16 mb-3 text-xl">Textures and edges</h3>
        <p className="text-caption mb-8 max-w-[42rem] text-base">
          plate-grid is the dot field of a notation plate, at most one band per
          page. corner-ticks are the plate&rsquo;s registration crosses at the
          section&rsquo;s corners. band-edge is the hairline and 24px shadow where
          a bone sheet meets the ink desk. All three paint in the band&rsquo;s
          hairline colour and change no text pairing.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="band-ink plate-grid corner-ticks flex min-h-40 items-center justify-center p-8">
            <p className="notation text-2xs">plate-grid + corner-ticks</p>
          </div>
          <div className="band-bone band-edge flex min-h-40 items-center justify-center p-8">
            <p className="notation text-2xs">band-edge on bone</p>
          </div>
          <div className="band-bone plate-grid corner-ticks flex min-h-40 items-center justify-center p-8">
            <p className="notation text-2xs">plate-grid on bone</p>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="type"
        title="Type"
        ground="bone"
        note="Three roles and one idea. Archivo carries the brand voice through its width axis — the identity is the contrast between an ultra-expanded wordmark and condensed headings from one family. Newsreader reads long-form. Martian Mono appears only inside notation, where monospacing means something."
      >
        <div className="mb-16 grid gap-10 lg:grid-cols-3">
          <div>
            <p className="eyebrow text-caption mb-4">Display / Archivo</p>
            <p className="wordmark text-xl text-ink">Guard Theory</p>
            <p className="display-condensed mt-3 text-2xl text-ink">
              Condensed heading
            </p>
            <p className="display-plain text-caption mt-3 text-lg">
              Plain, for interface
            </p>
          </div>
          <div>
            <p className="eyebrow text-caption mb-4">Body / Newsreader</p>
            <p className="text-base text-ink">
              The guard is not a list of positions. It is a structure you move
              through, and every grip is a claim about where you intend to go
              next.
            </p>
          </div>
          <div>
            <p className="eyebrow text-caption mb-4">Notation / Martian Mono</p>
            <p className="notation text-xs text-ink">
              FIG. 04 / REV B<br />
              01 CLOSED GUARD<br />
              02 OPEN GUARD
            </p>
          </div>
        </div>

        <h3 className="display-condensed mb-3 text-xl text-ink">The contrast cuts</h3>
        <p className="text-caption mb-8 max-w-[42rem] text-base">
          display-wide is the expanded cut (wdth 125, 800) for statements of
          three words or fewer, never a sentence. eyebrow is the section label
          (wdth 100, 500, 12px, 0.14em) — sans, because a label is not data.
          display-serif is Newsreader at display size for a study-register
          title. pull-quote is a bone-raised block with a 3px signal rule, once
          per piece at most, quoting only the piece itself.
        </p>
        <div className="grid gap-px border border-steel bg-steel sm:grid-cols-2">
          <div className="bg-bone p-7">
            <p className="notation text-caption text-2xs">display-wide</p>
            <p className="display-wide mt-4 text-[clamp(1.5rem,1rem+2vw,2.5rem)] text-ink">
              Guard{" "}
              <br />
              Theory
            </p>
          </div>
          <div className="bg-bone p-7">
            <p className="notation text-caption text-2xs">eyebrow</p>
            <p className="eyebrow mt-4 text-slate">First Edition</p>
            <p className="display-condensed mt-2 text-2xl text-ink">
              Paired with a condensed heading
            </p>
          </div>
          <div className="bg-bone p-7">
            <p className="notation text-caption text-2xs">display-serif</p>
            <p className="display-serif mt-4 text-3xl text-ink">
              A study title set in Newsreader
            </p>
          </div>
          <div className="bg-bone p-7">
            <p className="notation text-caption text-2xs">pull-quote</p>
            <blockquote className="pull-quote mt-4 bg-bone-raised text-ink">
              A drawing states how a garment is built, which a photograph cannot.
            </blockquote>
          </div>
        </div>

        <ul className="m-0 mt-16 list-none border-t border-steel p-0">
          {TYPE_SCALE.map((step) => (
            <li
              key={step.token}
              className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-steel py-5"
            >
              <span className="notation text-caption w-24 shrink-0 text-2xs">
                {step.token}
              </span>
              <span className={`display-condensed ${step.token} text-ink`}>
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="surfaces"
        title="Surfaces"
        ground="bone"
        note="A card is a surface: raised fill, hairline border, square corners — a drawing office, not an app store. On ink, bg-ink-raised with a steel-dim hairline; on bone, bg-bone-raised with a steel hairline. card-lift raises the card 2px on hover or focus-within and steps the border up (steel-mid on ink, slate on bone), in 140ms."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="card-lift border border-steel bg-bone-raised p-7 hover:border-slate focus-within:border-slate">
            <p className="notation text-caption text-2xs">card-lift on bone</p>
            <p className="display-condensed mt-4 text-xl text-ink">Bone-raised surface</p>
            <p className="mt-2 text-sm text-ink">
              Hairline in steel; on hover it steps up to slate and the card rises.
            </p>
            <p className="mt-4">
              <Link
                href="/design-system#surfaces"
                className="link-rule inline-flex min-h-6 items-center text-sm text-signal-dim"
              >
                A link inside the card
              </Link>
            </p>
          </div>
          <div className="band-ink p-6">
            <div className="card-lift border border-steel-dim bg-ink-raised p-7 hover:border-steel-mid focus-within:border-steel-mid">
              <p className="notation text-caption text-2xs">card-lift on ink</p>
              <p className="display-condensed mt-4 text-xl text-chalk">Ink-raised surface</p>
              <p className="mt-2 text-sm text-chalk">
                Hairline in steel-dim; on hover it steps up to steel-mid and the card rises.
              </p>
              <p className="mt-4">
                <Link
                  href="/design-system#surfaces"
                  className="link-rule inline-flex min-h-6 items-center text-sm text-signal-lift"
                >
                  A link inside the card
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="buttons"
        title="Buttons"
        note="Three intents, three different jobs. At most one signal button per view. Labels say what happens, in the same words the resulting screen will use."
      >
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="/first-edition">Join the First Edition list</ButtonLink>
          <ButtonLink href="/journal" intent="outline">
            Read the Journal
          </ButtonLink>
          <ButtonLink href="/technique" intent="quiet">
            Browse the Technique Library
          </ButtonLink>
          <Button disabled>Unavailable</Button>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="forms"
        title="Forms"
        note="Every control is tied to its label, hint and error by id. Consent is never pre-checked. Errors state what went wrong and how to fix it, in the interface's voice."
      >
        <form className="grid max-w-xl gap-8" noValidate>
          <TextField
            id="ds-email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            hint="Used only for First Edition release news."
          />
          <TextField
            id="ds-email-error"
            label="Email address"
            type="email"
            defaultValue="not-an-address"
            error="Enter an email address that includes an @ symbol."
          />
          <SelectField
            id="ds-sleeve"
            label="Preferred sleeve length"
            optional
            defaultValue=""
          >
            <option value="">No preference</option>
            <option value="short">Short sleeve</option>
            <option value="long">Long sleeve</option>
          </SelectField>
          <CheckboxField
            id="ds-consent"
            label="Email me when the First Edition is released. I can unsubscribe from any message."
          />
        </form>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="motion"
        title="Motion"
        note="Two durations and one curve. Motion explains a state change; it never announces itself. Reduced motion is honoured globally in globals.css, so a new component cannot forget it."
      >
        <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2">
          <li className="border border-steel-dim p-6">
            <p className="notation text-2xs text-orchid">140ms</p>
            <p className="text-caption mt-3 text-sm">
              State change on something already under the pointer or focus —
              a link colour, a notation node waking up.
            </p>
          </li>
          <li className="border border-steel-dim p-6">
            <p className="notation text-2xs text-orchid">420ms</p>
            <p className="text-caption mt-3 text-sm">
              Something entering or leaving the page, where the reader needs to
              see where it came from.
            </p>
          </li>
          <li className="border border-steel-dim p-6 sm:col-span-2">
            <p className="notation text-2xs text-orchid">
              --ease-control · cubic-bezier(0.2, 0, 0, 1)
            </p>
            <p className="text-caption mt-3 text-sm">
              Leaves quickly, arrives slowly. One curve everywhere, so nothing
              on the site moves in a way that feels like a different product.
            </p>
          </li>
        </ul>

        <h3 className="display-condensed mt-16 mb-3 text-xl text-chalk">
          The three behaviours
        </h3>
        <p className="text-caption mb-8 max-w-[42rem] text-base">
          reveal fades a band&rsquo;s children in and up 12px as they enter the
          viewport: 420ms, scroll-driven CSS (animation-timeline: view()), no
          JavaScript, and static in a browser without it. Apply it to a
          band&rsquo;s children, never the band and never the hero. link-rule
          grows an underline from the left in 140ms, like a leader line.
          plate-draw holds any path marked data-draw un-drawn until the card is
          hovered or focused, then draws it in over 420ms.
        </p>
        <ul className="m-0 grid list-none gap-6 p-0 lg:grid-cols-3">
          <li className="reveal border border-steel-dim bg-ink-raised p-6">
            <p className="notation text-2xs text-orchid">reveal · 420ms</p>
            <p className="mt-3 text-sm text-chalk">
              This card entered with the reveal utility. Scroll it out and back
              in to see it again.
            </p>
          </li>
          <li className="border border-steel-dim bg-ink-raised p-6">
            <p className="notation text-2xs text-orchid">link-rule · 140ms</p>
            <p className="mt-3 text-sm">
              <Link
                href="/design-system#motion"
                className="link-rule inline-flex min-h-6 items-center text-base text-chalk"
              >
                Hover or focus this link
              </Link>
            </p>
          </li>
          <li className="plate-draw card-lift border border-steel-dim bg-ink-raised p-6 hover:border-steel-mid">
            <p className="notation text-2xs text-orchid">plate-draw · 420ms</p>
            <svg viewBox="0 0 440 190" aria-hidden="true" className="mt-3 w-full">
              <DemoDrawing draw />
            </svg>
            <p className="text-caption mt-2 text-xs">
              Hover the card: the rings and the line draw in.
            </p>
          </li>
        </ul>
      </Section>

      {/* ---------------------------------------------------------------- */}
      <Section
        id="plates"
        title="Plates on paper"
        ground="bone"
        note="Every drawing paints with the steel, steel-dim, signal-lift, ink and orchid variables, tuned for the ink ground. Wrapping a plate in plate-on-paper remaps those variables for the paper ground — the line becomes slate, the grid becomes steel, the live node becomes signal-dim, the annotation reads as slate — so the same component reads on bone with no prop and no second drawing."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="band-ink p-6">
            <p className="notation text-caption mb-4 text-2xs">The plate on ink, as drawn</p>
            <Plate width={440} fieldHeight={200} title="GUARD THEORY — DEMONSTRATION" reference="FIG. 00 / REV A">
              <DemoDrawing />
            </Plate>
          </div>
          <div className="p-6">
            <p className="notation text-caption mb-4 text-2xs">The same plate inside plate-on-paper</p>
            <div className="plate-on-paper">
              <Plate width={440} fieldHeight={200} title="GUARD THEORY — DEMONSTRATION" reference="FIG. 00 / REV A">
                <DemoDrawing />
              </Plate>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
