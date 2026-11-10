create extension if not exists pgtap with schema extensions;

begin;

select plan(34);

select ok(
  to_regclass('public.article_status_events') is not null,
  'article status event table exists'
);

select ok(
  (select count(*) = 8
   from pg_class
   where oid in (
     'public.profiles'::regclass,
     'public.authors'::regclass,
     'public.categories'::regclass,
     'public.tags'::regclass,
     'public.articles'::regclass,
     'public.article_tags'::regclass,
     'public.article_revisions'::regclass,
     'public.article_status_events'::regclass
   )
   and relrowsecurity),
  'RLS is enabled on every application table'
);

select ok(not has_schema_privilege('anon', 'public', 'USAGE'), 'anon cannot use the application schema');
select ok(not has_schema_privilege('authenticated', 'public', 'USAGE'), 'authenticated cannot use the application schema');
select ok(has_schema_privilege('service_role', 'public', 'USAGE'), 'server service role can use the application schema');

select is(
  (select count(*)::integer
   from pg_policies
   where schemaname = 'public'
     and tablename in (
       'profiles', 'authors', 'categories', 'tags',
       'articles', 'article_tags', 'article_revisions', 'article_status_events'
     )),
  0,
  'application tables have zero RLS policies'
);

select ok(not has_table_privilege('anon', 'public.articles', 'select'), 'anon cannot select articles');
select ok(not has_table_privilege('authenticated', 'public.articles', 'select'), 'authenticated cannot select articles');
select ok(not has_table_privilege('anon', 'public.profiles', 'select'), 'anon cannot select profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'select'), 'authenticated cannot select profiles');
select ok(not has_table_privilege('anon', 'public.article_revisions', 'select'), 'anon cannot select revisions');
select ok(has_table_privilege('service_role', 'public.articles', 'select'), 'server service role can select articles');
select ok(has_table_privilege('service_role', 'public.profiles', 'select'), 'server service role can select profiles');
select ok(has_function_privilege('service_role', 'public.set_profile_updated_at()', 'EXECUTE'), 'server role can execute profile update trigger');
select ok(has_function_privilege('service_role', 'public.set_editorial_updated_at()', 'EXECUTE'), 'server role can execute editorial update trigger');

select ok(
  to_regprocedure('public.transition_article(uuid,uuid,public.article_status,timestamp with time zone,text)') is not null,
  'server transition RPC exists'
);

select ok(
  not (select prosecdef from pg_proc where oid = to_regprocedure('public.transition_article(uuid,uuid,public.article_status,timestamp with time zone,text)')),
  'transition RPC runs with invoker privileges'
);

select ok(
  has_function_privilege('service_role', 'public.transition_article(uuid,uuid,public.article_status,timestamp with time zone,text)', 'EXECUTE'),
  'server service role can call transition RPC'
);

select ok(
  not has_function_privilege('anon', 'public.transition_article(uuid,uuid,public.article_status,timestamp with time zone,text)', 'EXECUTE'),
  'anonymous users cannot call transition RPC'
);

select ok(
  not has_function_privilege('authenticated', 'public.transition_article(uuid,uuid,public.article_status,timestamp with time zone,text)', 'EXECUTE'),
  'authenticated users cannot call transition RPC directly'
);

select ok(
  to_regprocedure('public.current_app_role()') is null,
  'JWT-dependent role helper has been removed'
);

select is(
  (select count(*)::integer
   from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public' and p.prosecdef),
  1,
  'only the auth-user profile trigger remains SECURITY DEFINER'
);

select ok(
  (select prosecdef from pg_proc where oid = to_regprocedure('public.handle_new_auth_user()')),
  'auth-user trigger is SECURITY DEFINER'
);

create function public.__default_execute_probe()
returns integer
language sql
as $$ select 1 $$;

select ok(
  not has_function_privilege('anon', 'public.__default_execute_probe()', 'EXECUTE'),
  'new public functions do not grant execute to anon by default'
);

select ok(
  not has_function_privilege('authenticated', 'public.__default_execute_probe()', 'EXECUTE'),
  'new public functions do not grant execute to authenticated by default'
);

create table public.__default_table_probe (id integer primary key);

select ok(
  not has_table_privilege('anon', 'public.__default_table_probe', 'SELECT'),
  'new public tables do not grant select to anon by default'
);

select ok(
  not has_table_privilege('authenticated', 'public.__default_table_probe', 'SELECT'),
  'new public tables do not grant select to authenticated by default'
);

create type public.__default_type_probe as enum ('probe');

select ok(
  not has_type_privilege('anon', 'public.__default_type_probe', 'USAGE'),
  'new public types do not grant usage to anon by default'
);

select ok(
  not has_type_privilege('authenticated', 'public.__default_type_probe', 'USAGE'),
  'new public types do not grant usage to authenticated by default'
);

select ok(
  has_type_privilege('service_role', 'public.__default_type_probe', 'USAGE'),
  'new public types grant usage to the server role by default'
);

drop type public.__default_type_probe;
drop table public.__default_table_probe;
drop function public.__default_execute_probe();

-- Exercise the invoker RPC as the only application database role allowed to call it.
do $
declare
  v_actor_one uuid := gen_random_uuid();
  v_actor_two uuid := gen_random_uuid();
  v_author_id uuid;
  v_article_id uuid;
begin
  perform set_config('test.actor_one', v_actor_one::text, true);
  perform set_config('test.actor_two', v_actor_two::text, true);

  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  )
  values
    (v_actor_one, 'authenticated', 'authenticated', v_actor_one::text || '@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
    (v_actor_two, 'authenticated', 'authenticated', v_actor_two::text || '@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now());

  insert into public.authors (profile_id, slug, display_name)
  values (v_actor_one, 'pgtap-server-boundary-author', 'pgTAP Server Boundary Author')
  returning id into v_author_id;

  insert into public.articles (slug, title, author_id, created_by)
  values ('pgtap-server-boundary-article', 'Server boundary integration test', v_author_id, v_actor_one)
  returning id into v_article_id;

  perform set_config('test.article_id', v_article_id::text, true);
end;
$;

set local role service_role;
do $
begin
  perform set_config(
    'test.transition_result',
    public.transition_article(
      current_setting('test.actor_one')::uuid,
      current_setting('test.article_id')::uuid,
      'in_review'::public.article_status
    )::text,
    true
  );
end;
$;
reset role;

select is(
  current_setting('test.transition_result'),
  'in_review',
  'server role can submit its own contributor draft for review'
);

select is(
  (select count(*)::integer from public.article_revisions
   where article_id = current_setting('test.article_id')::uuid),
  1,
  'successful transition writes one revision atomically'
);

select is(
  (select count(*)::integer from public.article_status_events
   where article_id = current_setting('test.article_id')::uuid),
  1,
  'successful transition writes one status event atomically'
);

set local role service_role;
do $
begin
  begin
    perform public.transition_article(
      current_setting('test.actor_two')::uuid,
      current_setting('test.article_id')::uuid,
      'approved'::public.article_status
    );
    raise exception 'expected contributor ownership denial' using errcode = 'P0001';
  exception
    when sqlstate '42501' then
      null;
  end;
end;
$;
reset role;

select ok(true, 'server transition rejects a different contributor acting on another author draft');

select * from finish();

rollback;
