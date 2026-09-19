/**
 * Years for structured data, read out of the `lifespan` the registry already
 * carries — never supplied from anywhere else.
 *
 * `lifespan` is a display string that is only set when it has been verified
 * (see `Figure`). It is written in exactly two shapes, "1878-1941" and
 * "born 1958", and those are the only two this reads. Anything else — a
 * "c.", a question mark, a single bare year — returns nothing, because a
 * hedge on the page must not become a plain fact in the markup.
 *
 * A bare year is a valid reduced-precision ISO 8601 date, which is what
 * schema.org's `birthDate` takes. The registry records no day or month, so none
 * is stated.
 */
export function lifespanDates(lifespan: string | undefined): {
  birthDate?: string;
  deathDate?: string;
} {
  if (!lifespan) return {};

  const span = /^(\d{4})[-–](\d{4})$/.exec(lifespan);
  if (span) {
    const [, born, died] = span;
    if (born && died && Number(born) < Number(died)) {
      return { birthDate: born, deathDate: died };
    }
    return {};
  }

  const living = /^born (\d{4})$/.exec(lifespan);
  if (living?.[1]) return { birthDate: living[1] };

  return {};
}
