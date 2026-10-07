/**
 * What the portal says about a message, in words that match what happened.
 *
 * `email_log.status` has been 'sent' or 'failed', and 'not-delivered' is the
 * third (0008_email_not_delivered.sql): the message was written to the log
 * because no mail provider is connected. Showing that as "Failed" sent the
 * owner looking for a provider error that did not exist; showing a log-only
 * send as "Sent." told them a buyer had been emailed when nobody had.
 */

export type EmailStatusView = { label: string; problem: boolean };

export function emailStatusView(status: string): EmailStatusView {
  if (status === "sent") {
    return { label: "Sent", problem: false };
  }

  if (status === "not-delivered") {
    return { label: "Not sent — no mail provider", problem: true };
  }

  return { label: "Failed", problem: true };
}

/**
 * The portal's answer after a Resend button. `sent` is what sendEmail
 * returned, which is true for the log-only provider too — so whether a
 * provider actually delivers is asked separately.
 */
export function resendOutcome(
  sent: boolean,
  delivers: boolean,
): { status: "success" | "error"; message: string } {
  if (sent && delivers) {
    return { status: "success", message: "Sent." };
  }

  if (sent) {
    return {
      status: "error",
      message: "Not sent — no mail provider is connected, so it was written to the log instead.",
    };
  }

  return {
    status: "error",
    message: "It did not send. The reason is on the order, under Messages.",
  };
}
