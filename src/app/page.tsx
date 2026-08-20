import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";
import { GuardSystemMap } from "@/components/notation/GuardSystemMap";

export const metadata: Metadata = pageMetadata({
  title: `${SITE_NAME} — No-gi grappling apparel`,
  description:
    "No-gi grappling apparel and a technical study of the guard. Garments designed inside competition rulesets, and the reasoning published alongside them.",
  path: "/",
});

export default function HomePage() {
  return (
    <main id="main">
        <section className="px-6 pt-16 pb-28 md:px-12 md:pt-24">
          <div className="mx-auto grid max-w-[104rem] gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <h1 className="display-condensed text-4xl text-chalk">
                Guard is not
                <br />
                a position.
                <br />
                <span className="text-steel">It is a theory</span>
                <br />
                <span className="text-steel">of control.</span>
              </h1>

              <p className="prose-measure mt-10 text-lg text-steel">
                Guard Theory makes no-gi grappling apparel and publishes the
                reasoning behind it. Position before submission. Systems before
                chaos.
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="/first-edition"
                  className="display-plain bg-signal px-7 py-3.5 text-sm text-chalk no-underline transition-opacity duration-[140ms] ease-[var(--ease-control)] hover:opacity-85"
                >
                  Join the First Edition list
                </Link>
                <Link
                  href="/journal"
                  className="display-plain inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
                >
                  Read the Journal
                </Link>
              </div>

              <p className="mt-14 text-base text-steel">
                First Edition — join the list for first access
              </p>
            </div>

            <div className="lg:col-span-7">
              <p className="notation mb-8 text-2xs text-orchid">
                Fig. 01 — The guard, as a system
              </p>
              <GuardSystemMap />
            </div>
          </div>
      </section>
    </main>
  );
}
