# Editorial data model and access rules

## Tables
- authors: public byline identity, optionally linked to a staff profile.
- categories and tags: active taxonomy records.
- articles: structured content, editorial status, attribution, SEO fields, disclosure and publication timestamps.
- article_tags: many-to-many article taxonomy.
- article_revisions: append-only snapshots written by trusted server-side workflows.

Article body is JSONB so the editor can store a structured rich-text document. Search uses a generated English tsvector from title and excerpt. Public pages select only published article fields; the browser never queries the Supabase Data API.

## State model
draft → in_review → approved → scheduled → published → archived. The author may submit their own draft for review. Editors/admins own review, approval, scheduling, publication and archival transitions. Workflow transitions use a validated server action and the server-only transition RPC with revision/status-event writes.

## Server access model
- Browser: no Supabase client, key, direct API query or database access.
- Public visitors: server-rendered routes return active authors/categories/tags and published articles only. Server query helpers hard-code publication and active-state filters.
- Staff: server validates the Supabase Auth access token, reads the authoritative profile role, then performs explicitly authorized server-side operations.
- Contributor/journalist: own articles; create drafts; edit own draft and submit for review.
- Editor/admin: read and manage all editorial records.
- Commercial: no access to editorial drafts by default.
- Revisions: private server-side data; never returned to an unauthorized role. No update/delete path is exposed.

The application server uses a server-only Supabase secret key that bypasses RLS. Treat every use as privileged: public query helpers must constrain visibility, and staff mutations must re-check the verified actor, role, ownership and state. UI hiding is not a security control.

## Database posture and rollout
The target posture is RLS enabled on every application table with zero policies, no schema/table/type/sequence/function privileges for `PUBLIC`, `anon` or `authenticated`, and explicit grants to `service_role`. The only SECURITY DEFINER function in the application schema is the auth-user profile trigger, pinned to an empty search path.

The deny-all migration is staged at `supabase/pending/20261110120000_server_only_access_boundary.sql` and applied to a disposable local database in CI. Hosted Supabase still has its previous grants/policies until a separately reviewed, explicitly approved CLI promotion. No hosted migration has been applied by this change.
