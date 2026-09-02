-- 12 · Turns and their content parts.
--
-- Turns are authoritative. There is no rendered full-text column to drift out
-- of sync; a Transcript is derived from these rows and may be cached.
--
-- Written INCREMENTALLY while lifecycle = active, each in its own short
-- transaction. Persist live is not render live: the UI exposes no live
-- Transcript in first production. Incremental persistence is what makes a
-- Failed Conversation retain the partial evidence the product shows.
--
-- bigint identity rather than UUIDv7: these are the highest-volume rows in the
-- schema and are never referenced externally.
create table voxi.conversation_turns (
  id              bigint generated always as identity primary key,
  -- Single-column FK omitted; the composite tenant FK carries it.
  conversation_id uuid not null,
  account_id      uuid not null references voxi.accounts on delete cascade,

  -- Channel-neutral authorship. An in-app Conversation has no Caller, and
  -- 'agent' would collide with LiveKit's own Agent.
  role            voxi.turn_role not null,

  -- Assigned by the agent, monotonic within the Conversation.
  sequence        integer not null check (sequence >= 0),
  occurred_at     timestamptz not null default now(),

  constraint turns_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade,

  constraint turns_sequence_unique unique (conversation_id, sequence),
  -- Supports the composite tenant FK from turn_content.
  constraint turns_tenant_key unique (account_id, id)
);

comment on table voxi.conversation_turns is
  'One row per FINAL contribution. Interim STT hypotheses are realtime runtime data, not product history, and are excluded. Raw provider events belong in observability with a retention window.';

-- A Turn carries N content parts. In-app, WhatsApp and Email turns are
-- genuinely multimodal — text plus a document, or a voice note — so this is
-- known domain shape, not speculative abstraction. First-production telephony
-- turns have exactly one text part.
--
-- Text lives inline. Binary lives in Supabase Storage and is referenced here:
-- storage has its own access control, so object paths are prefixed with the
-- account id and the Storage policy keys on that prefix.
--
-- Realtime voice audio is never persisted. Asynchronous audio supplied as
-- message content — a WhatsApp voice note — may be, if that channel ships.
create table voxi.turn_content (
  id           bigint generated always as identity primary key,
  turn_id      bigint not null,
  account_id   uuid not null references voxi.accounts on delete cascade,

  kind         voxi.content_kind not null,
  ordinal      smallint not null default 0 check (ordinal >= 0),

  text         text,
  storage_path text,
  mime_type    text,
  size_bytes   bigint check (size_bytes >= 0),
  checksum     bytea,

  created_at   timestamptz not null default now(),

  constraint content_tenant_fk
    foreign key (account_id, turn_id)
    references voxi.conversation_turns (account_id, id) on delete cascade,

  constraint content_ordinal_unique unique (turn_id, ordinal),

  -- A Content Part is ONE thing: inline text or a stored object, never both
  -- and never neither. A part carrying both would make "what did this turn
  -- contain" ambiguous and give the search and rendering paths two sources.
  constraint content_has_exactly_one_body check (
    (kind =  'text' and text is not null     and storage_path is null)
    or
    (kind <> 'text' and storage_path is not null and text is null)
  )
);
