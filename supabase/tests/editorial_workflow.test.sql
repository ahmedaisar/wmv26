create extension if not exists pgtap with schema extensions;

begin;

select plan(22);

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

drop table public.__default_table_probe;
drop function public.__default_execute_probe();

select * from finish();

rollback;
