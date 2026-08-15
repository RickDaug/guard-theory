import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "Email confirmed",
  description: "Your email address is confirmed and you are on the First Edition list.",
  robots: { index: false, follow: false },
};

export default function EmailConfirmedPage() {
  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={
        <>
          Email
          <br />
          confirmed
        </>
      }
      primary={{ href: "/first-edition", label: "See what you signed up for" }}
      secondary={{ href: "/technique", label: "Browse the Technique Library" }}
    >
      <p className="text-lg text-steel">
        That address is confirmed and you are on the First Edition list.
      </p>
      <p className="text-base text-steel">
        You will hear from us once, when the First Edition opens.
        There is no newsletter and no drip sequence, and every message carries a
        one-click unsubscribe.
      </p>
    </UtilityPage>
  );
}
