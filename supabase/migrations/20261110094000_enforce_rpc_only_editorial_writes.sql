-- Keep editorial mutations behind the validated atomic RPCs.
-- These SECURITY DEFINER functions perform explicit auth.uid()/profile-role checks.

alter function public.transition_article(
  uuid,
  public.article_status,
  timestamptz,
  text
) security definer;

revoke insert, update, delete on public.articles from authenticated;
revoke insert on public.article_revisions from authenticated;
revoke insert on public.article_status_events from authenticated;

-- SELECT remains available under RLS. Article creation and state transitions
-- are performed only by create_article_draft / transition_article.
