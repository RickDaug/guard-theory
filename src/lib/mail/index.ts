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
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [email.to],
          subject: email.subject,
          text: email.body,
        }),
        signal: AbortSignal.timeout(8_000),
      });

      if (!response.ok) {
        return { ok: false, error: `${response.status}: ${(await response.text()).slice(0, 300)}` };
      }

      const payload = (await response.json()) as { id?: string };
      return { ok: true, providerId: payload.id ?? null };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }
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
 */
export async function sendEmail(
  template: EmailTemplate,
  email: Email,
  orderId: string | null = null,
): Promise<boolean> {
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
        `insert into email_log (id, order_id, to_email, template, provider_id, status, error)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [
          randomUUID(),
          orderId,
          email.to.toLowerCase(),
          template,
          result.ok ? result.providerId : null,
          result.ok ? "sent" : "failed",
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

  return result.ok;
}

export type { Email, EmailTemplate, MailProvider, SendResult } from "./types.ts";
