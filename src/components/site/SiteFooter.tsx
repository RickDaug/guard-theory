import Link from "next/link";
import { Monogram } from "@/components/brand/Monogram";

const COLUMNS: Array<{ heading: string; links: Array<{ href: string; label: string }> }> = [
  {
    heading: "Wear",
    links: [
      { href: "/shop", label: "Shop" },
      { href: "/first-edition", label: "First Edition" },
      { href: "/lookbook", label: "Lookbook" },
      { href: "/size-and-fit", label: "Size and fit" },
    ],
  },
  {
    heading: "Study",
    links: [
      { href: "/journal", label: "Journal" },
      { href: "/technique", label: "Technique Library" },
      { href: "/figures", label: "Influential figures" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Brand",
    links: [
      { href: "/about", label: "About" },
      { href: "/manifesto", label: "Manifesto" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { href: "/policies/privacy", label: "Privacy" },
      { href: "/policies/terms", label: "Terms" },
      { href: "/policies/shipping", label: "Shipping" },
      { href: "/policies/returns", label: "Returns" },
      { href: "/policies/cookies", label: "Cookies" },
      { href: "/policies/accessibility", label: "Accessibility" },
      { href: "/policies/editorial", label: "Editorial" },
      { href: "/policies/affiliate-disclosure", label: "Affiliate disclosure" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-steel-dim px-6 py-16 md:px-12">
      <div className="mx-auto max-w-[104rem]">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3.5" aria-label="Guard Theory, home">
              <Monogram size={24} className="text-chalk" />
              <span className="wordmark text-sm text-chalk">Guard Theory</span>
            </Link>
            <p className="mt-6 max-w-[24rem] text-sm text-steel">
              No-gi grappling apparel, and a technical study of the guard.
              Position before submission. Systems before chaos.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-labelledby={`footer-${column.heading}`}>
                <h2
                  id={`footer-${column.heading}`}
                  className="display-plain mb-5 text-sm text-steel"
                >
                  {column.heading}
                </h2>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-[24px] items-center text-sm text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <p className="mt-16 max-w-[38rem] text-sm text-steel">
          Guard Theory is an independent brand. Nothing published here replaces
          instruction from a qualified coach.
        </p>
      </div>
    </footer>
  );
}
