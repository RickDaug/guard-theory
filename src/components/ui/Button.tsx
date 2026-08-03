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

const BASE =
  "display-plain inline-flex items-center justify-center gap-2 text-sm no-underline transition-[background-color,border-color,color,opacity] duration-[140ms] ease-[var(--ease-control)] disabled:cursor-not-allowed disabled:opacity-45";

const INTENT: Record<Intent, string> = {
  signal: "bg-signal px-7 py-3.5 text-ink hover:opacity-85",
  outline:
    "border border-steel-dim px-7 py-3.5 text-chalk hover:border-signal hover:text-signal",
  quiet:
    "text-chalk underline decoration-steel-dim underline-offset-[6px] hover:decoration-signal",
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
