# WheresMaldives.com — Technical Architecture

Version 1.1 | Server-only Supabase access boundary

## Overview
One Next.js App Router application backed by Supabase PostgreSQL, Supabase Auth and Supabase Storage. Public content is server-rendered. The browser never receives a Supabase key or queries the Data API. The app server uses one server-only Supabase secret key and performs explicit authorization before returning private data or accepting mutations.

## Stack
| Layer | Choice |
|---|---|
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Design | Taste Skill `design-taste-frontend` |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth |
| Media | Supabase Storage |
| Validation | Zod |
| Forms | React Hook Form |
| Tests | Vitest + pgTAP; browser proof is a separate gate |
| Hosting | Vercel |
| Email | Resend, when configured |
| Analytics | PostHog or privacy-friendly alternative |

Avoid a separate CMS, search engine or job platform until measured need justifies it.

## Application structure
```text
src/
  app/
    (public)/
      page.tsx
      news/ category/ tag/ authors/
      hotels/ destinations/ atolls/ islands/
      experiences/ guides/ industry/
      about/ editorial-policy/ contact/ advertise/
    admin/
      articles/ authors/ categories/ tags/
      media/ hotels/ destinations/ enquiries/ users/
    api/
      newsletter/ enquiries/ webhooks/
  components/
    ui/ shell/ editorial/ property/ destination/ forms/
  features/
    articles/ hotels/ destinations/ newsletter/ enquiries/ users/
  lib/
    supabase/ auth/ permissions/ validation/ seo/ rate-limit/
  types/
supabase/
  migrations/
  seed/
docs/
```

## Rendering and data flow
- Public reads use Server Components and queries scoped to published/active records.
- Public database reads are dynamic and use `cache: "no-store"`; they are not shared through Next.js's data cache.
- Generate page metadata and canonical URLs.
- Revalidate public cache after authorized publish/unpublish/property changes (once caching is deliberately introduced).
- Admin routes require a verified Supabase Auth user and a profile role read from the database on the server.
- Server Actions handle same-origin mutations; Route Handlers handle webhooks/external endpoints.
- Validate each mutation with Zod, check role and record scope, and record audit events.
- The Next.js proxy may refresh an expiring auth cookie. It never decides authorization; every protected server operation verifies the user and role itself.

## Supabase client boundaries
- Exactly one Supabase client factory exists in `src/lib/supabase/server.ts`, marked `server-only`.
- It uses `SUPABASE_SECRET_KEY` (or the temporary legacy `SUPABASE_SERVICE_ROLE_KEY` fallback), disables session persistence/automatic refresh and applies a bounded no-store fetch.
- No browser client, `@supabase/ssr`, anon key or publishable key is used by application code.
- The secret key bypasses RLS. Therefore it is a high-impact credential and every data path is constrained in server code: public query helpers hard-code published/active filters; staff helpers verify the Auth user and authoritative `profiles.role`; mutations validate input and actor permissions before writing.
- RLS remains enabled with zero policies on application tables. `anon` and `authenticated` have no table or function grants. This is a deny-all backstop if a non-secret key is ever introduced accidentally. The server secret key is the only application credential with database access.
- `transition_article` is an invoker RPC executable only by `service_role`; it takes a verified actor id and checks the actor's database role and article ownership/state before performing its atomic transition.
- No identity token is forwarded as a PostgREST bearer token. Supabase Auth tokens are sent only to the Auth API for user verification/session refresh.

## Data domains
Identity: `profiles`, `authors`.
Editorial: `articles`, `article_revisions`, `categories`, `tags`, `article_tags`.
Media: `media_assets`.
Geography: `atolls`, `islands`.
Properties: `hotels`, `hotel_images`, `facilities`, `hotel_facilities`.
Audience/operations: `newsletter_subscribers`, `enquiries`, `audit_logs`.
Deferred commercial: `advertisers`, `campaigns`, `sponsored_placements`.

Use UUID primary keys, normalized slugs, foreign keys, timestamps and workload-appropriate indexes. Hotel belongs to island; island belongs to atoll. Articles have authors, optional categories and many-to-many tags. Property verification source, timestamp and actor must be traceable. Unknown facts remain null.

## RLS and grants
All application tables have RLS enabled and zero policies. Revoke `PUBLIC`, `anon` and `authenticated` table/sequence/function grants and revoke the global default EXECUTE grant for newly created functions. Explicitly grant the server's `service_role` access needed by the application. The only SECURITY DEFINER function in the application schema is the auth-user trigger that creates the initial profile; it is pinned to an empty search path. Catalog and pgTAP tests pin this posture. Platform-owned grants are documented as platform debt rather than treated as application defaults.

## Storage
Storage is not yet configured. When introduced, use server-mediated uploads or narrowly scoped signed upload flows; validate MIME, size and path. Store alt text, source/credit, dimensions and focal position. Upload permission does not imply publish permission.

## Search and SEO
Start with PostgreSQL full-text search and indexed normalized fields. Results include only published articles and active properties. Keep filters URL-addressable. Public pages server-render with canonical metadata, sitemap, robots, Open Graph and truthful structured data.

## Environments and secrets
Use separate development and production Supabase projects. Server runtime variables: `SUPABASE_URL`, `SUPABASE_SECRET_KEY` and `NEXT_PUBLIC_SITE_URL`. `SUPABASE_SERVICE_ROLE_KEY` is accepted temporarily as a server-only legacy fallback. Never set a Supabase key with a `NEXT_PUBLIC_` prefix. Keep operator database URLs outside the repository; migrations are applied by the CLI to an explicitly named target, never through the MCP or an implicit linked project. No hosted migration is authorized by this change.

## Observability
Structured logs without secrets/PII, error monitoring, uptime checks, backups and tested restore, migrations in source control, alerts for email/publishing failures.

## Architecture decisions
1. One Next.js App Router application; public content server-rendered.
2. Supabase relational backend; RLS deny-all for API roles, with the server secret as the only database credential.
3. Supabase Auth for staff identity; profiles are the authoritative application role source.
4. Custom editorial CMS for MVP; reassess only if editorial workflow outgrows it.
5. No booking engine in MVP; official outbound links and enquiries first.
6. English-first content; model entities for future localization.
7. PE `ui-design` governs screen design. Taste Skill supplements art direction and browser visual review.

## Supabase implementation status
The server-only client boundary is implemented. The deny-all grant migration is staged in `supabase/pending/` and is applied to the disposable local database in CI after the normal migration reset. It is deliberately not in `supabase/migrations/`, so a code merge cannot trigger a breaking hosted schema change. Until an operator separately promotes it, hosted databases retain their legacy anon/authenticated grants and policies. See `SUPABASE_SETUP.md` for the controlled promotion sequence.
