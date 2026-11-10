# Staff authentication and authorization

## Trust boundaries
- Supabase Auth establishes identity. The server validates the access token with `auth.getUser(accessToken)`; it never trusts a decoded token or client-supplied identity.
- The `profiles` table is the authoritative source of application roles.
- User-editable auth metadata is never used for authorization.
- Profile role is not writable by authenticated users.
- The browser receives only opaque HttpOnly, Secure-in-production, SameSite=Lax cookies for the access token, refresh token and expiry. It receives no Supabase key and performs no Supabase Data API query.
- The server's Supabase secret key bypasses RLS. Every protected server operation must independently verify the user and profile role before accessing private data or mutating state.

## Roles
admin, editor, journalist, contributor and commercial. Permissions for each feature must be enforced in server-side operations. Not every authenticated user is a staff member.

## Session lifecycle
- Invitation-only password sign-in uses a server action and the server-only Supabase client.
- Access and refresh tokens are stored in HttpOnly cookies; tokens are never returned to client components or serialized into page props.
- The Next.js proxy refreshes an expiring session and only performs session maintenance. It is not an authorization gate.
- Protected layouts/actions call `auth.getUser(accessToken)` and read the matching profile role from the database on the server.
- Sign-out revokes the refresh session globally and clears all session cookies.
- Signup remains disabled; no public registration route exists.
- Sign-in return path is constrained to same-origin relative paths.

## Database boundary
- Application tables keep RLS enabled with zero policies.
- `anon` and `authenticated` have no application table/sequence/function grants.
- The server's secret key is the only application credential that bypasses RLS and accesses application tables.
- The auth-user trigger may insert the initial contributor profile. The trigger function is SECURITY DEFINER with an empty search path; it is the only application-schema definer function.
- `transition_article` is an invoker function granted only to `service_role`; it verifies the supplied actor against `profiles`, checks the role/ownership/state transition and records revision/status history atomically.

## Account provisioning
The owner must provision staff identities through a trusted Supabase operator workflow. New auth users receive contributor by default through the database trigger. Role elevation must be performed by an authorized operator until the admin user-management workflow is implemented. Never promote a user based on a client-supplied role or signup metadata.

## Required checks for each new protected feature
- Verify the user through Supabase Auth on the server.
- Read the authoritative profile role from the database; do not trust metadata.
- Check permission and resource ownership in the server action/route handler before any service-key query or mutation.
- Validate every mutation with Zod and preserve same-origin protections.
- Test signed-out, each allowed role, each refused role and ownership boundaries.
- Never serialize the service key, auth tokens or private profile fields into client props.
