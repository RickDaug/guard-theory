import { query } from "../db/client.ts";
import { toDecimalString } from "../money.ts";
import { toCsv, type CsvColumn } from "../portal/csv.ts";

/**
 * The sales records export: every paid order in a date range, as a file the
 * owner keeps and hands to whoever prepares the filing.
 *
 * WHAT THIS IS NOT
 *
 * It is a records export, not a tax computation. It prints what each order
 * charged — including the tax Stripe Tax calculated and collected — and adds
 * nothing up into a liability. Stripe Tax's own reports are the source of
 * truth for a return; this is the shop's side of the ledger to check them
 * against, and the file kept with the records.
 *
 * DATES ARE PACIFIC
 *
 * The seller is in California and CDTFA periods are California calendar
 * months and quarters, so "which month was this sale in" is answered in
 * America/Los_Angeles, not UTC. An order paid at 17:30 on 31 March Pacific is
 * a 1 April order in UTC and a Q1 order here. Every date column says so in its
 * header.
 *
 * MONEY IS CENTS
 *
 * Summed as integers and printed with toDecimalString, so no total in the
 * summary can be a float's rounding of the rows above it.
 */

export const PACIFIC = "America/Los_Angeles";

// -- Pacific calendar dates ---------------------------------------------------

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: PACIFIC,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hourCycle: "h23",
});

/** "2026-03-31" for the calendar date the instant falls on in California. */
export function pacificDate(instant: Date): string {
  const parts = Object.fromEntries(PARTS.formatToParts(instant).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** A real calendar date written YYYY-MM-DD, or null. "2026-02-30" is null. */
export function parseIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  if (y < 2000 || y > 2999) return null;
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d
    ? value
    : null;
}

function iso(y: number, m: number, d: number): string {
  return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function lastDay(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// -- Ranges --------------------------------------------------------------------

export const PRESETS = ["last-month", "last-quarter", "last-year", "this-year"] as const;
export type Preset = (typeof PRESETS)[number];

export const PRESET_LABEL: Record<Preset, string> = {
  "last-month": "Last month",
  "last-quarter": "Last quarter",
  "last-year": "Last calendar year",
  "this-year": "This calendar year to date",
};

/** Inclusive Pacific calendar dates. */
export type DateRange = { from: string; to: string };

/** A preset's dates, relative to today in California. */
export function presetRange(preset: Preset, now: Date): DateRange {
  const [y, m, d] = pacificDate(now).split("-").map(Number) as [number, number, number];

  switch (preset) {
    case "last-month": {
      const py = m === 1 ? y - 1 : y;
      const pm = m === 1 ? 12 : m - 1;
      return { from: iso(py, pm, 1), to: iso(py, pm, lastDay(py, pm)) };
    }
    case "last-quarter": {
      const quarter = Math.floor((m - 1) / 3); // 0..3, this quarter
      const qy = quarter === 0 ? y - 1 : y;
      const first = quarter === 0 ? 10 : (quarter - 1) * 3 + 1;
      return { from: iso(qy, first, 1), to: iso(qy, first + 2, lastDay(qy, first + 2)) };
    }
    case "last-year":
      return { from: iso(y - 1, 1, 1), to: iso(y - 1, 12, 31) };
    case "this-year":
      return { from: iso(y, 1, 1), to: iso(y, m, d) };
  }
}

export type ExportRequest = {
  range: DateRange;
  includeTest: boolean;
  file: "orders" | "summary";
};

/**
 * Why a request was refused. A code rather than a sentence, because it travels
 * back to the form in a query string: the page prints only sentences it owns,
 * never text a link supplied.
 */
export const EXPORT_ERRORS = {
  file: "Choose the orders file or the summary file.",
  "dates-missing": "Enter both dates for a custom range.",
  "dates-order": "The start date is after the end date.",
  range: "That date range is not one this export offers.",
  "no-db": "There is no database connected.",
} as const;
export type ExportError = keyof typeof EXPORT_ERRORS;

export function exportErrorMessage(code: unknown): string | null {
  return typeof code === "string" && Object.hasOwn(EXPORT_ERRORS, code)
    ? EXPORT_ERRORS[code as ExportError]
    : null;
}

/**
 * The export's query string, read strictly. A preset wins over typed dates;
 * "custom" needs both dates, real ones, in order. Anything else is a refusal
 * with a sentence, never a guessed range.
 */
export function readExportRequest(
  params: URLSearchParams,
  now: Date,
): { ok: true; request: ExportRequest } | { ok: false; code: ExportError } {
  const preset = params.get("preset") ?? "last-month";
  const includeTest = params.get("test") === "1";
  const fileParam = params.get("file") ?? "orders";

  if (fileParam !== "orders" && fileParam !== "summary") {
    return { ok: false, code: "file" };
  }

  let range: DateRange;

  if ((PRESETS as readonly string[]).includes(preset)) {
    range = presetRange(preset as Preset, now);
  } else if (preset === "custom") {
    const from = parseIsoDate(params.get("from"));
    const to = parseIsoDate(params.get("to"));
    if (!from || !to) {
      return { ok: false, code: "dates-missing" };
    }
    if (from > to) {
      return { ok: false, code: "dates-order" };
    }
    range = { from, to };
  } else {
    return { ok: false, code: "range" };
  }

  return { ok: true, request: { range, includeTest, file: fileParam } };
}

// -- Rows ----------------------------------------------------------------------

export type SalesOrder = {
  number: number | string;
  placed_at: Date;
  status: string;
  ship_state: string;
  ship_postal: string;
  ship_country: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  refunded_cents: number;
  refunded_at: Date | null;
  currency: string;
  stripe_payment_intent: string | null;
  stripe_mode: string;
};

/**
 * Every order paid in the range, oldest first.
 *
 * An order row exists only once Stripe has taken the payment, so placed_at is
 * the paid date. Cancelled orders are included: they were paid, and their
 * refund is on the row. Test-mode orders are excluded unless asked for, and
 * then marked in their own column.
 *
 * The SQL window is padded by a day each side and the exact Pacific-date cut
 * is made here, so the database's time zone data never decides which month a
 * sale belongs to.
 */
export async function loadSalesOrders(range: DateRange, includeTest: boolean): Promise<SalesOrder[]> {
  const start = new Date(`${range.from}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 1);
  const end = new Date(`${range.to}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 2);

  const rows = await query<SalesOrder>(
    `select number, placed_at, status, ship_state, ship_postal, ship_country,
            subtotal_cents, shipping_cents, tax_cents, total_cents,
            refunded_cents, refunded_at, currency, stripe_payment_intent, stripe_mode
       from "order"
      where placed_at >= $1 and placed_at < $2
        and ($3::boolean or stripe_mode = 'live')
      order by placed_at asc, number asc`,
    [start, end, includeTest],
  );

  return filterToRange(rows, range);
}

export function filterToRange<T extends { placed_at: Date }>(rows: T[], range: DateRange): T[] {
  return rows.filter((row) => {
    const day = pacificDate(row.placed_at);
    return day >= range.from && day <= range.to;
  });
}

const money = (cents: number) => toDecimalString(cents);
const net = (order: SalesOrder) => order.total_cents - order.refunded_cents;

const ORDER_COLUMNS: CsvColumn<SalesOrder>[] = [
  { header: "order number", value: (o) => String(o.number), literal: true },
  { header: "paid date (Pacific time)", value: (o) => pacificDate(o.placed_at), literal: true },
  { header: "status", value: (o) => o.status },
  // State and ZIP only: the destination is what a sales-tax record needs, and
  // the rest of the address is personal data this file has no use for.
  { header: "ship-to state", value: (o) => o.ship_state },
  { header: "ship-to ZIP", value: (o) => o.ship_postal },
  { header: "ship-to country", value: (o) => o.ship_country },
  { header: "items subtotal", value: (o) => money(o.subtotal_cents), literal: true },
  { header: "shipping charged", value: (o) => money(o.shipping_cents), literal: true },
  { header: "tax charged", value: (o) => money(o.tax_cents), literal: true },
  { header: "total charged", value: (o) => money(o.total_cents), literal: true },
  { header: "refunded", value: (o) => money(o.refunded_cents), literal: true },
  {
    header: "refund recorded date (Pacific time)",
    value: (o) => (o.refunded_at ? pacificDate(o.refunded_at) : ""),
    literal: true,
  },
  { header: "net (total charged minus refunded)", value: (o) => money(net(o)), literal: true },
  { header: "currency", value: (o) => o.currency },
  { header: "Stripe payment id", value: (o) => o.stripe_payment_intent },
  { header: "Stripe mode", value: (o) => o.stripe_mode },
];

export function ordersCsv(orders: SalesOrder[]): string {
  return toCsv(orders, ORDER_COLUMNS);
}

// -- Summary -------------------------------------------------------------------

export type SummaryRow = {
  grouping: string;
  group: string;
  orders: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  refunded: number;
  net: number;
};

function empty(grouping: string, group: string): SummaryRow {
  return { grouping, group, orders: 0, subtotal: 0, shipping: 0, tax: 0, total: 0, refunded: 0, net: 0 };
}

function add(row: SummaryRow, order: SalesOrder): void {
  row.orders += 1;
  row.subtotal += order.subtotal_cents;
  row.shipping += order.shipping_cents;
  row.tax += order.tax_cents;
  row.total += order.total_cents;
  row.refunded += order.refunded_cents;
  row.net += net(order);
}

const normalise = (value: string) => value.trim().toUpperCase();

/** California vs everything else: the line CDTFA's return draws. */
export function destination(order: SalesOrder): string {
  if (normalise(order.ship_country) !== "US") return "Outside the US";
  return normalise(order.ship_state) === "CA" ? "California" : "Other US states";
}

/**
 * Totals by Pacific month, by California vs out of state, by state, and
 * overall. Refunds sit in the month the ORDER was paid, not the month the
 * money went back; the page says so.
 */
export function summarise(orders: SalesOrder[]): SummaryRow[] {
  const months = new Map<string, SummaryRow>();
  const destinations = new Map<string, SummaryRow>();
  const states = new Map<string, SummaryRow>();
  const all = empty("all orders in range", "total");

  const bucket = (map: Map<string, SummaryRow>, grouping: string, key: string) => {
    let row = map.get(key);
    if (!row) {
      row = empty(grouping, key);
      map.set(key, row);
    }
    return row;
  };

  for (const order of orders) {
    add(bucket(months, "month paid (Pacific time)", pacificDate(order.placed_at).slice(0, 7)), order);
    add(bucket(destinations, "destination", destination(order)), order);
    const state =
      normalise(order.ship_country) === "US"
        ? normalise(order.ship_state)
        : `${normalise(order.ship_country)} ${normalise(order.ship_state)}`.trim();
    add(bucket(states, "ship-to state", state), order);
    add(all, order);
  }

  const DESTINATION_ORDER = ["California", "Other US states", "Outside the US"];
  const sorted = (map: Map<string, SummaryRow>) =>
    [...map.values()].sort((a, b) => (a.group < b.group ? -1 : a.group > b.group ? 1 : 0));

  return [
    ...sorted(months),
    ...DESTINATION_ORDER.flatMap((key) => destinations.get(key) ?? []),
    ...sorted(states),
    all,
  ];
}

const SUMMARY_COLUMNS: CsvColumn<SummaryRow>[] = [
  { header: "grouping", value: (r) => r.grouping },
  { header: "group", value: (r) => r.group },
  { header: "orders", value: (r) => r.orders, literal: true },
  { header: "items subtotal", value: (r) => money(r.subtotal), literal: true },
  { header: "shipping charged", value: (r) => money(r.shipping), literal: true },
  { header: "tax charged", value: (r) => money(r.tax), literal: true },
  { header: "total charged", value: (r) => money(r.total), literal: true },
  { header: "refunded", value: (r) => money(r.refunded), literal: true },
  { header: "net (total charged minus refunded)", value: (r) => money(r.net), literal: true },
];

export function summaryCsv(orders: SalesOrder[]): string {
  return toCsv(summarise(orders), SUMMARY_COLUMNS);
}

export function exportFilename(request: ExportRequest): string {
  const kind = request.file === "orders" ? "orders" : "summary";
  const test = request.includeTest ? "-INCLUDES-TEST" : "";
  return `guard-theory-sales-records-${kind}-${request.range.from}-to-${request.range.to}${test}.csv`;
}
