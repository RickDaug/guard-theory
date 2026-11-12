import type { Metadata } from "next";
import { StateSheet } from "@/components/product/StateSheet";

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
    <StateSheet
      eyebrow="First Edition"
      title={
        <>
          That run{" "}
          <br />
          is finished
        </>
      }
      primary={{ href: "/first-edition", label: "Join the list for the next one" }}
      links={[{ href: "/shop", label: "See what else is being made" }]}
    >
      <p className="text-lg text-ink">
        This garment is not currently available.
      </p>
      <p className="text-base text-slate">
        We do not quietly restock and call it a new release. When it returns, the
        page will say so, and the list hears first.
      </p>
    </StateSheet>
  );
}
