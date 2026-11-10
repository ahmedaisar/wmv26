import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const staffRoles = ["admin", "editor", "journalist", "contributor", "commercial"] as const;
const canCreateArticles = (role: string) => role !== "commercial";

export default async function AdminDashboardPage() {
  const profile = await requireRoles(staffRoles);
  const supabase = await createSupabaseServerClient();

  const [drafts, reviews, published, recent] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "in_review"),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("articles").select("id,title,status,updated_at").order("updated_at", { ascending: false }).limit(5),
  ]);

  const countLabel = (result: { error: unknown; count: number | null }) =>
    result.error ? "—" : String(result.count ?? 0);

  return (
    <>
      <section className="hero hero--editorial admin-moment">
        <div className="wrap hero__in">
          <div className="hero__kicker">
            <span className="dot" aria-hidden="true" />
            Editorial workspace · {profile.role}
          </div>
          <h1 className="admin-title">Your publishing desk.</h1>
          <p className="admin-subtitle">
            A focused place to draft, review and publish the stories that bring the Maldives into view.
          </p>
          <div className="hero__foot">
            <span className="muted">
              {profile.display_name ? "Welcome back, " + profile.display_name + "." : "Welcome to your workspace."}
            </span>
            {canCreateArticles(profile.role) ? <Link className="btn btn--primary" href="/admin/articles/new">Create an article <span aria-hidden="true">↗</span></Link> : null}
          </div>
        </div>
      </section>
      <section className="admin-marquee section">
        <div className="wrap">
          <p className="t-label">The editorial workflow</p>
          <div data-moment="marquee-row" data-moment-opts='{"speed": 36}'>
            <ul className="mo-mq__track">
              <li>Draft</li>
              <li>In review</li>
              <li>Fact-check</li>
              <li>Approved</li>
              <li>Scheduled</li>
              <li>Published</li>
              <li>Archived</li>
              <li>Distribution</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="admin-page-head">
            <div>
              <p className="admin-kicker">Your publishing desk</p>
              <h2 className="admin-title">Editorial activity</h2>
            </div>
            {canCreateArticles(profile.role) ? <Link className="btn btn--secondary" href="/admin/articles">View all articles <span aria-hidden="true">↗</span></Link> : null}
          </div>

          <div className="admin-metrics">
            <div className="admin-metric">
              <span className="admin-metric__label">Drafts</span>
              <strong className="admin-metric__value">{countLabel(drafts)}</strong>
            </div>
            <div className="admin-metric">
              <span className="admin-metric__label">In review</span>
              <strong className="admin-metric__value">{countLabel(reviews)}</strong>
            </div>
            <div className="admin-metric">
              <span className="admin-metric__label">Published</span>
              <strong className="admin-metric__value">{countLabel(published)}</strong>
            </div>
          </div>

          <div className="admin-page-head">
            <div>
              <p className="admin-kicker">Recently updated</p>
              <h2 className="admin-title">Your latest stories</h2>
            </div>
          </div>

          {recent.error ? (
            <div className="admin-notice" role="status">
              Article data is not available. Check that the local or hosted Supabase migrations have been applied.
            </div>
          ) : recent.data?.length ? (
            <div className="admin-list">
              {recent.data.map((article) => (
                <Link className="admin-article-row" href={"/admin/articles"} key={article.id}>
                  <span className="admin-article-row__title">{article.title}</span>
                  <span className="admin-status">{article.status.replace("_", " ")}</span>
                  <time className="admin-article-row__meta admin-article-row__date" dateTime={article.updated_at}>
                    {new Date(article.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                  </time>
                </Link>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <h2>No stories yet.</h2>
              <p>Your first article will appear here once you save a draft.</p>
              <p><Link className="btn btn--primary" href="/admin/articles/new">Write the first draft</Link></p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
