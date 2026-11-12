import {
  TOPIC_VALUES,
  type ContactFieldErrors,
  type ContactTopic,
} from "./form-state.ts";

/**
 * Server-side validation for the contact form, out of the "use server" file so
 * a unit test can reach it without a request.
 *
 * Every free-text field has a cap. The message always had one; the name did
 * not, so a single public POST could store a megabyte in `contact_message.name`.
 */

export const MAX_NAME = 100;
export const MAX_EMAIL = 254;
export const MAX_MESSAGE = 4000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ParsedContact = {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
};

export type ContactParse =
  | { ok: true; value: ParsedContact }
  | { ok: false; errors: ContactFieldErrors };

function readString(data: FormData, key: string): string {
  const raw = data.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function sanitise(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

export function parseContact(formData: FormData): ContactParse {
  const name = sanitise(readString(formData, "name"));
  const email = sanitise(readString(formData, "email"));
  const message = sanitise(readString(formData, "message"));
  const topicRaw = readString(formData, "topic");

  const errors: ContactFieldErrors = {};

  if (!name) {
    errors.name = "Enter your name so we know who we are replying to.";
  } else if (name.length > MAX_NAME) {
    errors.name = `Shorten your name to ${MAX_NAME} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Enter an email address so we can reply.";
  } else if (email.length > MAX_EMAIL) {
    errors.email = "That email address is too long. Check it for a typo.";
  } else if (!EMAIL.test(email)) {
    errors.email = "Enter an email address that includes an @ symbol and a domain.";
  }

  if (!message) {
    errors.message = "Write your message. Even one line is enough.";
  } else if (message.length > MAX_MESSAGE) {
    errors.message = `Shorten your message to ${MAX_MESSAGE} characters or fewer. It is currently ${message.length}.`;
  }

  // A fixed set; anything else is filed as "other", so its length is moot.
  const topic = (TOPIC_VALUES as string[]).includes(topicRaw)
    ? (topicRaw as ContactTopic)
    : "other";

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { name, email, topic, message } };
}
