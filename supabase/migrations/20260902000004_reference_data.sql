-- 04 · Reference vocabularies, with seed data.
--
-- These are data, not types, because they grow with integrations, carry a
-- display label the UI needs, or encode an ordering that must stay reorderable.

-- Tier. rank makes the ladder data rather than type ordering, so a tier can be
-- inserted between two others with an UPDATE instead of a type migration.
-- NOT a billing table: no price, no interval, no provider plan id.
create table voxi.tiers (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  rank       smallint not null unique,
  created_at timestamptz not null default now()
);

insert into voxi.tiers (slug, name, rank) values
  ('starter',  'Starter',  10),
  ('pro',      'Pro',      20),
  ('business', 'Business', 30);

-- Where a Conversation happened.
create table voxi.channels (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

-- ONLY currently implemented Channels are seeded.
--
-- The schema is channel-neutral and can represent voxi_app, sms, email and
-- whatsapp — but the Channel filter in the UI is data-driven, so seeding a
-- future row here would put a fake option in front of a Subscriber. Rows are
-- added in the migration that ships the channel.
--
-- Schema-representable is not the same as currently implemented.
insert into voxi.channels (slug, name) values
  ('telephony', 'Phone');

-- How it operates. A WhatsApp Call and a WhatsApp voice note are both audio and
-- behave nothing alike; the first is realtime, the second is message content.
create table voxi.modes (
  id         smallint generated always as identity primary key,
  slug       text not null unique,
  name       text not null,
  created_at timestamptz not null default now()
);

-- Likewise: messaging mode has no agent implementation yet.
insert into voxi.modes (slug, name) values
  ('realtime_voice', 'Realtime voice');

-- Which modes each channel permits. conversations carries a composite FK to
-- this pair, which is what makes sms + realtime_voice unrepresentable rather
-- than merely wrong.
create table voxi.channel_modes (
  channel_id smallint not null references voxi.channels on delete restrict,
  mode_id    smallint not null references voxi.modes    on delete restrict,
  primary key (channel_id, mode_id)
);

-- The one implemented combination.
insert into voxi.channel_modes (channel_id, mode_id)
select c.id, m.id
from voxi.channels c
join voxi.modes m on true
where (c.slug, m.slug) in (('telephony', 'realtime_voice'));

-- Call outcome. Product meaning, telephony only, and it carries NO attention
-- semantics — nothing anywhere may derive needs_attention from these.
-- 'abandoned' must never be widened into a bucket for every unsuccessful Call;
-- that is what 'unresolved' exists for.
create table voxi.call_outcomes (
  id          smallint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,
  description text not null,
  created_at  timestamptz not null default now()
);

insert into voxi.call_outcomes (slug, name, description) values
  ('handled',    'Handled',    'Voxi resolved what the Caller needed.'),
  ('voicemail',  'Voicemail',  'The Caller left a message for the Subscriber.'),
  ('unresolved', 'Unresolved', 'A meaningful conversation happened, Voxi did not resolve the need, and no message was left.'),
  ('abandoned',  'Abandoned',  'The Call ended before a meaningful result was established.');
