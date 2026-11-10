-- Tighten role helper execution and index frequently joined editorial foreign keys.
-- The invoker can read only the caller's own profile under profiles_select_own RLS.
alter function public.current_app_role() security invoker;
revoke all on function public.current_app_role() from public, anon;
grant execute on function public.current_app_role() to authenticated;

create index if not exists articles_author_id_idx
  on public.articles (author_id);
create index if not exists articles_reviewed_by_idx
  on public.articles (reviewed_by)
  where reviewed_by is not null;
create index if not exists articles_published_by_idx
  on public.articles (published_by)
  where published_by is not null;
create index if not exists article_revisions_created_by_idx
  on public.article_revisions (created_by);
create index if not exists article_status_events_actor_id_idx
  on public.article_status_events (actor_id);
create index if not exists article_tags_tag_id_idx
  on public.article_tags (tag_id);
