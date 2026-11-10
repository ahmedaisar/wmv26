-- Atomic editorial status transitions and immutable status history.

create table public.article_status_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  from_status public.article_status not null,
  to_status public.article_status not null,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  note text,
  created_at timestamptz not null default now()
);

create index article_status_events_article_idx
  on public.article_status_events (article_id, created_at desc);

alter table public.article_status_events enable row level security;

revoke all on table public.article_status_events from anon, authenticated;
grant select, insert on public.article_status_events to authenticated;

create policy "article_status_events_read_accessible_articles"
  on public.article_status_events for select to authenticated
  using (
    exists (
      select 1 from public.articles as article
      where article.id = article_status_events.article_id
    )
  );

create policy "article_status_events_insert_as_actor"
  on public.article_status_events for insert to authenticated
  with check (
    actor_id = (select auth.uid())
    and exists (
      select 1 from public.articles as article
      where article.id = article_status_events.article_id
    )
  );

create function public.transition_article(
  p_article_id uuid,
  p_to_status public.article_status,
  p_scheduled_at timestamptz default null,
  p_note text default null
)
returns public.article_status
language plpgsql
set search_path = ''
as $$
declare
  v_article public.articles%rowtype;
  v_actor uuid;
  v_role public.app_role;
  v_revision_number integer;
begin
  v_actor := (select auth.uid());

  if v_actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_role := (select public.current_app_role());

  -- Lock the article so concurrent submissions cannot duplicate revision numbers
  -- or race two state transitions from the same prior state.
  select *
    into v_article
    from public.articles
    where id = p_article_id
    for update;

  if not found then
    raise exception 'Article not found or not accessible' using errcode = 'P0002';
  end if;

  if v_article.status = p_to_status then
    return p_to_status;
  end if;

  if v_role in ('admin', 'editor') then
    if not (
      (v_article.status = 'in_review' and p_to_status in ('draft', 'approved'))
      or (v_article.status = 'approved' and p_to_status in ('scheduled', 'published'))
      or (v_article.status = 'scheduled' and p_to_status in ('approved', 'published'))
      or (v_article.status = 'published' and p_to_status = 'archived')
    ) then
      raise exception 'Invalid editorial transition' using errcode = '22023';
    end if;
  elsif
    v_role in ('journalist', 'contributor')
    and v_article.created_by = v_actor
    and v_article.status = 'draft'
    and p_to_status = 'in_review'
  then
    null;
  else
    raise exception 'Not authorized to perform this editorial transition' using errcode = '42501';
  end if;

  if p_to_status = 'scheduled' and (p_scheduled_at is null or p_scheduled_at <= now()) then
    raise exception 'Scheduled publication must be in the future' using errcode = '22023';
  end if;

  if
    p_to_status = 'published'
    and v_article.status = 'scheduled'
    and v_article.scheduled_at > now()
  then
    raise exception 'Scheduled publication time has not arrived' using errcode = '22023';
  end if;

  select coalesce(max(revision_number), 0) + 1
    into v_revision_number
    from public.article_revisions
    where article_id = p_article_id;

  -- Snapshot before transition. This and the status update/event are one transaction.
  insert into public.article_revisions (
    article_id,
    revision_number,
    snapshot,
    change_summary,
    created_by
  )
  values (
    p_article_id,
    v_revision_number,
    jsonb_build_object(
      'slug', v_article.slug,
      'title', v_article.title,
      'excerpt', v_article.excerpt,
      'body', v_article.body,
      'status', v_article.status,
      'article_type', v_article.article_type,
      'disclosure', v_article.disclosure,
      'author_id', v_article.author_id,
      'category_id', v_article.category_id,
      'seo_title', v_article.seo_title,
      'seo_description', v_article.seo_description,
      'canonical_url', v_article.canonical_url,
      'scheduled_at', v_article.scheduled_at,
      'published_at', v_article.published_at
    ),
    nullif(left(trim(coalesce(p_note, '')), 1000), ''),
    v_actor
  );

  update public.articles
    set
      status = p_to_status,
      scheduled_at = case
        when p_to_status = 'scheduled' then p_scheduled_at
        when p_to_status in ('approved', 'published') then null
        else scheduled_at
      end,
      reviewed_by = case
        when p_to_status in ('draft', 'approved') and v_article.status = 'in_review' then v_actor
        else reviewed_by
      end,
      published_at = case
        when p_to_status = 'published' then now()
        else published_at
      end,
      published_by = case
        when p_to_status = 'published' then v_actor
        else published_by
      end
    where id = p_article_id;

  insert into public.article_status_events (
    article_id,
    from_status,
    to_status,
    actor_id,
    note
  )
  values (
    p_article_id,
    v_article.status,
    p_to_status,
    v_actor,
    nullif(left(trim(coalesce(p_note, '')), 1000), '')
  );

  return p_to_status;
end;
$$;

revoke all on function public.transition_article(
  uuid,
  public.article_status,
  timestamptz,
  text
) from public, anon, authenticated;

grant execute on function public.transition_article(
  uuid,
  public.article_status,
  timestamptz,
  text
) to authenticated;
