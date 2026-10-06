import type { Metadata } from "next";
import Link from "next/link";
import { SetPasswordForm } from "./SetPasswordForm";
import { isDatabaseConfigured } from "@/lib/db/client";
import { PASSWORD_MIN_LENGTH, peekToken } from "@/lib/portal/users";
import { portalUrl } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Crew Portal",
  description: "Choose a password.",
  robots: { index: false, follow: false, nocache: true },
  // The link's token is in this page's address. Nothing here loads from
  // elsewhere, and this makes sure no address is ever sent onward if that changes.
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

/**
 * Where a set-password link lands. Looking at it uses nothing up: the token is
 * spent only when a password is saved, so a mail scanner that follows the link
 * first does not break it.
 */
export default async function SetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.t) ? params.t[0] : params.t;
  const view = token && isDatabaseConfigured() ? await peekToken(token).catch(() => null) : null;

  return (
    <main id="main" className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-[26rem]">
        <p className="notation text-2xs text-orchid">Crew Portal</p>
        <h1 className="display-condensed mt-6 mb-8 text-3xl text-chalk">
          {view?.purpose === "reset" ? "Choose a new password" : "Choose your password"}
        </h1>

        {view && token ? (
          <>
            <p className="mb-10 text-base text-steel">
              {`${view.displayName}, your username is `}
              <span className="text-chalk">{view.username}</span>
              {". You will use both to sign in."}
            </p>
            <SetPasswordForm token={token} username={view.username} minLength={PASSWORD_MIN_LENGTH} />
          </>
        ) : (
          <>
            <p className="mb-8 text-base text-steel">
              This link has been used or has run out. Ask the owner to send you a new one.
            </p>
            <Link
              href={portalUrl("/sign-in")}
              className="display-plain inline-flex min-h-6 items-center text-sm text-chalk underline underline-offset-[6px]"
            >
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
