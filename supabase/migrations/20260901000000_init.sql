-- Voxi core schema. See CONTEXT.md for the vocabulary and docs/adr/ for the
-- decisions this encodes. Audio is never stored (ADR-0001 context); transcripts
-- are retained as Voxi's long-term memory of a Caller.

create schema if not exists voxi;

create type voxi.tier as enum ('starter', 'pro', 'business');
create type voxi.number_status as enum ('provisioning', 'active', 'released');
-- How the Call reached the Voxi Number. Both are inbound; Voxi never cold-calls.
create type voxi.call_arrival as enum ('direct', 'forwarded');
create type voxi.call_outcome as enum ('in_progress', 'handled', 'voicemail', 'abandoned', 'failed');
create type voxi.task_status as enum ('open', 'done', 'dismissed');
create type voxi.rule_trigger as enum ('caller', 'topic');
create type voxi.urgency as enum ('normal', 'high');
create type voxi.subscription_status as enum ('active', 'past_due', 'cancelled');

-- The tenant boundary. One Subscriber per account in v1; Business seats later
-- attach here rather than forcing a migration (see grilling round 2, Q5).
create table voxi.accounts (
  id          uuid primary key default gen_random_uuid(),
  tier        voxi.tier not null default 'starter',
  created_at  timestamptz not null default now()
);

create table voxi.subscribers (
  id               uuid primary key references auth.users on delete cascade,
  account_id       uuid not null references voxi.accounts on delete cascade,
  display_name     text,
  -- The Subscriber's own handset, used to verify conditional forwarding.
  personal_e164    text,
  created_at       timestamptz not null default now()
);
create index on voxi.subscribers (account_id);

create table voxi.voxi_numbers (
  id                     uuid primary key default gen_random_uuid(),
  account_id             uuid not null references voxi.accounts on delete cascade,
  e164                   text not null unique,
  provider               text not null default 'twilio',
  provider_ref           text,
  status                 voxi.number_status not null default 'provisioning',
  -- Set once a test call has been observed looping back through this number.
  forwarding_verified_at timestamptz,
  created_at             timestamptz not null default now()
);
create index on voxi.voxi_numbers (account_id);

create table voxi.calls (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references voxi.accounts on delete cascade,
  voxi_number_id  uuid not null references voxi.voxi_numbers on delete cascade,
  caller_e164     text,
  caller_name     text,
  arrival         voxi.call_arrival not null,
  outcome         voxi.call_outcome not null default 'in_progress',
  urgency         voxi.urgency not null default 'normal',
  -- Written asynchronously once the call ends. Null while in progress.
  summary         text,
  started_at      timestamptz not null default now(),
  ended_at        timestamptz,
  livekit_room    text,
  sip_call_id     text unique
);
create index on voxi.calls (account_id, started_at desc);
create index on voxi.calls (account_id, caller_e164);

-- Separate from calls so the memory store can be queried and, later, embedded
-- without dragging the call list through it.
create table voxi.transcripts (
  call_id     uuid primary key references voxi.calls on delete cascade,
  account_id  uuid not null references voxi.accounts on delete cascade,
  turns       jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);
create index on voxi.transcripts (account_id);

create table voxi.tasks (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references voxi.accounts on delete cascade,
  call_id     uuid references voxi.calls on delete set null,
  title       text not null,
  detail      text,
  status      voxi.task_status not null default 'open',
  due_at      timestamptz,
  created_at  timestamptz not null default now()
);
create index on voxi.tasks (account_id, status, created_at desc);

-- A Rule triggers on a Caller or a topic, never both (ADR-0001: it changes how
-- loudly Voxi tells the Subscriber, never whether their phone rings).
create table voxi.rules (
  id           uuid primary key default gen_random_uuid(),
  account_id   uuid not null references voxi.accounts on delete cascade,
  label        text not null,
  trigger      voxi.rule_trigger not null,
  caller_e164  text,
  topic        text,
  urgency      voxi.urgency not null default 'high',
  instruction  text,
  created_at   timestamptz not null default now(),
  constraint rule_matches_its_trigger check (
    (trigger = 'caller' and caller_e164 is not null and topic is null) or
    (trigger = 'topic'  and topic is not null and caller_e164 is null)
  )
);
create index on voxi.rules (account_id);
create index on voxi.rules (account_id, caller_e164) where trigger = 'caller';

-- Source of truth for entitlement regardless of who took the money: Paystack
-- webhooks now, RevenueCat when mobile ships (grilling round 3, Q8).
create table voxi.subscriptions (
  id                   uuid primary key default gen_random_uuid(),
  account_id           uuid not null references voxi.accounts on delete cascade,
  processor            text not null,
  processor_ref        text,
  tier                 voxi.tier not null,
  status               voxi.subscription_status not null default 'active',
  current_period_end   timestamptz,
  updated_at           timestamptz not null default now(),
  unique (processor, processor_ref)
);
create index on voxi.subscriptions (account_id);
