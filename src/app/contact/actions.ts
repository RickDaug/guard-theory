"use server";

import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { NdjsonStore } from "@/lib/storage/ndjson-store";
import {
  TOPIC_VALUES,
  type ContactFieldErrors,
  type ContactFormState,
  type ContactTopic,
} from "@/lib/contact/form-state";

type StoredMessage = {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  receivedAt: string;
  [key: string]: unknown;
};

const store = new NdjsonStore<StoredMessage>("contact.ndjson");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 4000;

function readString(data: FormData, key: string): string {
  const raw = data.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function sanitise(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

async function clientKey(): Promise<string> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip ? `contact:${ip}` : "contact:unknown";
}

export async function sendMessage(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Honeypot. Reports success without storing, so a bot learns nothing.
  if (readString(formData, "website") !== "") {
    return { status: "success", message: "Message received.", errors: {} };
  }

  const limit = checkRateLimit(await clientKey(), {
    limit: 3,
    windowMs: 10 * 60 * 1000,
  });

  if (!limit.allowed) {
    return {
      status: "error",
      message: `That's several messages in a short time. Try again in ${limit.retryAfterSeconds} seconds.`,
      errors: {},
    };
  }

  const name = sanitise(readString(formData, "name"));
  const email = sanitise(readString(formData, "email"));
  const message = sanitise(readString(formData, "message"));
  const topicRaw = readString(formData, "topic");

  const errors: ContactFieldErrors = {};

  if (!name) {
    errors.name = "Enter your name so we know who we are replying to.";
  }

  if (!email) {
    errors.email = "Enter an email address so we can reply.";
  } else if (!EMAIL.test(email)) {
    errors.email = "Enter an email address that includes an @ symbol and a domain.";
  }

  if (!message) {
    errors.message = "Write your message. Even one line is enough.";
  } else if (message.length > MAX_MESSAGE) {
    errors.message = `Shorten your message to ${MAX_MESSAGE} characters or fewer. It is currently ${message.length}.`;
  }

  const topic = (TOPIC_VALUES as string[]).includes(topicRaw)
    ? (topicRaw as ContactTopic)
    : "other";

  if (Object.keys(errors).length > 0) {
    const count = Object.keys(errors).length;
    return {
      status: "error",
      message:
        count === 1
          ? "There is one problem with the form."
          : `There are ${count} problems with the form.`,
      errors,
    };
  }

  const stored = await store.append({
    name,
    email: email.toLowerCase(),
    topic,
    message,
    receivedAt: new Date().toISOString(),
  });

  if (!stored) {
    return {
      status: "error",
      message:
        "We could not save your message just now. Nothing was lost on your side — try again in a moment.",
      errors: {},
    };
  }

  return { status: "success", message: "Message received.", errors: {} };
}
