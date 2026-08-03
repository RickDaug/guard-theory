import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "No longer available",
  description: "This garment is no longer available.",
  robots: { index: false, follow: true },
};

/**
 * The state a product page becomes when a run is finished.
 *
 * It says the run is over rather than "out of stock", because "out of stock"
 * implies a restock we have not committed to. The First Edition is a single
 * run; if it sells out, saying so plainly is the promise, not the problem.
 */
export default function ProductUnavailablePage() {
  return (
    <UtilityPage
      eyebrow="First Edition"
      title={
        <>
          That run
          <br />
          is finished
        </>
      }
      primary={{ href: "/first-edition", label: "Join the list for the next one" }}
      secondary={{ href: "/shop", label: "See what else is being made" }}
    >
      <p className="text-lg text-steel">
        This garment was made in a single run and that run is gone.
      </p>
      <p className="text-base text-steel">
        We are not going to quietly restock it and call it a new release. If it
        is made again, it will say so, and the list is how you will hear.
      </p>
    </UtilityPage>
  );
}
