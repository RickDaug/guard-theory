import type { Metadata } from "next";
import Link from "next/link";
import { stripeMode } from "@/lib/stripe/client";
import { portalUrl } from "@/lib/portal/routes";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/**
 * The portal shell.
 *
 * Same design system as the rest of the site, and held to the same tests: the
 * ground is `ink`, form surfaces are `graphite`, secondary text is `steel`
 * (never `steel-dim`, which is a hairline colour and 2.1:1 on ink), `signal` is
 * a fill and never a word, and interactive targets keep their 24px minimum.
 *
 * The mode banner is not decoration. It reads the Stripe key prefix rather than
 * an environment flag, because a flag can be set wrongly and then believed. An
 * unreadable key is shown as unknown rather than assumed to be test — a mode we
 * cannot determine is a mode we cannot safely take money in.
 */

const NAV = [
  { href: "", label: "Today" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
];

function ModeBanner() {
  const mode = stripeMode();

  if (mode === "live") {
    return null;
  }

  return (
    <p
      role="status"
      className="border-b border-steel-dim bg-graphite px-6 py-3 text-center text-sm text-chalk md:px-12"
    >
      {mode === "test"
        ? "Test mode. Orders taken here are not real and no money moves."
        : "Stripe is not configured, or its key is not readable. Nothing can be sold."}
    </p>
  );
}

export default function CrewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ModeBanner />

      <header className="border-b border-steel-dim px-6 py-5 md:px-12">
        <div className="mx-auto flex max-w-[104rem] flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href={portalUrl()}
            className="notation text-2xs text-orchid no-underline"
          >
            Crew Portal
          </Link>

          <nav aria-label="Portal" className="ml-auto">
            <ul className="m-0 flex list-none flex-wrap items-center gap-x-7 gap-y-2 p-0">
              {NAV.map((item) => (
                <li key={item.label}>
                  <Link
                    href={portalUrl(item.href)}
                    className="display-plain inline-flex min-h-6 items-center text-sm text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
