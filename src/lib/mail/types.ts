/**
 * The mail domain, defined independently of any provider.
 *
 * Same shape as the waitlist seam, for the same reason: nothing that composes a
 * message imports a provider SDK, and the provider is chosen in one place. When
 * Resend is swapped for something else, the templates do not move.
 */

/**
 * Three order messages, the list announcement, the waitlist's double opt-in
 * confirmation, and "test".
 *
 * "test" is what `scripts/mail/test-send.ts` logs under. It must not be
 * "announcement": the send path skips anyone `email_log` says already has the
 * announcement, so a test logged under that name would drop its recipient from
 * the real one.
 */
export type EmailTemplate =
  | "order-confirmation"
  | "order-in-process"
  | "order-shipped"
  | "announcement"
  | "waitlist-confirmation"
  | "test";

export type Email = {
  to: string;
  subject: string;
  /** Plain text. There is no HTML version, and that is a decision — see below. */
  body: string;
  /**
   * Sent to Resend as `Idempotency-Key`: the same key with the same body inside
   * 24 hours returns the first send instead of sending again. Only for messages
   * that must go at most once whoever asks — the order confirmation, which the
   * webhook, a Stripe retry and the cron reconcile can all reach. Never on a
   * deliberate resend from the portal, which is meant to go again.
   */
  idempotencyKey?: string;
};

/**
 * `email_log.status`, as 0002_email_log.sql and 0008_email_not_delivered.sql
 * allow it.
 *
 * "not-delivered" is the log-only provider: nothing failed, and nothing went.
 * It is not "sent", so the confirmation path does not treat it as done and a
 * later send, once a provider is connected, can find it and try again.
 */
export type EmailStatus = "sent" | "failed" | "not-delivered";

export type SendResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string };

export interface MailProvider {
  readonly name: string;
  /** False when messages are logged rather than delivered. */
  readonly delivers: boolean;
  send(email: Email): Promise<SendResult>;
}
