"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/portal/auth";
import {
  SHARED_USERNAME,
  findSignInUser,
  isSharedPasswordDisabled,
  normaliseUsername,
  portalSecret,
  recordSignIn,
} from "@/lib/portal/users";
import { createSession, destroySession, sweepExpiredSessions } from "@/lib/portal/session";
import { portalUrl, safeNextPath } from "@/lib/portal/routes";
import {
  KNOWN_DEVICE_DAYS,
  addressKey,
  beginLoginAttempt,
  isKnownDevice,
  knownDeviceCookieName,
  markAttemptSucceeded,
  signKnownDevice,
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

/**
 * Burned on an unknown username, so a wrong name costs the same ~100ms of
 * scrypt as a wrong password and the timing does not say which it was.
 */
let decoy: Promise<string> | null = null;

export async function signIn(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const sharedHash = process.env.PORTAL_PASSWORD_HASH?.trim() || undefined;

  if (!isDatabaseConfigured()) {
    console.error("[guard-theory] sign-in attempted with no DATABASE_URL");
    return {
      status: "error",
      message: "The portal is not configured yet. Nothing you did caused this.",
    };
  }

  const password = formData.get("password");
  const rawUsername = formData.get("username");
  // Empty, or "owner": the shared owner password (PORTAL_PASSWORD_HASH), which
  // keeps working until the owner turns it off from Crew. Anything else is a
  // crew account.
  const username = typeof rawUsername === "string" ? normaliseUsername(rawUsername) : "";
  const shared = username === "" || username === SHARED_USERNAME;

  if (typeof password !== "string" || password === "") {
    return { status: "error", message: "Enter the password.", field: "password" };
  }

  if (username.length > 64 || password.length > 256) {
    return { status: "error", message: "That username and password do not match.", field: "password" };
  }

  let secret: string;

  try {
    secret = await portalSecret(sharedHash);
  } catch (error) {
    console.error(
      "[guard-theory] sign-in secret unavailable:",
      error instanceof Error ? error.message : error,
    );
    return {
      status: "error",
      message: "We could not check that just now. Try again in a moment.",
    };
  }

  // The limiter lives in Postgres, so every instance counts against the same
  // numbers — see src/lib/portal/attempts.ts. The attempt is recorded before
  // the password is examined. If the limiter cannot be reached, nobody signs
  // in: the session table is in the same database, so there is nothing to gain
  // by pressing on, and an unmetered scrypt is the thing being defended.
  //
  // A browser that has signed in before carries a signed known-device cookie and
  // is exempt from the all-callers cap, so a botnet saturating it cannot lock
  // the owner out. It is still held to its own per-address cap. The trade-off is
  // written up at the top of src/lib/portal/attempts.ts.
  const store = await cookies();
  const knownDevice = isKnownDevice(store.get(knownDeviceCookieName())?.value, secret);
  let gate;

  try {
    gate = await beginLoginAttempt(addressKey(await clientAddress(), secret), { knownDevice });
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

  // Who this is, or null. One message for a wrong password, an unknown name,
  // a turned-off account and a turned-off shared password, so the form cannot
  // be used to find out which usernames exist.
  let userId: string | null | undefined;

  if (shared) {
    const usable = sharedHash !== undefined && !(await isSharedPasswordDisabled().catch(() => true));
    if (usable && (await verifyPassword(password, sharedHash))) {
      userId = null;
    } else if (!usable) {
      decoy ??= hashPassword("decoy-never-a-password");
      await verifyPassword(password, await decoy);
    }
  } else {
    const user = await findSignInUser(username).catch(() => undefined);
    if (user) {
      if (await verifyPassword(password, user.password_hash)) {
        userId = user.id;
      }
    } else {
      decoy ??= hashPassword("decoy-never-a-password");
      await verifyPassword(password, await decoy);
    }
  }

  if (userId === undefined) {
    return {
      status: "error",
      message: shared ? "That password is not right." : "That username and password do not match.",
      field: "password",
    };
  }

  await markAttemptSucceeded(gate.attemptId).catch(() => {});
  await sweepExpiredSessions();
  await sweepLoginAttempts();

  try {
    await createSession(userId);
    if (userId) {
      await recordSignIn(userId).catch(() => {});
    }
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

  // Remember this browser, or refresh how long it is remembered. Keyed on the
  // portal secret (the shared password hash while there is one), so changing
  // it forgets every browser at once.
  store.set(knownDeviceCookieName(), signKnownDevice(secret), {
    httpOnly: true,
    // Only ever read by this form's own POST, so it never needs to travel cross-site.
    sameSite: "strict",
    // __Host- (production) requires Secure, Path=/ and no Domain.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: KNOWN_DEVICE_DAYS * 24 * 60 * 60,
  });

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
