"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/portal/auth";
import { createSession, destroySession, sweepExpiredSessions } from "@/lib/portal/session";
import { portalUrl, safeNextPath } from "@/lib/portal/routes";
import {
  addressKey,
  beginLoginAttempt,
  markAttemptSucceeded,
  sweepLoginAttempts,
} from "@/lib/portal/attempts";
import type { PortalFormState } from "@/lib/portal/form-state";
import { isDatabaseConfigured } from "@/lib/db/client";

/**
 * Signing in.
 *
 * Every export here is async, because a constant exported from a "use server"
 * file is stripped and arrives undefined on the client.
 */

async function clientAddress(): Promise<string | null> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

export async function signIn(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const hash = process.env.PORTAL_PASSWORD_HASH?.trim();

  if (!hash || !isDatabaseConfigured()) {
    console.error(
      "[guard-theory] sign-in attempted with no PORTAL_PASSWORD_HASH or no DATABASE_URL",
    );
    return {
      status: "error",
      message: "The portal is not configured yet. Nothing you did caused this.",
    };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || password === "") {
    return { status: "error", message: "Enter the password." };
  }

  // The limiter lives in Postgres, so every instance counts against the same
  // numbers — see src/lib/portal/attempts.ts. The attempt is recorded before
  // the password is examined. If the limiter cannot be reached, nobody signs
  // in: the session table is in the same database, so there is nothing to gain
  // by pressing on, and an unmetered scrypt is the thing being defended.
  let gate;

  try {
    gate = await beginLoginAttempt(addressKey(await clientAddress(), hash));
  } catch (error) {
    console.error(
      "[guard-theory] sign-in limiter unavailable:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message: "We could not check that just now. Try again in a moment.",
    };
  }

  if (!gate.allowed) {
    return {
      status: "error",
      message: `Too many attempts. Try again in ${Math.ceil(gate.retryAfterSeconds / 60)} minutes.`,
    };
  }

  const ok = await verifyPassword(password, hash);

  if (!ok) {
    // One message for a wrong password and for anything else that failed. There
    // is one account, so there is nothing to enumerate, and nothing to gain by
    // being more specific.
    return { status: "error", message: "That password is not right." };
  }

  await markAttemptSucceeded(gate.attemptId).catch(() => {});
  await sweepExpiredSessions();
  await sweepLoginAttempts();

  try {
    await createSession();
  } catch (error) {
    // The password was right; the database was not reachable. Saying so beats
    // Next's "a server error occurred", which looks identical to a wrong
    // password and sends the owner looking in the wrong place.
    console.error(
      "[guard-theory] could not create a portal session:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message: "The password was right, but we could not start a session. Try again in a moment.",
    };
  }

  // An allowlist, inside the portal only. See safeNextPath.
  const target = safeNextPath(formData.get("next")) ?? portalUrl();

  // Outside any try/catch: redirect() works by throwing, and a catch would
  // swallow it and leave the reader staring at a form that just worked.
  redirect(target);
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect(portalUrl("/sign-in"));
}
