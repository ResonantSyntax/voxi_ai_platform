-- 03 · Enumerated types.
--
-- Enum where the vocabulary is ours, closed, and changes almost never.
-- Reference tables (stage 04) where it grows with integrations or needs a
-- display label. CHECK text where a provider owns the vocabulary or it grows
-- with every feature.

-- Whether Voxi operates for this Account at all. Distinct from entitlement,
-- which decides what an operating Account may use.
create type voxi.account_status as enum ('active', 'suspended', 'erasing', 'erased');

create type voxi.number_status as enum ('provisioning', 'active', 'released');

-- Axis 1 of 3. Did the conversation itself execute?
create type voxi.conversation_lifecycle as enum ('active', 'completed', 'failed');

-- Axis 2 of 3. Did post-conversation processing succeed? Named for the job,
-- not for Summary alone: it also produces Tasks and Input Requests.
-- Axis 3, degradation, is 1:N structured rows, not an enum.
create type voxi.enrichment_status as enum ('pending', 'processing', 'completed', 'failed');

-- Channel-neutral. 'caller' and 'agent' were rejected: an in-app Conversation
-- has no Caller, and 'agent' collides with LiveKit's own Agent. No 'system'
-- until a real conversational use exists.
create type voxi.turn_role as enum ('subscriber', 'external', 'voxi');

create type voxi.content_kind as enum ('text', 'audio', 'image', 'video', 'document');

create type voxi.task_status as enum ('open', 'done', 'dismissed');

-- Expiry is deliberately absent: whether an unanswered request ages out is a
-- product decision, not a state the database should presume.
create type voxi.input_request_status as enum ('pending', 'answered', 'dismissed');

create type voxi.job_status as enum ('pending', 'processing', 'completed', 'failed');

create type voxi.runtime_draft_status as enum ('draft', 'published', 'discarded');
