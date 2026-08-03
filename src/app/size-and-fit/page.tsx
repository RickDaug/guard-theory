import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { PRODUCTS } from "@/content/products";

export const metadata: Metadata = {
  title: "Size and fit",
  description:
    "How a BJJ rash guard should fit, what to check, and why Guard Theory has not published measurements yet.",
  alternates: { canonical: "/size-and-fit" },
};

const CHECKS = [
  {
    heading: "It should be tight enough to stay put",
    body: "A rash guard that rides up during a scramble is doing none of its job. Pull it down, sit in a deep guard, and stand up. If the hem has travelled, it is too loose.",
  },
  {
    heading: "The seams should sit where your body bends",
    body: "The raglan seam should run through the armpit rather than across the point of the shoulder, which is where most contact lands. If a seam sits on a bony landmark, it will be felt in a long round.",
  },
  {
    heading: "The sleeve should end where you want it to end",
    body: "A long sleeve that stops short of the wrist will be dragged there anyway. A short sleeve that sits below the elbow restricts the arm at exactly the angle a frame needs.",
  },
  {
    heading: "You should be able to breathe out fully",
    body: "Compression garments are sized down more often than they should be. If a full exhale is uncomfortable standing still, a hard round will be worse.",
  },
  {
    heading: "Check it grappling, not in a mirror",
    body: "Fit problems in a rash guard appear under load and nowhere else. Take a few rounds in it before deciding.",
  },
];

export default function SizeAndFitPage() {
  return (
    <main id="main" className="px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <Breadcrumbs trail={[{ href: "/size-and-fit", label: "Size and fit" }]} />

        <div className="mt-10 grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <h1 className="display-condensed text-4xl text-chalk">
              Size and fit
            </h1>

            <p className="mt-10 max-w-[36rem] text-lg text-steel">
              A rash guard is a compression garment, so &ldquo;fits&rdquo; means
              something more specific than it does for a t-shirt. Here is what to
              check, whether or not you ever buy one from us.
            </p>

            <ol className="m-0 mt-14 flex list-none flex-col gap-10 p-0">
              {CHECKS.map((check, index) => (
                <li key={check.heading} className="flex max-w-[36rem] gap-6">
                  <span
                    className="notation mt-1.5 shrink-0 text-2xs text-signal"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="display-condensed text-lg text-chalk">
                      {check.heading}
                    </h2>
                    <p className="mt-3 text-base text-steel">{check.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <section aria-labelledby="between" className="mt-16 max-w-[36rem]">
              <h2 id="between" className="display-condensed text-2xl text-chalk">
                Sizing between brands
              </h2>
              <p className="mt-5 text-base text-steel">
                There is no shared standard. A medium from one brand can be a
                different garment from a medium at another, which is why a size
                chart with real chest and length measurements is worth more than
                a letter. When ours exists it will be measurements, not a
                recommendation to size up or down.
              </p>
            </section>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="border border-steel-dim p-7">
              <h2 className="display-condensed text-xl text-chalk">
                No measurements yet
              </h2>
              <p className="mt-5 text-base text-steel">
                Guard Theory has not published a size chart, because no garment
                has been produced and measured. Inventing one would be worse than
                not having one — you would buy against it.
              </p>
              <p className="mt-5 text-base text-steel">
                When the First Edition is made, this page will carry chest,
                length and sleeve measurements per size, taken from production
                garments rather than from a pattern.
              </p>
              <p className="mt-5 text-base text-steel">
                If a return is caused by our chart being wrong, that will be our
                cost.
              </p>
            </div>

            <h2 className="notation mt-12 mb-5 text-2xs text-signal">
              Size labels planned
            </h2>
            <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
              {PRODUCTS[0]?.sizeLabels.map((size) => (
                <li
                  key={size}
                  className="notation border border-steel-dim px-4 py-2 text-2xs text-steel"
                >
                  {size}
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm text-steel">
              See the{" "}
              <Link
                href="/shop"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                garments themselves
              </Link>
              .
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
