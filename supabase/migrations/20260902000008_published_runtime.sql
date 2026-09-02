-- 08 · Published runtime. Immutable artifacts plus a mutable pointer.

-- A published release never changes. Publishing resolves every skill, tool,
-- capability and model alias, compiles instructions, precomputes per-tier
-- eligibility, canonicalises and hashes the result.
--
-- Immutability is enforced by trigger, not by revoking UPDATE: service_role
-- bypasses table privileges, so a grant would not hold.
create table voxi.runtime_releases (
  id            uuid primary key default voxi.uuidv7(),
  version       integer not null unique,
  runtime_hash  bytea not null check (length(runtime_hash) = 32),
  artifact      jsonb not null,
  published_at  timestamptz not null default now(),

  -- Operator identity, deliberately NOT a foreign key to subscribers.
  --
  -- A Subscriber is a product concept: the person who owns a Voxi Number.
  -- Whoever publishes a runtime is an operator of the platform, a different
  -- audience entirely, and there is no staff/operator model in this schema.
  -- Pointing at subscribers would conflate the two and, worse, ON DELETE SET
  -- NULL is an UPDATE that the immutability trigger below would reject —
  -- deleting a Subscriber would have made their Account's deletion fail.
  --
  -- Free text until a real operator model exists, at which point this becomes
  -- a foreign key to it.
  published_by  text,

  -- RESTRICT, not SET NULL. SET NULL is an UPDATE and the immutability trigger
  -- would reject it. Retaining the source draft is also more consistent: a
  -- published release should always be traceable to what produced it.
  source_draft_id uuid references voxi.runtime_drafts on delete restrict,

  -- Lets a Conversation reference the pair, so its denormalised runtime_hash
  -- cannot disagree with the release it names.
  constraint runtime_releases_hash_key unique (id, runtime_hash)
);

comment on column voxi.runtime_releases.artifact is
  'The fully materialised shared configuration: base instructions, model aliases, every eligible skill with compiled instructions and resolved tool identifiers, and per-tier eligibility variants. Bootstrap reads this one row and never joins a mutable skill table.';

create trigger runtime_releases_immutable
  before update or delete on voxi.runtime_releases
  for each row execute function voxi.forbid_mutation();

-- Exactly one row, naming the live release. Rollback moves this pointer; no
-- release is ever touched. A status flag on releases would have made them
-- mutable, which contradicts ADR-0006.
create table voxi.runtime_deployment (
  id                 smallint primary key default 1 check (id = 1),
  active_release_id  uuid not null references voxi.runtime_releases on delete restrict,
  updated_at         timestamptz not null default now(),
  -- Operator identity, same reasoning as runtime_releases.published_by.
  updated_by         text
);

comment on table voxi.runtime_deployment is
  'PK plus CHECK(id = 1) permits 0 or 1 rows, not exactly one — Postgres cannot require a row to exist. Before the first publish the table is legitimately empty. "Exactly one active release" is a publish-time invariant the deployment path upholds, not something the schema guarantees.';
