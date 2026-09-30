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

export default function FirstEditionPage() {
  return (
    <main id="main" tabIndex={-1} className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/first-edition", label: "First Edition" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <p className="notation text-2xs text-orchid">
              First access
            </p>

            <h1 className="display-condensed mt-6 text-4xl text-chalk">
              First Edition
            </h1>

            <p className="mt-8 max-w-[36rem] text-lg text-steel">
              <Link
                href="/shop"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                No-gi rash guards
              </Link>{" "}
              in long sleeve and short sleeve. The list gets them first.
            </p>

            <ul className="m-0 mt-14 flex list-none flex-col gap-10 p-0">
              {COMMITMENTS.map((item) => (
                <li key={item.heading} className="max-w-[36rem]">
                  <h2 className="display-condensed text-lg text-chalk">
                    {item.heading}
                  </h2>
                  <p className="mt-3 text-base text-steel">{item.body}</p>
                </li>
              ))}
            </ul>

            <p className="mt-14 max-w-[36rem] text-base text-steel">
              No countdown, no stock counter, no discount wheel. One message when
              it opens, and nothing else.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-steel-dim p-7 sm:p-10">
              <h2 className="display-condensed text-2xl text-chalk">
                Join the list
              </h2>
              <p className="mt-4 mb-10 max-w-[34rem] text-base text-steel">
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
      </div>
    </main>
  );
}
