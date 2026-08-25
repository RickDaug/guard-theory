import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Three intents, and they are genuinely different jobs rather than three
 * decorations:
 *
 *   signal  — the one action the page wants. At most one per view.
 *   outline — a real alternative the reader might reasonably choose instead.
 *   quiet   — navigation that happens to be a button, or a reversible action.
 *
 * Labels say what happens, in the same words the resulting screen will use.
 * "Join the list" produces a screen that says you have joined the list.
 */
type Intent = "signal" | "outline" | "quiet";

/**
 * min-h-6 is not styling — it is WCAG 2.2 SC 2.5.8, which requires a 24x24 CSS
 * pixel target. The quiet intent has no padding to reach that on its own.
 */
const BASE =
  "display-plain inline-flex min-h-6 items-center justify-center gap-2 text-sm no-underline transition-[background-color,border-color,color,opacity] duration-[140ms] ease-[var(--ease-control)] disabled:cursor-not-allowed disabled:opacity-45";

const INTENT: Record<Intent, string> = {
  // chalk, not ink: the brand blue is a mid-luminance colour, so a dark label
  // on it reads 3.6:1 and a near-white one reads 4.7:1. chalk's value was set
  // by this pairing.
  signal: "bg-signal px-7 py-3.5 text-chalk hover:opacity-85",
  outline:
    "border border-steel-dim px-7 py-3.5 text-chalk hover:border-signal-lift hover:text-signal-lift",
  quiet:
    "text-chalk underline decoration-steel-dim underline-offset-[6px] hover:decoration-signal-lift",
};

type ButtonProps = {
  intent?: Intent;
  children: ReactNode;
} & ComponentPropsWithoutRef<"button">;

export function Button({
  intent = "signal",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={`${BASE} ${INTENT[intent]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = {
  intent?: Intent;
  href: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

export function ButtonLink({
  intent = "signal",
  href,
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link href={href} className={`${BASE} ${INTENT[intent]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}
