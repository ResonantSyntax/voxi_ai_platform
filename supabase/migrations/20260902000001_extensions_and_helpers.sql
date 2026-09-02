-- 01 · Extensions and helper functions.
-- Non-destructive. Creates nothing tenant-facing.

create extension if not exists pgcrypto;

-- UUIDv7. Postgres 17.6 has no uuidv7() (that arrives in 18) and pg_uuidv7 is
-- not available on Supabase, so we build one.
--
-- This is deliberately the readable construction rather than the shorter
-- set_bit/overlay trick: the layout is visible on inspection, which matters
-- more here than a few microseconds. 48-bit millisecond timestamp, version
-- nibble 7, variant nibble 8..b, the rest random.
--
-- Column defaults use this. The agent generates ids client-side instead, so a
-- retried insert carries the same id and stays idempotent.
create or replace function voxi.uuidv7()
returns uuid
language sql
volatile
as $$
  select (
      lpad(to_hex((extract(epoch from clock_timestamp()) * 1000)::bigint), 12, '0')
   || '7'
   || substr(h, 14, 3)
   || to_hex(8 + (random() * 3)::int)
   || substr(h, 18, 15)
  )::uuid
  from (select replace(gen_random_uuid()::text, '-', '') as h) r;
$$;

comment on function voxi.uuidv7() is
  'Time-ordered UUID for client-visible ids. Keeps index inserts local and leaks no row volume. Values generated within the same millisecond share a timestamp prefix and differ only in the random tail, so they are time-SORTABLE but NOT strictly monotonic in generation order. Do not test for that.';

-- Blocks UPDATE and DELETE on append-only tables. Used by runtime_releases and
-- context_snapshots, where immutability is the whole point and a revoked grant
-- is not enough because service_role bypasses table privileges.
create or replace function voxi.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'relation %.% is append-only; % is not permitted',
    tg_table_schema, tg_table_name, tg_op
    using errcode = 'restrict_violation';
end;
$$;


-- NOTE: voxi.current_account_id() is NOT defined here. It is a SQL function
-- whose body reads voxi.subscribers, and check_function_bodies validates SQL
-- bodies at creation time — so defining it before stage 05 fails outright.
-- It lives in stage 17, next to the policies that use it.

-- Stamps updated_at. Clients are granted the business columns only; the
-- database owns its own metadata, so a browser cannot backdate a row.
create or replace function voxi.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
