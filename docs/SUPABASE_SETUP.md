# Supabase setup

## Scope
This guide covers local Supabase setup, the initial identity migration and staff authentication. No hosted Supabase project is linked or migrated by repository automation.

## Prerequisites
- Node.js 22+
- Docker Desktop/Engine for the local Supabase stack
- Supabase CLI, invoked with npx or installed per official documentation

## Local development
1. Copy .env.example to .env.local.
2. Start local services: npx supabase start.
3. Apply migrations and reset local data: npx supabase db reset.
4. Copy the local API URL and anon/publishable key printed by the CLI into .env.local as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
5. Start Next.js with npm run dev.

The local Supabase stack is disposable development data. Never use production data for local experiments.

## Hosted project
1. Create the Supabase project in the owner's account and select the intended region.
2. Store its project ref and database password in the operator's secret manager; do not commit them.
3. Link explicitly: npx supabase link --project-ref PROJECT_REF.
4. Review pending SQL with npx supabase migration list and the dry-run option supported by the installed CLI.
5. Apply only after reviewing the migration plan and confirming the target: npx supabase db push.
6. Configure matching hosting environment variables separately for preview/staging/production.

No hosted project was supplied, so no remote project has been linked or changed.

## Staff access
Signup is disabled. Provision staff accounts through a trusted Supabase operator workflow, then verify the profiles row created by the auth trigger. New users default to contributor. Role elevation is an operator-only task until the admin user-management feature is implemented. Do not share credentials in issues or pull requests.

## Client boundaries
- Browser client: public URL and anon/publishable key only; RLS must restrict every exposed table.
- Server client: forwards authenticated request cookies so queries execute under the signed-in user and RLS.
- No service-role client is introduced. Any future privileged job must be isolated in a server-only module with a narrow permission-checked interface.

## Before production
- Review the migration against the actual project and Supabase version.
- Test anonymous and authenticated access and every application role.
- Add explicit grants and RLS for each new table.
- Configure email provider, SMTP, redirect allowlist and confirmation flow.
- Establish backups, restore tests, migration ownership and environment separation.
