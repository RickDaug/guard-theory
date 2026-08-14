import type { Metadata } from "next";
import { Monogram, Wordmark } from "@/components/brand/Monogram";
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

function Section({
  id,
  title,
  note,
  children,
}: {
  id: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="border-t border-steel-dim pt-12 pb-24">
      <h2 id={id} className="display-condensed mb-3 text-2xl text-chalk">
        {title}
      </h2>
      {note ? (
        <p className="mb-12 max-w-[42rem] text-base text-steel">{note}</p>
      ) : (
        <div className="mb-12" />
      )}
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main id="main" className="px-6 py-20 md:px-12">
      <div className="mx-auto max-w-[84rem]">
        <header className="mb-20">
          <p className="notation mb-5 text-2xs text-orchid">
            Guard Theory / internal reference
          </p>
          <h1 className="display-condensed text-4xl text-chalk">
            Design system
          </h1>
          <p className="mt-8 max-w-[42rem] text-lg text-steel">
            Every token below is rendered from the same source the site uses.
            Contrast ratios are computed on this page, not transcribed, so a
            token change that breaks accessibility shows up here immediately.
          </p>
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
                <span className="notation text-2xs text-steel">{size}px</span>
              </div>
            ))}
            <div className="flex flex-col items-start gap-4">
              <Monogram size={128} className="text-chalk" />
              <span className="notation text-2xs text-steel">128px</span>
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
            <p className="max-w-[42rem] text-sm text-steel">
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
              <li key={swatch.token} className="bg-ink p-6">
                <div
                  className="mb-5 h-20 w-full border border-steel-dim"
                  style={{ backgroundColor: swatch.hex }}
                />
                <p className="notation text-2xs text-orchid">{swatch.token}</p>
                <p className="notation mt-1 text-2xs text-steel">
                  {swatch.hex} · {swatch.usage} · {swatch.origin}
                </p>
                <p className="mt-3 text-sm text-steel">{swatch.role}</p>
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
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Text
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Ground
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Ratio
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
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
                    <td className="notation py-3 text-2xs text-steel">
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
          <p className="mb-6 max-w-[42rem] text-base text-steel">
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
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Indicator
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Ground
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Role
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
                  Ratio
                </th>
                <th scope="col" className="notation py-3 text-2xs text-steel">
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
                    <td className="notation py-3 text-2xs text-steel">
                      {pair.bgToken}
                    </td>
                    <td className="py-3 pr-4 text-sm text-steel">{pair.role}</td>
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
          id="type"
          title="Type"
          note="Three roles. Archivo carries the brand voice through its width axis — the identity is the contrast between an ultra-expanded wordmark and condensed headings from one family. Newsreader reads long-form. Martian Mono appears only inside notation, where monospacing means something."
        >
          <div className="mb-16 grid gap-10 lg:grid-cols-3">
            <div>
              <p className="notation mb-4 text-2xs text-orchid">
                Display / Archivo
              </p>
              <p className="wordmark text-xl text-chalk">Guard Theory</p>
              <p className="display-condensed mt-3 text-2xl text-chalk">
                Condensed heading
              </p>
              <p className="display-plain mt-3 text-lg text-steel">
                Plain, for interface
              </p>
            </div>
            <div>
              <p className="notation mb-4 text-2xs text-orchid">
                Body / Newsreader
              </p>
              <p className="text-base text-chalk">
                The guard is not a list of positions. It is a structure you move
                through, and every grip is a claim about where you intend to go
                next.
              </p>
            </div>
            <div>
              <p className="notation mb-4 text-2xs text-orchid">
                Notation / Martian Mono
              </p>
              <p className="notation text-xs text-chalk">
                FIG. 04 / REV B<br />
                01 CLOSED GUARD<br />
                02 OPEN GUARD
              </p>
            </div>
          </div>

          <ul className="m-0 list-none border-t border-steel-dim p-0">
            {TYPE_SCALE.map((step) => (
              <li
                key={step.token}
                className="flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-steel-dim py-5"
              >
                <span className="notation w-24 shrink-0 text-2xs text-steel">
                  {step.token}
                </span>
                <span className={`display-condensed ${step.token} text-chalk`}>
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
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
              <p className="mt-3 text-sm text-steel">
                State change on something already under the pointer or focus —
                a link colour, a notation node waking up.
              </p>
            </li>
            <li className="border border-steel-dim p-6">
              <p className="notation text-2xs text-orchid">420ms</p>
              <p className="mt-3 text-sm text-steel">
                Something entering or leaving the page, where the reader needs to
                see where it came from.
              </p>
            </li>
            <li className="border border-steel-dim p-6 sm:col-span-2">
              <p className="notation text-2xs text-orchid">
                --ease-control · cubic-bezier(0.2, 0, 0, 1)
              </p>
              <p className="mt-3 text-sm text-steel">
                Leaves quickly, arrives slowly. One curve everywhere, so nothing
                on the site moves in a way that feels like a different product.
              </p>
            </li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
