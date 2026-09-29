import { randomUUID } from "node:crypto";
import { isDatabaseConfigured, query } from "../db/client.ts";
import { ephemeralStoreAllowed } from "../waitlist/fallback-stores.ts";
import type { ContactTopic } from "./form-state.ts";

/**
 * Where a contact message goes.
 *
 * The same shape as the waitlist seam, for the same reason: the action does not
 * know or care what is behind it, and the store is chosen in one place. The
 * store used to be a module-level NdjsonStore constructed inside a
 * `"use server"` file, which worked but put the storage decision in the middle
 * of the form handler.
 */

export type ContactMessage = {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  receivedAt: string;
};

export interface ContactStore {
  readonly name: string;
  readonly isDurable: boolean;
  /**
   * The new row's id, or null when it was not saved. The id is what the
   * forward records its delivery against.
   */
  save(message: ContactMessage): Promise<string | null>;
}

class PostgresContactStore implements ContactStore {
  readonly name = "postgres";
  readonly isDurable = true;

  async save(message: ContactMessage): Promise<string | null> {
    const id = randomUUID();
    try {
      await query(
        `
        insert into contact_message (id, name, email, topic, message, received_at)
        values ($1, $2, $3, $4, $5, $6)
        `,
        [
          id,
          message.name,
          message.email.toLowerCase(),
          message.topic,
          message.message,
          message.receivedAt,
        ],
      );
      return id;
    } catch (error) {
      console.error(
        "[guard-theory] failed to store contact message:",
        error instanceof Error ? error.message : error,
      );
      return null;
    }
  }
}

class MemoryContactStore implements ContactStore {
  readonly name = "in-memory (development only)";
  readonly isDurable = false;

  private warned = false;

  async save(): Promise<string | null> {
    if (!this.warned) {
      this.warned = true;
      console.warn(
        "[guard-theory] DATABASE_URL is not set: contact messages are being kept " +
          "in memory and will be lost when this process exits. Development only.",
      );
    }
    return randomUUID();
  }
}

class UnavailableContactStore implements ContactStore {
  readonly name = "unavailable (no DATABASE_URL)";
  readonly isDurable = false;

  async save(): Promise<string | null> {
    console.error(
      "[guard-theory] DATABASE_URL is not set in production. A contact message " +
        "was refused rather than accepted and dropped. Set it and redeploy.",
    );
    return null;
  }
}

let store: ContactStore | null = null;

export function getContactStore(): ContactStore {
  if (store) {
    return store;
  }

  if (isDatabaseConfigured()) {
    store = new PostgresContactStore();
  } else {
    store = ephemeralStoreAllowed()
      ? new MemoryContactStore()
      : new UnavailableContactStore();
  }

  return store;
}
