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
  runtime_hash  bytea not null,
  artifact      jsonb not null,
  published_at  timestamptz not null default now(),
  published_by  uuid references voxi.subscribers on delete set null,
  source_draft_id uuid references voxi.runtime_drafts on delete set null
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
  updated_by         uuid references voxi.subscribers on delete set null
);
