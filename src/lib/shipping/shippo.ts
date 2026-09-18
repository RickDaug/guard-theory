/**
 * USPS labels, bought server-side through Shippo.
 *
 * WHY THIS IS `fetch` AND NOT THE SDK
 *
 * The official `shippo` package is self-declared beta with breaking changes
 * between minor versions, is CJS-only, and pins a `zod` range. The surface used
 * here is two endpoints, both plain JSON POSTs with one auth header. That is
 * not a problem worth taking a beta dependency for.
 *
 * WHY NONE OF THIS TOUCHES THE CONTENT-SECURITY-POLICY
 *
 * Every call is server-to-server. CSP is a browser policy; it never sees a
 * request made from a route handler. `connect-src 'self'` is untouched, which
 * is the same reason the Stripe API calls are fine.
 */

const BASE = "https://api.goshippo.com";

/**
 * Current at the time of writing and the newest in Shippo's changelog.
 *
 * Sent explicitly rather than relying on the account default, for two reasons:
 * account defaults drift, and this header also decides the shape of webhook
 * payloads. An upgrade is irreversible on their side, so it should be a
 * deliberate edit here.
 */
const API_VERSION = "2018-02-08";

export type ShippoMode = "test" | "live" | "unknown";

export function shippoToken(): string | undefined {
  const token = process.env.SHIPPO_API_TOKEN?.trim();
  return token ? token : undefined;
}

export function isShippoConfigured(): boolean {
  return shippoToken() !== undefined;
}

/** Read from the token, the same way the Stripe mode is. A flag can be wrong. */
export function shippoMode(env: NodeJS.ProcessEnv = process.env): ShippoMode {
  const token = env.SHIPPO_API_TOKEN?.trim() ?? "";

  if (token.startsWith("shippo_live_")) {
    return "live";
  }

  if (token.startsWith("shippo_test_")) {
    return "test";
  }

  return "unknown";
}

/**
 * A Shippo failure, in words that are safe to show and to log.
 *
 * The raw response body used to be put in the Error message, which was then
 * logged and shown in the portal. A validation error from Shippo can quote the
 * address it was validating, so that put a customer's address in the function
 * logs. `message` here never contains a response body.
 *
 * `nothingBought` is what buyLabel needs to know before it lets the order be
 * tried again: true when Shippo answered no, or when the failure was before any
 * purchase was attempted; FALSE when the purchase request itself got no answer,
 * because then nobody knows whether postage was bought.
 */
export class ShippoError extends Error {
  readonly nothingBought: boolean;

  constructor(message: string, nothingBought: boolean) {
    super(message);
    this.name = "ShippoError";
    this.nothingBought = nothingBought;
  }
}

const PURCHASE_PATH = "/transactions";

async function shippo<T>(path: string, body: unknown): Promise<T> {
  const token = shippoToken();

  if (!token) {
    throw new ShippoError("SHIPPO_API_TOKEN is not set.", true);
  }

  let response: Response;

  try {
    response = await shippoFetch(path, token, body);
  } catch {
    throw new ShippoError(
      path === PURCHASE_PATH
        ? "Shippo did not answer the purchase request, so the label may or may not have been bought. Look in Shippo before trying again."
        : "Shippo did not answer. Nothing has been bought.",
      path !== PURCHASE_PATH,
    );
  }

  if (!response.ok) {
    // The status, never the body.
    throw new ShippoError(
      `Shippo refused the request (${response.status} on ${path}). Nothing has been bought.`,
      true,
    );
  }

  return (await response.json()) as T;
}

function shippoFetch(path: string, token: string, body: unknown): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${token}`,
      "SHIPPO-API-VERSION": API_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
}

export type Address = {
  name: string;
  street1: string;
  street2?: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string | null;
  email?: string | null;
};

/**
 * The parcel.
 *
 * A rashguard in a poly mailer. Overridable through the environment because it
 * is the one thing that changes when packaging changes, and it is not worth a
 * deploy.
 *
 * Worth knowing when tuning these: USPS removed the 4oz and 8oz commercial
 * tiers in July 2026, so everything under a pound is billed at the 12–15.99oz
 * rate. Shaving grams below a pound buys nothing.
 */
function parcel() {
  return {
    length: process.env.SHIP_PARCEL_LENGTH_IN ?? "12",
    width: process.env.SHIP_PARCEL_WIDTH_IN ?? "10",
    height: process.env.SHIP_PARCEL_HEIGHT_IN ?? "1",
    distance_unit: "in",
    weight: process.env.SHIP_PARCEL_WEIGHT_OZ ?? "10",
    mass_unit: "oz",
  };
}

export function shipFromAddress(): Address | null {
  const name = process.env.SHIP_FROM_NAME?.trim();
  const street1 = process.env.SHIP_FROM_STREET1?.trim();
  const city = process.env.SHIP_FROM_CITY?.trim();
  const state = process.env.SHIP_FROM_STATE?.trim();
  const zip = process.env.SHIP_FROM_ZIP?.trim();

  if (!name || !street1 || !city || !state || !zip) {
    return null;
  }

  return {
    name,
    street1,
    street2: process.env.SHIP_FROM_STREET2?.trim() || null,
    city,
    state,
    zip,
    country: process.env.SHIP_FROM_COUNTRY?.trim() || "US",
    phone: process.env.SHIP_FROM_PHONE?.trim() || null,
    email: process.env.SHIP_FROM_EMAIL?.trim() || null,
  };
}

type Rate = {
  object_id: string;
  amount: string;
  currency: string;
  provider: string;
  servicelevel?: { name?: string; token?: string };
  estimated_days?: number;
};

type Shipment = {
  status?: string;
  rates?: Rate[];
  messages?: { text?: string }[];
};

type Transaction = {
  object_id: string;
  status: string;
  label_url?: string;
  tracking_number?: string;
  tracking_url_provider?: string;
  messages?: { text?: string }[];
};

export type BoughtLabel = {
  transactionId: string;
  labelUrl: string;
  trackingNumber: string;
  trackingUrl: string | null;
  carrier: string;
  amount: string;
  currency: string;
};

/**
 * Buys one USPS Ground Advantage label.
 *
 * `async: false` on both calls, as a real JSON boolean. It defaults to TRUE on
 * the transaction endpoint, and omitting it returns a 2xx with no label, a
 * QUEUED status, and a polling loop nobody wanted. Sending the string "false"
 * has the same effect as omitting it, which is why the body is JSON rather
 * than form-encoded.
 */
export async function buyUspsLabel(to: Address, orderId: string): Promise<BoughtLabel> {
  const from = shipFromAddress();

  if (!from) {
    throw new ShippoError(
      "The ship-from address is not configured. Set SHIP_FROM_NAME, STREET1, CITY, STATE and ZIP.",
      true,
    );
  }

  const shipment = await shippo<Shipment>("/shipments/", {
    address_from: from,
    address_to: to,
    parcels: [parcel()],
    async: false,
  });

  const rates = shipment.rates ?? [];

  // usps_first and usps_parcel_select were retired in 2023. Ground Advantage
  // is the service; falling back to the cheapest USPS rate rather than failing
  // outright, because a renamed service level should not stop a parcel.
  const rate =
    rates.find((option) => option.servicelevel?.token === "usps_ground_advantage") ??
    rates
      .filter((option) => option.provider?.toUpperCase() === "USPS")
      .sort((a, b) => Number(a.amount) - Number(b.amount))[0];

  if (!rate) {
    // Shippo's own messages can quote the address back, so they are not
    // carried into the error, which is logged. The owner is looking at the
    // address already; the Shippo dashboard has the rest.
    throw new ShippoError(
      "Shippo returned no USPS rate for that address. Check the address on the order; Shippo's dashboard shows why.",
      true,
    );
  }

  const transaction = await shippo<Transaction>("/transactions", {
    rate: rate.object_id,
    label_file_type: "PDF_4x6",
    // Comes back on the tracking webhook, so Delivered can find the order
    // without a tracking-number index.
    metadata: `order:${orderId}`,
    async: false,
  });

  if (transaction.status !== "SUCCESS" || !transaction.label_url) {
    throw new ShippoError(
      "Shippo could not produce a label. Nothing has been bought; Shippo's dashboard shows why.",
      true,
    );
  }

  return {
    transactionId: transaction.object_id,
    labelUrl: transaction.label_url,
    trackingNumber: transaction.tracking_number ?? "",
    trackingUrl: transaction.tracking_url_provider ?? null,
    carrier: rate.provider ?? "USPS",
    amount: rate.amount,
    currency: rate.currency,
  };
}

/**
 * Fetches a fresh label URL.
 *
 * `label_url` is a pre-signed URL with an expiry baked into its query string,
 * and Shippo does not document how long it lasts. Storing it as though it were
 * permanent is a bug with a delayed fuse — so the transaction id is what gets
 * stored, and the link is re-fetched when someone actually wants to print.
 */
export async function refreshLabelUrl(transactionId: string): Promise<string | null> {
  const token = shippoToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${BASE}/transactions/${transactionId}`, {
    headers: {
      Authorization: `ShippoToken ${token}`,
      "SHIPPO-API-VERSION": API_VERSION,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    return null;
  }

  const transaction = (await response.json()) as Transaction;
  return transaction.label_url ?? null;
}
