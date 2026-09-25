"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * A primary-nav link that knows where the reader is.
 *
 * `aria-current="page"` on the section's own index, and `"true"` anywhere
 * beneath it — inside an article the Journal link is the current *section*, not
 * the current page, and saying "page" there would be wrong. The visible state
 * is drawn from the attribute, so the two cannot disagree.
 *
 * A client component only because the header is rendered once, in the layout,
 * and the layout does not know the path.
 */
export function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const current =
    pathname === href ? "page" : pathname.startsWith(`${href}/`) ? "true" : undefined;

  return (
    <Link href={href} aria-current={current} className={className}>
      {children}
    </Link>
  );
}
