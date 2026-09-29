import type { Metadata } from "next";
import Link from "next/link";
import { stripeKeyRefusal, stripeMode } from "@/lib/stripe/client";
import { checkStripeMode } from "@/lib/stripe/mode-check";
import { portalUrl } from "@/lib/portal/routes";
import { getSession } from "@/lib/portal/session";
import { PortalNav } from "./PortalNav";
import { signOut } from "./sign-in/actions";

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
 *
 * The prefix is then cross-checked with Stripe itself (`balance.retrieve()`'s
 * `livemode`, cached ten minutes; src/lib/stripe/mode-check.ts). A mismatch is
 * the loudest banner there is, in every mode, live included. When live and
 * Stripe agrees, there is still no banner: going live is meant to be noticed by
 * the banner disappearing.
 */

const NAV = [
  { href: "", label: "Today" },
  { href: "/orders/ship", label: "To ship" },
  { href: "/orders", label: "Orders" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/list", label: "First Edition" },
  { href: "/settings", label: "Settings" },
  { href: "/learn", label: "Learn" },
];

async function ModeBanner() {
  const mode = stripeMode();
  const refusal = stripeKeyRefusal();
  const production = process.env.VERCEL_ENV === "production";
  const check = await checkStripeMode();

  if (check.state === "mismatch") {
    return (
      <p
        role="alert"
        className="border-b-2 border-signal-lift bg-graphite px-6 py-3 text-center text-sm text-chalk md:px-12"
      >
        {`STRIPE MODE MISMATCH. The key reads as ${check.keyMode}; Stripe says ${check.stripeSays}. Do not trust any order, total or banner here until the key is checked.`}
      </p>
    );
  }

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
      {mode === "test"
        ? check.state === "match"
          ? " Stripe says: test — matches."
          : check.state === "unreachable"
            ? " Stripe could not be asked to confirm."
            : null
        : null}
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

          <PortalNav
            items={NAV.map((item) => ({ href: portalUrl(item.href), label: item.label }))}
          >
            <li>
              {/*
                signOut existed with nothing calling it, so the only way out
                was waiting twelve hours or signing in again elsewhere. A form
                rather than a link: signing out changes state, so it is a POST.
              */}
              <form action={signOut}>
                <button
                  type="submit"
                  className="display-plain inline-flex min-h-6 cursor-pointer items-center border-0 bg-transparent p-0 text-sm text-steel transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                >
                  Sign out
                </button>
              </form>
            </li>
          </PortalNav>
        </div>
      </header>

      {children}
    </div>
  );
}
