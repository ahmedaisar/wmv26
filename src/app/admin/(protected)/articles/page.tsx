import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { transitionArticle } from "./actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleStatus } from "@/types/database";

const staffRoles = ["admin", "editor", "journalist", "contributor"] as const;
const statuses: ArticleStatus[] = ["draft", "in_review", "approved", "scheduled", "published", "archived"];

type ArticlesPageProps = {
  searchParams: Promise<{ q?: string; status?: string; page?: string; created?: string; error?: string }>;
};

export default async function AdminArticlesPage({ searchParams }: ArticlesPageProps) {
  const profile = await requireRoles(staffRoles);
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const search = (params.q ?? "").trim().slice(0, 100);
  const status = statuses.includes(params.status as ArticleStatus)
    ? (params.status as ArticleStatus)
    : null;
  const page = Math.max(1, Math.min(1000, Number.parseInt(params.page ?? "1", 10) || 1));
  const pageSize = 20;

  let query = supabase
    .from("articles")
    .select("id,slug,title,status,article_type,author_id,created_by,updated_at", { count: "exact" })
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("title", "%" + search + "%");

  const { data: articles, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  const authorIds = Array.from(new Set((articles ?? []).map((article) => article.author_id)));
  let authorNames = new Map<string, string>();

  if (authorIds.length) {
    const { data: authors } = await supabase.from("authors").select("id,display_name").in("id", authorIds);
    authorNames = new Map((authors ?? []).map((author) => [author.id, author.display_name]));
  }

  const pageCount = Math.max(1, Math.ceil((count ?? 0) / pageSize));
  const queryString = new URLSearchParams();
  if (search) queryString.set("q", search);
  if (status) queryString.set("status", status);

  return (
    <div className="wrap">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Editorial</p>
          <h1 className="admin-title">Articles</h1>
          <p className="admin-subtitle">Draft, review and keep track of the stories in your publishing pipeline.</p>
        </div>
        <Link className="btn btn--primary" href="/admin/articles/new">New article <span aria-hidden="true">↗</span></Link>
      </div>

      {params.error === "transition" ? (
        <div className="admin-notice" role="alert">That editorial transition is not available for your role or the article&apos;s current status.</div>
      ) : null}
      {params.created === "1" ? (
        <div className="admin-notice" role="status">Draft created. It is saved privately until an editor publishes it.</div>
      ) : null}

      <form action="/admin/articles" className="admin-filter" method="get">
        <label className="field">
          <span className="field__label">Search titles</span>
          <input className="field__input" defaultValue={search} name="q" placeholder="Search articles" type="search" />
        </label>
        <label className="field">
          <span className="field__label">Status</span>
          <select className="field__input" defaultValue={status ?? ""} name="status">
            <option value="">All accessible statuses</option>
            {statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
          </select>
        </label>
        <button className="btn btn--secondary" type="submit">Filter</button>
        {(search || status) ? <Link className="btn btn--ghost" href="/admin/articles">Clear</Link> : null}
      </form>

      {error ? (
        <div className="admin-notice" role="alert">Articles could not be loaded. Confirm the Supabase migrations and access policies are applied.</div>
      ) : articles?.length ? (
        <>
          <div className="admin-list" aria-label="Articles">
            {articles.map((article) => (
              <div className="admin-article-row" key={article.id}>
                <div>
                  <Link className="admin-article-row__title" href={"/admin/articles/" + article.id}>{article.title}</Link>
                  <div className="admin-article-row__meta">
                    {article.article_type.replace("_", " ")} · {authorNames.get(article.author_id) ?? "Author"}
                  </div>
                </div>
                <div className="admin-row-actions">
                  <span className="admin-status">{article.status.replace("_", " ")}</span>
                  {profile.role !== "admin" && profile.role !== "editor" && article.created_by === profile.id && article.status === "draft" ? (
                    <form action={transitionArticle}>
                      <input name="articleId" type="hidden" value={article.id} />
                      <input name="toStatus" type="hidden" value="in_review" />
                      <input name="note" type="hidden" value="Submitted for editorial review" />
                      <button className="btn btn--secondary btn--sm" type="submit">Submit for review</button>
                    </form>
                  ) : null}
                  {(profile.role === "admin" || profile.role === "editor") && article.status === "in_review" ? (
                    <>
                      <form action={transitionArticle}>
                        <input name="articleId" type="hidden" value={article.id} />
                        <input name="toStatus" type="hidden" value="approved" />
                        <input name="note" type="hidden" value="Approved by editor" />
                        <button className="btn btn--primary btn--sm" type="submit">Approve</button>
                      </form>
                      <form action={transitionArticle}>
                        <input name="articleId" type="hidden" value={article.id} />
                        <input name="toStatus" type="hidden" value="draft" />
                        <input name="note" type="hidden" value="Changes requested" />
                        <button className="btn btn--ghost btn--sm" type="submit">Request changes</button>
                      </form>
                    </>
                  ) : null}
                  {(profile.role === "admin" || profile.role === "editor") && article.status === "approved" ? (
                    <form action={transitionArticle}>
                      <input name="articleId" type="hidden" value={article.id} />
                      <input name="toStatus" type="hidden" value="published" />
                      <input name="note" type="hidden" value="Published by editor" />
                      <button className="btn btn--primary btn--sm" type="submit">Publish</button>
                    </form>
                  ) : null}
                  {(profile.role === "admin" || profile.role === "editor") && article.status === "published" ? (
                    <form action={transitionArticle}>
                      <input name="articleId" type="hidden" value={article.id} />
                      <input name="toStatus" type="hidden" value="archived" />
                      <input name="note" type="hidden" value="Archived by editor" />
                      <button className="btn btn--ghost btn--sm" type="submit">Archive</button>
                    </form>
                  ) : null}
                </div>
                <time className="admin-article-row__meta admin-article-row__date" dateTime={article.updated_at}>
                  {new Date(article.updated_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </time>
              </div>
            ))}
          </div>
          <div className="admin-pagination">
            <span className="admin-article-row__meta">Page {page} of {pageCount} · {count ?? 0} accessible articles</span>
            <div className="admin-pagination__actions">
              {page > 1 ? (
                <Link className="btn btn--secondary btn--sm" href={"/admin/articles?" + queryString.toString() + (queryString.size ? "&" : "") + "page=" + (page - 1)}>Previous</Link>
              ) : null}
              {page < pageCount ? (
                <Link className="btn btn--secondary btn--sm" href={"/admin/articles?" + queryString.toString() + (queryString.size ? "&" : "") + "page=" + (page + 1)}>Next</Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="admin-empty">
          <p className="admin-kicker">Nothing here yet</p>
          <h2>No articles match this view.</h2>
          <p>Start a draft or adjust the filters. Drafts remain private until an editor approves and publishes them.</p>
          <p><Link className="btn btn--primary" href="/admin/articles/new">Create the first draft</Link></p>
        </div>
      )}
    </div>
  );
}
