create extension if not exists pgtap with schema extensions;

begin;

select plan(30);

select is(
  (select count(*)::integer
   from pg_class
   where oid in (
     'public.atolls'::regclass,
     'public.islands'::regclass,
     'public.properties'::regclass,
     'public.facilities'::regclass,
     'public.property_facilities'::regclass,
     'public.property_media'::regclass,
     'public.property_verification_events'::regclass,
     'public.property_status_events'::regclass
   )),
  8,
  'all eight Phase 3A tables exist'
);

select is(
  (select count(*)::integer
   from pg_class
   where oid in (
     'public.atolls'::regclass,
     'public.islands'::regclass,
     'public.properties'::regclass,
     'public.facilities'::regclass,
     'public.property_facilities'::regclass,
     'public.property_media'::regclass,
     'public.property_verification_events'::regclass,
     'public.property_status_events'::regclass
   )
   and relrowsecurity),
  8,
  'RLS is enabled on every Phase 3A table'
);

select is(
  (select count(*)::integer
   from pg_policies
   where schemaname = 'public'
     and tablename in (
       'atolls', 'islands', 'properties', 'facilities',
       'property_facilities', 'property_media',
       'property_verification_events', 'property_status_events'
     )),
  0,
  'Phase 3A tables have zero direct-access policies'
);

select ok(not has_schema_privilege('anon', 'public', 'USAGE'), 'anon cannot use public schema');
select ok(not has_schema_privilege('authenticated', 'public', 'USAGE'), 'authenticated cannot use public schema');
select ok(has_schema_privilege('service_role', 'public', 'USAGE'), 'server role can use public schema');

select ok(not has_table_privilege('anon', 'public.properties', 'SELECT'), 'anon cannot read properties directly');
select ok(not has_table_privilege('authenticated', 'public.properties', 'SELECT'), 'authenticated cannot read properties directly');
select ok(has_table_privilege('service_role', 'public.properties', 'SELECT'), 'server role can read properties');
select ok(not has_table_privilege('anon', 'public.property_media', 'SELECT'), 'anon cannot read property media directly');
select ok(not has_table_privilege('authenticated', 'public.property_status_events', 'SELECT'), 'authenticated cannot read private property status history');

select ok(
  to_regprocedure('public.transition_property(uuid,uuid,public.property_status,text,text,text)') is not null,
  'property transition function exists'
);

select ok(
  not (select prosecdef from pg_proc where oid = to_regprocedure('public.transition_property(uuid,uuid,public.property_status,text,text,text)')),
  'property transition function is invoker-security'
);

select ok(
  has_function_privilege('service_role', 'public.transition_property(uuid,uuid,public.property_status,text,text,text)', 'EXECUTE'),
  'server role can execute property transitions'
);

select ok(
  not has_function_privilege('anon', 'public.transition_property(uuid,uuid,public.property_status,text,text,text)', 'EXECUTE'),
  'anon cannot execute property transitions'
);

select ok(
  not has_function_privilege('authenticated', 'public.transition_property(uuid,uuid,public.property_status,text,text,text)', 'EXECUTE'),
  'authenticated cannot execute property transitions directly'
);

select ok(has_type_privilege('service_role', 'public.property_status', 'USAGE'), 'server role can use property status enum');
select ok(not has_type_privilege('anon', 'public.property_status', 'USAGE'), 'anon cannot use property status enum');

select ok(
  exists (select 1 from pg_constraint where conname = 'properties_published_requirements'),
  'published properties require verification, publication actor and known island'
);

select ok(
  exists (select 1 from pg_constraint where conname = 'properties_coordinate_pair'),
  'latitude and longitude must be supplied together'
);

select ok(
  exists (select 1 from pg_constraint where conname = 'properties_latitude_range')
  and exists (select 1 from pg_constraint where conname = 'properties_longitude_range'),
  'coordinates are constrained to valid geographic ranges'
);

select ok(
  exists (select 1 from pg_constraint where conname = 'properties_island_atoll_fk'),
  'property island and atoll must be a matching geography pair'
);

select ok(
  exists (select 1 from pg_constraint where conname = 'property_media_source'),
  'property media must have a storage path or valid HTTP(S) URL'
);

select ok(
  exists (select 1 from pg_constraint where conname = 'property_media_review_state'),
  'property media approval requires a reviewer and review timestamp'
);

-- Create a journalist-owned property and an editor to exercise the transition matrix.
do $body$
declare
  v_journalist uuid := gen_random_uuid();
  v_editor uuid := gen_random_uuid();
  v_atoll uuid;
  v_island uuid;
  v_property uuid;
begin
  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values
    (v_journalist, 'authenticated', 'authenticated', v_journalist::text || '@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
    (v_editor, 'authenticated', 'authenticated', v_editor::text || '@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

  update public.profiles set role = 'journalist' where id = v_journalist;
  update public.profiles set role = 'editor' where id = v_editor;

  insert into public.atolls (name, slug)
  values ('pgTAP Test Atoll', 'pgtap-test-atoll')
  returning id into v_atoll;

  insert into public.islands (atoll_id, name, slug)
  values (v_atoll, 'pgTAP Test Island', 'pgtap-test-island')
  returning id into v_island;

  insert into public.properties (
    name, slug, property_type, atoll_id, island_id, created_by, assigned_to
  )
  values (
    'pgTAP Test Property', 'pgtap-test-property', 'guesthouse', v_atoll, v_island, v_journalist, v_journalist
  )
  returning id into v_property;

  perform set_config('test.property_journalist', v_journalist::text, true);
  perform set_config('test.property_editor', v_editor::text, true);
  perform set_config('test.property_id', v_property::text, true);
end;
$body$;

set local role service_role;
do $body$
begin
  perform set_config(
    'test.property_submit_status',
    public.transition_property(
      current_setting('test.property_journalist')::uuid,
      current_setting('test.property_id')::uuid,
      'in_review'::public.property_status
    )::text,
    true
  );
end;
$body$;
reset role;

select is(
  current_setting('test.property_submit_status'),
  'in_review',
  'assigned journalist can submit a draft property for review'
);

set local role service_role;
do $body$
begin
  begin
    perform public.transition_property(
      current_setting('test.property_journalist')::uuid,
      current_setting('test.property_id')::uuid,
      'verified'::public.property_status,
      'Official source',
      'https://example.test/property'
    );
    raise exception 'expected journalist verification denial' using errcode = 'P0001';
  exception
    when sqlstate '42501' then
      null;
  end;
end;
$body$;
reset role;

select ok(true, 'journalist cannot verify a property');

set local role service_role;
do $body$
begin
  perform public.transition_property(
    current_setting('test.property_editor')::uuid,
    current_setting('test.property_id')::uuid,
    'verified'::public.property_status,
    'Official property website',
    'https://example.test/property',
    'Verified against official source'
  );

  perform set_config(
    'test.property_publish_status',
    public.transition_property(
      current_setting('test.property_editor')::uuid,
      current_setting('test.property_id')::uuid,
      'published'::public.property_status
    )::text,
    true
  );
end;
$body$;
reset role;

select is(
  current_setting('test.property_publish_status'),
  'published',
  'editor can verify and publish a property after source and geography checks'
);

select is(
  (select count(*)::integer
   from public.property_verification_events
   where property_id = current_setting('test.property_id')::uuid),
  1,
  'verification source and actor are retained in an immutable event'
);

select is(
  (select count(*)::integer
   from public.property_status_events
   where property_id = current_setting('test.property_id')::uuid),
  3,
  'submission, verification and publication each write a status event'
);

select ok(
  (select verified_at is not null and verified_by = current_setting('test.property_editor')::uuid
          and published_at is not null and published_by = current_setting('test.property_editor')::uuid
   from public.properties
   where id = current_setting('test.property_id')::uuid),
  'published property records its verifier and publisher'
);

select * from finish();

rollback;
