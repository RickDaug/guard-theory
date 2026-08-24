/**
 * The mail domain, defined independently of any provider.
 *
 * Same shape as the waitlist seam, for the same reason: nothing that composes a
 * message imports a provider SDK, and the provider is chosen in one place. When
 * Resend is swapped for something else, the templates do not move.
 */

export type EmailTemplate =
  | "order-confirmation"
  | "order-in-process"
  | "order-shipped"
  | "announcement";

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
