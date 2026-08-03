import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "Down for maintenance",
  description: "Guard Theory is temporarily unavailable while we make a change.",
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <UtilityPage
      eyebrow="Temporarily unavailable"
      tone="alert"
      title={
        <>
          Down for
          <br />
          maintenance
        </>
      }
      primary={{ href: "/", label: "Try the home page" }}
    >
      <p className="text-lg text-steel">
        We are making a change and the site is briefly offline. Nothing you
        submitted has been lost.
      </p>
      <p className="text-base text-steel">
        If you joined the First Edition list, you are still on it. Try again in a
        few minutes.
      </p>
    </UtilityPage>
  );
}
