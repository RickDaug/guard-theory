/**
 * The mail domain, defined independently of any provider.
 *
 * Same shape as the waitlist seam, for the same reason: nothing that composes a
 * message imports a provider SDK, and the provider is chosen in one place. When
 * Resend is swapped for something else, the templates do not move.
 */

/**
 * Four order messages, the list announcement, the waitlist's double opt-in
 * confirmation, a contact-form message forwarded to the owner, and "test".
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
  | "order-cancelled"
  | "announcement"
  | "waitlist-confirmation"
  | "contact-forward"
  | "crew-invite"
  | "crew-reset"
  | "test";

export type Email = {
  to: string;
  subject: string;
  /** Plain text. There is no HTML version, and that is a decision — see below. */
  body: string;
  /**
   * Sent to the provider as `Idempotency-Key`: the same key with the same body
   * inside 24 hours returns the first send instead of sending again (Resend,
   * checked 2026-09-18 against resend.com/docs/dashboard/emails/idempotency-keys;
   * 256 characters at most). For messages that must go at most once whoever
   * asks — the order confirmation, which the webhook, a Stripe retry and the
   * cron reconcile can all reach, and each announcement (a second line of
   * defence there, never the first: see `announcement.ts`). Never on a
   * deliberate resend from the portal, which is meant to go again.
   */
  idempotencyKey?: string;
  /**
   * Extra message headers, sent as Resend's `headers`. List mail only: the
   * announcement sets List-Unsubscribe and List-Unsubscribe-Post here (RFC
   * 8058), and no order message may carry either (see
   * src/lib/mail/list-unsubscribe.ts). Optional, because a test send has
   * nobody to unsubscribe.
   */
  headers?: Record<string, string>;
  /**
   * Where a reply goes, for this message only. Set on the contact forward so the
   * owner answers the sender straight from their inbox; everything else leaves
   * it unset and gets the deployment's `REPLY_TO_EMAIL`, if any.
   */
  replyTo?: string;
};

/**
 * What the ordinary send path writes to `email_log.status`
 * (0002_email_log.sql, 0008_email_not_delivered.sql).
 *
 * "not-delivered" is the log-only provider: nothing failed, and nothing went.
 * It is not "sent", so the confirmation path does not treat it as done and a
 * later send, once a provider is connected, can find it and try again.
 */
export type EmailStatus = "sent" | "failed" | "not-delivered";

/**
 * Everything `email_log.status` may hold: the above, plus the announcement's
 * claim ("pending", written before the provider is called) and "unknown" (the
 * provider never answered). 0017_announcement_campaign.sql is the other half
 * of this.
 */
export type EmailLogStatus = EmailStatus | "pending" | "unknown";

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
  | {
      ok: false;
      error: string;
      unknown: boolean;
      /**
       * How long the provider asked us to wait, from a 429's `Retry-After`.
       * Absent when it did not say.
       */
      retryAfterMs?: number;
    };

export interface MailProvider {
  readonly name: string;
  /** False when messages are logged rather than delivered. */
  readonly delivers: boolean;
  send(email: Email): Promise<SendResult>;
}
