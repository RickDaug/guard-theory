import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/client.ts";
import { SITE_NAME } from "../site.ts";
import type { Email, EmailStatus, EmailTemplate, MailProvider, SendResult } from "./types.ts";

/**
 * Sending mail, and never letting it break an order.
 *
 * THE RULE THIS FILE EXISTS FOR
 *
 * Email failure never blocks order processing. A provider outage must not turn
 * a paid order into a 500 that Stripe then retries; the payment is not in doubt
 * and the order is already written. So `sendEmail` does not throw. It records
 * what happened in `email_log` either way, logs loudly on failure in the same
 * house style as every other write on this site, and returns.
 *
 * The retry path is the portal: every order shows the state of each message it
 * should have sent, with a button to send it again.
 *
 * WHY PLAIN TEXT AND NO HTML PART
 *
 * A shop that sends an HTML receipt is a shop that has to maintain an HTML
 * receipt — table layouts, dark-mode inversions, Outlook. This site's whole
 * argument is that the writing carries it. A plain-text order confirmation
 * renders identically everywhere, cannot leak a tracking pixel, and reads the
 * way the rest of the site reads.
 */

class ResendProvider implements MailProvider {
  readonly name = "resend";
  readonly delivers = true;

  // Plain fields, not constructor parameter properties. `npm run test:unit`
  // runs under Node's type stripping, which cannot transform them — a
  // parameter property here fails to parse and takes every unit test that
  // transitively imports this file down with it, with an error that names
  // this line rather than the test.
  private readonly apiKey: string;
  private readonly from: string;
  private readonly replyTo: string | null;

  constructor(apiKey: string, from: string, replyTo: string | null) {
    this.apiKey = apiKey;
    this.from = from;
    this.replyTo = replyTo;
  }

  async send(email: Email): Promise<SendResult> {
    // `fetch`, not the SDK. Sending is one POST with a JSON body, and that is
    // not a problem that earns a dependency — see docs/commerce-plan.md §15.
    let response: Response;

    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: resendHeaders(this.apiKey, email),
        body: JSON.stringify(resendPayload(this.from, this.replyTo, email)),
        signal: AbortSignal.timeout(8_000),
      });
    } catch (error) {
      // No answer is not a "no". A request that timed out after Resend
      // accepted it looks exactly like one that never arrived, so this is
      // reported as unknown and nothing may retry it on its own.
      return {
        ok: false,
        unknown: true,
        error: `no answer from Resend: ${error instanceof Error ? error.message : String(error)}`,
      };
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const retryAfterMs = parseRetryAfter(response.headers.get("retry-after"));
      return {
        ok: false,
        unknown: isAmbiguousStatus(response.status),
        error: `${response.status}: ${detail.slice(0, 300)}`,
        ...(retryAfterMs === null ? {} : { retryAfterMs }),
      };
    }

    // A 2xx is an accepted message whether or not the body can be read. The
    // id is a convenience for the dashboard; losing it must not turn a sent
    // message into a failed one.
    const payload = (await response.json().catch(() => ({}))) as { id?: string };
    return { ok: true, providerId: payload.id ?? null };
  }
}

/**
 * `Retry-After` as milliseconds: whole seconds only, which is what Resend sends
 * on a 429. An HTTP date, a negative or anything unreadable is null — the
 * caller's own backoff applies instead.
 */
export function parseRetryAfter(value: string | null): number | null {
  const trimmed = value?.trim() ?? "";
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return null;
  }
  return Math.round(Number(trimmed) * 1000);
}

/**
 * Statuses that do not say whether the message went.
 *
 * A 5xx can come from a gateway in front of a Resend that accepted the
 * message. A 409 is Resend's answer to an idempotency key it has seen before:
 * either the earlier request is still in flight, or it finished with a
 * different payload — and in both cases there IS an earlier request. Every
 * other 4xx (a bad address, a bad key, the 429 quota) is a plain refusal.
 */
export function isAmbiguousStatus(status: number): boolean {
  return status >= 500 || status === 409;
}

/**
 * What runs before a provider is connected.
 *
 * It writes the whole message to the log rather than pretending to send it.
 * `delivers` is false and the portal says so, because a shop that thinks it has
 * emailed a customer and has not is worse off than one that knows it has not.
 */
class LoggingProvider implements MailProvider {
  readonly name = "log only (no mail provider connected)";
  readonly delivers = false;

  async send(email: Email): Promise<SendResult> {
    // Subject and size only. The body of an order email is a name, a postal
    // address and what was bought; function logs are not where that belongs,
    // and neither is the recipient's address.
    console.warn(
      `[guard-theory] no mail provider connected. Not sent: "${email.subject}" ` +
        `(${email.body.length} characters) to ${maskEmail(email.to)}`,
    );
    return { ok: true, providerId: null };
  }
}

/**
 * The body of Resend's POST. A function rather than an inline literal so the
 * test can see exactly what is sent without a network.
 *
 * `reply_to` is Resend's field name. It is only present when there is an
 * address to put in it, so a deployment without `REPLY_TO_EMAIL` sends the
 * same bytes it always has.
 */
export function resendPayload(from: string, replyTo: string | null, email: Email) {
  return {
    from: fromWithName(from),
    to: [email.to],
    subject: email.subject,
    text: email.body,
    ...(replyTo ? { reply_to: replyTo } : {}),
    // Message headers, only when the message has any (list mail), so every
    // other send is the same bytes as before.
    ...(email.headers && Object.keys(email.headers).length > 0 ? { headers: email.headers } : {}),
  };
}

/**
 * The From header, with a display name.
 *
 * `RECEIPT_FROM_EMAIL` is set as a bare address. Sent as-is, the inbox shows
 * the local part or the whole address where the shop name belongs, and a
 * receipt from a sender nobody recognises is the one that gets marked as spam.
 * A value that already carries a name (`Name <addr>`) is left as written.
 */
export function fromWithName(from: string): string {
  const value = from.trim();
  return value.includes("<") ? value : `${SITE_NAME} <${value}>`;
}

/**
 * The headers of Resend's POST. `Idempotency-Key` only when the message carries
 * one, so every other send is byte-for-byte what it was.
 */
export function resendHeaders(apiKey: string, email: Email): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {}),
  };
}

/**
 * `REPLY_TO_EMAIL`, when it is set and shaped like an address.
 *
 * The from-address has no mailbox behind it, so a customer who replies to an
 * order email gets a bounce until a forwarder exists at the mail host. This
 * lets the owner route replies somewhere that does exist in the meantime. It
 * is optional, and a malformed value is dropped with a warning rather than
 * refused: mail configuration must never be what stops an order email.
 */
export function readReplyTo(value: string | undefined = process.env.REPLY_TO_EMAIL): string | null {
  const replyTo = value?.trim();
  if (!replyTo) {
    return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo)) {
    console.warn(
      "[guard-theory] REPLY_TO_EMAIL is not an email address and was ignored; replies go to the from-address.",
    );
    return null;
  }
  return replyTo;
}

/** `s***@example.com` — enough to recognise in a log, not enough to harvest. */
export function maskEmail(address: string): string {
  const at = address.lastIndexOf("@");
  return at <= 0 ? "***" : `${address[0]}***${address.slice(at)}`;
}

let provider: MailProvider | null = null;

/** The one place a provider is chosen. */
export function getMailProvider(): MailProvider {
  if (provider) {
    return provider;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RECEIPT_FROM_EMAIL?.trim();

  provider =
    apiKey && from ? new ResendProvider(apiKey, from, readReplyTo()) : new LoggingProvider();

  return provider;
}

/**
 * Forgets the chosen provider so the next send reads the environment again.
 * For tests that switch between "no provider" and a connected one in one
 * process; nothing in the app changes its mail environment at runtime.
 */
export function resetMailProvider(): void {
  provider = null;
}

/**
 * What a send is recorded as. A provider that only logs reports success, and
 * used to be recorded as "sent" — which the confirmation path read as done, so
 * an order taken while mail was unconfigured never got its confirmation.
 */
export function logStatus(result: SendResult, delivers: boolean): EmailStatus {
  if (!result.ok) {
    return "failed";
  }
  return delivers ? "sent" : "not-delivered";
}

/**
 * Sends, records, and never throws.
 *
 * Returns whether it was delivered so a caller can report honestly, but no
 * caller may treat false as a reason to fail.
 *
 * `orderId` ties an order message to its order, which is how the portal shows
 * each order's mail state. List mail and `test` pass nothing: `email_log`
 * began without the column (0002_email_log.sql) and 0003_commerce.sql adds it,
 * nullable, with its foreign key.
 */
export async function sendEmail(
  template: EmailTemplate,
  email: Email,
  orderId: string | null = null,
): Promise<boolean> {
  return (await sendAndRecord(template, email, orderId)).ok;
}

/**
 * `sendEmail`, returning the provider's result instead of a boolean.
 *
 * For a caller that needs to tell a refusal from a send nobody can vouch for
 * (`result.unknown`). Same contract otherwise — it never throws, and it logs,
 * against `orderId` when there is one. The log row says "failed" for both
 * (`logStatus`): everything this path sends may be sent again — the order
 * confirmation carries an idempotency key — and the confirmation retry looks
 * for "failed" and "not-delivered" rows (0008_email_not_delivered.sql).
 *
 * NOT FOR THE ANNOUNCEMENT, and it refuses it. This path sends first and
 * writes the log afterwards, which is right for a message that may be sent
 * again and wrong for one that must arrive once. The list send claims its row
 * BEFORE the provider call — `claimRecipient` in `announcement.ts` — and an
 * announcement sent from here would go out unclaimed, past the one index that
 * stops a second copy.
 */
export async function sendAndRecord(
  template: EmailTemplate,
  email: Email,
  orderId: string | null = null,
): Promise<SendResult> {
  if (template === "announcement") {
    const error = "the announcement is sent by scripts/mail/send-announcement.ts or a portal campaign, which claim first";
    console.error(`[guard-theory] refused to send ${template} to ${maskEmail(email.to)}: ${error}`);
    return { ok: false, unknown: false, error };
  }

  const mail = getMailProvider();
  const result = await mail.send(email);

  if (!result.ok) {
    console.error(
      `[guard-theory] failed to send ${template} to ${maskEmail(email.to)}: ${result.error}`,
    );
  }

  if (isDatabaseConfigured()) {
    try {
      await query(
        `insert into email_log (id, order_id, to_email, template, provider_id, status, error)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          randomUUID(),
          orderId,
          email.to.toLowerCase(),
          template,
          result.ok ? result.providerId : null,
          logStatus(result, mail.delivers),
          result.ok ? null : result.error.slice(0, 1000),
        ],
      );
    } catch (error) {
      // The log failing must not fail the send either. Two layers of "never
      // let mail break an order" rather than one.
      console.error(
        "[guard-theory] could not record the email attempt:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  return result;
}

export type { Email, EmailStatus, EmailTemplate, MailProvider, SendResult } from "./types.ts";
