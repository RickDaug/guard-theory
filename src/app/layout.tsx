import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Guard Theory — No-gi grappling apparel",
    template: "%s · Guard Theory",
  },
  description:
    "Guard Theory makes no-gi grappling apparel and publishes a technical study of the guard. Position before submission. Systems before chaos.",
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
        {children}
      </body>
    </html>
  );
}
