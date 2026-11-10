import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleStatus, Json } from "@/types/database";
import { transitionArticle } from "../actions";

type ArticlePageProps = {
  params: Promise<{ id: string }>;
};

function paragraphText(body: Json): string[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  const blocks = (body as { content?: unknown }).content;
  if (!Array.isArray(blocks)) return [];

  return blocks.flatMap((block: unknown) => {
    if (!block || typeof block !== "object") return [];
    const node = block as { type?: unknown; content?: unknown };
    if (node.type !== "paragraph" || !Array.isArray(node.content)) return [];
    const text = node.content
      .filter((item: unknown): item is { type: string; text: string } =>
        Boolean(item && typeof item === "object" &&
          (item as { type?: unknown }).type === "text" &&
          typeof (item as { text?: unknown }).text === "string"))
      .map((item) => item.text)
      .join("");
    return text ? [text] : [];
  });
}

function transitionForm(articleId: string, toStatus: ArticleStatus, label: string, note: string, primary = false) {
  return (
    <form action={transitionArticle} key={toStatus}>
      <input name="articleId" type="hidden" value={articleId} />
      <input name="toStatus" type="hidden" value={toStatus} />
      <input name="note" type="hidden" value={note} />
      <button className={primary ? "btn btn--primary" : "btn btn--secondary"} type="submit">{label}</button>
    </form>
  );
}

export default async function AdminArticleDetailPage({ params }: ArticlePageProps) {
  const profile = await requireRoles(["admin", "editor", "journalist", "contributor"]);
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: article, error } = await supabase
    .from("articles")
    .select("id,slug,title,excerpt,body,status,article_type,disclosure,author_id,created_by,category_id,seo_title,seo_description,scheduled_at,published_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !article) notFound();

  const [{ data: author }, { data: category }, { data: revisions }] = await Promise.all([
    supabase.from("authors").select("display_name").eq("id", article.author_id).maybeSingle(),
    article.category_id
      ? supabase.from("categories").select("name").eq("id", article.category_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("article_revisions")
      .select("id,revision_number,change_summary,created_at")
      .eq("article_id", article.id)
      .order("revision_number", { ascending: false })
      .limit(10),
  ]);

  const isEditor = profile.role === "admin" || profile.role === "editor";
  const isOwner = article.created_by === profile.id;
  const paragraphs = paragraphText(article.body);
  const actions = [];

  if (!isEditor && isOwner && article.status === "draft") {
    actions.push(transitionForm(article.id, "in_review", "Submit for review", "Submitted for editorial review", true));
  }
  if (isEditor && article.status === "in_review") {
    actions.push(transitionForm(article.id, "approved", "Approve article", "Approved by editor", true));
    actions.push(transitionForm(article.id, "draft", "Request changes", "Changes requested"));
  }
  if (isEditor && article.status === "approved") {
    actions.push(transitionForm(article.id, "published", "Publish now", "Published by editor", true));
  }
  if (isEditor && article.status === "published") {
    actions.push(transitionForm(article.id, "archived", "Archive article", "Archived by editor"));
  }
  if (isEditor && article.status === "scheduled") {
    actions.push(transitionForm(article.id, "approved", "Cancel schedule", "Scheduled publication cancelled"));
    if (!article.scheduled_at || new Date(article.scheduled_at) <= new Date()) {
      actions.push(transitionForm(article.id, "published", "Publish now", "Published by editor", true));
    }
  }

  return (
    <div className="wrap">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Editorial / Articles / {article.status.replace("_", " ")}</p>
          <h1 className="admin-title">{article.title}</h1>
          <p className="admin-subtitle">{article.excerpt ?? "No standfirst has been added."}</p>
        </div>
        <Link className="btn btn--secondary" href="/admin/articles">Back to articles</Link>
      </div>

      <div className="admin-notice">
        <strong>{article.status.replace("_", " ")}</strong>
        {" · "}{article.article_type.replace("_", " ")}
        {" · "}{article.disclosure === "none" ? "Independent editorial" : article.disclosure}
        {" · "}{author?.display_name ?? "Unknown author"}
        {category?.name ? " · " + category.name : ""}
      </div>

      {actions.length ? (
        <div className="btn-row" aria-label="Available editorial actions">{actions}</div>
      ) : null}

      <article className="admin-article-detail">
        <div className="admin-article-detail__body">
          {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : (
            <p className="muted">This draft has no body copy yet.</p>
          )}
        </div>
        <aside className="admin-article-detail__sidebar">
          <h2>Article details</h2>
          <dl>
            <div><dt>URL slug</dt><dd>{article.slug}</dd></div>
            <div><dt>Last updated</dt><dd><time dateTime={article.updated_at}>{new Date(article.updated_at).toLocaleString("en-GB")}</time></dd></div>
            <div><dt>Published</dt><dd>{article.published_at ? new Date(article.published_at).toLocaleString("en-GB") : "Not published"}</dd></div>
            <div><dt>SEO title</dt><dd>{article.seo_title ?? "Not set"}</dd></div>
            <div><dt>SEO description</dt><dd>{article.seo_description ?? "Not set"}</dd></div>
          </dl>
        </aside>
      </article>

      <section className="admin-revisions">
        <div className="admin-page-head">
          <div>
            <p className="admin-kicker">Audit trail</p>
            <h2 className="admin-title">Recent revisions</h2>
          </div>
        </div>
        {revisions?.length ? (
          <ol className="admin-list">
            {revisions.map((revision) => (
              <li className="admin-article-row" key={revision.id}>
                <span className="admin-article-row__title">Revision {revision.revision_number}</span>
                <span className="admin-article-row__meta">{revision.change_summary ?? "Content snapshot"}</span>
                <time className="admin-article-row__meta" dateTime={revision.created_at}>{new Date(revision.created_at).toLocaleString("en-GB")}</time>
              </li>
            ))}
          </ol>
        ) : (
          <div className="admin-empty"><p>No revision history is available.</p></div>
        )}
      </section>
    </div>
  );
}
