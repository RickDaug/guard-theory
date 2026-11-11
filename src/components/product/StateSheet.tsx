import Link from "next/link";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * A terminal state of the commerce path — an order received, a run finished —
 * as a bone sheet: the same shape as `UtilityPage` (eyebrow, title, what
 * happened, what to do next) laid on the paper ground the shop now uses, so a
 * buyer does not step from a bone cart into an ink dead end.
 *
 * It states what happened and offers the next thing to do. The primary action
 * is the one signal block on the page; the rest are plain links.
 */
export function StateSheet({
  eyebrow,
  title,
  children,
  primary,
  links = [],
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  primary?: { href: string; label: string };
  /** The other places to go from here, in order. */
  links?: Array<{ href: string; label: string }>;
}) {
  return (
    <main id="main" tabIndex={-1}>
      <div className="band-bone band-edge corner-ticks px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[104rem]">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <p className="eyebrow text-slate">{eyebrow}</p>
              <h1 className="display-condensed mt-5 text-4xl leading-[0.9] text-ink">{title}</h1>
            </div>

            <div className="lg:col-span-6 lg:col-start-7 lg:pt-2">
              <div className="flex max-w-[36rem] flex-col gap-5 text-ink">{children}</div>

              {primary || links.length > 0 ? (
                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-steel pt-8">
                  {primary ? <ButtonLink href={primary.href}>{primary.label}</ButtonLink> : null}
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="display-plain inline-flex min-h-6 items-center text-sm text-signal-dim underline decoration-steel underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-dim"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
