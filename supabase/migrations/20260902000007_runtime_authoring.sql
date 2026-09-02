-- 07 · Runtime authoring. Mutable. Read only by publish, never by a live
-- Conversation.

-- Declarative catalog of stable tool identifiers. Implementations live in git
-- behind TOOL_REGISTRY.
--
-- Managed through the admin/deployment path. Explicitly NOT synced by a worker
-- at boot: that would invert ADR-0005 (the database declares what the runtime
-- contains) and put a schema write in the crash-loop path.
create table voxi.tools (
  id          smallint generated always as identity primary key,
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table voxi.capabilities (
  id          smallint generated always as identity primary key,
  name        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

create table voxi.skills (
  id           uuid primary key default voxi.uuidv7(),
  slug         text not null unique,
  name         text not null,
  instructions text not null,
  min_tier_id  smallint not null references voxi.tiers on delete restrict,
  enabled      boolean not null default false,
  version      integer not null default 1,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on column voxi.skills.slug is
  'Internal runtime vocabulary, deliberately avoiding product terms: qa-lookup not Q&A, task-capture not Tasks.';

-- Join tables with real foreign keys rather than text[]: a typo becomes an
-- insert the database refuses, at authoring time, instead of a publish failure.
--
-- ON DELETE RESTRICT to tools/capabilities is deliberate. Removing a tool from
-- code while a Skill still references it must fail loudly.
create table voxi.skill_tools (
  skill_id uuid     not null references voxi.skills on delete cascade,
  tool_id  smallint not null references voxi.tools  on delete restrict,
  primary key (skill_id, tool_id)
);

create table voxi.skill_capabilities (
  skill_id      uuid     not null references voxi.skills       on delete cascade,
  capability_id smallint not null references voxi.capabilities on delete restrict,
  primary key (skill_id, capability_id)
);

-- Mutable pre-publish configuration. A separate table from runtime_releases so
-- an immutable row never has to carry draft nullability.
create table voxi.runtime_drafts (
  id                     uuid primary key default voxi.uuidv7(),
  status                 voxi.runtime_draft_status not null default 'draft',
  base_instructions      text not null,
  realtime_model_alias   text not null,
  background_model_alias text not null,
  notes                  text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  published_at           timestamptz
);
