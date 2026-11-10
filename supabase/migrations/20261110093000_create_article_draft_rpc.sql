-- Create an article and its initial revision atomically under caller RLS.

create function public.create_article_draft(
  p_title text,
  p_slug text,
  p_author_id uuid,
  p_excerpt text default null,
  p_body jsonb default '{}'::jsonb,
  p_article_type public.article_type default 'news',
  p_disclosure public.article_disclosure default 'none',
  p_category_id uuid default null,
  p_seo_title text default null,
  p_seo_description text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_role public.app_role;
  v_article_id uuid;
begin
  v_actor := (select auth.uid());
  if v_actor is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  v_role := (select public.current_app_role());
  if v_role is null or v_role not in ('admin', 'editor', 'journalist', 'contributor') then
    raise exception 'Not authorized to create editorial content' using errcode = '42501';
  end if;

  if nullif(trim(coalesce(p_title, '')), '') is null
    or nullif(trim(coalesce(p_slug, '')), '') is null
    or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  then
    raise exception 'A valid title and slug are required' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_body, '{}'::jsonb)) <> 'object' then
    raise exception 'Article body must be a structured JSON object' using errcode = '22023';
  end if;

  if length(coalesce(p_excerpt, '')) > 280
    or length(coalesce(p_seo_title, '')) > 100
    or length(coalesce(p_seo_description, '')) > 200
  then
    raise exception 'Article metadata exceeds the allowed length' using errcode = '22023';
  end if;

  if v_role in ('journalist', 'contributor') then
    if p_disclosure <> 'none' then
      raise exception 'Only editors may assign commercial disclosure' using errcode = '42501';
    end if;

    if not exists (
      select 1
      from public.authors as author
      where author.id = p_author_id
        and author.profile_id = v_actor
        and author.is_active = true
    ) then
      raise exception 'An active author profile linked to your account is required' using errcode = '42501';
    end if;
  elsif not exists (
    select 1
    from public.authors as author
    where author.id = p_author_id
      and author.is_active = true
  ) then
    raise exception 'Select an active author profile' using errcode = '22023';
  end if;

  if p_category_id is not null and not exists (
    select 1
    from public.categories as category
    where category.id = p_category_id
      and category.is_active = true
  ) then
    raise exception 'Select an active category' using errcode = '22023';
  end if;

  insert into public.articles (
    slug,
    title,
    excerpt,
    body,
    status,
    article_type,
    disclosure,
    author_id,
    category_id,
    created_by,
    seo_title,
    seo_description
  )
  values (
    p_slug,
    trim(p_title),
    nullif(trim(coalesce(p_excerpt, '')), ''),
    coalesce(p_body, '{}'::jsonb),
    'draft',
    p_article_type,
    p_disclosure,
    p_author_id,
    p_category_id,
    v_actor,
    nullif(trim(coalesce(p_seo_title, '')), ''),
    nullif(trim(coalesce(p_seo_description, '')), '')
  )
  returning id into v_article_id;

  insert into public.article_revisions (
    article_id,
    revision_number,
    snapshot,
    change_summary,
    created_by
  )
  values (
    v_article_id,
    1,
    jsonb_build_object(
      'slug', p_slug,
      'title', trim(p_title),
      'excerpt', nullif(trim(coalesce(p_excerpt, '')), ''),
      'body', coalesce(p_body, '{}'::jsonb),
      'status', 'draft',
      'article_type', p_article_type,
      'disclosure', p_disclosure,
      'author_id', p_author_id,
      'category_id', p_category_id,
      'seo_title', nullif(trim(coalesce(p_seo_title, '')), ''),
      'seo_description', nullif(trim(coalesce(p_seo_description, '')), '')
    ),
    'Initial draft',
    v_actor
  );

  return v_article_id;
end;
$$;

revoke all on function public.create_article_draft(
  text,
  text,
  uuid,
  text,
  jsonb,
  public.article_type,
  public.article_disclosure,
  uuid,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_article_draft(
  text,
  text,
  uuid,
  text,
  jsonb,
  public.article_type,
  public.article_disclosure,
  uuid,
  text,
  text
) to authenticated;
