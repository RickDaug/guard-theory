import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

/**
 * An empty screen is an invitation to act. This one says what happened, does
 * not apologise, and offers the three places someone who landed here most
 * plausibly wanted.
 */
export default function NotFound() {
  return (
    <main id="main" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <p className="notation text-2xs text-signal">Error 404</p>
        <h1 className="display-condensed mt-6 text-4xl text-chalk">
          This page
          <br />
          does not exist
        </h1>
        <p className="mt-8 max-w-[34rem] text-lg text-steel">
          The address may be mistyped, or the page may have been removed. Nothing
          on the site has been renamed recently, so a typo is the likelier of the
          two.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <ButtonLink href="/">Go to the home page</ButtonLink>
          <Link
            href="/technique"
            className="display-plain text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
          >
            Browse the Technique Library
          </Link>
          <Link
            href="/journal"
            className="display-plain text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
          >
            Read the Journal
          </Link>
        </div>
      </div>
    </main>
  );
}
