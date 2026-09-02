-- 06 · Billing. Provider truth, never read at Conversation bootstrap.

-- subscription_status is CHECK text rather than an enum: it mirrors a payment
-- provider's vocabulary, which is not ours to control or version.
create table voxi.subscriptions (
  id                 uuid primary key default voxi.uuidv7(),
  account_id         uuid not null references voxi.accounts on delete restrict,
  plan_tier_id       smallint not null references voxi.tiers on delete restrict,
  processor          text not null,
  processor_ref      text,
  status             text not null
                     check (status in ('active','past_due','cancelled','incomplete','paused')),
  current_period_start timestamptz,
  current_period_end   timestamptz,
  grace_until        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  unique (processor, processor_ref)
);

comment on column voxi.subscriptions.plan_tier_id is
  'What the Subscriber bought. Distinct from accounts.entitlement_tier_id, which is what they may currently use. The two diverge during Grace and suspension.';

-- Append-only provider webhooks. One table serving idempotency, audit and
-- history at once. ON DELETE RESTRICT to accounts because these outlive erasure.
--
-- payload is REDACTED during Account erasure, never deleted: financial facts
-- are retained under statutory obligation, customer name, email and phone are
-- not covered by that obligation and are removed.
create table voxi.subscription_events (
  id                uuid primary key default voxi.uuidv7(),
  account_id        uuid not null references voxi.accounts on delete restrict,
  subscription_id   uuid references voxi.subscriptions on delete set null,
  processor         text not null,
  provider_event_id text not null,
  event_type        text not null,
  payload           jsonb not null,
  redacted_at       timestamptz,
  received_at       timestamptz not null default now(),

  -- Webhook idempotency.
  unique (processor, provider_event_id)
);
