import { randomBytes, randomUUID } from "node:crypto";
import { query, queryOne } from "../db/client.ts";
import type { StoreResult, WaitlistStore, WaitlistSignup } from "./types.ts";

/**
 * The durable waitlist store.
 *
 * Replaces LocalFileWaitlistStore, which said of itself that a temp directory
 * "is not storage". This one is, so `isDurable` is finally true and the health
 * check stops being a warning.
 *
 * The loud-logging contract is carried over deliberately: a write that fails
 * returns `{ ok: false }` and prints, so the reader is told the truth and the
 * failure is visible in the logs. Silence is how the original defect survived
 * to production, and nothing here re-earns that.
 */

export function newUnsubscribeToken(): string {
  return randomBytes(32).toString("base64url");
}

type SignupRow = {
  id: string;
  unsubscribed_at: Date | null;
};

export class PostgresWaitlistStore implements WaitlistStore {
  readonly name = "postgres";
  readonly isDurable = true;

  async add(signup: WaitlistSignup): Promise<StoreResult> {
    try {
      // One statement, so a duplicate submitted twice at once cannot produce
      // two rows or a lost update. The unique index on email is the arbiter,
      // not a read-then-write check that has a race in the middle of it.
      //
      // A resubscribe is an update: it clears unsubscribed_at and refreshes the
      // details, because someone rejoining the list has plainly consented again.
      const rows = await query<SignupRow & { inserted: boolean }>(
        `
        insert into waitlist_signup (
          id, email, first_name, training_experience, sleeve_preference,
          product_interest, consent, submitted_at, unsubscribe_token, source
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'form')
        on conflict (email) do update set
          first_name          = excluded.first_name,
          training_experience = excluded.training_experience,
          sleeve_preference   = excluded.sleeve_preference,
          product_interest    = excluded.product_interest,
          unsubscribed_at     = null
        returning id, unsubscribed_at, (xmax = 0) as inserted
        `,
        [
          randomUUID(),
          signup.email.toLowerCase(),
          signup.firstName,
          signup.trainingExperience ?? null,
          signup.sleevePreference ?? null,
          signup.productInterest,
          signup.consent,
          signup.submittedAt,
          newUnsubscribeToken(),
        ],
      );

      const row = rows[0];

      if (!row) {
        // An insert that returns nothing is not a case Postgres produces here;
        // if it ever does, it is a failure, not a quiet success.
        console.error("[guard-theory] waitlist insert returned no row");
        return { ok: false, reason: "storage-unavailable" };
      }

      return { ok: true, alreadyOnList: !row.inserted };
    } catch (error) {
      console.error(
        "[guard-theory] failed to store waitlist signup:",
        error instanceof Error ? error.message : error,
      );
      return { ok: false, reason: "storage-unavailable" };
    }
  }
}

export type UnsubscribeResult = "unsubscribed" | "already" | "unknown-token" | "unavailable";

/**
 * Honours an unsubscribe token.
 *
 * Idempotent: following the same link twice is not an error, because a person
 * clicking twice has not done anything wrong. An unknown token is reported as
 * unknown rather than as success — telling someone they are unsubscribed when
 * no row changed is exactly the lie /unsubscribe used to tell.
 */
export async function unsubscribeByToken(token: string): Promise<UnsubscribeResult> {
  if (!token) {
    return "unknown-token";
  }

  try {
    const updated = await queryOne<{ id: string }>(
      `
      update waitlist_signup
         set unsubscribed_at = now()
       where unsubscribe_token = $1
         and unsubscribed_at is null
      returning id
      `,
      [token],
    );

    if (updated) {
      return "unsubscribed";
    }

    const existing = await queryOne<{ id: string }>(
      "select id from waitlist_signup where unsubscribe_token = $1",
      [token],
    );

    return existing ? "already" : "unknown-token";
  } catch (error) {
    console.error(
      "[guard-theory] failed to process unsubscribe:",
      error instanceof Error ? error.message : error,
    );
    return "unavailable";
  }
}
