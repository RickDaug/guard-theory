import Link from "next/link";
import type { ReactNode } from "react";
import type { UnsubscribeOutcome } from "./copy";

/**
 * What the reader sees for each outcome. Shared by the page (a link with no
 * token) and the confirm form (after the POST), so the two cannot drift. No
 * server-only imports: the confirm form is a client component.
 */

export type Copy = {
  title: ReactNode;
  tone?: "neutral" | "alert";
  body: ReactNode;
};

export function copyFor(result: UnsubscribeOutcome): Copy {
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
              preferences you gave us removed,{" "}
              <Link
                href="/contact"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                ask
              </Link>{" "}
              and we will delete them — you do not need to give a reason.
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
              cannot find one,{" "}
              <Link
                href="/contact"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                write to us
              </Link>{" "}
              and we will remove you by hand.
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
              <Link
                href="/contact"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                Write to us
              </Link>{" "}
              and we will make sure you are off the list. That is faster than
              trying the link again.
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
              Try the link again in a few minutes. If it fails twice,{" "}
              <Link
                href="/contact"
                className="text-chalk underline decoration-steel-dim underline-offset-[5px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
              >
                write to us
              </Link>{" "}
              and we will remove you by hand.
            </p>
          </>
        ),
      };
  }
}

