-- 17 · Row Level Security.
--
-- Authorisation is RLS and nothing else: the browser queries Postgres directly
-- and there is no API tier that would re-implement it (ADR-0004).
--
-- Ownership path is always account_id — one hop, no recursive joins. That is
-- what the denormalisation was for.
--
-- Client WRITES are field- and operation-constrained via GRANT, not blanket
-- table mutability. A policy decides which ROWS; a grant decides which COLUMNS
-- and operations.

grant usage on schema voxi to authenticated, anon;
-- anon gets schema usage but no table grants, so an unauthenticated request
-- fails at the table rather than with an opaque "permission denied for schema".

-- Resolves the requesting Subscriber's Account.
--
-- Defined here rather than in stage 01 because its body reads voxi.subscribers,
-- and check_function_bodies validates SQL function bodies at creation time.
--
-- SECURITY DEFINER is load-bearing: every policy below calls this, and it reads
-- voxi.subscribers, which itself has RLS. Without DEFINER the policy on
-- subscribers would recurse into itself. STABLE so the planner calls it once
-- per statement rather than once per row.
create or replace function voxi.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select account_id from voxi.subscribers where auth_user_id = auth.uid()
$$;

-- Defence in depth: a SECURITY DEFINER function is EXECUTE-able by PUBLIC by
-- default, which would let any role reach it. Grant only what needs it.
revoke all on function voxi.current_account_id() from public;
grant execute on function voxi.current_account_id() to authenticated;

-- uuidv7() is a column DEFAULT, evaluated as the INSERTING role — so every
-- role that inserts needs EXECUTE, including service_role, which is every write
-- the agent and workers make. Revoking from public without this would break
-- them.
revoke all on function voxi.uuidv7() from public;
grant execute on function voxi.uuidv7() to authenticated, service_role;

-- Enable and force everywhere. FORCE also subjects the table owner; roles with
-- BYPASSRLS (service_role) still bypass, which is how the agent and workers write.
do $$
declare t text;
begin
  foreach t in array array[
    'tiers','channels','modes','channel_modes','call_outcomes',
    'accounts','subscribers','voxi_numbers',
    'subscriptions','subscription_events',
    'skills','tools','capabilities','skill_tools','skill_capabilities',
    'runtime_drafts','runtime_releases','runtime_deployment',
    'qa_pairs','rules','context_snapshots',
    'conversations','calls','conversation_degradations',
    'conversation_turns','turn_content',
    'tasks','input_requests','jobs'
  ] loop
    execute format('alter table voxi.%I enable row level security', t);
    execute format('alter table voxi.%I force row level security', t);
  end loop;
end $$;

-- Reference data ------------------------------------------------------------
-- No tenant dimension. The UI needs these for display labels.
do $$
declare t text;
begin
  foreach t in array array['tiers','channels','modes','call_outcomes'] loop
    execute format(
      'create policy %I on voxi.%I for select to authenticated using (true)', t || '_read', t);
    execute format('grant select on voxi.%I to authenticated', t);
  end loop;
end $$;

-- channel_modes is deliberately NOT client-visible: it is runtime validation
-- data, not a label source.

-- Account-owned, read-only for the client -----------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'voxi_numbers','subscriptions',
    'conversations','calls',
    'conversation_turns','turn_content'
  ] loop
    execute format(
      'create policy %I on voxi.%I for select to authenticated
         using (account_id = voxi.current_account_id())', t || '_read', t);
    execute format('grant select on voxi.%I to authenticated', t);
  end loop;
end $$;

-- conversation_degradations is readable so the UI can show "Degraded", but the
-- grant is COLUMN-SCOPED: detail holds raw runtime internals — error payloads,
-- stack context, internal references — that must never become Subscriber-
-- visible. A table-level grant would have exposed it despite the comment
-- claiming otherwise.
--
-- Consequence for clients: SELECT * fails on this table. Callers must name
-- columns, which is the correct habit anyway.
create policy degradations_read on voxi.conversation_degradations
  for select to authenticated using (account_id = voxi.current_account_id());
grant select (id, conversation_id, account_id, skill_slug, occurred_at)
  on voxi.conversation_degradations to authenticated;

-- accounts keys off its own id rather than an account_id column.
create policy accounts_read on voxi.accounts
  for select to authenticated using (id = voxi.current_account_id());
grant select on voxi.accounts to authenticated;

-- Subscriber reads their Account's row and updates only their own profile.
create policy subscribers_read on voxi.subscribers
  for select to authenticated using (account_id = voxi.current_account_id());
create policy subscribers_update_self on voxi.subscribers
  for update to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());
grant select on voxi.subscribers to authenticated;
grant update (display_name, personal_e164) on voxi.subscribers to authenticated;

-- Account-owned, full CRUD --------------------------------------------------
-- Subscriber-authored guidance is genuinely theirs to manage.
create policy qa_pairs_all on voxi.qa_pairs
  for all to authenticated
  using (account_id = voxi.current_account_id())
  with check (account_id = voxi.current_account_id());
create policy rules_all on voxi.rules
  for all to authenticated
  using (account_id = voxi.current_account_id())
  with check (account_id = voxi.current_account_id());

-- Column-scoped writes. account_id must be supplied on insert (the WITH CHECK
-- pins it to the caller's own Account), but created_at and updated_at are
-- database-owned and deliberately ungranted, so a client cannot spoof them.
grant select, delete on voxi.qa_pairs, voxi.rules to authenticated;
grant insert (account_id, question, answer) on voxi.qa_pairs to authenticated;
grant update (question, answer)             on voxi.qa_pairs to authenticated;
grant insert (account_id, label, caller_e164, topic, instruction) on voxi.rules to authenticated;
grant update (label, caller_e164, topic, instruction)             on voxi.rules to authenticated;

-- Account-owned, narrow writes ----------------------------------------------
-- A Task is raised by Voxi; the Subscriber only clears it.
create policy tasks_read on voxi.tasks
  for select to authenticated using (account_id = voxi.current_account_id());
create policy tasks_update on voxi.tasks
  for update to authenticated
  using (account_id = voxi.current_account_id())
  with check (account_id = voxi.current_account_id());
grant select on voxi.tasks to authenticated;
-- status only. updated_at is stamped by trigger — a client must not be able to
-- backdate its own metadata.
grant update (status) on voxi.tasks to authenticated;

-- An Input Request is answered, never authored, by the Subscriber. Resolve-only
-- in first production: answering does not trigger re-enrichment.
create policy input_requests_read on voxi.input_requests
  for select to authenticated using (account_id = voxi.current_account_id());
grant select on voxi.input_requests to authenticated;

-- NO direct UPDATE grant.
--
-- Granting update(answer, status, answered_at) would have let the browser
-- fabricate answered_at, or set status='answered' with an empty answer, or
-- move a request to any status the CHECK happens to permit. The product has
-- one narrow operation — "Answer Voxi" — so the database exposes exactly that,
-- as an RPC in stage 18. The timestamp is the database's to write.

-- Service role only ---------------------------------------------------------
-- No policy and no grant: skills, tools, capabilities, skill_tools,
-- skill_capabilities, runtime_drafts, runtime_releases, runtime_deployment,
-- channel_modes, jobs, context_snapshots, subscription_events.
--
-- context_snapshots holds nothing secret — it is the Subscriber's own Q&A and
-- Rules — but no UI needs it and it is an internal audit artifact.
-- jobs stays hidden because enrichment_status already lives on the
-- Conversation; exposing the queue would leak retry counts and error strings
-- for no benefit.

-- Supabase Storage has its OWN access control on storage.objects, entirely
-- separate from these policies. Object paths are prefixed with the account id
-- and a Storage policy must key on that prefix — otherwise row access is
-- airtight while the bytes are readable by anyone holding a path.
