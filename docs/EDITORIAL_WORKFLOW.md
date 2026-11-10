# Editorial workflow

## State transitions
- Journalist/contributor: draft → in_review for an article they created.
- Editor/admin: in_review → draft (changes requested) or approved.
- Editor/admin: approved → scheduled (future timestamp) or published.
- Editor/admin: scheduled → approved (cancel schedule) or published once due.
- Editor/admin: published → archived.

There is no direct contributor publication, no direct draft-to-published transition and no anonymous state mutation.

## Atomic transition RPC
The target `transition_article` function is an invoker RPC executable only by `service_role`. The server first validates the Supabase Auth access token and reads the actor's role from `profiles`; it passes that verified actor id to the RPC. The function locks the actor profile and article, rechecks the actor's database role and article ownership/state transition, then writes the revision snapshot, article update and immutable status event in one transaction.

The RPC does not trust a client-supplied actor id: only the server can call it, and the server must source the actor id from a verified Auth user. Server Actions must not accept an actor id or role from form data. Content mutations also validate input and record revisions.

## Rollout compatibility
The new signature and grants are staged in `supabase/pending/20261110120000_server_only_access_boundary.sql`. CI applies that SQL to local Supabase and tests allowed and refused transitions. Hosted Supabase still has the previous `auth.uid()`-based function and grants until an owner-approved migration promotion. PR #8's draft RPC/actions were authored for that previous model and must be rebased and adapted before merge.

## Scheduled publishing
The function validates due times and allows an editor/admin to publish a due scheduled article. Automatic publication at the scheduled time requires a later trusted scheduler/cron integration. Until then, scheduled records remain scheduled and need an authorized publish action after the due time.
