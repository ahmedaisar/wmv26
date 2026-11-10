# Staff authentication and authorization

## Trust boundaries
- Supabase Auth establishes identity. Server-side getUser() validates the session with Supabase.
- The profiles table is the authoritative source of application roles.
- User-editable auth metadata is never used for authorization.
- Profile role is not writable by authenticated users; database grants allow only display name/avatar updates.
- RLS remains the final data-access boundary. UI visibility and the Next.js proxy are not substitutes for database policies.

## Roles
admin, editor, journalist, contributor and commercial. Permissions for each feature must be enforced in server-side operations and matching RLS policies. Not every authenticated user is a staff member.

## Current implementation
- Invitation-only password sign-in using Supabase Auth.
- Sign-out server action.
- Next.js proxy refreshes Supabase cookies on /admin routes and validates the user session.
- Protected admin route-group layout checks the current auth user and profile role on the server.
- Missing profiles or unsupported roles go to an access-denied page.
- Sign-in return path is constrained to same-origin relative paths.
- Signup remains disabled; no public registration route exists.

## Account provisioning
The owner must provision staff identities through the trusted Supabase operator workflow. New auth users receive contributor by default through the database trigger. Role elevation must be performed by an authorized operator until the admin user-management workflow is implemented. Never promote a user based on a client-supplied role or signup metadata.

## Future security requirements
- Re-check authorization in every Server Action and Route Handler that reads or mutates protected data.
- Apply explicit grants and RLS to every new table and storage bucket.
- Test anonymous access and each role.
- Use getUser(), not getSession(), as the server-side identity check.
- Validate all form inputs and constrain redirects.
- Apply rate limits/CAPTCHA and email-provider protections before production.
- Audit role changes and sensitive publishing operations.
