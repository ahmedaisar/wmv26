import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { signOut } from "../actions";

const staffRoles = ["admin", "editor", "journalist", "contributor", "commercial"] as const;

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireRoles(staffRoles);
  const canManageAuthors = profile.role === "admin" || profile.role === "editor";
  const canManageArticles = profile.role !== "commercial";

  return (
    <div className="admin-shell">
      <header className="nav">
        <div className="wrap nav__bar">
          <Link className="nav__logo" href="/admin">
            <span className="mark mark--initial" aria-hidden="true">W</span>
            <span>WHERESMALDIVES</span>
          </Link>
          <nav aria-label="Workspace navigation" className="nav__links">
            <span className="nav__item"><Link className="nav__link" href="/admin">Overview</Link></span>
            {canManageArticles ? <span className="nav__item"><Link className="nav__link" href="/admin/articles">Articles</Link></span> : null}
            {canManageAuthors ? (
              <span className="nav__item"><Link className="nav__link" href="/admin/authors">Authors</Link></span>
            ) : null}
          </nav>
          <div className="nav__actions">
            <span className="nav__profile">{profile.display_name ?? "Staff"} · {profile.role}</span>
            <form action={signOut}>
              <button className="btn btn--secondary btn--sm" type="submit">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
