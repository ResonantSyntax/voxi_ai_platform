-- 18 · Database-owned metadata, onboarding, and the narrow client operations.
--
-- Runs last because it needs every table plus voxi.current_account_id().

-- 1 · updated_at is the database's, not the client's -------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'subscriptions','skills','runtime_drafts','qa_pairs','rules','tasks'
  ] loop
    execute format(
      'create trigger %I before update on voxi.%I
         for each row execute function voxi.set_updated_at()', t || '_touch', t);
  end loop;
end $$;

-- 2 · Onboarding ------------------------------------------------------------
-- Stage 02 removed the old auth trigger because it welded Subscriber identity
-- to auth.users: subscribers.id WAS auth.users.id. That is the thing being
-- fixed, not the automatic provisioning itself.
--
-- Without a replacement there is no path at all: a new browser user has no
-- Account, and RLS correctly forbids them creating one, because
-- current_account_id() returns null for a person with no Subscriber row.
--
-- So: still a trigger, but the Subscriber now gets its OWN uuid and merely
-- LINKS to the auth user. Pre-auth invited Subscribers stay possible — the
-- claim branch below adopts an existing unlinked row instead of creating one.
create or replace function voxi.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_starter smallint;
begin
  -- Already linked (re-run, or a restored user): nothing to do.
  if exists (select 1 from voxi.subscribers s where s.auth_user_id = new.id) then
    return new;
  end if;

  -- Claim branch: an invited Subscriber created before they had an auth
  -- identity. Adopt the existing row rather than creating a second Account.
  update voxi.subscribers s
     set auth_user_id = new.id
   where s.auth_user_id is null
     and s.personal_e164 is not distinct from (new.raw_user_meta_data ->> 'phone')
     and (new.raw_user_meta_data ->> 'phone') is not null;
  if found then
    return new;
  end if;

  select id into v_starter from voxi.tiers where slug = 'starter';

  insert into voxi.accounts (entitlement_tier_id)
  values (v_starter)
  returning id into v_account;

  insert into voxi.subscribers (account_id, auth_user_id, display_name)
  values (v_account, new.id, new.raw_user_meta_data ->> 'full_name');

  return new;
end;
$$;

revoke all on function voxi.handle_new_auth_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function voxi.handle_new_auth_user();

-- A Voxi Number is NOT provisioned here. It requires an external provider call
-- that cannot happen inside a database trigger; onboarding enqueues that work.

-- 3 · Answer an Input Request ------------------------------------------------
-- The single narrow operation the product exposes, replacing a direct UPDATE
-- grant that would have let the browser fabricate answered_at or set an
-- answered status with no answer.
--
-- SECURITY DEFINER with an explicit tenant check: the caller may only answer a
-- pending request belonging to their own Account, and the database writes the
-- timestamp.
create or replace function voxi.answer_input_request(
  p_request_id uuid,
  p_answer     text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid := voxi.current_account_id();
begin
  if v_account is null then
    raise exception 'no account for the current user' using errcode = 'insufficient_privilege';
  end if;

  if p_answer is null or btrim(p_answer) = '' then
    raise exception 'an answer is required' using errcode = 'check_violation';
  end if;

  update voxi.input_requests r
     set answer      = p_answer,
         status      = 'answered',
         answered_at = now()
   where r.id = p_request_id
     and r.account_id = v_account
     and r.status = 'pending';

  if not found then
    -- Deliberately does not distinguish "not yours" from "not pending": a
    -- caller must not be able to probe for the existence of another tenant's
    -- rows.
    raise exception 'no pending input request % for this account', p_request_id
      using errcode = 'no_data_found';
  end if;
end;
$$;

revoke all on function voxi.answer_input_request(uuid, text) from public;
grant execute on function voxi.answer_input_request(uuid, text) to authenticated;

comment on function voxi.answer_input_request(uuid, text) is
  'Resolve-only, per the first-production decision: records the answer and resolves the request. It deliberately does NOT trigger re-enrichment.';
