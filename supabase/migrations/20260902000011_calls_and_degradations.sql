-- 11 · The telephony extension, and the third state axis.

-- Call is a Conversation over telephony. conversation_id is BOTH primary key
-- and foreign key: 0..1 Call per Conversation, structurally, with no second
-- identity for one communication episode.
--
-- Channel extensions are earned by real channel-specific data, not created for
-- symmetry. Email and WhatsApp get one when they ship and have their own; the
-- in-app channel may never need one.
create table voxi.calls (
  conversation_id uuid primary key references voxi.conversations on delete cascade,
  account_id      uuid not null references voxi.accounts on delete cascade,
  voxi_number_id  uuid not null,

  direction       text not null check (direction in ('inbound', 'outbound')),
  -- How the Call reached the Number. Both are inbound to Voxi.
  arrival         text check (arrival in ('direct', 'forwarded')),

  caller_e164     text,
  caller_name     text,
  callee_e164     text,

  -- Product MEANING, never lifecycle, and it carries NO attention semantics.
  -- Nothing may derive needs_attention from this column.
  outcome_id      smallint references voxi.call_outcomes on delete restrict,

  sip_call_id     text unique,
  provider        text,
  provider_ref    text,

  constraint calls_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade,

  constraint calls_number_tenant_fk
    foreign key (account_id, voxi_number_id)
    references voxi.voxi_numbers (account_id, id) on delete restrict
);

comment on table voxi.calls is
  'A Call is a telephony Conversation. Every Call is a Conversation; not every Conversation is a Call. Nothing declaratively forces a telephony Conversation to HAVE this row — that is a transaction invariant, recorded not assumed.';

-- Axis 3 of 3. Structured records of a Skill that could not be used at
-- bootstrap, so Voxi continued with reduced capability.
--
-- 1:N, not a boolean: more than one Skill can degrade in a single bootstrap,
-- and ADR-0006 requires the reason survive without anyone parsing error prose.
-- is_degraded is EXISTS(...) over this table.
--
-- Degradation composes with lifecycle and enrichment; a fully enriched
-- Conversation can still be degraded.
create table voxi.conversation_degradations (
  id              uuid primary key default voxi.uuidv7(),
  conversation_id uuid not null references voxi.conversations on delete cascade,
  account_id      uuid not null references voxi.accounts on delete cascade,

  skill_slug      text not null,
  error_type      text not null,
  missing_ref     text,
  -- Raw internals. The client-facing projection omits this column.
  detail          jsonb,
  occurred_at     timestamptz not null default now(),

  constraint degradations_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade
);
