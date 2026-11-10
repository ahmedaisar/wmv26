create extension if not exists pgtap with schema extensions;

begin;

select plan(18);

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
  (select prosecdef from pg_proc where oid = to_regprocedure('public.transition_article(uuid,public.article_status,timestamp with time zone,text)')),
  'transition RPC runs with definer privileges after explicit role and ownership checks'
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

select ok(
  not has_function_privilege('anon', 'public.current_app_role()', 'EXECUTE'),
  'anonymous users cannot call the authenticated role helper'
);

select ok(
  has_function_privilege('authenticated', 'public.current_app_role()', 'EXECUTE'),
  'authenticated role helper remains available to trusted role-checking RPCs'
);

select ok(
  to_regprocedure('public.create_article_draft(text,text,uuid,text,jsonb,public.article_type,public.article_disclosure,uuid,text,text)') is not null,
  'create draft RPC exists'
);

select ok(
  (select prosecdef from pg_proc where oid = to_regprocedure('public.create_article_draft(text,text,uuid,text,jsonb,public.article_type,public.article_disclosure,uuid,text,text)')),
  'create draft RPC runs with definer privileges after explicit role and author checks'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.create_article_draft(text,text,uuid,text,jsonb,public.article_type,public.article_disclosure,uuid,text,text)',
    'EXECUTE'
  ),
  'anonymous users cannot create article drafts'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.create_article_draft(text,text,uuid,text,jsonb,public.article_type,public.article_disclosure,uuid,text,text)',
    'EXECUTE'
  ),
  'authenticated users can call create draft RPC subject to role checks'
);

select ok(
  not has_table_privilege('authenticated', 'public.articles', 'INSERT'),
  'authenticated users cannot insert articles outside the draft RPC'
);

select ok(
  not has_table_privilege('authenticated', 'public.articles', 'UPDATE'),
  'authenticated users cannot bypass the transition RPC with direct updates'
);

select ok(
  not has_table_privilege('authenticated', 'public.article_revisions', 'INSERT'),
  'authenticated users cannot forge revision snapshots'
);

select ok(
  not has_table_privilege('authenticated', 'public.article_status_events', 'INSERT'),
  'authenticated users cannot forge status history events'
);

select * from finish();

rollback;
