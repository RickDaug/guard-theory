"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
// Deliberately NOT "@/lib/search" — that module imports every content
// registry, and a client import of it drags all of them into the bundle.
import { searchDocuments, type SearchDocument } from "@/lib/search/types";

/**
 * Results update as you type and are announced politely rather than assertively,
 * so a screen reader is not interrupted mid-word on every keystroke.
 *
 * Three states, three different messages: nothing typed yet, typed and found
 * nothing, typed and found something. An empty screen is an invitation to act,
 * so the first two say what to do next.
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
    <div>
      <div className="flex max-w-[36rem] flex-col gap-2">
        <label htmlFor={inputId} className="display-plain text-sm text-chalk">
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
          className="w-full border border-steel-dim bg-graphite px-4 py-3 text-base text-chalk placeholder:text-steel transition-colors duration-[140ms] ease-[var(--ease-control)] focus:border-signal-lift"
        />
      </div>

      <p id={statusId} aria-live="polite" className="notation mt-6 text-2xs text-steel">
        {!hasQuery
          ? `${index.length} pages indexed. Start typing to filter them.`
          : results.length === 0
            ? "No matches"
            : results.length === 1
              ? "1 match"
              : `${results.length} matches`}
      </p>

      {hasQuery && results.length === 0 ? (
        <div className="mt-8 max-w-[36rem] border border-steel-dim p-8">
          <h2 className="display-condensed text-xl text-chalk">
            Nothing matches “{trimmed}”
          </h2>
          <p className="mt-4 text-base text-steel">
            Search looks for every word you type, so fewer words usually finds
            more.
          </p>
          <Link
            href="/technique"
            className="display-plain mt-6 inline-flex min-h-6 items-center text-sm text-chalk underline decoration-steel-dim underline-offset-[6px] transition-colors duration-[140ms] ease-[var(--ease-control)] hover:decoration-signal-lift"
          >
            Browse the Technique Library instead
          </Link>
        </div>
      ) : null}

      {results.length > 0 ? (
        <ul className="m-0 mt-8 grid max-w-[70rem] list-none gap-px bg-steel-dim p-0 sm:grid-cols-2">
          {results.map((result) => (
            <li key={result.id} className="bg-ink">
              <Link
                href={result.href}
                className="group flex h-full flex-col p-7 no-underline transition-colors duration-[140ms] ease-[var(--ease-control)] hover:bg-ink-raised"
              >
                <span className="notation text-2xs text-steel">
                  {result.kind}
                </span>
                <span className="display-condensed mt-4 text-lg text-chalk transition-colors duration-[140ms] ease-[var(--ease-control)] group-hover:text-signal-lift">
                  {result.title}
                </span>
                <span className="mt-3 text-sm text-steel">{result.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
