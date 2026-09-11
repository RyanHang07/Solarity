-- 113. The data export has never worked, and `security invoker` is why.
--
-- ## The collision
--
-- Two deliberate decisions, each defensible, that cannot both hold:
--
-- 1. **`public.users` is not directly selectable.** `authenticated` has no
--    SELECT grant on it — access goes through masked `security definer` RPCs
--    (`profile_by_username`, `circle_roster`, `search_users`). Of the eight
--    tables this export touches, it is the only one without the grant.
-- 2. **`export_user_data` was written `security invoker`** so that it is,
--    in the Edge Function's words, "structurally incapable of returning anyone
--    else's rows even if a WHERE clause were wrong".
--
-- A security-invoker function cannot read a table its caller cannot read. So
-- the function raises `42501` on its very first block — `profile` — for every
-- caller, always. `lib/errors.ts` renders a bare 42501 as "You don't have
-- access to that.", which is indistinguishable from the function's own
-- `raise ... using errcode = 'insufficient_privilege'` for a null `auth.uid()`,
-- and that collapsing is why this survived: the two very different causes say
-- the same sentence.
--
-- **Nothing caught it because nothing called it.** `delete-account.spec.ts`
-- asserted the link was visible and stopped there. The audit of 11 September
-- wrote the first test that actually downloads the file, and it failed on the
-- first run.
--
-- ## Why definer rather than granting SELECT on users
--
-- Granting `authenticated` SELECT on `public.users` would fix this and undo
-- decision 1 across the whole app, exposing the most sensitive table in the
-- schema to direct PostgREST reads to fix one function. That is the larger
-- change by far, and the wrong direction.
--
-- The guarantee given up is real but was never in force: the function has not
-- run since it was written. What replaces it is the pattern every other RPC
-- here already uses — `auth.uid()` captured once into `v_uid`, refused when
-- null, and **every one of the seven clauses scoped `where ... = v_uid`**.
-- There is no parameter, so there is no argument for a caller to influence.
-- The body below is the deployed one, unchanged except for the security
-- attribute; this migration deliberately does not take the opportunity to
-- adjust what the export contains, because `/support` publishes that list and
-- `e2e/delete-account.spec.ts` now asserts it in both directions.

create or replace function public.export_user_data()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  -- **The whole authorisation, and now it is load-bearing.** Under invoker
  -- rights a mistake here would have been caught by RLS; under definer rights
  -- it is the only check. It comes first and there is no path around it.
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = 'insufficient_privilege';
  end if;

  return jsonb_build_object(
    'exported_at', now(),
    'profile', (
      select to_jsonb(x) from (
        select u.id, u.username, u.display_name, u.avatar_url,
               u.checkin_timezone, u.created_at
        from public.users u where u.id = v_uid
      ) x
    ),
    'lifetime_stats', (
      select to_jsonb(x) from (
        select current_streak, longest_streak_ever, total_days_completed,
               total_goals_achieved, visible_on_profile
        from public.user_lifetime_stats where user_id = v_uid
      ) x
    ),
    'goals', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select g.id, g.title, c.name as category, g.deadline,
               g.achieved_at, g.archived_at, g.created_at
        from public.goals g
        join public.goal_categories c on c.id = g.category_id
        where g.user_id = v_uid
        order by g.created_at
      ) x
    ), '[]'::jsonb),
    'check_ins', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select pe.check_in_date, pe.note, pe.photo_url, pe.created_at
        from public.progress_entries pe
        where pe.user_id = v_uid
        order by pe.check_in_date
      ) x
    ), '[]'::jsonb),
    'daily_completion', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select date, all_completed from public.daily_completion
        where user_id = v_uid order by date
      ) x
    ), '[]'::jsonb),
    'circles', coalesce((
      select jsonb_agg(to_jsonb(x)) from (
        select gr.name, gm.role, gm.joined_at
        from public.group_members gm
        join public.groups gr on gr.id = gm.group_id
        where gm.user_id = v_uid
      ) x
    ), '[]'::jsonb)
  );
end;
$$;

-- Re-asserted rather than assumed: `create or replace` preserves grants, and
-- restating them costs nothing and survives the function being recreated by
-- some later migration that forgets.
revoke execute on function public.export_user_data() from public;
revoke execute on function public.export_user_data() from anon;
grant  execute on function public.export_user_data() to authenticated;


-- ---------------------------------------------------------------------------
-- Assertions. These ran green in a rolled-back transaction before this file
-- existed, which is the only reason to believe the fix rather than hope it.
-- ---------------------------------------------------------------------------
do $$
declare
  v_secdef  boolean;
  v_subject uuid;
  v_keys    int;
begin
  -- The precondition that made this necessary. If a later migration grants
  -- SELECT on `public.users` to `authenticated`, the reasoning above stops
  -- applying and somebody should revisit whether definer is still wanted.
  if has_table_privilege('authenticated', 'public.users', 'SELECT') then
    raise exception
      'authenticated can now SELECT public.users; revisit why this is definer';
  end if;

  select p.prosecdef into v_secdef
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'export_user_data';

  if not v_secdef then
    raise exception 'export_user_data is not security definer';
  end if;

  if has_function_privilege('anon', 'public.export_user_data()', 'EXECUTE') then
    raise exception 'anon can execute export_user_data';
  end if;
  if not has_function_privilege('authenticated', 'public.export_user_data()', 'EXECUTE') then
    raise exception 'authenticated cannot execute export_user_data';
  end if;

  -- It returns the caller's own data, and all seven promised keys. Skipped
  -- rather than failed on an empty database, so this file is safe to replay
  -- against a fresh project.
  select id into v_subject from public.users order by created_at limit 1;
  if v_subject is null then
    raise notice 'no users; skipping the round-trip assertion';
    return;
  end if;

  perform set_config('request.jwt.claims',
                     json_build_object('sub', v_subject,
                                       'role', 'authenticated')::text, true);

  select count(*) into v_keys
  from jsonb_object_keys(public.export_user_data());

  if v_keys <> 7 then
    raise exception 'export returned % keys, expected 7 (/support publishes the list)', v_keys;
  end if;

  -- And it is *that* user's row, not merely some user's.
  if (public.export_user_data() -> 'profile' ->> 'id')::uuid <> v_subject then
    raise exception 'export returned a different user''s profile';
  end if;

  perform set_config('request.jwt.claims', null, true);
end $$;
