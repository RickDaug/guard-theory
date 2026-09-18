import { timingSafeEqual } from "node:crypto";
import { query } from "@/lib/db/client";
import { shippoMode } from "@/lib/shipping/shippo";

/**
 * Shippo tracking, so an order marks itself Delivered.
 *
 * SHIPPO WEBHOOKS ARE UNSIGNED BY DEFAULT, AND THAT SHAPES THIS FILE
 *
 * Shippo offers three protections. HMAC signing exists but is not self-serve —
 * it takes an email to an account manager and up to ten business days — so it
 * is not available to a new account on a free plan. The two that are available
 * are a secret in the URL and an IP allowlist, and both are used.
 *
 * The secret is a path segment. That does NOT keep it out of logs — an earlier
 * version of this comment said it did, and it was wrong: Vercel's request logs
 * record the full path, so anyone who can read this project's logs can read the
 * secret. It is a shared secret with that exposure, no better. What limits the
 * damage is what the endpoint can do (next paragraph), the length floor below,
 * and rotating SHIPPO_WEBHOOK_TOKEN whenever someone leaves the Vercel team.
 *
 * That is proportionate rather than lax. The worst a forged request here can do
 * is mark an order Delivered early. No money moves, nothing ships, and nothing
 * is refunded. Compare the Stripe webhook next door, which is signature-checked
 * because a forged request there would invent an order.
 *
 * Even so, the payload is never trusted as fact: status only ever moves
 * forward, and only for a tracking number already in our database.
 *
 * RETURN 200, FAST, ALWAYS
 *
 * Shippo expects a 2xx within three seconds and retries only twice, and only on
 * 408/429/5xx — a 4xx is never retried. So an event we do not act on still
 * gets a 200, because the alternative is losing it permanently.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Shippo's published US egress addresses. Undated, so it warns rather than blocks. */
const KNOWN_IPS = new Set([
  "52.4.41.98",
  "52.23.121.194",
  "52.44.110.80",
  "54.81.253.187",
  "54.81.255.221",
]);

/**
 * A short token is a guessable token, and the comparison being constant-time
 * does not help with that. 32 characters of hex is 128 bits; anything shorter
 * is treated as not configured, so a weak secret fails closed (404 for
 * everyone) rather than quietly working.
 */
const MIN_TOKEN_LENGTH = 32;

function secretMatches(candidate: string): boolean {
  const expected = process.env.SHIPPO_WEBHOOK_TOKEN?.trim();

  if (!expected) {
    return false;
  }

  if (expected.length < MIN_TOKEN_LENGTH) {
    console.error(
      `[guard-theory] SHIPPO_WEBHOOK_TOKEN is shorter than ${MIN_TOKEN_LENGTH} characters and is being refused. ` +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
    return false;
  }

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);

  // Compared in constant time, and length-checked first because
  // timingSafeEqual throws on a mismatch rather than returning false.
  return a.length === b.length && timingSafeEqual(a, b);
}

type TrackingPayload = {
  event?: string;
  test?: boolean;
  data?: {
    tracking_number?: string;
    metadata?: string;
    tracking_status?: { status?: string; status_date?: string };
  };
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;

  if (!secretMatches(token)) {
    // 404, not 401: an endpoint that answers differently to a wrong secret is
    // an endpoint that confirms the right one exists.
    return new Response(null, { status: 404 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (ip && !KNOWN_IPS.has(ip)) {
    // Logged, not blocked. The published list carries no date, and silently
    // dropping real deliveries because Shippo added an address is worse than
    // accepting a request that already knew the secret.
    console.warn(`[guard-theory] Shippo webhook from an unlisted address: ${ip}`);
  }

  let payload: TrackingPayload;

  try {
    payload = (await request.json()) as TrackingPayload;
  } catch {
    return new Response("ok", { status: 200 });
  }

  if (payload.event !== "track_updated") {
    return new Response("ok", { status: 200 });
  }

  // Test payloads carry test: true. Without this check a preview deployment
  // sharing a webhook would move real orders.
  const expectTest = shippoMode() === "test";

  if (Boolean(payload.test) !== expectTest) {
    return new Response("ok", { status: 200 });
  }

  const status = payload.data?.tracking_status?.status;
  const trackingNumber = payload.data?.tracking_number;

  if (status !== "DELIVERED" || !trackingNumber) {
    return new Response("ok", { status: 200 });
  }

  try {
    // Advance-only and idempotent. `status = 'shipped'` in the WHERE clause is
    // what stops a late or duplicated event resurrecting a cancelled order or
    // re-stamping one that is already delivered.
    await query(
      `update "order"
          set status = 'delivered', delivered_at = now()
        where tracking_number = $1
          and status = 'shipped'`,
      [trackingNumber],
    );
  } catch (error) {
    console.error(
      "[guard-theory] could not apply a Shippo tracking update:",
      error instanceof Error ? error.message : error,
    );
    // 500 so Shippo retries — this is one of the statuses it retries on.
    return new Response("error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
