import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You have been removed from the Guard Theory First Edition list.",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={
        <>
          You are
          <br />
          unsubscribed
        </>
      }
      primary={{ href: "/", label: "Go to the home page" }}
      secondary={{ href: "/journal", label: "Read the Journal" }}
    >
      <p className="text-lg text-steel">
        Your email address has been removed from the First Edition list. We will
        not email you again.
      </p>
      <p className="text-base text-steel">
        Nothing else was deleted automatically. If you would also like the
        preferences you gave us removed, ask and we will delete them — you do not
        need to give a reason.
      </p>
      <p className="text-base text-steel">
        If you did this by accident, you can join again at any time. Nothing is
        held against the address.
      </p>
    </UtilityPage>
  );
}
