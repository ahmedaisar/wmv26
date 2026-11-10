import Link from "next/link";
import { requireRoles } from "@/lib/auth";
import { createAuthor } from "../actions";

type NewAuthorPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function NewAuthorPage({ searchParams }: NewAuthorPageProps) {
  await requireRoles(["admin", "editor"]);
  const params = await searchParams;

  return (
    <div className="wrap">
      <div className="admin-page-head">
        <div>
          <p className="admin-kicker">Editorial / People / New</p>
          <h1 className="admin-title">Add an author.</h1>
          <p className="admin-subtitle">Create a public byline. Link a staff profile if the person will create and submit their own drafts.</p>
        </div>
        <Link className="btn btn--secondary" href="/admin/authors">Back to authors</Link>
      </div>

      {params.error ? (
        <div className="admin-notice" role="alert">
          {params.error === "invalid" ? "Check the author name, slug and profile UUID." : "The author could not be saved. The slug may already be in use."}
        </div>
      ) : null}

      <form action={createAuthor} className="admin-form">
        <label className="field field--full">
          <span className="field__label">Display name</span>
          <input className="field__input" maxLength={80} name="displayName" required />
        </label>
        <label className="field">
          <span className="field__label">URL slug <span className="field__hint">Optional · generated from name</span></span>
          <input className="field__input" maxLength={100} name="slug" placeholder="author-name" />
        </label>
        <label className="field">
          <span className="field__label">Staff profile UUID <span className="field__hint">Optional</span></span>
          <input className="field__input" name="profileId" placeholder="00000000-0000-0000-0000-000000000000" />
        </label>
        <label className="field field--full">
          <span className="field__label">Biography</span>
          <textarea className="field__input" maxLength={600} name="bio" rows={4} />
        </label>
        <div className="btn-row">
          <button className="btn btn--primary" type="submit">Save author <span aria-hidden="true">↗</span></button>
          <Link className="btn btn--ghost" href="/admin/authors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
