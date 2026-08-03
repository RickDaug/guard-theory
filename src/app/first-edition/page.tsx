import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { getWaitlistStore } from "@/lib/waitlist";

export const metadata: Metadata = {
  title: "First Edition",
  description:
    "The first Guard Theory release: no-gi rash guards built to a stated standard. Release date to be announced. Join the list for first access.",
  alternates: { canonical: "/first-edition" },
};

const COMMITMENTS = [
  {
    heading: "One release, then a pause",
    body: "The First Edition is a single run. We would rather make one garment properly than four adequately, and we will say when it is gone rather than quietly restocking.",
  },
  {
    heading: "Specifications published, not implied",
    body: "Fabric weight, composition, seam construction and print method will be stated on the product page. Nothing will be described as premium in place of a number.",
  },
  {
    heading: "Competition-legal by default",
    body: "No-gi rulesets constrain what a rash guard may look like. Designing inside that constraint from the start is more useful than designing around it afterwards.",
  },
];

export default function FirstEditionPage() {
  const store = getWaitlistStore();

  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/first-edition", label: "First Edition" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-6">
            <p className="notation text-2xs text-signal">
              Release date to be announced
            </p>

            <h1 className="display-condensed mt-6 text-4xl text-chalk">
              First Edition
            </h1>

            <p className="mt-8 max-w-[36rem] text-lg text-steel">
              The first Guard Theory release is a small run of no-gi rash guards.
              There is no date yet, and we are not going to invent one. Join the
              list and you will hear once, when there is something real to say.
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

            <p className="notation mt-14 max-w-[36rem] text-2xs text-steel">
              No countdown, no stock counter, no discount wheel. When we know the
              date, so will you.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="border border-steel-dim p-7 sm:p-10">
              <h2 className="display-condensed text-2xl text-chalk">
                Join the list
              </h2>
              <p className="mt-4 mb-10 max-w-[34rem] text-base text-steel">
                Two fields are required. Everything else helps us plan the run
                and is genuinely optional.
              </p>

              <WaitlistForm />

              {!store.isDurable ? (
                <p className="notation mt-10 border-t border-steel-dim pt-6 text-2xs text-steel">
                  Development note: no mail provider is connected yet, so
                  submissions are written to a local file rather than sent
                  anywhere. Nothing is discarded. See docs/owner-decisions.md.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
