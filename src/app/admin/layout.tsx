import type { Metadata } from "next";
import Script from "next/script";

import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Workspace | WheresMaldives.com",
    template: "%s | WheresMaldives Workspace",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Script
        src="/taste-skill/assets/moments/moments.js"
        strategy="afterInteractive"
        type="module"
      />
    </>
  );
}
