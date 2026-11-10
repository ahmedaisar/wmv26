# Editorial data model and access rules

## Tables
- authors: public byline identity, optionally linked to a staff profile.
- categories and tags: active taxonomy records.
- articles: structured content, editorial status, attribution, SEO fields, disclosure and publication timestamps.
- article_tags: many-to-many article taxonomy.
- article_revisions: append-only snapshots written by trusted server-side workflows.

Article body is JSONB so the editor can store a structured rich-text document. Search uses a generated English tsvector from title and excerpt. The public API does not receive internal author profile IDs, creator/reviewer/publisher IDs, scheduled timestamps or search vector through anonymous column grants.

## State model
draft → in_review → approved → scheduled → published → archived. The author may submit their own draft for review. Editors/admins own review, approval, scheduling, publication and archival transitions. The database currently constrains direct author updates to draft/in_review and editor/admin updates to the full record. Workflow transitions should be implemented through validated Server Actions/RPCs with revision and audit writes.

## Access model
- Anonymous: active authors/categories/tags and published articles only.
- Contributor/journalist: own articles; create drafts; edit own draft and submit for review.
- Editor/admin: read and manage all editorial records.
- Commercial: no access to editorial drafts by default.
- Revisions: authenticated users may read revisions only for articles visible to them; append is restricted to own drafts or editor/admin actions. No update/delete grants are issued.

RLS is enabled on every table. Table grants and column-level public grants are intentionally explicit. Future Server Actions must re-check role and record scope; UI hiding is not a security control.

## Important implementation boundary
This migration has not been applied to a hosted Supabase project. Run it locally with the Supabase CLI, inspect policies and test anon/authenticated roles before linking or pushing to a hosted database. Use explicit public article column selections in application queries.
