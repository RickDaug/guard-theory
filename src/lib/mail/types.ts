/**
 * The mail domain, defined independently of any provider.
 *
 * Same shape as the waitlist seam, for the same reason: nothing that composes a
 * message imports a provider SDK, and the provider is chosen in one place. When
 * Resend is swapped for something else, the templates do not move.
 */

/**
 * One real message, plus "test". `feat/commerce` adds "order-confirmation",
 * "order-in-process" and "order-shipped" along with the orders that produce
 * them.
 *
 * "test" is what `scripts/mail/test-send.ts` logs under. It must not be
 * "announcement": the send path skips anyone `email_log` says already has the
 * announcement, so a test logged under that name would drop its recipient from
 * the real one.
 */
export type EmailTemplate = "announcement" | "test";

export type Email = {
  to: string;
  subject: string;
  /** Plain text. There is no HTML version, and that is a decision — see below. */
  body: string;
};

export type SendResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string };

export interface MailProvider {
  readonly name: string;
  /** False when messages are logged rather than delivered. */
  readonly delivers: boolean;
  send(email: Email): Promise<SendResult>;
}
