import type { Metadata } from "next";
import Link from "next/link";
import { stripeKeyRefusal, stripeMode } from "@/lib/stripe/client";
import { portalUrl } from "@/lib/portal/routes";
import { getSession } from "@/lib/portal/session";

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
  { href: "/list", label: "First Edition" },
  { href: "/learn", label: "Learn" },
];

function ModeBanner() {
  const mode = stripeMode();
  const refusal = stripeKeyRefusal();
  const production = process.env.VERCEL_ENV === "production";

  if (mode === "live" && !refusal) {
    return null;
  }

  if (refusal) {
    return (
      <p
        role="status"
        className="border-b border-signal-lift bg-graphite px-6 py-3 text-center text-sm text-chalk md:px-12"
      >
        A live Stripe key is set on a deployment that is not production, and it is being refused.
        Nothing can be sold here. Put a test key on this environment.
      </p>
    );
  }

  return (
    <p
      role="status"
      className="border-b border-steel-dim bg-graphite px-6 py-3 text-center text-sm text-chalk md:px-12"
    >
      {mode === "test"
        ? production
          ? "TEST MODE ON THE LIVE SITE. Checkout works and takes no money: a real customer can place an order that is not real. Switch to the live key before opening."
          : "Test mode. Orders taken here are not real and no money moves."
        : "Stripe is not configured, or its key is not readable. Nothing can be sold."}
    </p>
  );
}

export default async function CrewLayout({ children }: { children: React.ReactNode }) {
  // The sign-in page shares this layout and is public. Which Stripe mode the
  // shop is in, and what the portal's sections are called, is nobody's business
  // until they have signed in — so without a session the shell is empty. This
  // is presentation, not authorisation: every page and action still checks for
  // itself.
  const session = await getSession();

  if (!session) {
    return <div className="min-h-screen">{children}</div>;
  }

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
