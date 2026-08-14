import type { Metadata, Viewport } from "next";
import { MonogramDefs } from "@/components/brand/Monogram";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteStructuredData } from "@/components/site/SiteStructuredData";
import {
  IS_INDEXABLE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — No-gi grappling apparel`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  // Indexing is opt-in. Preview and staging deployments are noindex unless
  // NEXT_PUBLIC_ALLOW_INDEXING is explicitly switched on.
  robots: IS_INDEXABLE
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — No-gi grappling apparel`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — No-gi grappling apparel`,
    description: SITE_DESCRIPTION,
  },
};

/**
 * The brand ground, handed to the browser chrome. Without it a mobile browser
 * paints its address bar white above a near-black page and the site starts one
 * scroll behind itself. The value is `ink`; it is written literally because this
 * is metadata rather than CSS and cannot read a custom property.
 */
export const viewport: Viewport = {
  themeColor: "#1B1725",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full`}>
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MonogramDefs />
        <SiteHeader />
        {children}
        <SiteFooter />
        <SiteStructuredData />
      </body>
    </html>
  );
}
