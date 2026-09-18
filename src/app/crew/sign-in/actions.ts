"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";
import { verifyPassword } from "@/lib/portal/auth";
import { createSession, destroySession, sweepExpiredSessions } from "@/lib/portal/session";
import { portalUrl } from "@/lib/portal/routes";
import type { PortalFormState } from "@/lib/portal/form-state";
import { isDatabaseConfigured } from "@/lib/db/client";

/**
 * Signing in.
 *
 * Every export here is async, because a constant exported from a "use server"
 * file is stripped and arrives undefined on the client.
 */

async function clientKey(): Promise<string> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  return ip ? `crew:${ip}` : "crew:unknown";
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

  // Tighter than the contact form's three in ten minutes: this is the door to
  // the order book, not a message box. The limiter is in-process and documented
  // as insufficient across instances — it raises the cost of casual guessing
  // rather than stopping a determined attack, which is what the 32-byte
  // password hash is for.
  const limit = checkRateLimit(await clientKey(), { limit: 5, windowMs: 15 * 60 * 1000 });

  if (!limit.allowed) {
    return {
      status: "error",
      message: `Too many attempts. Try again in ${limit.retryAfterSeconds} seconds.`,
    };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || password === "") {
    return { status: "error", message: "Enter the password." };
  }

  const ok = await verifyPassword(password, hash);

  if (!ok) {
    // One message for a wrong password and for anything else that failed. There
    // is one account, so there is nothing to enumerate, and nothing to gain by
    // being more specific.
    return { status: "error", message: "That password is not right." };
  }

  await sweepExpiredSessions();

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

  const next = formData.get("next");
  const target =
    typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
      ? next
      : portalUrl();

  // Outside any try/catch: redirect() works by throwing, and a catch would
  // swallow it and leave the reader staring at a form that just worked.
  redirect(target);
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect(portalUrl("/sign-in"));
}
