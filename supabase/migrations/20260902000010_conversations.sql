-- 10 · The Conversation root.
--
-- One conversational exchange involving Voxi, through one channel. This is the
-- product's own word (CONTEXT.md), used unchanged — there is nothing to
-- translate between UI, API and schema.

create table voxi.conversations (
  id          uuid primary key default voxi.uuidv7(),
  account_id  uuid not null references voxi.accounts on delete cascade,

  -- Where and how. The composite FK to channel_modes is what makes an invalid
  -- pair such as sms + realtime_voice unrepresentable.
  channel_id  smallint not null,
  mode_id     smallint not null,

  -- Runtime identity. Written ONCE at bootstrap, never updated. Together these
  -- reconstruct exactly what produced the conversation.
  runtime_release_id     uuid  not null,
  runtime_hash           bytea not null check (length(runtime_hash) = 32),
  context_hash           bytea not null check (length(context_hash) = 32),
  effective_tier_id      smallint not null references voxi.tiers on delete restrict,

  -- Axis 1: did the conversation execute?
  lifecycle   voxi.conversation_lifecycle not null default 'active',
  -- Axis 2: did post-conversation processing succeed? Independent of axis 1.
  -- Axis 3, degradation, is rows in conversation_degradations.
  enrichment_status voxi.enrichment_status not null default 'pending',

  -- The channel-neutral subject or topic of the Conversation, shown in the
  -- product UI. NOT an Email Subject header — raw Email metadata belongs to a
  -- future Email extension.
  subject     text,

  -- Summary is FIELDS here, not a table. One current Summary per Conversation,
  -- no version history. Promote to a table only when regeneration history,
  -- human edits or multiple summary types genuinely exist.
  summary               text,
  summary_generated_at  timestamptz,
  summary_model_alias   text,

  -- Derived search document. See migration 15 for maintenance.
  search_tsv  tsvector,

  started_at  timestamptz not null default now(),
  ended_at    timestamptz,

  -- The pair, not the id alone: runtime_hash is denormalised onto the
  -- Conversation so it is readable without a join, and this makes it
  -- impossible for it to disagree with the release it names.
  constraint conversations_runtime_fk
    foreign key (runtime_release_id, runtime_hash)
    references voxi.runtime_releases (id, runtime_hash) on delete restrict,

  constraint conversations_channel_mode_valid
    foreign key (channel_id, mode_id)
    references voxi.channel_modes (channel_id, mode_id) on delete restrict,

  constraint conversations_context_fk
    foreign key (account_id, context_hash)
    references voxi.context_snapshots (account_id, context_hash) on delete restrict,

  -- Supports composite tenant foreign keys from every child.
  constraint conversations_tenant_key unique (account_id, id)
);

comment on constraint conversations_context_fk on voxi.conversations is
  'Composite tenant FK: a Conversation can only reference a context snapshot owned by its own Account.';
