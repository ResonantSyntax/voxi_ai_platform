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
> **Turns** are what was conversationd.
> **Content** is what each Turn contains.

`Conversation` is internal persistence and runtime vocabulary. It is deliberately
not product language and never appears in the Subscriber's world — there, a
telephony Conversation is a **Call**, exactly as `CONTEXT.md` defines it.

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

- **`Conversation` is the internal root.** One bounded communication episode
  between Voxi and another participant through a supported channel. Chosen
  over `Interaction` (on the Call avoid-list in `CONTEXT.md`), `Session`
  (collides with LiveKit `AgentSession` and Supabase auth sessions),
  `Conversation` (already plain English describing what a Call is) and
  `Dialogue` (strains once Email, SMS and attachments arrive).
- **Channel and Mode are separate dimensions.** Channel answers *where*:
  telephony, chat, sms, email, whatsapp. Mode answers *how it operates*:
  realtime_voice or messaging. Voice and text are not channels. A WhatsApp
  Call and a WhatsApp voice note are both audio and behave completely
  differently — the first is realtime, the second is message content.
- **Channel is reference data, not an enum.** New channels are plausible
  (Teams, Slack, RCS, Telegram, web chat) and should not require a type
  migration.
- **Call attaches to Conversation by shared primary key.** `calls.conversation_id` is
  both PK and FK, giving 0..1 Call per Conversation structurally, with no second
  identity for the same communication episode.
- **Channel extensions are earned, not symmetrical.** A channel gets its own
  table only when it has real channel-specific persistent data. Call clearly
  does. Chat may need nothing.
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
- **A Turn carries 0..N content parts.** Chat, WhatsApp and Email turns are
  genuinely multimodal — text plus documents, or a voice note — so this is known
  domain shape, not speculative abstraction. The physical content schema is not
  locked; only the 1:N relationship is.
- **Turn authorship is channel-neutral.** `caller | agent | system` is rejected
  as telephony vocabulary: an app Chat has no Caller, and `agent` collides with
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
  `handled | voicemail | abandoned` confirmed. `unresolved` proposed for the
  real gap — a meaningful conversation happened, Voxi did not resolve the need,
  no message was left — pending UI confirmation. **`abandoned` must not be
  widened into a bucket for every unsuccessful Call.**
- **Outcome does not participate in attention.** No `handled → needs_attention
  = false` logic anywhere. Neither does lifecycle, degradation, or enrichment
  failure. Attention remains `open_tasks > 0 OR needs_subscriber_input`.
- **Subscriber-input physical representation is reopened**, pending UI Q9. What
  is locked is the requirement: if the feature ships, the signal is structured,
  deterministic, machine-readable, may support multiple outstanding requests,
  and is never inferred from Summary or Transcript prose. No answer payload,
  response channel, resolution linkage or threading is designed until Q9 lands.

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

## Still open

Carried into round 4: Account versus Subscriber as separate entities, Summary
placement, Task ownership and optionality, the context snapshot foreign-key
shape, skill-to-tool representation, Turn and Content structure, participant
identity on a Turn, and Channel and Mode representation. Deletion semantics,
indexes, RLS ownership paths and outcome vocabulary follow once those land.
