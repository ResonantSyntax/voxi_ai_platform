-- 02 · DESTRUCTIVE. Removes the superseded Call-rooted schema.
--
-- ============================================================================
-- READ BEFORE APPLYING
-- ============================================================================
-- Every object below was verified on 2026-09-02 against kevynftebdaoidljydyf:
--
--   exactly 0 rows (by count(*), not planner estimate) in accounts,
--   subscribers, voxi_numbers, calls, transcripts, tasks, rules, subscriptions
--   and auth.users
--   0 dependent views, rules or functions
--   0 foreign keys from outside the voxi schema
--
-- Nothing is preserved for compatibility. The Call-rooted model predates the
-- Conversation root and is replaced, not migrated.
--
-- This stage runs BEFORE the creates because accounts, subscribers,
-- voxi_numbers, calls, tasks, rules and subscriptions are recreated under the
-- same names with different shapes.
--
-- Re-verify immediately before applying:
--   select 'accounts', count(*) from voxi.accounts
--   union all select 'calls', count(*) from voxi.calls  ... etc.
-- If any count is non-zero, STOP.
-- ============================================================================

-- The trigger goes first: it references voxi.handle_new_user, and it lives on
-- auth.users, which this migration does not otherwise touch.
drop trigger if exists on_auth_user_created on auth.users;

-- Tables, in reverse dependency order. Each named explicitly rather than
-- dropping the schema, so the diff shows exactly what is destroyed.
drop table if exists voxi.transcripts;
drop table if exists voxi.tasks;
drop table if exists voxi.rules;
drop table if exists voxi.calls;
drop table if exists voxi.voxi_numbers;
drop table if exists voxi.subscriptions;
drop table if exists voxi.subscribers;
drop table if exists voxi.accounts;

-- Functions superseded by 01. current_account_id changes definition: it now
-- resolves through subscribers.auth_user_id rather than subscribers.id,
-- because Subscriber identity is no longer welded to auth.users.
drop function if exists voxi.handle_new_user();

-- Types. Several are replaced by reference tables (tier, call_outcome) and
-- several by differently-valued enums (task_status, number_status).
drop type if exists voxi.tier;
drop type if exists voxi.number_status;
drop type if exists voxi.call_arrival;
drop type if exists voxi.call_outcome;
drop type if exists voxi.task_status;
drop type if exists voxi.rule_trigger;
drop type if exists voxi.urgency;
drop type if exists voxi.subscription_status;

-- NOT dropped, deliberately:
--   schema voxi                  reused
--   voxi.uuidv7, forbid_mutation, current_account_id   created in 01
--   the PostgREST exposed-schema setting from migration 20260901000002
