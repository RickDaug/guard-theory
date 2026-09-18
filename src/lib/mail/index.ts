import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/client.ts";
import type { Email, EmailTemplate, MailProvider, SendResult } from "./types.ts";

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

  constructor(apiKey: string, from: string) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(email: Email): Promise<SendResult> {
    // `fetch`, not the SDK. Sending is one POST with a JSON body, and that is
    // not a problem that earns a dependency — see docs/commerce-plan.md §15.
    let response: Response;

    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...(email.idempotencyKey ? { "Idempotency-Key": email.idempotencyKey } : {}),
        },
        body: JSON.stringify({
          from: this.from,
          to: [email.to],
          subject: email.subject,
          text: email.body,
          ...(email.headers ? { headers: email.headers } : {}),
        }),
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
      return {
        ok: false,
        unknown: isAmbiguousStatus(response.status),
        error: `${response.status}: ${detail.slice(0, 300)}`,
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
    console.warn(
      `[guard-theory] no mail provider connected. Not sent:\n` +
        `  to: ${email.to}\n  subject: ${email.subject}\n\n${email.body}\n`,
    );
    return { ok: true, providerId: null };
  }
}

let provider: MailProvider | null = null;

/** The one place a provider is chosen. */
export function getMailProvider(): MailProvider {
  if (provider) {
    return provider;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RECEIPT_FROM_EMAIL?.trim();

  provider = apiKey && from ? new ResendProvider(apiKey, from) : new LoggingProvider();

  return provider;
}

/**
 * Sends, records, and never throws.
 *
 * Returns whether it was delivered so a caller can report honestly, but no
 * caller may treat false as a reason to fail.
 *
 * There is no `orderId` argument here, and no `order_id` column behind it,
 * for the same reason the order templates are absent: this build has no
 * orders. `feat/commerce` restores both together.
 */
export async function sendEmail(
  template: EmailTemplate,
  email: Email,
): Promise<boolean> {
  return (await sendAndRecord(template, email)).ok;
}

/**
 * `sendEmail`, returning the provider's result instead of a boolean.
 *
 * For a caller that needs to tell a refusal from a send nobody can vouch for
 * (`unknown`, logged under that status). Same contract otherwise — it never
 * throws, and it logs.
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
): Promise<SendResult> {
  if (template === "announcement") {
    const error = "the announcement is sent by scripts/mail/send-announcement.ts, which claims first";
    console.error(`[guard-theory] refused to send ${template} to ${email.to}: ${error}`);
    return { ok: false, unknown: false, error };
  }

  const mail = getMailProvider();
  const result = await mail.send(email);

  if (!result.ok) {
    console.error(
      `[guard-theory] failed to send ${template} to ${email.to}: ${result.error}`,
    );
  }

  if (isDatabaseConfigured()) {
    try {
      await query(
        `insert into email_log (id, to_email, template, provider_id, status, error)
         values ($1, $2, $3, $4, $5, $6)`,
        [
          randomUUID(),
          email.to.toLowerCase(),
          template,
          result.ok ? result.providerId : null,
          result.ok ? "sent" : result.unknown ? "unknown" : "failed",
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

export type { Email, EmailTemplate, MailProvider, SendResult } from "./types.ts";
