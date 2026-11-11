import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { SystemMapMotif } from "@/components/notation/SystemMapMotif";

export const metadata: Metadata = pageMetadata({
  title: "About",
  description:
    "What Guard Theory is and what it makes: no-gi apparel, and writing with sourced claims. The standard is the same for both.",
  path: "/about",
});

/** An inline link on the study ground: signal-dim, the one tint that reads on paper. */
const SHEET_LINK =
  "text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim";

const READ_NEXT = [
  { href: "/manifesto", label: "Manifesto" },
  { href: "/policies/editorial", label: "Editorial policy" },
  { href: "/policies/accessibility", label: "Accessibility" },
];

const CONTINUE = [
  { href: "/shop", label: "Shop" },
  { href: "/technique", label: "Technique Library" },
  { href: "/journal", label: "Journal" },
];

/**
 * The brand page is a sheet of the monograph laid on the desk: an ink band
 * carrying the breadcrumb and the system map at hairline weight, the text on
 * bone at a reading measure, and a closing ink plate that sends the reader
 * on to the three things the page describes.
 */
export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1}>
      {/* The desk. The motif is decoration — aria-hidden, hairline, held at
          low opacity under the breadcrumb so nothing drops below AA. */}
      <div className="band-ink relative overflow-hidden px-6 pt-16 pb-24 md:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 right-0 w-[44rem] max-w-[110vw] text-steel-dim opacity-40 md:right-12"
        >
          <SystemMapMotif />
        </div>
        <div className="relative mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/about", label: "About" }]} />
        </div>
      </div>

      {/* The sheet. Pulled up over the band's foot so it reads as laid on it. */}
      <div className="px-6 md:px-12">
        <div className="band-bone band-edge mx-auto -mt-12 max-w-[104rem] px-7 py-14 sm:px-16 sm:py-20">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <h1 className="display-serif text-4xl text-ink">About</h1>
              <div aria-hidden="true" className="mt-8 h-1 w-16 bg-signal" />

              <div className="mt-10 flex max-w-[38rem] flex-col gap-6">
                <p className="text-lg text-ink">
                  Guard Theory makes{" "}
                  <Link href="/shop" className={SHEET_LINK}>
                    no-gi grappling apparel
                  </Link>{" "}
                  and publishes a technical study of the guard. Those are one
                  project, not two.
                </p>

                <p className="text-base text-ink">
                  The apparel exists because training kit is worn for hours a week
                  and is mostly sold on adjectives. The writing exists because
                  jiu-jitsu is taught overwhelmingly through demonstration, and
                  demonstration is bad at explaining why something works — you can
                  watch a guard retained a hundred times and still not be able to
                  say what the retaining consisted of.
                </p>

                <p className="text-base text-ink">
                  So the same standard applies to both. A garment is described by
                  its construction rather than its marketing. A technique is
                  described by its mechanics rather than its lineage. When we do
                  not know something, the page says we do not know it.
                </p>
              </div>

              <section aria-labelledby="how" className="mt-16 border-t border-steel pt-10">
                <h2 id="how" className="eyebrow text-slate">
                  How this site works
                </h2>
                <div className="mt-6 flex max-w-[38rem] flex-col gap-6">
                  <p className="text-base text-ink">
                    Every diagram on the site is drawn in one notation — a ring for
                    a position, a line for a transition, a numbered callout keyed
                    to a legend, and a title block naming the drawing. A guard
                    system map and{" "}
                    <Link href="/lookbook" className={SHEET_LINK}>
                      a garment flat
                    </Link>{" "}
                    are pages from the same document.
                  </p>
                  <p className="text-base text-ink">
                    Reference material carries no commercial links in its body
                    copy. The{" "}
                    <Link href="/technique" className={SHEET_LINK}>
                      Technique Library
                    </Link>{" "}
                    and the{" "}
                    <Link href="/journal" className={SHEET_LINK}>
                      Journal
                    </Link>{" "}
                    are meant to be worth sending to a training partner, and nobody
                    forwards an advert.
                  </p>
                </div>
              </section>
            </div>

            <aside className="lg:col-span-4 lg:col-start-9" aria-labelledby="read-next">
              <h2 id="read-next" className="eyebrow border-b border-steel pb-3 text-slate">
                Read next
              </h2>
              <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0">
                {READ_NEXT.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="link-rule inline-flex min-h-6 items-center text-base text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-signal-dim"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>

      {/* Where to go from here: the three things the page just described. */}
      <nav aria-label="Continue" className="band-ink px-6 pt-24 pb-20 md:px-12">
        <ul className="mx-auto my-0 grid max-w-[104rem] list-none gap-px border-y border-steel-dim p-0 sm:grid-cols-3">
          {CONTINUE.map((item) => (
            <li key={item.href} className="border-b border-steel-dim last:border-b-0 sm:border-b-0">
              <Link
                href={item.href}
                className="card-lift group flex min-h-6 items-center justify-between gap-6 py-8 no-underline sm:px-6"
              >
                <span className="display-condensed text-2xl text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                  {item.label}
                </span>
                <span aria-hidden="true" className="notation text-xs text-steel">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
