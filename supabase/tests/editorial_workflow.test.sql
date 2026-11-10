create extension if not exists pgtap with schema extensions;

begin;

select plan(8);

select ok(
  to_regclass('public.article_status_events') is not null,
  'article status event table exists'
);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.article_status_events'::regclass),
  'article status event table has RLS enabled'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'article_status_events'
      and policyname = 'article_status_events_read_accessible_articles'
  ),
  'status history reads are scoped to accessible articles'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'article_status_events'
      and policyname = 'article_status_events_insert_as_actor'
  ),
  'status history inserts are actor-scoped'
);

select ok(
  to_regprocedure('public.transition_article(uuid,public.article_status,timestamp with time zone,text)') is not null,
  'transition RPC exists'
);

select ok(
  not (select prosecdef from pg_proc where oid = to_regprocedure('public.transition_article(uuid,public.article_status,timestamp with time zone,text)')),
  'transition RPC runs with caller privileges'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.transition_article(uuid,public.article_status,timestamp with time zone,text)',
    'EXECUTE'
  ),
  'anonymous users cannot call transition RPC'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.transition_article(uuid,public.article_status,timestamp with time zone,text)',
    'EXECUTE'
  ),
  'authenticated users can call transition RPC subject to RLS and role checks'
);

select * from finish();

rollback;
