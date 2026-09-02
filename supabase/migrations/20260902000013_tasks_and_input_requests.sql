-- 13 · The two attention mechanisms.
--
-- A Task is something the Subscriber must DO.
-- An Input Request is something Voxi needs FROM them.
-- They are distinct concepts and feed attention independently:
--
--   needs_attention = open_tasks > 0 OR unresolved_input_requests > 0
--
-- Attention is DERIVED, never stored. There is no read/unread, seen, new or
-- inbox state, and nothing else contributes — not Call outcome, not lifecycle,
-- not enrichment status, not degradation.

create table voxi.tasks (
  id              uuid primary key default voxi.uuidv7(),
  account_id      uuid not null references voxi.accounts on delete cascade,
  -- Required in first production: there are no standalone, manually created
  -- Tasks and no global "add Task" entry point. Relaxing later is an instant
  -- DROP NOT NULL with no data migration.
  -- Single-column FK omitted; the composite tenant FK carries it.
  conversation_id uuid not null,

  title           text not null,
  detail          text,
  status          voxi.task_status not null default 'open',
  due_at          timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint tasks_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade
);

comment on column voxi.tasks.account_id is
  'Required independently of conversation_id so tenancy never depends on walking the parent.';

-- First production is RESOLVE-ONLY: answering records the answer and resolves
-- the request. It does NOT trigger re-enrichment. So nothing here has to answer
-- whether Summary regenerates, whether Tasks are replaced or merged, or which
-- pass produced which Task.
create table voxi.input_requests (
  id              uuid primary key default voxi.uuidv7(),
  account_id      uuid not null references voxi.accounts on delete cascade,
  conversation_id uuid not null,

  question        text not null,
  status          voxi.input_request_status not null default 'pending',
  answer          text,
  asked_at        timestamptz not null default now(),
  answered_at     timestamptz,

  constraint input_requests_tenant_fk
    foreign key (account_id, conversation_id)
    references voxi.conversations (account_id, id) on delete cascade,

  -- An answered request has an answer and a resolution time; a pending one has
  -- neither. Dismissed needs neither.
  -- dismissed means closed WITHOUT an answer, so it carries neither. A request
  -- that was answered stays answered; it is not later dismissed.
  constraint input_requests_answer_consistent check (
    (status = 'answered'  and answer is not null and answered_at is not null)
    or (status = 'pending'   and answer is null and answered_at is null)
    or (status = 'dismissed' and answer is null and answered_at is null)
  )
);
