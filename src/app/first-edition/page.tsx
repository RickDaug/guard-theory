import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export const metadata: Metadata = pageMetadata({
  title: "First Edition — No-gi rash guards",
  description: "The First Edition: Guard Theory's first no-gi rash guards, in long sleeve and short sleeve. Join the list for first access.",
  path: "/first-edition",
});

/**
 * These are commitments about how the garment is made and described. They are
 * deliberately not commitments about scarcity, scheduling or supply — a brand
 * that leads with how little it is making, and how unsure it is when, is
 * telling a reader it is not ready. The standard is the story.
 */
const COMMITMENTS = [
  {
    heading: "Made properly, or not made",
    body: "We would rather make one garment properly than four adequately.",
  },
];

/**
 * Two bands. The title plate on ink, then a bone sheet carrying the
 * commitments, with the form mounted on it as an ink plate of its own — the
 * form's controls, labels and error summary are drawn for the ink ground and
 * are untouched, so the plate gives them their ground back. On a phone the
 * sheet and the plate stack.
 */
export default function FirstEditionPage() {
  return (
    <main id="main" tabIndex={-1}>
      <section className="band-ink corner-ticks px-6 pt-10 pb-16 md:px-12 md:pt-12 md:pb-24">
        <div className="mx-auto max-w-[104rem]">
          <Breadcrumbs trail={[{ href: "/first-edition", label: "First Edition" }]} />

          <div className="mt-12 max-w-[46rem] md:mt-16">
            <p className="display-wide text-xs text-chalk sm:text-sm">First access</p>

            <h1 className="display-condensed mt-6 text-4xl leading-[0.9] text-chalk">
              First Edition
            </h1>

            <p className="mt-8 max-w-[36rem] text-lg text-chalk">
              <Link
                href="/shop"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                No-gi rash guards
              </Link>{" "}
              in long sleeve and short sleeve. The list gets them first.
            </p>
          </div>
        </div>
      </section>

      <section className="band-bone band-edge px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-[104rem] gap-14 lg:grid-cols-12 lg:gap-20">
          <div className="reveal lg:col-span-5">
            <ul className="m-0 flex list-none flex-col gap-10 p-0">
              {COMMITMENTS.map((item) => (
                <li key={item.heading} className="max-w-[36rem] border-t border-steel pt-6">
                  <h2 className="display-condensed text-xl text-ink">
                    {item.heading}
                  </h2>
                  <p className="mt-3 text-base text-slate">{item.body}</p>
                </li>
              ))}
            </ul>

            <p className="mt-12 max-w-[36rem] text-base text-slate">
              No countdown, no stock counter, no discount wheel. One message when
              it opens, and nothing else.
            </p>

            <Link
              href="/lookbook"
              className="link-rule display-plain mt-10 inline-flex min-h-6 items-center text-sm text-signal-dim"
            >
              Lookbook
            </Link>
          </div>

          <div className="reveal lg:col-span-7">
            {/* The plate. band-ink restores the ground, the text colour and the
                focus ring the form was built against. */}
            <div className="band-ink corner-ticks p-7 sm:p-10 lg:p-12">
              <h2 className="display-condensed text-2xl text-chalk">
                Join the list
              </h2>
              <p className="mt-4 mb-10 max-w-[34rem] text-base text-chalk">
                Name, email and your consent to be emailed. Everything else is
                optional. Questions about the list, sizing or competition
                legality are answered in the{" "}
                <Link
                  href="/faq"
                  className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
                >
                  FAQ
                </Link>
                .
              </p>

              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
