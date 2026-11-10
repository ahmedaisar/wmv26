# Supabase setup

## Scope
This guide covers local Supabase setup, the server-only application client and staff authentication. Repository automation validates migrations against a disposable local database. It does not link or migrate a hosted project.

## Prerequisites
- Node.js 22+
- Docker Desktop/Engine for the local Supabase stack
- Supabase CLI 2.x for the current documented `--db-url` workflow

## Local development
1. Copy `.env.example` to `.env.local`.
2. Start local services: `npx supabase start`.
3. Apply migrations and reset local data: `npx supabase db reset`.
4. Set `SUPABASE_URL` to the local API URL and `SUPABASE_SECRET_KEY` to the local secret key. If the CLI only prints the legacy `service_role` key, it may be used as `SUPABASE_SERVICE_ROLE_KEY` during transition. Never put either key in a `NEXT_PUBLIC_` variable.
5. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and start Next.js with `npm run dev`.

The local Supabase stack is disposable development data. Never use production data for local experiments. The browser does not need a Supabase URL or key.

## Hosted project and deployment
- Store the project ref and database connection string in the operator's secret manager; never commit or paste them into chat.
- Configure `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel for Preview and Production environments before deploying this server-only architecture. Use the new Supabase secret key where available; the legacy `service_role` key is a temporary fallback and has the same high-impact server-only handling requirements.
- Do not add `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the app environment.
- Keep the CLI unlinked. Every hosted migration list/dry-run/apply command must name the target using that environment's operator-held `--db-url`; never use an implicit linked project.
- Read the production migration ledger and dry-run before any promotion. Production migrations are applied only at release, immediately before promotion, after the owner's explicit go-ahead.
- No hosted project migration or key rotation is authorized by this code change.

## Staff access
Signup is disabled. Provision staff accounts through a trusted Supabase operator workflow, then verify the profiles row created by the auth trigger. New users default to contributor. Role elevation is an operator-only task until the admin user-management feature is implemented. Do not share credentials in issues or pull requests.

## Client boundaries
- Browser: no Supabase client, key, API query or direct database access.
- Server: one `server-only` Supabase client using the secret key, with session persistence disabled, no-store fetches and a bounded request timeout.
- Auth tokens live only in HttpOnly cookies and are sent to Supabase Auth for verification/refresh, never as the PostgREST bearer credential.
- Application tables have RLS enabled with zero policies and no grants to `anon` or `authenticated`. The server secret key is privileged; all public filters and staff authorization must therefore be enforced in server code.
- The server-side authorization helper validates Supabase Auth identity and reads `profiles.role` from the database. Never trust client-supplied roles or auth metadata.

## Before production
- Confirm Vercel Preview and Production each have the correct environment-specific server secret.
- Review the migration against the actual project and Supabase version.
- Verify the migration ledger and compatibility window before applying.
- Test signed-out public reads, staff session refresh, role denial and every protected operation.
- Configure email provider, SMTP, redirect allowlist and confirmation flow.
- Establish backups, restore tests, migration ownership and environment separation.
