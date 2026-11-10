# Staff access operations

The admin workspace is invitation-only. There is no public signup route.

## Local testing
1. Start the local Supabase stack and apply committed migrations.
2. Create a test user using the local Supabase Auth dashboard or CLI operator workflow.
3. Confirm the auth trigger created a matching profiles row with role contributor.
4. Sign in at /admin/sign-in with the test credentials.
5. Verify that an authenticated user with no profile is sent to /admin/access-denied and that a signed-out user cannot load /admin.

## Role assignment
The profile role is not self-service. Do not add role fields to public signup or accept a role from a form, URL or user metadata. Until the admin user-management screen exists, an authorized database operator must assign elevated roles using the reviewed database console process and retain an audit record.

## Production readiness
A hosted Supabase project, staff account, email provider and redirect allowlist must be configured before testing production sign-in. The current repository setup does not provision or invite real users.