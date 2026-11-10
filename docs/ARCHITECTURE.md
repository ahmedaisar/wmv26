# WheresMaldives.com — Technical Architecture

Version 1.0 | Proposed baseline

## Overview
One Next.js App Router application backed by Supabase PostgreSQL, Supabase Auth and Supabase Storage. Public content is server-rendered and cacheable. Admin operations are authenticated, server-authorized and additionally constrained by RLS.

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
| Tests | Vitest + Playwright |
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
- Generate page metadata and canonical URLs.
- Revalidate public cache after authorized publish/unpublish/property changes.
- Admin routes require a session and role.
- Server Actions handle same-origin mutations; Route Handlers handle webhooks/external endpoints.
- Validate each mutation with Zod, check role and record scope, and record audit events.

## Supabase client boundaries
Create separate browser and server user-context clients. User-scoped server operations must forward the authenticated session so RLS applies. A privileged server-only client may be used only for narrowly defined jobs that cannot run under user-scoped RLS. Never expose service-role credentials to client bundles. Prefer user-scoped operations and RLS over bypassing RLS.

## Data domains
Identity: `profiles`, `authors`.
Editorial: `articles`, `article_revisions`, `categories`, `tags`, `article_tags`.
Media: `media_assets`.
Geography: `atolls`, `islands`.
Properties: `hotels`, `hotel_images`, `facilities`, `hotel_facilities`.
Audience/operations: `newsletter_subscribers`, `enquiries`, `audit_logs`.
Deferred commercial: `advertisers`, `campaigns`, `sponsored_placements`.

Use UUID primary keys, normalized slugs, foreign keys, timestamps and workload-appropriate indexes. Hotel belongs to island; island belongs to atoll. Articles have authors, optional categories and many-to-many tags. Property verification source, timestamp and actor must be traceable. Unknown facts remain null.

## RLS policy stance
Enable RLS on all tables exposed through Supabase APIs. Default is deny unless explicitly granted.
- Anonymous: select published articles and active properties only.
- Contributor: own permitted drafts/submissions.
- Journalist: own/assigned drafts, no publish.
- Editor: editorial read/write/publish.
- Commercial: assigned enquiries/campaigns; no editorial draft access by default.
- Administrator: privileged management.

Use carefully reviewed helper functions to avoid recursive profile-policy problems. Test anonymous access and every role.

## Storage
Separate public editorial/property assets from private unpublished uploads. Validate MIME, size and path. Store alt text, source/credit, dimensions and focal position. Upload permission does not imply publish permission.

## Search and SEO
Start with PostgreSQL full-text search and indexed normalized fields. Results include only published articles and active properties. Keep filters URL-addressable. Public pages server-render with canonical metadata, sitemap, robots, Open Graph and truthful structured data.

## Environments and secrets
Separate development, staging and production Supabase projects where practical. Map hosting environments to the correct project. Expected variable names only (never commit values): `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or current publishable key, `SUPABASE_SERVICE_ROLE_KEY` (server only if needed), `RESEND_API_KEY` and analytics keys if selected. No production secrets in PR logs or screenshots.

## Observability
Structured logs without secrets/PII, error monitoring, uptime checks, backups and tested restore, migrations in source control, alerts for email/publishing failures.

## Architecture decisions
1. One Next.js App Router application; public content server-rendered.
2. Supabase relational backend; RLS mandatory.
3. Custom editorial CMS for MVP; reassess only if editorial workflow outgrows it.
4. No booking engine in MVP; official outbound links and enquiries first.
5. English-first content; model entities for future localization.
6. PE `ui-design` governs screen design. Taste Skill `design-taste-frontend` supplements art direction and browser visual review; Node 22+ and Chrome/Edge/Chromium are required for browser checks.

## Open technical decisions
Confirm Supabase project/region, Vercel project/team/domain, newsletter and analytics providers, rich-text editor, image transformation/storage approach and staff role assignments.

## Supabase implementation status
The Supabase foundation now includes browser/server user-context clients, Zod-validated public environment values, local CLI configuration and a profile/role migration. No hosted project is linked and no remote migration has been applied. See `SUPABASE_SETUP.md` for local and hosted operator steps.
