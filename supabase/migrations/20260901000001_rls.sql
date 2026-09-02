-- Authorisation is RLS and nothing else: the browser queries Postgres directly
-- (grilling round 3, Q13). Every table is scoped by account_id.

-- Stable so the planner calls it once per statement rather than per row.
create or replace function voxi.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select account_id from voxi.subscribers where id = auth.uid()
$$;

-- Give every new auth user an account and a subscriber row.
create or replace function voxi.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_account_id uuid;
begin
  insert into voxi.accounts default values returning id into new_account_id;
  insert into voxi.subscribers (id, account_id, display_name)
  values (new.id, new_account_id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function voxi.handle_new_user();

grant usage on schema voxi to authenticated;

do $$
declare
  t text;
begin
  foreach t in array array[
    'accounts','subscribers','voxi_numbers','calls','transcripts',
    'tasks','rules','subscriptions'
  ] loop
    execute format('alter table voxi.%I enable row level security', t);
    execute format('alter table voxi.%I force row level security', t);
  end loop;
end $$;

-- accounts and subscribers key off their own id/account_id; the rest are
-- uniform. Read is granted everywhere; writes only where a Subscriber should
-- be authoring. Calls, transcripts and summaries are written by the agent
-- using the service role, which bypasses RLS.
create policy account_self on voxi.accounts
  for select to authenticated using (id = voxi.current_account_id());

create policy subscriber_self on voxi.subscribers
  for select to authenticated using (account_id = voxi.current_account_id());
create policy subscriber_update_self on voxi.subscribers
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array['voxi_numbers','calls','transcripts','subscriptions'] loop
    execute format(
      'create policy %I on voxi.%I for select to authenticated using (account_id = voxi.current_account_id())',
      t || '_read', t);
  end loop;

  -- Subscribers author their own tasks and rules, so these get full CRUD.
  foreach t in array array['tasks','rules'] loop
    execute format(
      'create policy %I on voxi.%I for all to authenticated
         using (account_id = voxi.current_account_id())
         with check (account_id = voxi.current_account_id())',
      t || '_all', t);
  end loop;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'accounts','subscribers','voxi_numbers','calls','transcripts',
    'tasks','rules','subscriptions'
  ] loop
    execute format('grant select on voxi.%I to authenticated', t);
  end loop;
  grant insert, update, delete on voxi.tasks, voxi.rules to authenticated;
  grant update on voxi.subscribers to authenticated;
end $$;
