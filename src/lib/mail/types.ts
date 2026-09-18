/**
 * The mail domain, defined independently of any provider.
 *
 * Same shape as the waitlist seam, for the same reason: nothing that composes a
 * message imports a provider SDK, and the provider is chosen in one place. When
 * Resend is swapped for something else, the templates do not move.
 */

/**
 * Three order messages, the list announcement, and "test".
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
  | "test";

export type Email = {
  to: string;
  subject: string;
  /** Plain text. There is no HTML version, and that is a decision — see below. */
  body: string;
  /**
   * Extra message headers — `List-Unsubscribe` and its companion, for list
   * mail. Optional, because a test send has nobody to unsubscribe.
   */
  headers?: Record<string, string>;
  /**
   * Sent to the provider as `Idempotency-Key`. The same key twice is one
   * message, not two — for as long as the provider remembers it, which for
   * Resend is 24 hours (checked 2026-09-18 against
   * resend.com/docs/dashboard/emails/idempotency-keys; 256 characters at
   * most). A second line of defence, never the first: see `announcement.ts`.
   */
  idempotencyKey?: string;
};

/**
 * A failure is one of two different things, and the difference is whether it
 * is safe to try again.
 *
 * `unknown: false` — the provider answered and said no. Nothing went out.
 * `unknown: true`  — nobody knows. The request timed out, the connection
 * dropped, or the answer was a 5xx or a 409 from somewhere between here and
 * the mailbox. The message may be in the reader's inbox already, and the only
 * way to find out is to look in the provider's dashboard.
 */
export type SendResult =
  | { ok: true; providerId: string | null }
  | { ok: false; error: string; unknown: boolean };

/** What `email_log.status` may hold. Migration 0005 is the other half of this. */
export type EmailLogStatus = "pending" | "sent" | "failed" | "unknown";

export interface MailProvider {
  readonly name: string;
  /** False when messages are logged rather than delivered. */
  readonly delivers: boolean;
  send(email: Email): Promise<SendResult>;
}
