-- Phase 3A: canonical geography, property catalogue and verification provenance.
-- Staged outside supabase/migrations so no hosted Git integration can apply it
-- accidentally. The release-validation workflow applies it only to local CI.

begin;

create type public.property_type as enum ('resort', 'hotel', 'guesthouse');
create type public.property_status as enum ('draft', 'in_review', 'verified', 'published', 'archived');
create type public.property_media_review_status as enum ('pending', 'approved', 'rejected');

create table public.atolls (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  source_name text,
  source_url text,
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.islands (
  id uuid primary key default gen_random_uuid(),
  atoll_id uuid not null references public.atolls(id) on delete restrict,
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  classification text check (
    classification is null or classification in ('inhabited', 'resort', 'uninhabited', 'industrial', 'other')
  ),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  source_name text,
  source_url text,
  source_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, atoll_id)
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  property_type public.property_type not null,
  status public.property_status not null default 'draft',
  summary text,
  description text,
  atoll_id uuid references public.atolls(id) on delete restrict,
  island_id uuid,
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  official_website_url text,
  booking_url text,
  public_email text,
  public_phone text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete restrict,
  updated_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete restrict,
  verification_source_name text,
  verification_source_url text,
  published_at timestamptz,
  published_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_island_atoll_fk
    foreign key (island_id, atoll_id)
    references public.islands(id, atoll_id)
    on delete restrict,
  constraint properties_island_requires_atoll
    check (island_id is null or atoll_id is not null),
  constraint properties_coordinate_pair
    check ((latitude is null) = (longitude is null)),
  constraint properties_latitude_range
    check (latitude is null or latitude between -90 and 90),
  constraint properties_longitude_range
    check (longitude is null or longitude between -180 and 180),
  constraint properties_verification_pair
    check ((verified_at is null) = (verified_by is null)),
  constraint properties_publication_pair
    check ((published_at is null) = (published_by is null)),
  constraint properties_verified_source
    check (
      verified_at is null
      or (
        length(trim(coalesce(verification_source_name, ''))) > 0
        and verification_source_url ~* '^https?://'
      )
    ),
  constraint properties_published_requirements
    check (
      status <> 'published'
      or (
        verified_at is not null
        and verified_by is not null
        and published_at is not null
        and published_by is not null
        and atoll_id is not null
        and island_id is not null
      )
    )
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_facilities (
  property_id uuid not null references public.properties(id) on delete cascade,
  facility_id uuid not null references public.facilities(id) on delete restrict,
  is_verified boolean not null default false,
  source_url text,
  verified_at timestamptz,
  verified_by uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (property_id, facility_id),
  constraint property_facilities_verification_pair
    check ((verified_at is null) = (verified_by is null)),
  constraint property_facilities_verified_source
    check (
      not is_verified
      or (
        verified_at is not null
        and verified_by is not null
        and source_url ~* '^https?://'
      )
    )
);

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text unique,
  media_url text,
  alt_text text not null check (length(trim(alt_text)) > 0),
  credit text,
  source_url text,
  sort_order integer not null default 0,
  focal_x numeric(5,4) not null default 0.5 check (focal_x between 0 and 1),
  focal_y numeric(5,4) not null default 0.5 check (focal_y between 0 and 1),
  review_status public.property_media_review_status not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint property_media_source
    check (storage_path is not null or media_url ~* '^https?://'),
  constraint property_media_review_pair
    check ((reviewed_at is null) = (reviewed_by is null)),
  constraint property_media_review_state
    check (review_status = 'pending' or (reviewed_at is not null and reviewed_by is not null))
);

create table public.property_verification_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  source_name text not null check (length(trim(source_name)) > 0),
  source_url text not null check (source_url ~* '^https?://'),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  note text,
  created_at timestamptz not null default now()
);

create table public.property_status_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  from_status public.property_status,
  to_status public.property_status not null,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  note text,
  created_at timestamptz not null default now()
);

create index islands_atoll_active_sort_idx
  on public.islands (atoll_id, is_active, sort_order, name);
create index properties_directory_idx
  on public.properties (status, is_active, published_at desc);
create index properties_atoll_directory_idx
  on public.properties (atoll_id, status, is_active, published_at desc);
create index properties_island_directory_idx
  on public.properties (island_id, status, is_active, published_at desc);
create index properties_type_directory_idx
  on public.properties (property_type, status, is_active, published_at desc);
create index properties_assigned_to_idx
  on public.properties (assigned_to) where assigned_to is not null;
create index property_facilities_facility_idx
  on public.property_facilities (facility_id, property_id);
create index property_media_public_idx
  on public.property_media (property_id, sort_order)
  where review_status = 'approved';
create index property_verification_events_property_idx
  on public.property_verification_events (property_id, created_at desc);
create index property_status_events_property_idx
  on public.property_status_events (property_id, created_at desc);

create trigger atolls_set_updated_at
  before update on public.atolls
  for each row execute function public.set_editorial_updated_at();
create trigger islands_set_updated_at
  before update on public.islands
  for each row execute function public.set_editorial_updated_at();
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute function public.set_editorial_updated_at();
create trigger facilities_set_updated_at
  before update on public.facilities
  for each row execute function public.set_editorial_updated_at();

alter table public.atolls enable row level security;
alter table public.islands enable row level security;
alter table public.properties enable row level security;
alter table public.facilities enable row level security;
alter table public.property_facilities enable row level security;
alter table public.property_media enable row level security;
alter table public.property_verification_events enable row level security;
alter table public.property_status_events enable row level security;

revoke all on table
  public.atolls,
  public.islands,
  public.properties,
  public.facilities,
  public.property_facilities,
  public.property_media,
  public.property_verification_events,
  public.property_status_events
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.atolls,
  public.islands,
  public.properties,
  public.facilities,
  public.property_facilities,
  public.property_media,
  public.property_verification_events,
  public.property_status_events
to service_role;

create function public.transition_property(
  p_actor_id uuid,
  p_property_id uuid,
  p_to_status public.property_status,
  p_source_name text default null,
  p_source_url text default null,
  p_note text default null
)
returns public.property_status
language plpgsql
set search_path = ''
as $$
declare
  v_property public.properties%rowtype;
  v_role public.app_role;
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
    into v_property
    from public.properties
    where id = p_property_id
    for update;

  if not found then
    raise exception 'Property not found or not accessible' using errcode = 'P0002';
  end if;

  if p_to_status is null then
    raise exception 'A target property status is required' using errcode = '22023';
  end if;

  if v_role in ('admin', 'editor') then
    if not (
      (v_property.status = 'draft' and p_to_status = 'in_review')
      or (v_property.status = 'in_review' and p_to_status in ('draft', 'verified'))
      or (v_property.status = 'verified' and p_to_status = 'published')
      or (v_property.status = 'published' and p_to_status = 'archived')
      or (v_property.status = 'archived' and p_to_status = 'draft')
    ) then
      raise exception 'Invalid property transition' using errcode = '22023';
    end if;
  elsif
    v_role = 'journalist'
    and v_property.status = 'draft'
    and p_to_status = 'in_review'
    and (v_property.created_by = p_actor_id or v_property.assigned_to = p_actor_id)
  then
    null;
  else
    raise exception 'Not authorized to perform this property transition' using errcode = '42501';
  end if;

  if p_to_status = 'verified' then
    if length(trim(coalesce(p_source_name, ''))) = 0
      or p_source_url is null
      or p_source_url !~* '^https?://'
    then
      raise exception 'Verification requires a named HTTP(S) source' using errcode = '22023';
    end if;
  end if;

  if p_to_status = 'published' and (
    v_property.verified_at is null
    or v_property.verified_by is null
    or v_property.atoll_id is null
    or v_property.island_id is null
  ) then
    raise exception 'Property must be verified and assigned to an island before publication' using errcode = '22023';
  end if;

  update public.properties
    set
      status = p_to_status,
      updated_by = p_actor_id,
      verified_at = case when p_to_status = 'verified' then now()
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else verified_at end,
      verified_by = case when p_to_status = 'verified' then p_actor_id
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else verified_by end,
      verification_source_name = case when p_to_status = 'verified' then trim(p_source_name)
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else verification_source_name end,
      verification_source_url = case when p_to_status = 'verified' then trim(p_source_url)
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else verification_source_url end,
      published_at = case when p_to_status = 'published' then now()
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else published_at end,
      published_by = case when p_to_status = 'published' then p_actor_id
        when p_to_status = 'draft' and v_property.status = 'archived' then null
        else published_by end
    where id = p_property_id;

  if p_to_status = 'verified' then
    insert into public.property_verification_events (
      property_id, source_name, source_url, actor_id, note
    )
    values (
      p_property_id,
      trim(p_source_name),
      trim(p_source_url),
      p_actor_id,
      nullif(left(trim(coalesce(p_note, '')), 1000), '')
    );
  end if;

  insert into public.property_status_events (
    property_id, from_status, to_status, actor_id, note
  )
  values (
    p_property_id,
    v_property.status,
    p_to_status,
    p_actor_id,
    nullif(left(trim(coalesce(p_note, '')), 1000), '')
  );

  return p_to_status;
end;
$$;

revoke all on function public.transition_property(
  uuid,
  uuid,
  public.property_status,
  text,
  text,
  text
) from public, anon, authenticated;
grant execute on function public.transition_property(
  uuid,
  uuid,
  public.property_status,
  text,
  text,
  text
) to service_role;

commit;
