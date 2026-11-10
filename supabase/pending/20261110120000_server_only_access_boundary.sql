-- Server-only Data API boundary.
-- Application queries now use the server secret key; browser/API roles have no
-- direct table or function privileges and RLS remains enabled as deny-all.

alter default privileges for role postgres
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres
  revoke usage on types from public, anon, authenticated;
alter default privileges for role postgres
  grant usage on types to service_role;
alter default privileges for role postgres
  revoke execute on functions from public, anon, authenticated;

do $$
declare
  v_table text;
  v_policy record;
  v_tables text[] := array[
    'profiles',
    'authors',
    'categories',
    'tags',
    'articles',
    'article_tags',
    'article_revisions',
    'article_status_events'
  ];
begin
  foreach v_table in array v_tables loop
    execute format('alter table public.%I enable row level security', v_table);

    for v_policy in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = v_table
    loop
      execute format('drop policy %I on public.%I', v_policy.policyname, v_table);
    end loop;

    execute format(
      'revoke all on table public.%I from public, anon, authenticated',
      v_table
    );
    execute format(
      'grant select, insert, update, delete on table public.%I to service_role',
      v_table
    );
  end loop;
end;
$$;

revoke all on schema public from public, anon, authenticated;
grant usage on schema public to service_role;

revoke all on all types in schema public from public, anon, authenticated;
grant usage on all types in schema public to service_role;

revoke all on all sequences in schema public from public, anon, authenticated;
grant usage, select, update on all sequences in schema public to service_role;

revoke all on all functions in schema public from public, anon, authenticated;

-- The old helper relied on auth.uid() inside Postgres. User JWTs are no longer
-- sent to PostgREST; the server verifies identity with the Auth API and passes
-- the verified actor id to this service-role-only invoker RPC.
drop function if exists public.transition_article(
  uuid,
  public.article_status,
  timestamptz,
  text
);
drop function if exists public.current_app_role();

create function public.transition_article(
  p_actor_id uuid,
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
  v_role public.app_role;
  v_revision_number integer;
begin
  select profile.role
    into v_role
    from public.profiles as profile
    where profile.id = p_actor_id
    for share;

  if not found then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select *
    into v_article
    from public.articles
    where id = p_article_id
    for update;

  if not found then
    raise exception 'Article not found or not accessible' using errcode = 'P0002';
  end if;

  if p_to_status is null then
    raise exception 'A target status is required' using errcode = '22023';
  end if;

  if v_role in ('admin', 'editor') then
    if v_article.status = p_to_status then
      return p_to_status;
    end if;

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
    and v_article.created_by = p_actor_id
    and v_article.status = 'draft'
    and p_to_status in ('draft', 'in_review')
  then
    if p_to_status = 'draft' then
      return p_to_status;
    end if;
  else
    raise exception 'Not authorized to perform this editorial transition' using errcode = '42501';
  end if;

  if p_to_status = 'scheduled' and (p_scheduled_at is null or p_scheduled_at <= now()) then
    raise exception 'Scheduled publication must be in the future' using errcode = '22023';
  end if;

  if
    p_to_status = 'published'
    and v_article.status = 'scheduled'
    and (v_article.scheduled_at is null or v_article.scheduled_at > now())
  then
    raise exception 'Scheduled publication time has not arrived' using errcode = '22023';
  end if;

  select coalesce(max(revision_number), 0) + 1
    into v_revision_number
    from public.article_revisions
    where article_id = p_article_id;

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
    p_actor_id
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
        when p_to_status in ('draft', 'approved') and v_article.status = 'in_review' then p_actor_id
        else reviewed_by
      end,
      published_at = case
        when p_to_status = 'published' then now()
        else published_at
      end,
      published_by = case
        when p_to_status = 'published' then p_actor_id
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
    p_actor_id,
    nullif(left(trim(coalesce(p_note, '')), 1000), '')
  );

  return p_to_status;
end;
$$;

revoke all on function public.transition_article(
  uuid,
  uuid,
  public.article_status,
  timestamptz,
  text
) from public, anon, authenticated;
grant execute on function public.transition_article(
  uuid,
  uuid,
  public.article_status,
  timestamptz,
  text
) to service_role;

-- Existing BEFORE UPDATE triggers still execute under the server's table role.
grant execute on function public.set_profile_updated_at() to service_role;
grant execute on function public.set_editorial_updated_at() to service_role;
