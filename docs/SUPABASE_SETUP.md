# Supabase setup

## Scope of this increment
This change establishes the Supabase client boundary, local CLI configuration and a first identity/profile migration. It does not connect to a hosted project, apply migrations remotely, enable staff sign-in UI or provision credentials.

## Prerequisites
- Node.js 22+
- Docker Desktop/Engine for the local Supabase stack
- Supabase CLI, invoked with npx or installed per the official documentation

## Local development
1. Copy .env.example to .env.local.
2. Start local services: npx supabase start.
3. Apply migrations and reset local data: npx supabase db reset.
4. Copy the local API URL and anon/publishable key printed by the CLI into .env.local as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
5. Start Next.js with npm run dev.

The local Supabase stack creates a disposable development database. Never use production data for local experiments.

## Hosted project
1. Create the Supabase project in the owner's account and select the intended region.
2. Store its project ref and database password in the operator's secret manager; do not commit them.
3. Link explicitly: npx supabase link --project-ref PROJECT_REF.
4. Review pending SQL with npx supabase migration list and the dry-run option supported by the installed CLI.
5. Apply only after reviewing the migration plan and confirming the target: npx supabase db push.
6. Configure matching hosting environment variables separately for preview/staging/production.

No hosted Supabase project was supplied in this task, so no remote project has been linked or changed.

## Client boundaries
- Browser client: public URL and anon/publishable key only; RLS must restrict every exposed table.
- Server client: forwards authenticated request cookies so queries execute under the signed-in user and RLS.
- No service-role client is introduced. If a later background/admin operation truly requires one, isolate it behind a server-only module and a narrow permission-checked interface.

## Profile and role policy
New auth users receive a contributor profile by database trigger. User-editable auth metadata is used only for the display name; it never determines role. Authenticated users can select their own profile and update only display name/avatar columns. Elevated roles must be assigned by a trusted operator and are not self-service.

The current_app_role helper is SECURITY DEFINER, has a fixed empty search path and reads the caller's profile without relying on profile RLS recursion. It is granted only to authenticated users. It is groundwork for later policy definitions, not a complete authorization system.

## Before production
- Review the migration against the actual project and Supabase version.
- Test anonymous and authenticated access and every application role.
- Add explicit grants and RLS for each new table.
- Configure email provider, SMTP, redirect allowlist and confirmation flow.
- Establish backups, restore tests, migration ownership and environment separation.
