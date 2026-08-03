import Link from "next/link";
import { Monogram } from "@/components/brand/Monogram";

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/technique", label: "Technique" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="px-6 py-6 md:px-12">
      <div className="mx-auto flex max-w-[104rem] flex-wrap items-center gap-x-10 gap-y-5">
        <Link
          href="/"
          className="flex items-center gap-3.5"
          aria-label="Guard Theory, home"
        >
          <Monogram size={26} className="text-chalk" />
          <span className="wordmark text-sm text-chalk">Guard Theory</span>
        </Link>

        <nav aria-label="Primary" className="ml-auto">
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-8 gap-y-2 p-0">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="display-plain text-sm text-steel no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:text-chalk"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {/* Below sm this would wrap onto a line of its own and read as a
                stranded element. The hero carries the same action, prominently,
                so the header simply does without it on the narrowest screens. */}
            <li className="hidden sm:block">
              <Link
                href="/first-edition"
                className="display-plain border border-steel-dim px-4 py-2 text-sm text-chalk no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:border-signal hover:text-signal"
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
