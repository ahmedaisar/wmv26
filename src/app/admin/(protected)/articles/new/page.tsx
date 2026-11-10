import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createArticleDraft } from "../actions";

type NewArticlePageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewArticlePage({ searchParams }: NewArticlePageProps) {
  const profile = await requireRoles(["admin", "editor", "journalist", "contributor"]);
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  let authorQuery = supabase
    .from("authors")
    .select("id,display_name,profile_id")
    .eq("is_active", true)
    .order("display_name");

  if (profile.role === "journalist" || profile.role === "contributor") {
    authorQuery = authorQuery.eq("profile_id", profile.id);
  }

  const [{ data: authors, error: authorError }, { data: categories }] = await Promise.all([
    authorQuery,
    supabase.from("categories").select("id,name").eq("is_active", true).order("sort_order"),
  ]);

  const canDisclose = profile.role === "admin" || profile.role === "editor";

  return (
    <div className="wrap">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Editorial / New</p>
          <h1 className="admin-title">Start a story.</h1>
          <p className="admin-subtitle">Create a private draft. It will not appear on the public website until it has passed editorial review and is published.</p>
        </div>
        <Link className="btn btn--secondary" href="/admin/articles">Back to articles</Link>
      </div>

      {params.error ? (
        <div className="admin-notice" role="alert">
          {params.error === "invalid"
            ? "Some fields are missing or invalid. Check the title, slug and author."
            : "The draft could not be saved. Check that the slug is unique and the selected author is active."}
        </div>
      ) : null}

      {authorError ? (
        <div className="admin-notice" role="alert">Author profiles could not be loaded. Check your workspace access.</div>
      ) : !authors?.length ? (
        <div className="admin-empty">
          <h2>No author profile is available.</h2>
          {canDisclose ? (
            <>
              <p>Create an author record before drafting. You can optionally link it to a staff profile using that profile&apos;s UUID.</p>
              <p><Link className="btn btn--primary" href="/admin/authors/new">Create an author profile</Link></p>
            </>
          ) : (
            <p>Ask an editor to create an author record linked to your staff profile before you submit a story.</p>
          )}
        </div>
      ) : (
        <form action={createArticleDraft} className="admin-form">
          <label className="field field--full">
            <span className="field__label">Headline</span>
            <input className="field__input" maxLength={180} name="title" placeholder="Write a clear, specific headline" required />
          </label>
          <label className="field">
            <span className="field__label">URL slug <span className="field__hint">Optional · generated from headline if blank</span></span>
            <input className="field__input" maxLength={180} name="slug" placeholder="story-url-slug" />
          </label>
          <label className="field">
            <span className="field__label">Article type</span>
            <select className="field__input" defaultValue="news" name="articleType">
              <option value="news">News</option>
              <option value="feature">Feature</option>
              <option value="interview">Interview</option>
              <option value="guide">Guide</option>
              <option value="press_release">Press release</option>
            </select>
          </label>
          <label className="field">
            <span className="field__label">Byline</span>
            <select className="field__input" name="authorId" required>
              <option value="">Select an author</option>
              {authors.map((author) => <option key={author.id} value={author.id}>{author.display_name}</option>)}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Category</span>
            <select className="field__input" defaultValue="" name="categoryId">
              <option value="">Uncategorized</option>
              {(categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </label>
          {canDisclose ? (
            <label className="field">
              <span className="field__label">Commercial disclosure</span>
              <select className="field__input" defaultValue="none" name="disclosure">
                <option value="none">Independent editorial</option>
                <option value="sponsored">Sponsored</option>
                <option value="affiliate">Affiliate</option>
              </select>
            </label>
          ) : null}
          <label className="field field--full">
            <span className="field__label">Standfirst <span className="field__hint">Up to 280 characters</span></span>
            <textarea className="field__input" maxLength={280} name="excerpt" rows={2} />
          </label>
          <label className="field field--full">
            <span className="field__label">Story body</span>
            <textarea className="field__input admin-body-input" name="body" placeholder="Write the first draft. Separate paragraphs with a blank line." rows={12} />
          </label>
          <label className="field">
            <span className="field__label">SEO title</span>
            <input className="field__input" maxLength={100} name="seoTitle" />
          </label>
          <label className="field">
            <span className="field__label">SEO description</span>
            <textarea className="field__input" maxLength={200} name="seoDescription" rows={2} />
          </label>
          <div className="btn-row">
            <button className="btn btn--primary" type="submit">Save private draft <span aria-hidden="true">↗</span></button>
            <Link className="btn btn--ghost" href="/admin/articles">Cancel</Link>
          </div>
        </form>
      )}
    </div>
  );
}
