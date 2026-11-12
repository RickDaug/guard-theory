import { serializeJsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description:
    "Straight answers on the First Edition, sizing and returns, why the product pages carry drawings rather than photographs, and how the Journal is written.",
  path: "/faq",
});

const FAQS = [
  {
    q: "When is the First Edition released?",
    a: "The list is told first, and told once. We announce a date when it is fixed, and we do not move a date once it is announced.",
  },
  {
    q: "What will it cost?",
    a: "There is no introductory price that quietly becomes the real one, and no discount wheel.",
  },
  {
    q: "Can I pre-order?",
    a: "No. Joining the list costs nothing, commits you to nothing and takes no payment details. It is a list, not a pre-order.",
  },
  {
    q: "How often will you email me?",
    a: "Once, when the First Edition opens. There is no newsletter and no drip sequence. Every message to the list carries a one-click unsubscribe.",
  },
  {
    q: "Why are there drawings instead of photographs?",
    a: "Because a drawing shows how a garment is built, and a photograph only shows how it looks.",
  },
  {
    q: "How do I know what size I am?",
    a: "The size and fit guide covers what to check when you try one on, and the returns policy covers exchanging a size.",
  },
  {
    q: "Is the Technique Library a substitute for classes?",
    a: "No, and it says so on every entry. Written material cannot correct your positioning or stop a submission in time. It is meant to make training with a coach more useful.",
  },
  {
    q: "Who writes the Journal?",
    a: "Guard Theory editorial. Every published article carries a byline, a publication date and the sources it was built from. The byline names the publication rather than a person; a person's name goes on a piece only when that person wrote it or has read it and agreed to put their name to it. The editorial policy explains how articles are sourced.",
  },
  {
    q: "Do you take sponsored posts or affiliate commission?",
    a: "No. There are no affiliate links, no paid placements and no commission arrangements. If that ever changes, the affiliate disclosure page changes before the first such link appears.",
  },
  {
    q: "Will you make spats, shorts or accessories?",
    a: "Spats and shorts once the rash guard fit is proven on real bodies. Tape is the accessory most easily specified honestly, so it comes first. Mouthguards and mats are being considered, not promised.",
  },
  {
    q: "I found a mistake in an article.",
    a: "Tell us and point at the claim. Factual errors get corrected in the piece with a dated note — we do not quietly edit a page and pretend it never said what it said. The corrections policy lists every piece that carries one.",
  },
];

export default function FaqPage() {
  /**
   * FAQPage structured data mirrors exactly what is rendered. If an answer is
   * edited, both change together, because both read the same array.
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": absoluteUrl("/faq#faq"),
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/faq", label: "FAQ" }]} />

        {/* The sheet: a contents page of the monograph. Each question is a
            row — question in the margin, answer at the reading measure. */}
        <div className="band-bone band-edge mt-10 px-7 py-14 sm:px-16 sm:py-20">
          <header className="max-w-[46rem]">
            <h1 className="display-serif text-4xl text-ink">
              Frequently asked
            </h1>
            <div aria-hidden="true" className="mt-8 h-1 w-16 bg-signal" />
            <p className="mt-8 text-lg text-ink">
              Short answers, and the reasoning behind them where the reasoning is
              the useful part.
            </p>
          </header>

          <dl className="m-0 mt-16 border-t border-steel p-0">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="grid gap-x-12 gap-y-3 border-b border-steel py-8 lg:grid-cols-12"
              >
                <dt className="display-condensed text-lg text-ink lg:col-span-5">
                  {item.q}
                </dt>
                <dd className="m-0 max-w-[38rem] text-base text-ink lg:col-span-7">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-14 text-base text-ink">
            Something not answered here?{" "}
            <Link
              href="/contact"
              className="text-signal-dim underline decoration-steel underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
            >
              Ask us
            </Link>
            .
          </p>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </main>
  );
}
