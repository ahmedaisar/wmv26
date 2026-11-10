# Editorial workflow

## State transitions
- Journalist/contributor: draft → in_review for an article they created.
- Editor/admin: in_review → draft (changes requested) or approved.
- Editor/admin: approved → scheduled (future timestamp) or published.
- Editor/admin: scheduled → approved (cancel schedule) or published once due.
- Editor/admin: published → archived.

There is no direct contributor publication, no direct draft-to-published transition and no anonymous state mutation.

## Atomic transition RPC
The transition_article function runs with caller privileges (SECURITY INVOKER), locks the article row, checks the caller's profile role and ownership, validates the transition, appends a revision snapshot, updates the article and writes an immutable status event in one transaction. It is executable by authenticated users only; RLS and role checks remain in force.

The RPC is the only supported state-transition path for the application. It runs as SECURITY DEFINER only because authenticated clients have no direct INSERT/UPDATE/DELETE privileges on articles and cannot insert revision snapshots or status events. The function locks the row and explicitly validates auth.uid(), the current profile role, ownership and the transition matrix before making its atomic changes. The create_article_draft RPC is similarly SECURITY DEFINER with explicit role, author and category checks; a missing profile is denied. Future Server Actions must call these narrow RPCs rather than writing protected fields or audit tables directly. A future content-edit RPC must validate scope and append a revision in the same transaction.

## Scheduled publishing
This migration validates due times and allows an editor/admin to publish a due scheduled article. Automatic publication at the scheduled time requires a later trusted scheduler/cron integration. Until then, scheduled records remain scheduled and need an authorized publish action after the due time.
