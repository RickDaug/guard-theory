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
 *
 * Drawn as one plate: a raised surface with registration ticks, centred on an
 * ink band carrying the plate's dot grid. The status is short, so it sits in
 * the middle of the band rather than top-left of an empty page.
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
    <main
      id="main"
      tabIndex={-1}
      className="band-ink plate-grid flex min-h-[70vh] items-center px-6 py-20 md:px-12 md:py-28"
    >
      <div className="corner-ticks mx-auto w-full max-w-[44rem] border border-steel-dim bg-ink-raised px-7 py-12 sm:px-14 sm:py-16">
        <p
          className={`eyebrow ${
            tone === "alert" ? "text-signal-lift" : "text-caption"
          }`}
        >
          {eyebrow}
        </p>

        <h1 className="display-condensed mt-6 text-3xl leading-[0.95] text-chalk">{title}</h1>

        <div className="mt-8 flex max-w-[36rem] flex-col gap-5 text-chalk">{children}</div>

        {primary || secondary ? (
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-steel-dim pt-8">
            {primary ? (
              <ButtonLink href={primary.href}>{primary.label}</ButtonLink>
            ) : null}
            {secondary ? (
              <Link
                href={secondary.href}
                className="display-plain inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
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
