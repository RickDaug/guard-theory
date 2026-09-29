import type { Metadata } from "next";
import { UtilityPage } from "@/components/site/UtilityPage";
import { ConfirmForm } from "./ConfirmForm";
import {
  metaDescriptionFor,
  metaTitleFor,
  tokenFromSearchParams,
  type UnsubscribePageState,
} from "./copy";
import { copyFor } from "./outcome";

/**
 * The link at the foot of every list email.
 *
 * GET CHANGES NOTHING. It used to: one click on the link was the whole
 * interaction. But email security scanners (Outlook Safe Links, Mimecast and
 * the rest) fetch every link in a message before the reader sees it, so a GET
 * that wrote took people off the list silently (security audit 2026-09-29,
 * S3-3). A link with a token now shows a confirm button, and the POST behind
 * it does the write — see ConfirmForm and actions.ts.
 *
 * One click still exists where it belongs: each list email carries
 * `List-Unsubscribe` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
 * (RFC 8058), and a mail client's own Unsubscribe button POSTs to
 * /api/unsubscribe, which acts at once. RFC 8058 requires POST for exactly the
 * scanner reason above.
 *
 * The `<title>` never claims an outcome: on GET nothing has happened yet.
 *
 * Reaching it with no token at all is not an error. The links crawl fetches
 * this route directly, and a person can arrive here from a bookmark; both get
 * the explanation rather than a failure.
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ t?: string | string[] }>;

async function readToken(searchParams: SearchParams): Promise<string> {
  return tokenFromSearchParams((await searchParams).t);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const state: UnsubscribePageState = (await readToken(searchParams)) ? "confirm" : "no-token";

  return {
    title: metaTitleFor(state),
    description: metaDescriptionFor(state),
    robots: { index: false, follow: false },
    // The token is a bearer credential for one address. Keep it out of the
    // Referer sent to anything this page links to.
    referrer: "no-referrer",
  };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const token = await readToken(searchParams);

  if (token) {
    return <ConfirmForm token={token} />;
  }

  const { title, body, tone } = copyFor("no-token");

  return (
    <UtilityPage
      eyebrow="First Edition list"
      title={title}
      tone={tone}
      primary={{ href: "/", label: "Go to the home page" }}
      secondary={{ href: "/journal", label: "Read the Journal" }}
    >
      {body}
    </UtilityPage>
  );
}
