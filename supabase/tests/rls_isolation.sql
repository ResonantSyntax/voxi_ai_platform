-- Run against a local stack:  supabase start && psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" -f supabase/tests/rls_isolation.sql
-- Asserts one thing: a Subscriber cannot see another account's Calls.
-- Rolls back, so it is safe to run repeatedly.

begin;

insert into auth.users (id, email, aud, role)
values ('11111111-1111-1111-1111-111111111111', 'a@test.local', 'authenticated', 'authenticated'),
       ('22222222-2222-2222-2222-222222222222', 'b@test.local', 'authenticated', 'authenticated');
-- handle_new_user() has now created an account + subscriber for each.

insert into voxi.voxi_numbers (account_id, e164, status)
select account_id, '+2787000000' || row_number() over (order by id), 'active'
from voxi.subscribers;

insert into voxi.calls (account_id, voxi_number_id, caller_e164, arrival, outcome)
select account_id, id, '+27820001111', 'direct', 'handled' from voxi.voxi_numbers;

do $$
declare
  visible int;
begin
  set local role authenticated;

  perform set_config('request.jwt.claims',
    '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
  select count(*) into visible from voxi.calls;
  if visible <> 1 then
    raise exception 'RLS leak: subscriber A sees % calls, expected 1', visible;
  end if;

  perform set_config('request.jwt.claims',
    '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
  select count(*) into visible from voxi.calls;
  if visible <> 1 then
    raise exception 'RLS leak: subscriber B sees % calls, expected 1', visible;
  end if;

  -- An anonymous request must see nothing at all.
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  select count(*) into visible from voxi.calls;
  if visible <> 0 then
    raise exception 'RLS leak: anon sees % calls, expected 0', visible;
  end if;

  reset role;
  raise notice 'RLS isolation OK';
end $$;

rollback;
