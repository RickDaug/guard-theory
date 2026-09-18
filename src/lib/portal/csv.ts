/**
 * CSV, written by hand.
 *
 * Escaping a CSV field is one function; the part that actually needs care is
 * formula injection, and a library does not necessarily handle it. So this is
 * not a dependency avoided out of stubbornness — it is the part of the job
 * worth writing on purpose.
 *
 * FORMULA INJECTION
 *
 * A cell beginning `=`, `+`, `-`, `@`, tab or carriage return is executed as a
 * formula when the file is opened in Excel, Sheets or Numbers. A subscriber
 * whose name is `=HYPERLINK("http://evil","click")` becomes a working link in
 * the owner's spreadsheet, and `=IMPORTXML(...)` can exfiltrate the rest of the
 * sheet. The addresses in this export were typed by strangers into a public
 * form, so every text cell is neutralised.
 *
 * The neutralising prefix is a single quote, which spreadsheets read as "treat
 * this as text" and strip on display, so the owner sees the original value.
 */

const DANGEROUS_START = /^[=+\-@\t\r]/;

export function sanitizeTextCell(value: string): string {
  return DANGEROUS_START.test(value) ? `'${value}` : value;
}

function escapeCell(value: string): string {
  // A field containing a quote, a comma or a newline has to be quoted, and
  // quotes inside it doubled. RFC 4180.
  return /["\n\r,]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export type CsvColumn<T> = {
  header: string;
  /** Return the raw value. Sanitising and escaping happen here, not in callers. */
  value: (row: T) => string | number | null | undefined;
  /** Numbers and dates are not attacker-controlled, so they skip the prefix. */
  literal?: boolean;
};

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const lines = [columns.map((column) => escapeCell(column.header)).join(",")];

  for (const row of rows) {
    lines.push(
      columns
        .map((column) => {
          const raw = column.value(row);
          const text = raw === null || raw === undefined ? "" : String(raw);
          return escapeCell(column.literal ? text : sanitizeTextCell(text));
        })
        .join(","),
    );
  }

  // CRLF, because that is what RFC 4180 says and what Excel expects. A BOM is
  // prepended by the route so non-ASCII names survive Excel on Windows.
  return lines.join("\r\n");
}
