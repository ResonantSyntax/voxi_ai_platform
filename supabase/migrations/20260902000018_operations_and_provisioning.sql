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
-- fixed, not automatic provisioning itself.
--
-- Without a replacement there is no path at all: a new browser user has no
-- Account, and RLS correctly forbids them creating one, because
-- current_account_id() returns null for a person with no Subscriber row.
--
-- Deterministic and unconditional: every new auth user gets a fresh Account and
-- a fresh Subscriber. There is NO matching on phone, email, name or any other
-- metadata, and no adoption of an existing Subscriber.
--
-- An earlier draft claimed an unlinked Subscriber by matching personal_e164
-- from auth metadata. That was removed: phone numbers are reused, shared,
-- mistyped, stale and normalised inconsistently, so the match is not proof of
-- ownership and a collision would hand a stranger someone else's Account. It
-- also served a pre-auth invitation flow that does not exist in first
-- production.
--
-- The architecture is preserved regardless — subscribers.id is still an
-- independently generated Voxi uuid, and auth_user_id is only a link. When
-- pre-auth Subscribers become real they need an explicit proof-bearing
-- invitation token, never inference from a phone number.
--
-- ATOMICITY: this runs inside the auth.users INSERT transaction. If either
-- insert fails, the auth user insert rolls back with it, so a person can never
-- end up authenticated with no Account.
--
-- IDEMPOTENCY: there is deliberately no "already exists" guard. If this ever
-- ran twice for one auth user, subscribers.auth_user_id UNIQUE rejects the
-- second row and the whole transaction fails loudly, which is the correct
-- outcome — far better than silently owning two Accounts.
create or replace function voxi.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account uuid;
  v_tier    smallint;
begin
  -- ASSUMPTION FLAGGED FOR CONFIRMATION: a new signup starts on Starter
  -- entitlement. PRODUCT.md describes onboarding as "account created -> basic
  -- Voxi setup" without naming an initial Tier, so this is the one value here
  -- not settled by the conceptual design. No billing policy is invented: no
  -- subscription row is created, and Entitlement is simply the free level.
  select t.id into v_tier from voxi.tiers t where t.slug = 'starter';
  if v_tier is null then
    raise exception 'tier "starter" is missing; reference data has not been seeded'
      using errcode = 'no_data_found';
  end if;

  -- account_status defaults to 'active' per the enum default.
  insert into voxi.accounts (entitlement_tier_id)
  values (v_tier)
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

-- A Voxi Number is deliberately NOT provisioned here. It requires a network
-- call to the telephony provider, which must be retryable and must never sit
-- inside a Postgres trigger holding the auth transaction open. Onboarding
-- enqueues that work separately.

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
