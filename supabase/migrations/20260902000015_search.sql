-- 15 · Conversation search.
--
-- Scope: identity, subject, Summary and Tasks. Transcript text is deliberately
-- NOT indexed — Turns are written while someone is still talking, so a GIN
-- index on turn content would charge every utterance for search recall, and
-- keyword indexing of transcripts would be superseded by the later
-- chunk-and-embed retrieval work rather than reused by it.
--
-- conversations.search_tsv is DERIVED DATA. Its authoritative sources are the
-- Conversation's own subject and Summary, its Call identity, and its Tasks.
-- Invariant 9: refreshed in the same logical operation as any source change.
--
-- One maintained vector rather than two GIN indexes and a ranked union: one
-- index, one query, no cross-table ranking, and nothing on the live Turn path.

-- Pure composition. Takes values rather than reading a row, so the BEFORE
-- trigger can use it for a row that does not exist yet.
create or replace function voxi.compose_conversation_search(
  p_subject     text,
  p_summary     text,
  p_caller_name text,
  p_caller_e164 text,
  p_task_text   text
) returns tsvector
language sql
immutable
as $$
  select setweight(to_tsvector('english', coalesce(p_subject, '')),     'A')
      || setweight(to_tsvector('english', coalesce(p_caller_name, '')), 'A')
      || setweight(to_tsvector('simple',  coalesce(p_caller_e164, '')), 'A')
      || setweight(to_tsvector('english', coalesce(p_summary, '')),     'B')
      || setweight(to_tsvector('english', coalesce(p_task_text, '')),   'C');
$$;

create or replace function voxi.conversation_task_text(p_conversation_id uuid)
returns text
language sql
stable
as $$
  select string_agg(t.title || ' ' || coalesce(t.detail, ''), ' ')
    from voxi.tasks t
   where t.conversation_id = p_conversation_id;
$$;

-- BEFORE trigger on the Conversation's own searchable columns.
--
-- Composes from NEW rather than re-reading the table: on INSERT the row does
-- not exist yet, so a self-query would silently produce NULL.
--
-- The UPDATE OF list prevents recursion — refreshing writes search_tsv, which
-- is not in the list, so the trigger does not re-fire.
create or replace function voxi.tg_conversation_search()
returns trigger
language plpgsql
as $$
begin
  new.search_tsv := voxi.compose_conversation_search(
    new.subject,
    new.summary,
    (select c.caller_name from voxi.calls c where c.conversation_id = new.id),
    (select c.caller_e164 from voxi.calls c where c.conversation_id = new.id),
    voxi.conversation_task_text(new.id)
  );
  return new;
end;
$$;

create trigger conversations_search_refresh
  before insert or update of subject, summary on voxi.conversations
  for each row execute function voxi.tg_conversation_search();

-- AFTER triggers, for sources that live in other tables. These re-read the
-- Conversation, which by then exists.
create or replace function voxi.refresh_conversation_search(p_conversation_id uuid)
returns void
language sql
as $$
  update voxi.conversations c
     set search_tsv = voxi.compose_conversation_search(
           c.subject,
           c.summary,
           (select ca.caller_name from voxi.calls ca where ca.conversation_id = c.id),
           (select ca.caller_e164 from voxi.calls ca where ca.conversation_id = c.id),
           voxi.conversation_task_text(c.id))
   where c.id = p_conversation_id;
$$;

create or replace function voxi.tg_search_from_child()
returns trigger
language plpgsql
as $$
begin
  perform voxi.refresh_conversation_search(
    case when tg_op = 'DELETE' then old.conversation_id else new.conversation_id end);
  return null;
end;
$$;

-- Call identity is part of the search document.
create trigger calls_search_refresh
  after insert or update of caller_name, caller_e164 or delete on voxi.calls
  for each row execute function voxi.tg_search_from_child();

-- Tasks. Covers the initial enrichment pass that CREATES them, which is the
-- case most easily missed.
--
-- Task completion alone does not refresh: status is not part of the document,
-- so the UPDATE OF list names only title and detail.
create trigger tasks_search_refresh
  after insert or update of title, detail or delete on voxi.tasks
  for each row execute function voxi.tg_search_from_child();

create index conversations_search_idx on voxi.conversations using gin (search_tsv);
