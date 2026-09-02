-- 16 · Indexes.
--
-- Split deliberately. Uniqueness and primary keys were declared inline with
-- their tables; this file adds foreign-key support and known access paths.
-- Postgres does NOT index foreign keys automatically, and an unindexed FK makes
-- every parent DELETE scan the child.

-- Foreign-key support ------------------------------------------------------
create index subscribers_account_idx        on voxi.subscribers (account_id);
create index voxi_numbers_account_idx       on voxi.voxi_numbers (account_id);
create index subscriptions_account_idx      on voxi.subscriptions (account_id);
create index subscription_events_account_idx on voxi.subscription_events (account_id);
create index subscription_events_sub_idx    on voxi.subscription_events (subscription_id);
create index skill_tools_tool_idx           on voxi.skill_tools (tool_id);
create index skill_capabilities_cap_idx     on voxi.skill_capabilities (capability_id);
create index runtime_releases_draft_idx     on voxi.runtime_releases (source_draft_id);
create index qa_pairs_account_idx           on voxi.qa_pairs (account_id);
create index rules_account_idx              on voxi.rules (account_id);
create index conversations_release_idx      on voxi.conversations (runtime_release_id);
create index calls_number_idx               on voxi.calls (voxi_number_id);
create index degradations_conversation_idx  on voxi.conversation_degradations (conversation_id);
create index turn_content_turn_idx          on voxi.turn_content (turn_id);
create index tasks_conversation_idx         on voxi.tasks (conversation_id);
create index input_requests_conversation_idx on voxi.input_requests (conversation_id);
create index jobs_conversation_idx          on voxi.jobs (conversation_id);

-- Known access paths -------------------------------------------------------

-- Conversation History, newest first, with cursor pagination. The single most
-- frequent query in the product.
create index conversations_history_idx
  on voxi.conversations (account_id, started_at desc);

-- The same list filtered by Channel — one of the two approved filters.
create index conversations_channel_history_idx
  on voxi.conversations (account_id, channel_id, started_at desc);

-- Attention, half one: open Tasks.
create index tasks_open_idx
  on voxi.tasks (account_id, status, created_at desc);

-- Attention, half two: unresolved Input Requests. Partial, because only
-- pending rows are ever counted.
create index input_requests_pending_idx
  on voxi.input_requests (account_id)
  where status = 'pending';

-- Transcript render, in order.
create index turns_ordered_idx
  on voxi.conversation_turns (conversation_id, sequence);

-- The job claim query: SELECT ... WHERE status='pending' AND next_attempt_at
-- <= now() ORDER BY created_at FOR UPDATE SKIP LOCKED.
create index jobs_claim_idx
  on voxi.jobs (next_attempt_at, created_at)
  where status = 'pending';

-- The stale-claim sweeper: rows whose worker died after committing the claim.
create index jobs_stale_idx
  on voxi.jobs (claimed_at)
  where status = 'processing';

-- The stale-Conversation sweeper: an agent that died mid-call leaves lifecycle
-- 'active' forever otherwise.
create index conversations_stale_idx
  on voxi.conversations (started_at)
  where lifecycle = 'active';

-- Inbound telephony resolves the Account from the dialled Number. Covered by
-- the unique constraint on e164; no additional index needed.

-- DEFERRED until measured: virtualisation support, partitioning of
-- conversation_turns or turn_content, and any vector or hybrid retrieval index.
