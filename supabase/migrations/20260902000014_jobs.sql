-- 14 · Durable background work.
--
-- ONE table for all asynchronous work; only the handlers differ. Inserted in
-- the same transaction as the state change that creates it, which is what makes
-- it a true outbox: no Conversation can be committed without the work it needs.
--
-- job_type is CHECK text rather than an enum or a reference table: it is pure
-- implementation, grows with every feature, and has no display label or UI
-- consumer that would justify a catalog.
create table voxi.jobs (
  id              uuid primary key default voxi.uuidv7(),
  job_type        text not null
                  check (job_type in (
                    'conversation_enrichment',
                    'workflow_delivery',
                    'storage_cleanup',
                    'account_erasure'
                  )),

  -- Always required. Lets the queue be drained per tenant during an incident,
  -- and keeps the RLS path one hop.
  account_id      uuid not null references voxi.accounts on delete cascade,

  -- NULLABLE: storage_cleanup and account_erasure have no Conversation.
  conversation_id uuid references voxi.conversations on delete cascade,

  status          voxi.job_status not null default 'pending',
  attempts        integer not null default 0,
  max_attempts    integer not null default 5,
  next_attempt_at timestamptz not null default now(),
  -- Set when a worker claims the row. A worker that dies AFTER commit leaves
  -- the row in 'processing' forever; a sweeper resets rows whose claimed_at is
  -- older than a timeout.
  claimed_at      timestamptz,

  payload         jsonb not null default '{}'::jsonb,
  idempotency_key text,
  last_error      text,

  created_at      timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,

  -- MATCH SIMPLE (the default) is deliberate: when conversation_id is null the
  -- composite constraint is not checked, which is exactly what a
  -- non-Conversation job needs.
  constraint jobs_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade,

  -- Restores, per type, the invariant that nullability removed.
  constraint jobs_conversation_required_by_type check (
    job_type not in ('conversation_enrichment', 'workflow_delivery')
    or conversation_id is not null
  ),

  -- A retried insert cannot double-enqueue.
  constraint jobs_idempotent unique (job_type, idempotency_key)
);

comment on table voxi.jobs is
  'Claimed with SELECT ... FOR UPDATE SKIP LOCKED. No ordering guarantee: n8n events are self-describing and independently processable by design.';

comment on column voxi.jobs.payload is
  'For account_erasure and storage_cleanup this carries the EXACT Storage object keys, captured before any row is deleted. Once turn_content is gone the keys are gone with it and the files orphan permanently. Never delete by prefix wildcard.';
