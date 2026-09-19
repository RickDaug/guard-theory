import type { Metadata } from "next";
import { cache } from "react";
import { UtilityPage } from "@/components/site/UtilityPage";
import { unsubscribeByToken } from "@/lib/waitlist";
import { metaDescriptionFor, metaTitleFor, tokenFromSearchParams, type UnsubscribeOutcome } from "./copy";

/**
 * This page used to assert an outcome with nothing behind it: a static sheet
 * telling the reader their address had been removed, while nothing removed it.
 * It now honours a real token — and the `<title>` honours it too, so a tab or
 * a screen reader's document title cannot claim success on a link that did
 * nothing.
 *
 * It is dynamic because it writes. One click on the link in an email is the
 * whole interaction — the privacy policy promises "a one-click unsubscribe" and
 * a confirmation button would not be one.
 *
 * Reaching it with no token at all is not an error. The links crawl fetches
 * this route directly, and a person can arrive here from a bookmark; both get
 * the explanation rather than a failure.
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ t?: string | string[] }>;

/**
 * `generateMetadata` and the page component both need the outcome, and the
 * lookup writes — `unsubscribeByToken` marks the row unsubscribed on a valid
 * token. `cache()` makes the two calls in one render share a single write
 * instead of racing two updates against the same row. The store itself is
 * idempotent either way (a second update matches no row and reports
 * "already"), so this is about not doing the write twice, not about
 * correctness of the result.
 */
const resolveOutcome = cache(
  async (token: string): Promise<UnsubscribeOutcome> => (token ? unsubscribeByToken(token) : "no-token"),
);

async function outcomeFor(searchParams: SearchParams): Promise<UnsubscribeOutcome> {
  const params = await searchParams;
  const token = tokenFromSearchParams(params.t);
  return resolveOutcome(token);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const outcome = await outcomeFor(searchParams);

  return {
    title: metaTitleFor(outcome),
    description: metaDescriptionFor(outcome),
    robots: { index: false, follow: false },
  };
}

type Copy = {
  title: React.ReactNode;
  tone?: "neutral" | "alert";
  body: React.ReactNode;
};

function copyFor(result: UnsubscribeOutcome): Copy {
  switch (result) {
    case "unsubscribed":
    case "already":
      return {
        title: (
          <>
            You are{" "}
            <br />
            unsubscribed
          </>
        ),
        body: (
          <>
            <p className="text-lg text-steel">
              Your email address has been removed from the First Edition list. We
              will not email you again.
            </p>
            <p className="text-base text-steel">
              Nothing else was deleted automatically. If you would also like the
              preferences you gave us removed, ask and we will delete them — you
              do not need to give a reason.
            </p>
            <p className="text-base text-steel">
              If you did this by accident, you can join again at any time.
              Nothing is held against the address.
            </p>
          </>
        ),
      };

    case "no-token":
      return {
        title: (
          <>
            Use the link{" "}
            <br />
            in the email
          </>
        ),
        body: (
          <>
            <p className="text-lg text-steel">
              This page removes an address from the First Edition list, and it
              needs the link from one of our emails to know which address to
              remove.
            </p>
            <p className="text-base text-steel">
              Every email we send carries that link at the foot of it. If you
              cannot find one, write to us and we will remove you by hand.
            </p>
          </>
        ),
      };

    case "unknown-token":
      return {
        title: (
          <>
            That link{" "}
            <br />
            is not ours
          </>
        ),
        body: (
          <>
            <p className="text-lg text-steel">
              We could not match this link to an address on the list. It may have
              been truncated by an email client, or the address may already have
              been deleted outright.
            </p>
            <p className="text-base text-steel">
              Write to us and we will make sure you are off the list. That is
              faster than trying the link again.
            </p>
          </>
        ),
      };

    case "unavailable":
      return {
        tone: "alert",
        title: (
          <>
            We could not{" "}
            <br />
            do that just now
          </>
        ),
        body: (
          <>
            <p className="text-lg text-steel">
              Something on our side failed and your address has not been removed.
              We would rather say so than show you a confirmation that means
              nothing.
            </p>
            <p className="text-base text-steel">
              Try the link again in a few minutes. If it fails twice, write to us
              and we will remove you by hand.
            </p>
          </>
        ),
      };
  }
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const result = await outcomeFor(searchParams);
  const { title, body, tone } = copyFor(result);

  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={title}
      tone={tone}
      primary={{ href: "/", label: "Go to the home page" }}
      secondary={{ href: "/journal", label: "Read the Journal" }}
    >
      {body}
    </UtilityPage>
  );
}
