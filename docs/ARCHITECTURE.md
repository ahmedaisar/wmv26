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
| Design | Taste Skill design-taste-frontend |
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

## Rendering and data flow
- Public reads use Server Components and queries scoped to published/active records.
- Generate page metadata and canonical URLs.
- Revalidate public cache after authorized publish/unpublish/property changes.
- Admin routes require a session and role.
- Server Actions handle same-origin mutations; Route Handlers handle webhooks/external endpoints.
- Validate each mutation, check role and record scope, and record sensitive actions.

## Supabase implementation status
The first Supabase foundation adds browser/server user-context clients, Zod-validated public environment values, local CLI configuration and a profile/role migration. No hosted project is linked and no remote migration has been applied. See SUPABASE_SETUP.md for local and hosted operator steps.

## RLS policy stance
Enable RLS on all tables exposed through Supabase APIs. Default is deny unless explicitly granted. Anonymous users should read published articles and active properties only. Contributors and journalists are limited to permitted drafts; editors can publish; commercial access is restricted to assigned commercial records; administrators manage the system. Test anonymous access and every role.

## Environments and secrets
Separate development, staging and production Supabase projects where practical. Never expose service-role credentials to client bundles. Prefer user-scoped operations and RLS over bypassing RLS.
