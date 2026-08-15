import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";

export const metadata: Metadata = pageMetadata({
  title: "First Edition",
  description: "The First Edition: no-gi rash guards built to a published standard, designed inside competition rulesets. Join the list for first access.",
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
    body: "We would rather make one garment properly than four adequately. What ships carries the specification it was designed to, and we say so on the page rather than implying it.",
  },
  {
    heading: "Specifications published, not implied",
    body: "Fabric weight, composition, seam construction and print method are stated on the product page. Nothing is described as premium in place of a number.",
  },
  {
    heading: "Competition-legal by default",
    body: "No-gi rulesets constrain what a rash guard may look like. Designing inside that constraint from the start is more useful than designing around it afterwards.",
  },
];

export default function FirstEditionPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
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
              No-gi rash guards built to a published standard and designed inside
              competition rulesets rather than around them. The list gets it
              first.
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
                optional.
              </p>

              <WaitlistForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
