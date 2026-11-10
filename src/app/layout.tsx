import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wheresmaldives.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WheresMaldives.com — The Maldives. Beyond the Ordinary.",
    template: "%s | WheresMaldives.com",
  },
  description:
    "Independent Maldives travel and hospitality media, hotel discovery and island stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600&family=Red+Hat+Text:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
