-- Editorial CMS schema and role-aware access controls.
-- Public clients can only read published content. All write paths are staff-scoped.

create type public.article_status as enum (
  'draft',
  'in_review',
  'approved',
  'scheduled',
  'published',
  'archived'
);

create type public.article_type as enum (
  'news',
  'feature',
  'interview',
  'guide',
  'press_release'
);

create type public.article_disclosure as enum (
  'none',
  'sponsored',
  'affiliate'
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  slug text not null unique,
  display_name text not null,
  bio text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint authors_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb,
  status public.article_status not null default 'draft',
  article_type public.article_type not null default 'news',
  disclosure public.article_disclosure not null default 'none',
  author_id uuid not null references public.authors (id) on delete restrict,
  category_id uuid references public.categories (id) on delete set null,
  created_by uuid not null references public.profiles (id) on delete restrict,
  reviewed_by uuid references public.profiles (id) on delete set null,
  published_by uuid references public.profiles (id) on delete set null,
  seo_title text,
  seo_description text,
  canonical_url text,
  scheduled_at timestamptz,
  published_at timestamptz,
  is_featured boolean not null default false,
  search_vector tsvector generated always as (
    setweight(to_tsvector('english'::regconfig, coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english'::regconfig, coalesce(excerpt, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint published_articles_have_timestamp check (
    status <> 'published' or published_at is not null
  )
);

create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (article_id, tag_id)
);

create table public.article_revisions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  revision_number integer not null,
  snapshot jsonb not null,
  change_summary text,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint article_revisions_number_positive check (revision_number > 0),
  unique (article_id, revision_number)
);

create index articles_publication_idx
  on public.articles (published_at desc)
  where status = 'published';

create index articles_author_status_idx
  on public.articles (created_by, status, updated_at desc);

create index articles_category_status_idx
  on public.articles (category_id, status, published_at desc);

create index articles_search_idx
  on public.articles using gin (search_vector);

create index article_revisions_article_idx
  on public.article_revisions (article_id, revision_number desc);

create function public.set_editorial_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_editorial_updated_at() from public, anon, authenticated;

create trigger set_authors_updated_at
  before update on public.authors
  for each row execute function public.set_editorial_updated_at();

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_editorial_updated_at();

create trigger set_tags_updated_at
  before update on public.tags
  for each row execute function public.set_editorial_updated_at();

create trigger set_articles_updated_at
  before update on public.articles
  for each row execute function public.set_editorial_updated_at();

-- RLS is enabled before grants are issued.
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.articles enable row level security;
alter table public.article_tags enable row level security;
alter table public.article_revisions enable row level security;

-- Remove default table access, then grant only the operations needed by each client.
revoke all on table
  public.authors,
  public.categories,
  public.tags,
  public.articles,
  public.article_tags,
  public.article_revisions
from anon, authenticated;

grant usage on type
  public.article_status,
  public.article_type,
  public.article_disclosure
to anon, authenticated;

-- Anonymous clients get only explicitly public columns.
grant select (id, slug, display_name, bio, avatar_url, created_at, updated_at)
  on public.authors to anon;

grant select (id, slug, name, description, sort_order, created_at, updated_at)
  on public.categories to anon;

grant select (id, slug, name, description, created_at, updated_at)
  on public.tags to anon;

grant select (
  id, slug, title, excerpt, body, status, article_type, disclosure,
  author_id, category_id, seo_title, seo_description, canonical_url,
  published_at, is_featured, created_at, updated_at
) on public.articles to anon;

grant select (article_id, tag_id, created_at) on public.article_tags to anon;

-- Authenticated staff receive table privileges; RLS below limits rows and actions.
grant select, insert, update, delete on public.authors to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.tags to authenticated;
grant select, insert, update, delete on public.articles to authenticated;
grant select, insert, delete on public.article_tags to authenticated;
grant select, insert on public.article_revisions to authenticated;

-- Public reads: active taxonomy/author records and published articles only.
create policy "authors_public_read"
  on public.authors for select to anon, authenticated
  using (is_active = true);

create policy "authors_editor_manage"
  on public.authors for all to authenticated
  using ((select public.current_app_role()) in ('admin', 'editor'))
  with check ((select public.current_app_role()) in ('admin', 'editor'));

create policy "categories_public_read"
  on public.categories for select to anon, authenticated
  using (is_active = true);

create policy "categories_editor_manage"
  on public.categories for all to authenticated
  using ((select public.current_app_role()) in ('admin', 'editor'))
  with check ((select public.current_app_role()) in ('admin', 'editor'));

create policy "tags_public_read"
  on public.tags for select to anon, authenticated
  using (is_active = true);

create policy "tags_editor_manage"
  on public.tags for all to authenticated
  using ((select public.current_app_role()) in ('admin', 'editor'))
  with check ((select public.current_app_role()) in ('admin', 'editor'));

create policy "articles_public_read"
  on public.articles for select to anon, authenticated
  using (status = 'published' and published_at <= now());

create policy "articles_staff_read"
  on public.articles for select to authenticated
  using (
    (select public.current_app_role()) in ('admin', 'editor')
    or created_by = (select auth.uid())
  );

create policy "articles_staff_create_draft"
  on public.articles for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and status = 'draft'
    and (select public.current_app_role()) in ('admin', 'editor', 'journalist', 'contributor')
  );

create policy "articles_editor_update"
  on public.articles for update to authenticated
  using ((select public.current_app_role()) in ('admin', 'editor'))
  with check ((select public.current_app_role()) in ('admin', 'editor'));

create policy "articles_contributor_update_draft"
  on public.articles for update to authenticated
  using (
    created_by = (select auth.uid())
    and status = 'draft'
    and (select public.current_app_role()) in ('journalist', 'contributor')
  )
  with check (
    created_by = (select auth.uid())
    and status in ('draft', 'in_review')
    and (select public.current_app_role()) in ('journalist', 'contributor')
  );

create policy "articles_editor_delete"
  on public.articles for delete to authenticated
  using ((select public.current_app_role()) in ('admin', 'editor'));

create policy "article_tags_read_accessible_articles"
  on public.article_tags for select to anon, authenticated
  using (
    exists (
      select 1 from public.articles as article
      where article.id = article_tags.article_id
    )
  );

create policy "article_tags_staff_manage_drafts"
  on public.article_tags for all to authenticated
  using (
    (select public.current_app_role()) in ('admin', 'editor')
    or exists (
      select 1 from public.articles as article
      where article.id = article_tags.article_id
        and article.created_by = (select auth.uid())
        and article.status = 'draft'
    )
  )
  with check (
    (select public.current_app_role()) in ('admin', 'editor')
    or exists (
      select 1 from public.articles as article
      where article.id = article_tags.article_id
        and article.created_by = (select auth.uid())
        and article.status = 'draft'
    )
  );

create policy "article_revisions_read_accessible_articles"
  on public.article_revisions for select to authenticated
  using (
    exists (
      select 1 from public.articles as article
      where article.id = article_revisions.article_id
    )
  );

create policy "article_revisions_append_only"
  on public.article_revisions for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1 from public.articles as article
      where article.id = article_revisions.article_id
        and (
          (select public.current_app_role()) in ('admin', 'editor')
          or (article.created_by = (select auth.uid()) and article.status = 'draft')
        )
    )
  );
