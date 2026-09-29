"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The portal's sections, with the one you are in marked.
 *
 * The longest matching href wins, so /orders/ship marks "To ship" and not
 * "Orders" as well. `aria-current` says it to a screen reader; the underline
 * says it to everyone else — brighter text alone would be a difference of
 * colour only (SC 1.4.1). The underline is drawn from the attribute, so the two
 * cannot disagree.
 *
 * A client component only because the layout does not know the path.
 */
export function PortalNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();

  const current = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return (
    <nav aria-label="Portal" className="ml-auto">
      <ul className="m-0 flex list-none flex-wrap items-center gap-x-7 gap-y-2 p-0">
        {items.map((item) => {
          const state =
            item === current ? (pathname === item.href ? "page" : "true") : undefined;

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                aria-current={state}
                className="display-plain inline-flex min-h-6 items-center text-sm text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk aria-[current]:text-chalk aria-[current]:underline aria-[current]:decoration-signal-lift aria-[current]:decoration-2 aria-[current]:underline-offset-[6px]"
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
