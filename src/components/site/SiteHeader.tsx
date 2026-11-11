import Link from "next/link";
import { CartLink } from "@/components/cart/CartLink";
import { Monogram } from "@/components/brand/Monogram";
import { NavLink } from "./NavLink";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/technique", label: "Technique" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "About" },
];

/**
 * The header is the one piece of ink chrome every band sits under.
 *
 * Sticky, so the mark and the nav stay in reach on a long sheet; translucent
 * with a blur so a bone band scrolling beneath it reads as paper passing
 * under the desk lamp rather than as a hard cut. The hairline is the plate's
 * title-block rule.
 *
 * The current section is marked with a small orchid tick before the label —
 * the annotation layer doing its job — rather than an underline, which on a
 * nav reads as a link state rather than a location.
 */
export function SiteHeader() {
  return (
    <header className="band-ink sticky top-0 z-40 border-b border-steel-dim/70 px-6 backdrop-blur-md supports-[backdrop-filter]:bg-ink/85 md:px-12">
      <div className="mx-auto flex max-w-[104rem] flex-wrap items-center gap-x-10 gap-y-3 py-4 md:py-5">
        <Link
          href="/"
          className="flex items-center gap-3.5 no-underline"
          aria-label="Guard Theory, home"
        >
          <Monogram size={28} className="text-chalk" />
          <span className="wordmark text-sm text-chalk">Guard Theory</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto">
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-7 gap-y-2 p-0 md:gap-x-9">
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  className="eyebrow group relative inline-flex min-h-6 items-center text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk aria-[current]:text-chalk aria-[current]:before:absolute aria-[current]:before:-left-3.5 aria-[current]:before:top-1/2 aria-[current]:before:h-px aria-[current]:before:w-2 aria-[current]:before:-translate-y-1/2 aria-[current]:before:bg-orchid aria-[current]:before:content-['']"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            {/* Appears only once there is something in the cart. */}
            <CartLink />

            {/* Below sm this would wrap onto a line of its own and read as a
                stranded element. The hero carries the same action, prominently,
                so the header simply does without it on the narrowest screens. */}
            <li className="hidden sm:block">
              <Link
                href="/first-edition"
                className="eyebrow inline-flex min-h-6 items-center border border-steel-mid px-4 py-2.5 text-chalk no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:border-chalk"
              >
                Join the list
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
