-- 09 · Subscriber-authored context.

create table voxi.qa_pairs (
  id         uuid primary key default voxi.uuidv7(),
  account_id uuid not null references voxi.accounts on delete cascade,
  question   text not null,
  answer     text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Rules.
--
-- NO CROSS-FIELD TRIGGER-COMBINATION CONSTRAINT. This is deliberate and must
-- stay that way until the product settles it.
--
-- The superseded schema enforced caller XOR topic. CONTEXT.md now says "Exact
-- Rule trigger behaviour is still being designed. Do not invent trigger
-- combinations or limitations unless they are already documented elsewhere",
-- and PRODUCT.md adds "Do not infer product behaviour from provisional
-- database constraints".
--
-- So: no XOR, no OR, no at-least-one, no exactly-one. The application layer
-- restricts what it exposes today; the database stays permissive so no invented
-- invariant has to be undone when Rule semantics land.
create table voxi.rules (
  id          uuid primary key default voxi.uuidv7(),
  account_id  uuid not null references voxi.accounts on delete cascade,
  label       text not null,
  caller_e164 text,
  topic       text,
  instruction text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Content-addressed and tenant-scoped. Two Accounts may legitimately produce
-- the same hash — every new Starter Subscriber has no Q&A and no Rules, so they
-- all canonicalise identically — and must still own separate rows.
--
-- The digest is bytea, not 64-char hex: 32 bytes instead of 64, and faster to
-- compare. Rendered as hex only for logs and admin.
--
-- Append-only: a snapshot is what makes a historical Conversation reconstructable.
create table voxi.context_snapshots (
  account_id   uuid not null references voxi.accounts on delete cascade,
  context_hash bytea not null,
  snapshot     jsonb not null,
  created_at   timestamptz not null default now(),

  primary key (account_id, context_hash)
);

comment on column voxi.context_snapshots.snapshot is
  'Canonicalised structured context given to the compiler: stable ordering, consistent serialisation, no timestamps, NO secrets or OAuth tokens.';

create trigger context_snapshots_immutable
  before update or delete on voxi.context_snapshots
  for each row execute function voxi.forbid_mutation();
