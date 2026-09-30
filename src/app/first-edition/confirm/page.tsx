import type { Metadata } from "next";
import Link from "next/link";
import { UtilityPage } from "@/components/site/UtilityPage";
import { ConfirmForm } from "@/components/waitlist/ConfirmForm";
import { CONFIRMATION_TTL_HOURS } from "@/lib/waitlist/confirm";

/**
 * Where the confirmation email's link lands.
 *
 * Rendering this page writes nothing. The link only carries the token to a
 * Confirm button, and the button's POST (confirmWaitlist) is what confirms —
 * so a mail scanner that opens every link in a message confirms nobody. This
 * is deliberately unlike /unsubscribe, whose one-click GET is what the privacy
 * policy promises: leaving must be effortless, joining must be someone's act.
 *
 * Reaching it with no token is not an error. The links crawl fetches every
 * route, and a person can arrive from a bookmark; both get the explanation.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirm your address",
  description: "Confirm your email address to join the Guard Theory First Edition list.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ t?: string | string[] }>;

export default async function ConfirmPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).t;
  const token = ((Array.isArray(raw) ? raw[0] : raw) ?? "").trim().slice(0, 256);

  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={
        token ? (
          <>
            Confirm your{" "}
            <br />
            address
          </>
        ) : (
          <>
            Use the link{" "}
            <br />
            in the email
          </>
        )
      }
      secondary={{ href: "/journal", label: "Read the Journal" }}
    >
      {token ? (
        <>
          <p className="text-lg text-steel">
            Press the button to add this address to the First Edition list. You will hear from
            us once, when it opens.
          </p>
          <ConfirmForm token={token} ttlHours={CONFIRMATION_TTL_HOURS} />
        </>
      ) : (
        <>
          <p className="text-lg text-steel">
            This page confirms an address for the First Edition list, and it needs the link
            from the email we sent to know which one.
          </p>
          <p className="text-base text-steel">
            If you cannot find the email,{" "}
            <Link
              href="/first-edition"
              className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
            >
              join again
            </Link>{" "}
            and we will send another.
          </p>
        </>
      )}
    </UtilityPage>
  );
}
