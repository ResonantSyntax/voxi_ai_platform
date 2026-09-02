-- 05 · Identity and tenancy.
--
-- Account 1:1 Subscriber 1:1 Voxi Number for first production. Three separate
-- concepts even at 1:1 — tenant identity, person identity and authentication
-- identity are different things, and collapsing them is the migration nobody
-- wants to do later.

-- The tenancy, ownership and security boundary. Holds NO personal data, which
-- is exactly what lets it survive erasure as a tombstone so lawfully retained
-- financial records keep a valid foreign key.
create table voxi.accounts (
  id                 uuid primary key default voxi.uuidv7(),
  entitlement_tier_id smallint not null references voxi.tiers on delete restrict,
  account_status     voxi.account_status not null default 'active',
  created_at         timestamptz not null default now(),
  erased_at          timestamptz
);

comment on column voxi.accounts.entitlement_tier_id is
  'What the Subscriber may use right now. Written by billing. The ONLY tier the runtime reads — it never interprets payment state.';

-- The human. Deliberately not welded to auth.users: a person must be able to
-- exist before an auth record, which invitations will require.
create table voxi.subscribers (
  id            uuid primary key default voxi.uuidv7(),
  account_id    uuid not null references voxi.accounts on delete cascade,
  auth_user_id  uuid unique references auth.users on delete set null,
  display_name  text,
  personal_e164 text,
  created_at    timestamptz not null default now(),

  -- First production: one Subscriber per Account. Relaxing to 1:N later is
  -- dropping this constraint, nothing more.
  constraint subscribers_one_per_account unique (account_id)
);

-- A number Voxi answers. Surrogate id with e164 unique: numbers port, get
-- reassigned and get corrected, so the number is a business key, never identity.
create table voxi.voxi_numbers (
  id                     uuid primary key default voxi.uuidv7(),
  account_id             uuid not null references voxi.accounts on delete cascade,
  e164                   text not null unique,
  provider               text not null default 'twilio',
  provider_ref           text,
  status                 voxi.number_status not null default 'provisioning',
  forwarding_verified_at timestamptz,
  created_at             timestamptz not null default now(),
  released_at            timestamptz,

  -- First production: one Number per Account.
  constraint voxi_numbers_one_per_account unique (account_id),
  -- Supports the composite tenant FK from calls.
  constraint voxi_numbers_tenant_key unique (account_id, id)
);

comment on table voxi.voxi_numbers is
  'Numbers are released via status, never deleted — historical Calls must stay interpretable.';
