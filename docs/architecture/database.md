# Voxi database design — running record

> **PROVISIONAL. NO DDL, NO MIGRATIONS.** This records decisions taken during
> the database grilling session, round by round. Nothing here is migration-ready
> until the design is approved as a whole. The visual companion is the schema
> board artifact; if the two ever disagree, this file wins and the board is
> wrong.

Product vocabulary lives in [CONTEXT.md](../../CONTEXT.md) and was not modified
during this session. Issues found in it are recorded separately in
[glossary-conflicts.md](./glossary-conflicts.md).

## The central rule

> **Conversation** is the bounded communication unit.
> **Channel** is where it happened.
> **Mode** is how it operated.
> **Turns** are what was exchanged.
> **Content** is what each Turn contains.

`Conversation` is the product's own word, defined in `CONTEXT.md`, and the
schema uses it unchanged. Product and persistence share one root term
deliberately — there is nothing to translate between UI, API and database. A
telephony Conversation is a **Call**; every Call is a Conversation, and not
every Conversation is a Call.

## Decided

### Round 1

- **Call means telephony and nothing else.** It is no longer the universal
  persistence parent. In-app voice and text are real Voxi runtime modes, not
  speculation, so a channel-neutral root sits above them.
- **Transcripts are turns, not documents.** One append-only row per final
  contribution. Rewriting a growing JSONB document on every turn is quadratic
  under TOAST and loses the whole conversation if a worker dies mid-call.
- **Turns are authoritative.** No parallel rendered full-text column to drift
  out of sync; a rendered transcript is derived and may be cached.
- **Interim STT hypotheses are not product history.** They are realtime runtime
  data. Raw provider events belong in observability with a retention window,
  not in the product database.
- **Releases are immutable; a deployment pointer says what is live.** An
  `is_active` flag flipped on rollback would make releases mutable, which
  contradicts ADR-0006. Rollback moves the pointer and touches no release.

### Round 2

- **Tier is reference data, not a Postgres enum.** Tier comparison happens at
  publish time when materialising eligibility variants, never at bootstrap — so
  the join costs nothing on the hot path, and in conversation the ladder becomes
  data that can be reordered rather than type ordering that cannot. `Tier`,
  `Plan` and `Entitlement` stay three distinct concepts referencing the same
  vocabulary. `tiers` is not a billing table: no price, no interval, no
  provider plan id.
- **Effective Entitlement is captured on the Conversation at start**, alongside
  runtime release, runtime hash and context hash. Immutable for the life of the
  record. A Call that began on Starter stays Starter in history even if the
  Subscriber upgrades minutes later. Reconstructing this from a change timeline
  would be strictly worse and wrong at boundaries.
- **Billing history comes from append-only provider events**, when Paystack is
  built. One table serves webhook idempotency, audit and history. A derived
  `entitlement_changes` table is not justified — it is recomputable.
- **Composite foreign keys are a house rule.** Where tenant identity is
  denormalised onto a child alongside a tenant-owned parent, enforce it
  relationally: parent declares `UNIQUE (account_id, id)`, child references
  `(account_id, parent_id)`. Cross-tenant disagreement becomes structurally
  impossible rather than merely unlikely. Applied selectively — denormalise
  `account_id` only where it materially helps RLS, querying or operational
  support, not mechanically everywhere.

### Round 3

- **A channel-neutral root above Call was established.** One bounded
  communication episode between Voxi and another participant through a
  supported channel. It was briefly named `Exchange`, because at the time the
  product glossary had no word for it — `Interaction` was on the Call
  avoid-list, `Session` collided with LiveKit `AgentSession` and Supabase auth
  sessions, and `Dialogue` strained once Email and attachments arrived. Round 6
  retired that name once the product defined **Conversation** for exactly this
  concept.
- **Channel and Mode are separate dimensions.** Channel answers *where*:
  telephony, voxi_app, sms, email, whatsapp. Mode answers *how it operates*:
  realtime_voice or messaging. Voice and text are not channels. A WhatsApp
  Call and a WhatsApp voice note are both audio and behave completely
  differently — the first is realtime, the second is message content.
- **Channel is reference data, not an enum.** New channels are plausible
  (Teams, Slack, RCS, Telegram) and should not require a type
  migration.
- **Call attaches to Conversation by shared primary key.** `calls.conversation_id` is
  both PK and FK, giving 0..1 Call per Conversation structurally, with no second
  identity for the same communication episode.
- **Channel extensions are earned, not symmetrical.** A channel gets its own
  table only when it has real channel-specific persistent data. Call clearly
  does. The in-app channel may need nothing.
- **Content is a third dimension.** A Turn carries 0..N content parts — text,
  audio, image, document. For v1 telephony, text may be the only populated
  form. `turn.text` must not be assumed sufficient forever.

### Round 4

- **Account and Subscriber stay separate entities**, at 1:1 for first
  production, with Subscriber 1:1 Voxi Number. Tenant identity, person identity
  and authentication identity are three different things, which is reason
  enough to separate them today. Subscriber carries a Voxi-owned id with a
  nullable unique `auth_user_id`, so a person can exist before an auth record —
  which future invitations require. Account 1:N Subscribers is explicitly
  deferred; no members, seats, roles, invitations or assignment.
- **Summary stays as columns on the Conversation.** One current Summary per
  Conversation. A table earns its place when regeneration history, human edits or
  multiple summary types exist — none do.
- **A Task always belongs to a Conversation.** `conversation_id` required now;
  relaxing it later is an instant `DROP NOT NULL`. `account_id` stays required
  independently so tenancy never depends on walking the parent.
- **No read/unread model.** A Conversation needs attention when it has open Tasks
  or structured subscriber-input state. `needs_subscriber_input` must be
  deterministic and machine-readable — never inferred by matching prose in a
  Summary or a Turn.
- **Context snapshots referenced by composite tenant FK**, with the digest
  stored compactly as binary rather than 64-character hex, rendered as hex only
  for logs and admin.
- **Tools and capabilities are declarative catalog tables** with join tables to
  skills — not text arrays. **No worker-startup registry sync.** A worker
  mutating authoring state at boot inverts ADR-0005 and puts a schema write in
  the crash-loop path. Code/database agreement is proven by CI, publish
  validation and deployment validation instead.
- **A Turn carries 0..N content parts.** In-app, WhatsApp and Email turns are
  genuinely multimodal — text plus documents, or a voice note — so this is known
  domain shape, not speculative abstraction. The physical content schema is not
  locked; only the 1:N relationship is.
- **Turn authorship is channel-neutral.** `caller | agent | system` is rejected
  as telephony vocabulary: an in-app Conversation has no Caller, and `agent` collides with
  LiveKit's own terminology. `voxi` is preferred over `agent`.
- **Channel, Mode and channel_modes are all reference data.** Valid combinations
  are declared rather than assumed, so `sms + realtime_voice` is unrepresentable.
  Mode is a reference table too, not an enum — mixing an FK with an enum in the
  join table is the asymmetry that decided it.

### Round 5

- **Turn role is `subscriber | external | voxi`.** No `system` role until a real
  conversational use exists — an enum value with no defined author becomes the
  junk drawer that holds tool traces and debugging breadcrumbs, and a value
  cannot be removed once written. Lifecycle events are not Turns.
- **Lifecycle and outcome are two concepts, not one.** The Conversation owns
  channel-neutral lifecycle; the Call extension owns telephony outcome. A
  shared vocabulary containing `voicemail` would put a value on every Email row
  that can never apply.
- **Subscriber-input state stays independent of Tasks.** Collapsing it into a
  Task kind was proposed from this worktree and rejected: attention semantics
  are owned by the UI/product worktree, and persistence implements them rather
  than redefining them.
- **Binary content lives in Supabase Storage**, not in Postgres. `turn_content`
  holds path, mime, size and checksum.
- **Storage cleanup is a real non-Conversation job.** A database CASCADE removes
  the row referencing an object, never the object itself. `jobs.conversation_id`
  therefore becomes nullable while `account_id` stays required — with no
  generic polymorphic aggregate.
- **Client write access is per-field and per-operation**, not blanket table
  mutability. Row access and column/API exposure are separate concerns.
- **Account erasure is not a plain cascade.** It spans Postgres, Storage, Auth
  and a billing-retention boundary, and needs an explicit ordered workflow.

## Cross-worktree boundary

Product semantics — what a Subscriber experiences, what concepts mean,
attention behaviour, information hierarchy, product-visible states — are owned
by the UI/product worktree. This worktree owns how those concepts persist:
foreign keys, cardinalities, state representation, referential integrity, RLS
ownership, indexes, retention and transaction invariants.

**The database implements product semantics; it does not redefine them.** A
persistence decision that would change product meaning is a contradiction to
surface, not to resolve locally.

### Terminology map

Product and persistence now share one root word, deliberately. `Conversation`
means the same thing in `CONTEXT.md`, the API and the schema — nothing to
translate.

| Product / UI | Persistence |
| --- | --- |
| Conversation | `conversations` row |
| Call | `conversations.channel = telephony` + `calls` extension |
| Caller | a Turn with `role = external` on a telephony Conversation |
| Transcript | ordered Turn content, rendered |
| Summary | columns on `conversations` |
| Task | `tasks` row, always owned by a Conversation |

**`Exchange` is retired.** It was invented here to name a concept the product
did not yet have. The product now has it and calls it Conversation, so keeping
both would buy permanent translation debt between UI, API and schema for no
architectural benefit.

### Round 6

- **`Exchange` renamed to `Conversation`.** Terminology correction, not a
  redesign — everything settled about the shared root stands unchanged.
- **State is three independent axes, never one composite enum.** They coexist,
  and the database must keep them separable rather than pre-composing a UI
  status:
  - **Conversation lifecycle** — `active | completed | failed`. Did the
    conversation itself execute?
  - **Enrichment lifecycle** — `pending | processing | completed | failed`.
    Renamed from `summary_status`, because the job produces Summary *and* Tasks
    *and* structured state; naming it after one output misleads.
  - **Runtime degradation** — Voxi continued with reduced capability because
    part of the published runtime could not be used. Happens at bootstrap, not
    during enrichment. A completed, fully enriched Conversation can still be
    degraded.
- **Degradation is 1:N structured records, not a boolean.** ADR-0006 requires
  degradation carry runtime version, hash, skill slug, missing reference and
  error type — and more than one skill can degrade in a single bootstrap.
  `is_degraded` is `EXISTS (conversation_degradations)`. A boolean would force
  the UI to infer the reason from error prose, which ADR-0006 forbids.
- **Call outcome is product meaning and belongs to Call, never Conversation.**
  **`handled | voicemail | unresolved | abandoned`, all four confirmed.**
  `unresolved` covers the real gap — a meaningful conversation happened, Voxi
  did not resolve the need, no message was left. These are domain values, not
  UI copy. **`abandoned` must never be widened into a bucket for every
  unsuccessful Call.**
- **Outcome does not participate in attention.** No `handled → needs_attention
  = false` logic anywhere. Neither does lifecycle, degradation, or enrichment
  failure. Attention remains `open_tasks > 0 OR needs_subscriber_input`.
- **Input Requests are a distinct entity, closed.** A Task is something the
  Subscriber must do; an Input Request is something Voxi needs *from* them.
  They are separate concepts and feed attention independently. A Conversation
  carries 0..N Input Requests, each answered directly through a narrow reply
  affordance — never a general composer, thread or messaging surface. The
  signal is structured and deterministic and is never inferred from Summary or
  Transcript prose.

  The full product rule, owned by the UI worktree:
  `needs_attention = open_tasks > 0 OR unresolved_input_requests > 0`.
  Nothing else contributes — not Call outcome, not lifecycle, not enrichment
  state, not degradation.

### Round 7 — Account erasure

- **The Account survives as a non-personal tombstone**, `status = erased`. It
  holds only a surrogate id, tier, status and timestamps — no personal data —
  so retaining it costs nothing and keeps lawfully retained financial records
  referentially valid. Everything personal underneath is genuinely deleted:
  Subscriber, Conversations, Calls, Turns, Content, Tasks, Rules, Q&A, context
  snapshots, Storage objects, the Auth identity and external credentials.
  **Conversational data is deleted, never anonymised and kept.**
- **Retained billing events are redacted, not preserved whole.** Keep the
  financial facts that genuinely require retention — amount, currency, date,
  provider reference, tax-relevant fields, event type and status. Remove name,
  email, phone and other customer-identifying payload fields. Retaining a raw
  provider webhook payload is not automatically justified by the financial
  event needing retention.
- **Erasure is one durable resumable job**, not a cascade — it spans Postgres,
  Storage, Auth, the telephony provider and external integrations, and no
  transaction covers that. Progress is persisted so a retry skips steps that
  already succeeded, and every step is idempotent.

  Order: mark the Account `erasing` → **capture the exact external resource and
  Storage object keys** → release the Voxi Number with the configured telephony
  provider → delete Storage objects → revoke the Auth identity → revoke
  external integrations and credentials → delete tenant personal and
  conversational data → redact retained billing records → mark the Account
  `erased`.

  **Capture before delete is the whole reason this cannot be a cascade.** Once
  `turn_content` rows are gone, the object keys are gone with them and the
  files orphan permanently. **Never delete Storage by prefix wildcard** — a
  prefix bug reaches another tenant's data. The job carries exact keys.

  The step is written provider-neutrally on purpose. Twilio is the standardised
  provider (round 3), but a workflow step that names a vendor is where a
  provider swap leaves dead instructions behind.

## Known integrity gaps, accepted deliberately

- **A telephony Conversation is not forced by the database to have its Call row.**
  Postgres cannot declare "must have a child" without a trigger or deferred
  constraint. The agent creates both in one transaction; this is a transaction
  invariant rather than a schema constraint. Recorded for the invariant pass.

## Deliberately not modelled

**Thread** — the long-lived continuity above Conversation that asynchronous
channels will need (an Email thread, a WhatsApp relationship spanning weeks).
The eventual hierarchy is likely `Thread → Conversation → Turn → Content`, but
segmentation rules are unknown, so no table exists. The rule that matters now:
**Conversation must not silently become "the entire WhatsApp history with this
person forever."**

Also unbuilt: Email and WhatsApp channel extensions, media and document
storage, vector search chunks, Memory, per-Subscriber OAuth credentials.

### Round 8 — closed from merged product context

- **Failed Conversation is CLOSED.** `lifecycle = failed` stays visible in
  Conversation History with the product state **Failed**. It never maps to
  `abandoned` (a Call outcome) or to Degraded (which means Voxi continued with
  reduced capability). Partial evidence is shown only where it genuinely
  exists — no Summary, Tasks or outcome are fabricated to make a failed
  Conversation look complete. It does not contribute to attention, and there is
  no Subscriber retry in first production.
- **Conversation volume is CLOSED** as a planning assumption: Consumer low,
  Business potentially high. Not a measured figure. Its persistence
  consequences are cursor pagination and search shipping in first production.
- **Turns are persisted incrementally while `lifecycle = active`** — each in
  its own short transaction, ordered by an agent-assigned sequence unique per
  Conversation, final output only. This was already implied by the round 1
  decision to reject a growing JSONB document: the stated reason was that a
  worker dying mid-call must not lose the conversation, which only holds if
  turns are durable before it ends. It is also what lets a Failed Conversation
  retain the partial evidence the UI expects. **Architecture-owned; closed
  here, no product decision required.**
- **Channel values are `telephony | voxi_app | sms | email | whatsapp`.**
  `chat` was stale. In-app Voice and Text Chat are both `voxi_app`,
  distinguished by Mode.

## Still open

Nothing. Q10, Q11 and Q12 closed in round 8 — see the decision log. The
complete specification is **[Final conceptual design](#final-conceptual-design)**
at the end of this document; everything above it is the record of how each
decision was reached.

<details><summary>Superseded note from before round 8 closed</summary>

The entity model is complete. Two items remain, and only one of them can block
anything.

**Q10 — what happens after an Input Request is answered.** Product behaviour,
not schema. Neither branch changes a table: resolve-only writes `answered_at`
and the answer onto the request; re-enrichment re-runs a job that already
exists and rewrites Summary columns that are already rewritable. The single
schema consequence, if re-enrichment ships, is telling apart Tasks raised by
different passes — one nullable column on a low-volume table, trivially added
later with existing rows correctly reading as pass one. **Does not block
conceptual sign-off or DDL.**

**Q12 — what Conversation search covers.** Does not change any entity, but it
does decide the index set, which is part of sign-off. See the index section.
**Blocks the index deliverable only.**

`runtime.md`'s Call-first bootstrap assumption is corrected: tenancy resolution
is now a per-channel binding, of which the dialled Voxi Number is the telephony
case rather than the universal rule.

</details>

### Round 8 closures

- **Q10 — resolve-only.** Answering an Input Request records the answer and a
  resolution timestamp, moving it `pending → answered`. It does not trigger
  re-enrichment. First production therefore never has to answer whether Summary
  is regenerated, whether Tasks are replaced or merged, or which pass produced
  which Task. If re-enrichment ships later, the provenance needed is one
  nullable column on a low-volume table.
- **Q11 — persist live, do not render live.** Final Turns are written
  incrementally while `lifecycle = active`, each in its own short transaction,
  ordered by an agent-assigned sequence unique within the Conversation.
  Interim STT hypotheses are excluded. Partial durable evidence survives worker
  failure, which is what lets a Failed Conversation show what genuinely exists.
  The UI exposes no live Transcript in first production — **persist live is not
  render live.**
- **Q12 — search covers identity, subject, Summary and Tasks.** Full Transcript
  text is deliberately not indexed. Turns are written during a live
  Conversation, so a large FTS index on turn content would charge every
  utterance for search recall; and keyword indexing of transcripts would be
  superseded by the later chunk-and-embed retrieval work rather than reused
  by it. **Transcript search is deferred to that architecture, not to a bigger
  index now.**

---

# Final conceptual design

> **For approval. Still no DDL.** This is the consolidated specification; the
> decision log above records how each choice was reached. Where the schema
> board and this document disagree, this document wins.

## Entities by domain

### Identity and tenancy

| Entity | Responsibility |
| --- | --- |
| `accounts` | Tenancy, ownership and security boundary. Holds entitlement tier and account status. Contains no personal data, which is what lets it survive erasure as a tombstone. |
| `subscribers` | The human who owns and operates Voxi. Nullable, unique `auth_user_id` so a person can exist before an auth record. |
| `voxi_numbers` | A number Voxi answers. Surrogate id, `e164` unique — numbers port, get reassigned and get corrected. |

Cardinality, first production: `accounts 1—1 subscribers 1—1 voxi_numbers`.
Three separate concepts at 1:1; `accounts 1—N subscribers` is deferred and the
1:1 must never collapse them.

### Billing and entitlement

| Entity | Responsibility |
| --- | --- |
| `tiers` | Reference vocabulary with an explicit `rank`. Not a billing table — no price, interval or provider plan id. |
| `subscriptions` | Provider billing truth: plan, status, period, grace. Never read at bootstrap. |
| `subscription_events` | Append-only provider webhooks. Serves idempotency, audit and history at once. Redacted, not deleted, on erasure. |

Runtime reads `accounts.entitlement_tier` and never interprets payment state.

### Runtime authoring

| Entity | Responsibility |
| --- | --- |
| `skills` | Mutable authoring record: slug, name, instructions, minimum tier, enabled. Read only by publish. |
| `tools` | Declarative catalog of stable tool identifiers. Managed through the deployment path — never synced by a worker at boot. |
| `capabilities` | Same, for availability requirements. |
| `skill_tools`, `skill_capabilities` | Join tables with real foreign keys, so a typo is an insert the database refuses. |
| `runtime_drafts` | Mutable pre-publish configuration. |

### Published runtime

| Entity | Responsibility |
| --- | --- |
| `runtime_releases` | Immutable, insert-only. Fully materialised artifact, `runtime_hash`, per-tier eligibility variants. |
| `runtime_deployment` | Single row naming the live release. Rollback moves the pointer; no release is ever touched. |

### Subscriber context

| Entity | Responsibility |
| --- | --- |
| `qa_pairs` | Subscriber-authored deterministic answers. Pro tier. |
| `rules` | Standing instructions. Trigger on a Caller or a topic, never both. |
| `context_snapshots` | Content-addressed, tenant-scoped, insert-only. Reconstructs exactly what a historical Conversation was given. |

### Conversation

| Entity | Responsibility |
| --- | --- |
| `channels` | Reference: `telephony`, `voxi_app`, `sms`, `email`, `whatsapp`. |
| `modes` | Reference: `realtime_voice`, `messaging`. |
| `channel_modes` | Which modes each channel permits, making `sms + realtime_voice` unrepresentable. |
| `conversations` | **The root.** Runtime release, runtime hash, context hash, effective entitlement, timings, Summary columns, lifecycle and enrichment state, search vector. |
| `calls` | Telephony extension. Direction, caller and callee numbers, Voxi Number, SIP and carrier identifiers, arrival, **outcome**. |
| `conversation_turns` | One append-only row per final contribution: role, sequence, timestamp. |
| `turn_content` | 0..N content parts per Turn. Text inline; binary by reference into Storage. |
| `input_requests` | What Voxi needs *from* the Subscriber. 0..N per Conversation. |
| `conversation_degradations` | 0..N structured records of a Skill unusable at bootstrap. |
| `tasks` | What the Subscriber must do. Always belongs to a Conversation. |

### Background work

| Entity | Responsibility |
| --- | --- |
| `jobs` | One durable table for all asynchronous work. Claimed with `FOR UPDATE SKIP LOCKED`; attempts, backoff, dead-letter, stale-claim recovery. |

## Cardinalities

```
accounts 1─1 subscribers 1─1 voxi_numbers
accounts 1─N conversations 1─0..1 calls
conversations 1─N conversation_turns 1─N turn_content
conversations 1─N tasks · input_requests · conversation_degradations · jobs
conversations N─1 runtime_releases · context_snapshots · channels · modes · tiers
channels N─M modes  (via channel_modes)
skills   N─M tools  (via skill_tools)
skills   N─M capabilities (via skill_capabilities)
runtime_deployment 1─1 runtime_releases   (single row)
```

## Keys

**UUIDv7 everywhere it is client-visible or externally referenced** — accounts,
subscribers, voxi_numbers, conversations, tasks, input_requests, jobs,
runtime_releases, runtime_drafts, skills, degradations. Time-ordered so inserts
stay local in the index, and it leaks no volume the way a sequence does.
Postgres 17.6 has no `uuidv7()` and `pg_uuidv7` is unavailable on Supabase, so
generation is a small SQL function over `pgcrypto` for defaults, with Python
generating client-side where the agent needs the id before writing — which is
what makes a retried insert idempotent.

**`bigint` identity for high-volume internal rows** — `conversation_turns`,
`turn_content`. Never referenced externally, and they will outnumber everything
else.

**Natural and composite keys where the relationship is the identity:**

- `calls.conversation_id` is **both PK and FK** — 0..1 Call per Conversation,
  structurally, with no second identity for one communication episode
- `context_snapshots` — `(account_id, context_hash)`
- `channel_modes`, `skill_tools`, `skill_capabilities` — composite of their two
  foreign keys
- `runtime_deployment` — one row, enforced by a CHECK on a constant id
- Reference tables carry a small surrogate id with a unique slug

## State and reference vocabularies

| Field | Form | Reason |
| --- | --- | --- |
| Tier | **reference table** with `rank` | Compared at publish time only, so the join is free; the ladder becomes reorderable data instead of type ordering |
| Channel, Mode | **reference tables** | Grow with integrations; a join table of two FKs beats mixing an FK with an enum |
| `conversations.lifecycle` | **enum** `active · completed · failed` | Closed, owned by us, changes almost never |
| `conversations.enrichment_status` | **enum** `pending · processing · completed · failed` | As above. Named for the job, not for Summary alone — it also produces Tasks and Input Requests |
| `calls.outcome` | **reference table** `handled · voicemail · unresolved · abandoned` | Product meaning; the UI needs display labels. `abandoned` is never widened |
| `conversation_turns.role` | **enum** `subscriber · external · voxi` | No `system` until a real conversational use exists |
| `tasks.status` | **enum** `open · done · dismissed` | |
| `input_requests.status` | **enum** `pending · answered · dismissed` | Expiry is a product decision, not a state |
| `jobs.status` | **enum** | The state machine is the point |
| `jobs.job_type` | **CHECK text** | Pure implementation, grows with every feature, no display label |
| `subscription_status` | **CHECK text** | Mirrors a provider's vocabulary, which is not ours to control |
| `account_status` | **enum** `active · suspended · erasing · erased` | |
| `number_status` | **enum** `provisioning · active · released` | |

**Three state axes stay independent** — lifecycle, enrichment and degradation
coexist and are never pre-composed into a UI status. `is_degraded` is
`EXISTS (conversation_degradations)`, never a stored boolean, so the reason
survives without anyone parsing error prose.

**Attention is derived, never stored:**
`needs_attention = open_tasks > 0 OR unresolved_input_requests > 0`. Outcome,
lifecycle, enrichment state and degradation contribute nothing.

## Immutability

| Entity | Rule |
| --- | --- |
| `runtime_releases` | Insert-only. A published artifact never changes, so rollback restores exactly what ran |
| `context_snapshots` | Insert-only, content-addressed |
| `conversation_turns`, `turn_content` | Append-only |
| `subscription_events` | Insert-only, except redaction during erasure |
| `conversations` | Mutable while `active`; afterwards only enrichment output and search vector |
| Runtime identity on a Conversation | `runtime_release_id`, `runtime_hash`, `context_hash`, `effective_entitlement` are written once at bootstrap and never updated |

## Deletion semantics

The governing rule: **no deletion may make a historical Conversation
uninterpretable.**

| Relationship | Behaviour |
| --- | --- |
| anything → `accounts` | **CASCADE** — erasure must genuinely delete |
| `conversations` → `runtime_releases` | **RESTRICT** |
| `conversations` → `context_snapshots` | **RESTRICT** |
| `conversations` → `channels`, `modes`, `tiers` | **RESTRICT** |
| `calls` → `voxi_numbers` | **RESTRICT** — release a number via status, never delete it |
| `calls` → `conversations` | **CASCADE** — the extension dies with its root |
| `conversation_turns`, `tasks`, `input_requests`, `conversation_degradations`, `jobs` → `conversations` | **CASCADE** |
| `turn_content` → `conversation_turns` | **CASCADE** |
| `skill_tools`, `skill_capabilities` → `skills` | **CASCADE** |
| `skill_tools` → `tools`, `skill_capabilities` → `capabilities` | **RESTRICT** — removing a referenced tool must fail loudly |
| `subscriptions`, `subscription_events` → `accounts` | **RESTRICT**, retained through erasure |

### Account erasure

Not a cascade — it spans Postgres, Storage, Auth, the telephony provider and
external integrations, and no transaction covers that. One durable, resumable,
idempotent `account_erasure` job:

```
mark account erasing
  → capture exact Storage object keys and external resource ids
  → release the Voxi Number with the configured telephony provider
  → delete Storage objects (never by prefix wildcard)
  → revoke the Auth identity
  → revoke external integrations and credentials
  → delete tenant personal and conversational data
  → redact retained billing records to financial facts only
  → mark account erased
```

**Capture before delete is the whole reason this cannot be a cascade.** Once
`turn_content` is gone the object keys are gone with it and the files orphan
permanently. The Account survives as a non-personal tombstone so lawfully
retained financial records keep a valid foreign key; conversational data is
deleted, never anonymised and kept.

## Tenant ownership

`account_id` is denormalised onto every table the client reads or that the
worker filters by: `conversations`, `calls`, `conversation_turns`,
`turn_content`, `tasks`, `input_requests`, `conversation_degradations`, `jobs`,
`rules`, `qa_pairs`, `context_snapshots`.

**Wherever it is denormalised alongside a parent reference, tenant consistency
is enforced relationally** — the parent declares `UNIQUE (account_id, id)` and
the child's foreign key is the pair. Cross-tenant disagreement becomes
structurally impossible rather than dependent on application correctness.

`turn_content` is three hops from the account, on the highest-volume table in
the schema; denormalising there is what stops every transcript render paying
for a correlated subquery per row.

## RLS ownership model

| Access | Tables |
| --- | --- |
| **Client reads own account** | `accounts`, `subscribers`, `voxi_numbers`, `conversations`, `calls`, `conversation_turns`, `turn_content`, `tasks`, `input_requests`, `conversation_degradations`, `rules`, `qa_pairs`, `subscriptions` |
| **Client writes, field- and operation-constrained** | `rules`, `qa_pairs` (full CRUD); `tasks` (status only); `input_requests` (answer and resolve only); `subscribers` (own profile only) |
| **Any authenticated read** | `tiers`, `channels`, `modes`, `call_outcomes` — reference data with no tenant dimension |
| **Service role only, never client-visible** | `skills`, `tools`, `capabilities`, `skill_tools`, `skill_capabilities`, `runtime_drafts`, `runtime_releases`, `runtime_deployment`, `channel_modes`, `jobs`, `context_snapshots`, `subscription_events` |

Ownership path is always `account_id` — one hop, no recursive joins.
`conversation_degradations` is client-readable so the UI can show **Degraded**,
with raw error internals kept in a detail column the client-facing projection
omits.

**Supabase Storage has its own access control**, entirely separate from these
policies. Object paths are prefixed with the account id and the Storage policy
keys on that prefix, or row access is airtight while the bytes are not.

## Required indexes

### Correctness and uniqueness

```
voxi_numbers (e164) UNIQUE
skills (slug) · tools (name) · capabilities (name) UNIQUE
tiers (slug) UNIQUE · tiers (rank) UNIQUE
channels (slug) · modes (slug) UNIQUE
context_snapshots (account_id, context_hash) PK
conversation_turns (conversation_id, sequence) UNIQUE
calls (sip_call_id) UNIQUE
jobs (job_type, idempotency_key) UNIQUE
subscription_events (provider_event_id) UNIQUE
runtime_releases (version) UNIQUE
runtime_deployment — CHECK constant id, single row
UNIQUE (account_id, id) on conversations and conversation_turns
    — support for the composite tenant foreign keys
```

### Known access paths

```
conversations (account_id, started_at DESC)          history, cursor pagination
conversations (account_id, channel_id, started_at DESC)   channel filter
tasks (account_id, status, created_at DESC)          open Tasks, attention
input_requests (account_id) WHERE status = 'pending' attention
conversation_turns (conversation_id, sequence)       transcript render
turn_content (turn_id)
jobs (next_attempt_at) WHERE status = 'pending'      the claim query
jobs (claimed_at) WHERE status = 'processing'        stale-claim sweeper
conversations (started_at) WHERE lifecycle = 'active'  stale-conversation sweeper
subscriptions (account_id)
conversation_degradations (conversation_id)
```

### Search — first production scope

Scope is **identity, subject, Summary and Tasks**. Transcript text is
deliberately not indexed.

Rather than two GIN indexes and a ranked union across tables, `conversations`
carries a single maintained `search_tsv`, written by the enrichment job from
caller identity, subject, Summary and Task titles:

```
conversations USING GIN (search_tsv)
```

One index, one query, no cross-table ranking, **and nothing on the live Turn
write path** — which is the point, since Turns are written while someone is
still talking. The obligation this creates: any future feature that lets a Task
title change must refresh the vector, either in that code path or by a trigger
on `tasks`.

Search suppresses date grouping and returns a flat ranked set.

### Deferred until measured

Virtualisation, partitioning of `conversation_turns` or `turn_content`, and any
vector or hybrid retrieval index. Full Transcript search belongs to the later
chunk-and-embed architecture, not to a larger keyword index now.

## Transaction invariants

1. **A committed Conversation that needs enrichment has its job committed in
   the same transaction.** No Conversation exists without the work it requires.
2. **A Conversation and its Call extension are created together**, in one
   transaction. The database cannot declare "must have a child", so this is an
   application invariant — recorded, not assumed.
3. **Each Turn is its own short transaction.** No long-running transaction is
   held open for the duration of a Conversation.
4. **A context snapshot is inserted-if-absent before or with the Conversation
   that references it.**
5. **Runtime and context identity are written once at bootstrap** and never
   updated for the life of the record.
6. **`finish_call` closes lifecycle, and enrichment is a separate job.** The
   agent process is released as soon as the participant disconnects; no LLM
   call sits inside a database transaction.
7. **Erasure captures external resource keys before deleting the rows that
   reference them.**
8. **Job insertion is idempotent** on `(job_type, idempotency_key)`.

## Deferred, deliberately

`threads` (long-lived continuity above Conversation for asynchronous channels —
Conversation must never silently become "the entire WhatsApp history with this
person"), Email and WhatsApp channel extensions, media and document storage
rows, `conversation_search_chunks` with embeddings, Memory, per-Subscriber
OAuth credentials, `accounts 1—N subscribers` with seats and roles, per-skill
model routing, canary runtime rollout, and re-enrichment provenance.
