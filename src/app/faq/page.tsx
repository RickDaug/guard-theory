import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "FAQ",
  description: "Straight answers about the First Edition, sizing, returns and how the Journal is written.",
  path: "/faq",
});

const FAQS = [
  {
    q: "When is the First Edition released?",
    a: "The list is told first, and told once. We announce a date when it is fixed, and we do not move a date once it is announced.",
  },
  {
    q: "What will it cost?",
    a: "The price is published on the product page. There is no introductory price that quietly becomes the real one, and no discount wheel.",
  },
  {
    q: "Can I pre-order?",
    a: "No. Joining the list costs nothing, commits you to nothing and takes no payment details. It is a list, not a pre-order.",
  },
  {
    q: "How often will you email me?",
    a: "Once, when the First Edition opens. There is no newsletter and no drip sequence. Every message carries a one-click unsubscribe.",
  },
  {
    q: "Why are there drawings instead of photographs?",
    a: "Because a production flat states how a garment is built and a photograph only shows how it looks. These are the drawings a factory is given — seam construction, sleeve geometry, hem. Photography sits alongside them, never instead of them.",
  },
  {
    q: "How do I know what size I am?",
    a: "The size and fit guide has the full chart in inches and centimetres, plus what to check when you try one on. If a garment does not match those measurements, return postage is ours both ways.",
  },
  {
    q: "Will the rash guards be competition legal?",
    a: "That is the design constraint we started from rather than one we work around. Specific ruleset compliance is stated on the product page, not promised in advance.",
  },
  {
    q: "Is the Technique Library a substitute for classes?",
    a: "No, and it says so on every entry. Written material cannot correct your positioning or stop a submission in time. It is meant to make training with a coach more useful.",
  },
  {
    q: "Who writes the Journal?",
    a: "Rick R and Steven P. Every article carries a byline, a publication date and the sources it was built from, because a piece nobody will put their name to is not worth reading.",
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
    a: "Tell us and point at the claim. Factual errors get corrected in the piece with a dated note — we do not quietly edit a page and pretend it never said what it said.",
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
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/faq", label: "FAQ" }]} />

        <header className="mt-10 mb-16 max-w-[46rem]">
          <h1 className="display-condensed text-4xl text-chalk">
            Frequently asked
          </h1>
          <p className="mt-8 text-lg text-steel">
            Short answers, and the reasoning behind them where the reasoning is
            the useful part.
          </p>
        </header>

        <dl className="m-0 grid max-w-[70rem] grid-cols-1 gap-px bg-steel-dim p-0 lg:grid-cols-2">
          {FAQS.map((item) => (
            <div key={item.q} className="bg-ink p-8">
              <dt className="display-condensed text-lg text-chalk">{item.q}</dt>
              <dd className="m-0 mt-4 text-base text-steel">{item.a}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-14 text-base text-steel">
          Something not answered here?{" "}
          <Link
            href="/contact"
            className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            Ask us
          </Link>
          .
        </p>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
