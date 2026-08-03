import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Guard Theory is, what it makes, how it works, and what it has not decided yet.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/about", label: "About" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h1 className="display-condensed text-4xl text-chalk">About</h1>

            <div className="mt-10 flex max-w-[36rem] flex-col gap-6">
              <p className="text-lg text-steel">
                Guard Theory makes no-gi grappling apparel and publishes a
                technical study of the guard. Those are one project, not two.
              </p>

              <p className="text-base text-steel">
                The apparel exists because training kit is worn for hours a week
                and is mostly sold on adjectives. The writing exists because
                jiu-jitsu is taught overwhelmingly through demonstration, and
                demonstration is bad at explaining why something works — you can
                watch a guard retained a hundred times and still not be able to
                say what the retaining consisted of.
              </p>

              <p className="text-base text-steel">
                So the same standard applies to both. A garment is described by
                its construction rather than its marketing. A technique is
                described by its mechanics rather than its lineage. When we do
                not know something, the page says we do not know it.
              </p>
            </div>

            <section aria-labelledby="how" className="mt-16">
              <h2 id="how" className="display-condensed text-2xl text-chalk">
                How this site works
              </h2>
              <div className="mt-6 flex max-w-[36rem] flex-col gap-6">
                <p className="text-base text-steel">
                  Every diagram on the site is drawn in one notation — a ring for
                  a position, a line for a transition, a numbered callout keyed
                  to a legend, and a title block naming the drawing. A guard
                  system map and a garment flat are pages from the same document.
                </p>
                <p className="text-base text-steel">
                  Reference material carries no commercial links in its body
                  copy. The{" "}
                  <Link
                    href="/technique"
                    className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
                  >
                    Technique Library
                  </Link>{" "}
                  and the{" "}
                  <Link
                    href="/journal"
                    className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
                  >
                    Journal
                  </Link>{" "}
                  are meant to be worth sending to a training partner, and nobody
                  forwards an advert.
                </p>
              </div>
            </section>

            <section aria-labelledby="not-yet" className="mt-16">
              <h2 id="not-yet" className="display-condensed text-2xl text-chalk">
                What we have not decided
              </h2>
              <div className="mt-6 flex max-w-[36rem] flex-col gap-6">
                <p className="text-base text-steel">
                  There is no founder story on this page. Not because there
                  isn&rsquo;t one, but because writing a compelling origin
                  narrative is the easiest thing on a site like this to
                  embellish, and we would rather leave the space empty than fill
                  it with something shaped for effect. It will appear when it can
                  be written plainly.
                </p>
                <p className="text-base text-steel">
                  Pricing, release dates and garment measurements are undecided.
                  Every page that would carry one says so rather than showing a
                  placeholder that looks like a commitment.
                </p>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <h2 className="notation mb-6 text-2xs text-signal">Read next</h2>
            <ul className="m-0 flex list-none flex-col gap-4 p-0">
              {[
                { href: "/manifesto", label: "Manifesto" },
                { href: "/policies/editorial", label: "Editorial policy" },
                { href: "/policies/corrections", label: "Corrections" },
                { href: "/policies/accessibility", label: "Accessibility" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-[24px] items-center text-base text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </main>
  );
}
