import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";

export const metadata: Metadata = {
  title: "Not submitted",
  description: "Your submission did not go through.",
  robots: { index: false, follow: false },
};

export default function FormErrorPage() {
  return (
    <UtilityPage
      eyebrow="Not submitted"
      tone="alert"
      title={
        <>
          That did not
          <br />
          go through
        </>
      }
      primary={{ href: "/first-edition", label: "Try the First Edition list again" }}
      secondary={{ href: "/contact", label: "Tell us what happened" }}
    >
      <p className="text-lg text-steel">
        Something went wrong on our side and your submission was not saved.
      </p>
      <p className="text-base text-steel">
        Nothing was lost on yours — going back will still have your answers in
        the form. If it fails a second time, tell us and we will look at it
        rather than leaving you to keep trying.
      </p>
    </UtilityPage>
  );
}
