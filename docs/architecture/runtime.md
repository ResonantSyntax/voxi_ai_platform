# Voxi runtime architecture

> **PROVISIONAL — NOT MIGRATION-READY.**
> Entities below describe responsibilities and relationships only. Column
> types, keys, constraints, enums, nullability, cascade behaviour, indexes and
> RLS are deliberately unresolved and belong to a dedicated database design
> session. Nothing here should be turned into a migration as written.

Decisions behind this: [ADR-0005](../adr/0005-supabase-declares-git-implements.md)
(config/code boundary), [ADR-0006](../adr/0006-runtime-publishing.md)
(publishing), [ADR-0004](../adr/0004-where-logic-lives.md) (where logic lives),
[ADR-0002](../adr/0002-pipeline-over-speech-to-speech.md) (voice pipeline).
Product vocabulary is in [CONTEXT.md](../../CONTEXT.md); Skill, Runtime and
CompiledRuntime are internal terms and are deliberately not in it.

## The five layers

```
AUTHORING      mutable config in Supabase — drafts, skills, instructions
    │              edited freely; changes nothing that is running
    ▼
PUBLISH        resolve → validate → materialise → canonicalise → hash → activate
    │              the only path from authoring to execution
    ▼
BOOTSTRAP      one artifact read + subscriber context; final composition
    │              per Conversation, before the first response
    ▼
EXECUTION      realtime or messaging; CompiledRuntime held for the Conversation
    │              no configuration reads, no skill rediscovery
    ▼
BACKGROUND     durable jobs — Summary, Tasks, enrichment, workflow delivery
```

The distinction that matters: **the editable Supabase configuration is the
authoring model; the immutable published artifact is the execution contract.**

## Data ownership

| Owner | Writes | Notes |
| --- | --- | --- |
| Operators (via publish) | runtime drafts, skills, published artifacts | Global, not account-scoped |
| Billing | account entitlement and status | Derived from subscription events |
| Subscribers (web, under RLS) | Q&A, Rules, profile | Their own account only |
| Agent (service role) | Conversation, Turns, context snapshot, job | Bypasses RLS — see invariants |
| Background worker (service role) | Summary, Tasks, job state | |

## Entities (provisional)

### Global configuration — not account-scoped

**Runtime version.** A published, immutable artifact plus its identity
(`version`, `runtime_hash`) and lifecycle state (draft / active / retired).
Holds the fully materialised shared configuration: base instructions, model
aliases, every eligible skill's compiled instructions and resolved tool
identifiers, and precomputed per-tier eligibility. Exactly one is active.

**Skill.** The authoring record: slug, name, instructions, tool references,
required capabilities, minimum tier, enabled. Mutable. **Read only by the
publish step** — never by a live Conversation.

Both are internal operator configuration. Subscribers have no reason to read
either, which makes their tenancy story different from every other entity and
is the first thing the database session should settle.

### Account state

**Account.** The tenant boundary. Carries `entitlement_tier` (what the runtime
consumes) and `account_status` (whether Voxi operates at all). Entitlement is
derived by billing; the runtime never interprets payment state.

**Subscription.** Billing truth: plan, provider state, period, grace window.
Feeds entitlement. Never read at bootstrap.

### Subscriber context

**Q&A pair**, **Rule.** Mutable Subscriber-authored context. Current values
only — no version history (see "rejected" below).

**Context snapshot.** Content-addressed. The canonicalised structured context
supplied to the compiler, keyed by its hash, inserted if absent. Fifty Conversations
with unchanged context reference one snapshot; editing one answer produces a
new hash automatically.

### Conversation record

**Conversation**, **Turns.** Authoritative history. Each Conversation carries
`runtime_version`, `runtime_hash` and `context_hash` — together these
reconstruct what produced the conversation.

### Work

**Job.** One durable table for all asynchronous work, distinguished by type
(`call_enrichment`, `workflow_delivery`, later `call_indexing`). Claimed with
`FOR UPDATE SKIP LOCKED`; attempts, backoff, dead-letter. Handlers differ; the
persistence mechanism does not.

## Invariants

These are the contract the database session must enforce, and the reason it
should be a separate pass.

1. **A committed Conversation that needs enrichment has its job committed in
   the same transaction.** No Conversation can exist without the work it
   requires.
2. **A published artifact never changes.** Editing a skill affects the next
   draft, never a published version.
3. **Exactly one runtime version is active.**
4. `runtime_hash` is the hash of the canonical published artifact — never of
   the authoring tables.
5. `context_hash` is the hash of canonicalised subscriber context: stable
   ordering, consistent serialisation, no timestamps, **no secrets or OAuth
   tokens**, only content that affects runtime behaviour.
6. **Every Conversation's referenced runtime version and context snapshot must
   outlive it.** Neither may be deleted or mutated while one points at it.
7. **No published artifact contains an unresolvable tool or capability
   reference.** Enforced at publish; re-checked at worker startup.
8. **Realtime voice audio is never persisted.** Transcription happens in
   flight and the durable record of a realtime Conversation is textual.
   Asynchronous audio supplied as message content — a WhatsApp voice note — is
   different: it is content a sender chose to send, and may be persisted as a
   Content Part if that channel is ever implemented. Neither exists in first
   production.
9. **Every account-scoped row carries `account_id`**, and the agent — which
   connects with RLS bypassed — resolves it **once at bootstrap, per channel**,
   then passes it explicitly into every write. Telephony resolves it from the
   dialled Voxi Number; that is a channel binding, not the universal rule.
   Every supported channel must supply exactly one such binding to an Account
   before a Conversation is created, and a channel with no binding cannot
   start one. Only the telephony binding exists today.
10. **The runtime reads `entitlement_tier` only.** No payment-state branching
    anywhere in the agent.
11. **Suspended accounts short-circuit before runtime construction** — no
    artifact load, no context load, no capability evaluation.
12. **A context snapshot is owned by exactly one account.** Identity is
    `(account_id, context_hash)`; a snapshot is never shared across accounts
    even when the hashed content is byte-identical.

## Context snapshot tenancy — decided

Context hashes collide across accounts, and this is expected rather than
hypothetical: every new Starter Subscriber has no Q&A and no Rules, so they all
canonicalise to the same empty context and the same hash.

**Decision: snapshots are identified by a tenant-scoped composite —
`(account_id, context_hash)`.** `account_id` is *not* folded into the hashed
content.

This keeps the meaning of `context_hash` purely content-based — *the hash of
the canonical subscriber-context content* — rather than "content plus owner".
Two accounts may legitimately produce the same hash and still own separate
rows. That gives deduplication within an account, explicit tenant ownership,
a straightforward RLS path, and no possibility of one account's snapshot
serving another's Conversation.

Still open for the database session: the exact foreign-key shape, and whether
a Conversation references the composite key directly or through a surrogate. The
tenancy requirement itself is settled and not up for challenge.

## Runtime boundaries

Supabase may be queried at: publish, worker startup, session bootstrap (twice —
artifact and subscriber context), inside a tool call that genuinely needs live
data, and by the background worker.

Supabase must **never** be queried to rediscover skills, reload instructions,
recompile a runtime, or determine what tools exist — before, during or between
conversational turns.

## No generic configuration store

There is deliberately **no `config jsonb` escape hatch** on the runtime or
anywhere else. Configuration gets an explicit home or it does not exist yet.

> Do not add generic configuration storage before knowing what configuration it
> needs to hold.

An untyped column that is convenient to write to becomes an architectural junk
drawer: unrelated settings accumulate because JSONB is easier than a decision,
and nothing can validate, constrain or discover them. When a requirement
genuinely has a schema-flexible shape, JSONB gets introduced deliberately for
that requirement.

This does not apply to the published artifact, which is a materialised
document with a known shape produced by a validating publish step — the
opposite of an open-ended settings bag.

## Deliberately not built

Full Q&A/Rule version history (content-addressed snapshots satisfy historical
reconstruction without version-on-write). Vector search, chunking and
embeddings — regeneratable from Transcripts by their own definition, so
building them early buys no architectural protection and forces premature
choices about embedding model, dimensions, chunk size and index type with no
queries to evaluate against. Per-skill model routing. Canary rollout.
Per-subscriber skill overrides. A FastMCP server. Database-driven STT/TTS.
A Memory skill — Memory does not exist yet, and a skill is a real executable
capability, not a placeholder.

## Retention requirement

Since historical Conversation search is expected later, Turns must preserve
speaker/role, sequence, timestamps and utterance text. Getting that structure
right now matters far more than deciding how it will eventually be chunked.
