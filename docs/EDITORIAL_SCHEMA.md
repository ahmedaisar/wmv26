# Editorial data model and access rules

## Tables
- `authors`: public byline identity, optionally linked to a staff profile.
- `categories` and `tags`: active taxonomy records.
- `articles`: structured content, editorial status, attribution, SEO fields, disclosure and publication timestamps.
- `article_tags`: many-to-many article taxonomy.
- `article_revisions`: append-only snapshots written by trusted database workflows.
- `article_status_events`: immutable editorial transition history.

Article body is JSONB. The current admin form creates paragraph blocks; a full block editor is not yet implemented. Search uses a generated English tsvector from title and excerpt. Anonymous column grants intentionally omit internal profile IDs, creator/reviewer/publisher IDs, scheduled timestamps and the search vector.

## State model
`draft → in_review → approved → scheduled → published → archived`. Contributors may submit their own drafts for review. Editors/admins own review, approval, scheduling, publication and archival transitions. Scheduled publication is not automatic: a trusted scheduler is a future capability.

## Access model
- **Anonymous:** active authors/categories/tags and published articles only, subject to explicit column grants and RLS.
- **Contributor/journalist:** read own articles and use the validated draft-creation and transition RPCs within ownership rules.
- **Editor/admin:** read and manage editorial records through the protected admin surface and validated RPCs.
- **Commercial:** no access to editorial drafts by default.
- **Revisions/events:** read access follows article visibility; writes are restricted to trusted RPCs. No client update/delete path is provided.

RLS is enabled on editorial tables. Grants are explicit. UI hiding is not an authorization control: Server Actions and RPCs must re-check the authenticated actor, role and record scope.

## Mutation boundary
Editorial writes are RPC-only for authenticated application clients:
- `create_article_draft(...)` is `SECURITY DEFINER`, checks `auth.uid()`, requires an eligible staff profile, validates author/category scope, inserts a draft and its initial revision atomically.
- `transition_article(...)` is `SECURITY DEFINER`, locks the target row, checks `auth.uid()`, profile role and ownership, validates the transition, and writes the article update, revision and status event atomically.
- Authenticated clients have no direct INSERT/UPDATE/DELETE grants on `articles`, no direct INSERT on `article_revisions` or `article_status_events`.
- Anonymous execution of `current_app_role()` and the draft RPC is revoked. Authenticated execution remains required for validated application calls.

Because these functions execute with definer privileges, every function must keep a safe, explicit `search_path`, qualify object names, validate all caller-controlled identifiers and avoid dynamic SQL. Review function ownership and grants as part of every migration.

## Hosted rollout boundary
The initial identity/editorial migrations are present in the connected Supabase project. The three PR #8 migrations (draft RPC, RPC-only write grants and anonymous helper revoke) have **not** been applied to the hosted project. Apply them only through a separately reviewed migration release after confirming project identity, backup/restore readiness, migration diff, rollback plan and hosted role tests.

Use explicit public article column selections in application queries. Never expose service-role credentials to browser code.
