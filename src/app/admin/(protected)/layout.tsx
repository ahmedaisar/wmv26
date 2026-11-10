import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { signOut } from "../actions";

const staffRoles = ["admin", "editor", "journalist", "contributor", "commercial"] as const;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRoles(staffRoles);

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-sand bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-12">
          <div className="flex items-center gap-8">
            <Link className="text-[11px] font-bold tracking-[0.2em] text-ocean" href="/admin">WM / WORKSPACE</Link>
            <span className="hidden text-xs text-muted md:inline">Editorial operations</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <span className="text-muted">{profile.display_name ?? "Staff"} · {profile.role}</span>
            <form action={signOut}>
              <button className="font-semibold text-ocean underline underline-offset-4" type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-12 md:px-12">{children}</main>
    </div>
  );
}
