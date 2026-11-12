"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
// Deliberately NOT "@/lib/search" — that module imports every content
// registry, and a client import of it drags all of them into the bundle.
import { searchDocuments, type SearchDocument } from "@/lib/search/types";

const NO_MATCH_EXITS = [
  { href: "/technique", label: "Browse the Technique Library" },
  { href: "/journal", label: "Read the Journal" },
  { href: "/figures", label: "See the influential figures" },
];

/**
 * Results update as you type and are announced politely rather than assertively,
 * so a screen reader is not interrupted mid-word on every keystroke.
 *
 * Three states, three different messages: nothing typed yet, typed and found
 * nothing, typed and found something. An empty screen is an invitation to act,
 * so the first two say what to do next.
 *
 * Drawn on bone (the study register): the field is a tall control with a
 * steel-mid border, the results a contents list under steel hairlines.
 */
export function SearchClient({ index }: { index: SearchDocument[] }) {
  const [query, setQuery] = useState("");
  const inputId = useId();
  const statusId = useId();

  const trimmed = query.trim();
  const results = useMemo(
    () => searchDocuments(index, trimmed),
    [index, trimmed],
  );

  const hasQuery = trimmed.length > 0;

  return (
    <div className="mt-14">
      <div className="flex max-w-[40rem] flex-col gap-3">
        <label htmlFor={inputId} className="display-plain text-sm text-ink">
          Search Guard Theory
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          aria-describedby={statusId}
          placeholder="guard retention, rash guard, privacy…"
          className="w-full border border-steel-mid bg-bone-raised px-5 py-4 text-lg text-ink placeholder:text-slate transition-colors duration-[140ms] ease-[var(--ease-control)] focus:border-signal-dim"
        />
      </div>

      <p id={statusId} aria-live="polite" className="notation mt-6 text-2xs text-slate">
        {!hasQuery
          ? `${index.length} pages indexed. Start typing to filter them.`
          : results.length === 0
            ? "No matches"
            : results.length === 1
              ? "1 match"
              : `${results.length} matches`}
      </p>

      {hasQuery && results.length === 0 ? (
        <div className="mt-8 max-w-[40rem] border border-steel bg-bone-raised p-8">
          <h2 className="display-condensed text-xl text-ink">
            Nothing matches “{trimmed}”
          </h2>
          <p className="mt-4 text-base text-slate">
            Search looks for every word you type, so fewer words usually finds
            more.
          </p>
          {/* Three ways on, not one. Search covers the whole site, so sending
              everybody who misses to the Library assumed what they were
              looking for. */}
          <ul role="list" className="m-0 mt-6 flex list-none flex-col gap-2 p-0">
            {NO_MATCH_EXITS.map((exit) => (
              <li key={exit.href}>
                <Link
                  href={exit.href}
                  className="link-rule display-plain inline-flex min-h-6 items-center text-sm text-signal-dim"
                >
                  {exit.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="m-0 mt-10 max-w-[70rem] list-none border-t border-steel p-0">
          {results.map((result) => (
            <li key={result.id} className="border-b border-steel">
              <Link
                href={result.href}
                className="group grid gap-x-10 gap-y-1.5 py-6 no-underline md:grid-cols-[7rem_minmax(0,22rem)_minmax(0,1fr)] md:items-baseline"
              >
                <span className="notation text-2xs text-slate">
                  {result.kind}
                </span>
                <span className="display-condensed text-lg text-ink transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-dim">
                  <span className="link-rule group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
                    {result.title}
                  </span>
                </span>
                <span className="max-w-[38rem] text-sm text-slate">{result.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
