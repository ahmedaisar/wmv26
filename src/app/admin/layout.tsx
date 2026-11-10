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
    <div className="taste-app" data-radius="soft">
      {children}
      <Script
        src="/taste-skill/assets/moments/moments.js"
        strategy="afterInteractive"
        type="module"
      />
    </div>
  );
}
