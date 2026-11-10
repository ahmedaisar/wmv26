import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminAuthorsPage() {
  await requireRoles(["admin", "editor"]);
  const supabase = await createSupabaseServerClient();
  const { data: authors, error } = await supabase
    .from("authors")
    .select("id,slug,display_name,bio,profile_id,is_active,updated_at")
    .order("display_name");

  return (
    <div className="wrap">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Editorial / People</p>
          <h1 className="admin-title">Authors</h1>
          <p className="admin-subtitle">Manage public bylines and link them to staff accounts where contributors need to submit their own work.</p>
        </div>
        <Link className="btn btn--primary" href="/admin/authors/new">Add author <span aria-hidden="true">↗</span></Link>
      </div>

      {error ? (
        <div className="admin-notice" role="alert">Author records could not be loaded.</div>
      ) : authors?.length ? (
        <div className="admin-list">
          {authors.map((author) => (
            <div className="admin-article-row" key={author.id}>
              <div>
                <strong className="admin-article-row__title">{author.display_name}</strong>
                <div className="admin-article-row__meta">/{author.slug}{author.profile_id ? " · linked staff profile" : " · public byline only"}</div>
              </div>
              <span className="admin-status">{author.is_active ? "Active" : "Inactive"}</span>
              <time className="admin-article-row__meta admin-article-row__date" dateTime={author.updated_at}>
                {new Date(author.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-empty">
          <h2>No author profiles yet.</h2>
          <p>Add a public byline. To let a journalist or contributor write under that byline, link it to their staff profile UUID.</p>
          <p><Link className="btn btn--primary" href="/admin/authors/new">Create the first author</Link></p>
        </div>
      )}
    </div>
  );
}
