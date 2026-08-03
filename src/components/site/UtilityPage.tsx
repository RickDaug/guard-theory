import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * The shared shape for every terminal state on the site — maintenance,
 * unsubscribed, confirmed, submitted, failed, unavailable.
 *
 * Each one states what happened, in the interface's voice, and offers the next
 * thing to do. None of them apologise, and none of them are vague about what
 * occurred. A screen with nothing on it is a dead end; a screen with a
 * direction is not.
 */
export function UtilityPage({
  eyebrow,
  title,
  children,
  primary,
  secondary,
  tone = "neutral",
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string };
  /** "alert" tints the eyebrow, for states the reader did not choose. */
  tone?: "neutral" | "alert";
}) {
  return (
    <main id="main" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <p
          className={`notation text-2xs ${
            tone === "alert" ? "text-signal" : "text-steel"
          }`}
        >
          {eyebrow}
        </p>

        <h1 className="display-condensed mt-6 text-4xl text-chalk">{title}</h1>

        <div className="mt-8 flex max-w-[36rem] flex-col gap-5">{children}</div>

        {primary || secondary ? (
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            {primary ? (
              <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="display-plain text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal"
              >
                {secondary.label}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
