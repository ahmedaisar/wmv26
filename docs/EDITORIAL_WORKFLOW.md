# Editorial workflow

## State transitions
- Journalist/contributor: draft → in_review for an article they created.
- Editor/admin: in_review → draft (changes requested) or approved.
- Editor/admin: approved → scheduled (future timestamp) or published.
- Editor/admin: scheduled → approved (cancel schedule) or published once due.
- Editor/admin: published → archived.

There is no direct contributor publication, no direct draft-to-published transition and no anonymous state mutation.

## Atomic transition RPC
The `transition_article` function runs as `SECURITY DEFINER` because authenticated clients have no direct INSERT/UPDATE/DELETE privileges on articles and cannot insert revision snapshots or status events. It locks the article row and explicitly validates `auth.uid()`, the current profile role, ownership and the transition matrix before making its atomic changes. The `create_article_draft` RPC is similarly `SECURITY DEFINER` with explicit role, author and category checks; a missing profile is denied.

These narrow RPCs are the only supported application mutation paths. Future Server Actions must call them rather than writing protected tables directly. A future content-edit RPC must validate scope and append a revision in the same transaction.

## Scheduled publishing
The database validates due times and allows an editor/admin to publish a due scheduled article. Automatic publication at the scheduled time requires a later trusted scheduler/cron integration. Until then, scheduled records remain scheduled and need an authorized publish action after the due time.
