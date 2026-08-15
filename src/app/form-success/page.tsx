import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "Submitted",
  description: "Your submission was received.",
  robots: { index: false, follow: false },
};

/**
 * The no-JavaScript fallback destination for a successful submission. Forms on
 * the site normally resolve in place, so most people will never see this — it
 * exists so that a submission is never a blank screen.
 */
export default function FormSuccessPage() {
  return (
    <UtilityPage
      eyebrow="Received"
      title="Submitted"
      primary={{ href: "/", label: "Go to the home page" }}
    >
      <p className="text-lg text-steel">
        Your submission was received. Nothing further is needed from you.
      </p>
      <p className="text-base text-steel">
        If you were joining the First Edition list, you will hear from us once,
        when it opens.
      </p>
    </UtilityPage>
  );
}
