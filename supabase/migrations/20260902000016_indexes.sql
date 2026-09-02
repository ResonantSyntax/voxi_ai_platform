-- 16 · Indexes.
--
-- Uniqueness and primary keys were declared with their tables. This file adds
-- foreign-key support and known access paths.
--
-- Postgres does NOT index foreign keys automatically, and an unindexed FK makes
-- every parent DELETE scan the child. Since the single-column FKs to
-- conversations were removed in favour of composite tenant FKs, the supporting
-- indexes must lead with account_id to match.
--
-- Deliberately NOT created, because an existing UNIQUE constraint already
-- provides a usable index:
--   subscribers (account_id)          covered by subscribers_one_per_account
--   voxi_numbers (account_id)         covered by voxi_numbers_one_per_account
--   conversation_turns (conversation_id, sequence)  covered by turns_sequence_unique
--   turn_content (turn_id, ordinal)   covered by content_ordinal_unique
--   runtime_releases (id, runtime_hash)  covered by runtime_releases_hash_key

-- Foreign-key support ------------------------------------------------------
create index subscriptions_account_idx       on voxi.subscriptions (account_id);
create index subscription_events_account_idx on voxi.subscription_events (account_id);
create index subscription_events_sub_idx     on voxi.subscription_events (subscription_id);
create index skill_tools_tool_idx            on voxi.skill_tools (tool_id);
create index skill_capabilities_cap_idx      on voxi.skill_capabilities (capability_id);
create index runtime_releases_draft_idx      on voxi.runtime_releases (source_draft_id);
create index qa_pairs_account_idx            on voxi.qa_pairs (account_id);
create index rules_account_idx               on voxi.rules (account_id);

-- Composite tenant FK support. Column order matches the constraint.
create index conversations_runtime_idx  on voxi.conversations (runtime_release_id, runtime_hash);
-- Child side of conversations_context_fk, so deleting a snapshot does not scan.
create index conversations_context_idx  on voxi.conversations (account_id, context_hash);
create index calls_tenant_idx           on voxi.calls (account_id, conversation_id);
create index calls_number_idx           on voxi.calls (account_id, voxi_number_id);
create index degradations_tenant_idx    on voxi.conversation_degradations (account_id, conversation_id);
create index turns_tenant_idx           on voxi.conversation_turns (account_id, conversation_id);
create index content_tenant_idx         on voxi.turn_content (account_id, turn_id);
create index tasks_tenant_idx           on voxi.tasks (account_id, conversation_id);
create index input_requests_tenant_idx  on voxi.input_requests (account_id, conversation_id);
create index jobs_tenant_idx            on voxi.jobs (account_id, conversation_id);

-- Known access paths -------------------------------------------------------

-- Conversation History, newest first, cursor-paginated. The most frequent
-- query in the product.
create index conversations_history_idx
  on voxi.conversations (account_id, started_at desc);

-- The same list filtered by Channel — one of the two approved filters.
create index conversations_channel_history_idx
  on voxi.conversations (account_id, channel_id, started_at desc);

-- Attention, half one: open Tasks.
create index tasks_open_idx
  on voxi.tasks (account_id, status, created_at desc);

-- Attention, half two: unresolved Input Requests. Partial — only pending rows
-- are ever counted.
create index input_requests_pending_idx
  on voxi.input_requests (account_id)
  where status = 'pending';

-- The job claim query: WHERE status='pending' AND next_attempt_at <= now()
-- ORDER BY created_at FOR UPDATE SKIP LOCKED.
create index jobs_claim_idx
  on voxi.jobs (next_attempt_at, created_at)
  where status = 'pending';

-- The stale-claim sweeper: workers that died after committing their claim.
create index jobs_stale_idx
  on voxi.jobs (claimed_at)
  where status = 'processing';

-- The stale-Conversation sweeper: an agent that died mid-call would otherwise
-- leave lifecycle 'active' forever.
create index conversations_stale_idx
  on voxi.conversations (started_at)
  where lifecycle = 'active';

-- Inbound telephony resolves the Account from the dialled Number, covered by
-- the unique constraint on e164.

-- DEFERRED until measured: virtualisation support, partitioning of
-- conversation_turns or turn_content, and any vector or hybrid retrieval index.
