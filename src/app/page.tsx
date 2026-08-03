import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { GuardSystemMap } from "@/components/notation/GuardSystemMap";

export default function HomePage() {
  return (
    <>
      <SiteHeader />

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
                  className="display-plain bg-signal px-7 py-3.5 text-sm text-ink no-underline transition-opacity duration-[140ms] ease-[var(--ease-control)] hover:opacity-85"
                >
                  Join the First Edition list
                </Link>
                <Link
                  href="/journal"
                  className="display-plain text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
                >
                  Read the Journal
                </Link>
              </div>

              <p className="notation mt-14 text-2xs text-steel-dim">
                First Edition — release date to be announced
              </p>
            </div>

            <div className="lg:col-span-7">
              <p className="notation mb-8 text-2xs text-signal">
                Fig. 01 — The guard, as a system
              </p>
              <GuardSystemMap />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
