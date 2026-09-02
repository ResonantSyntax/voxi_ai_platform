# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Recorded for the first production surface, `apps/web` (Next.js dashboard).
`apps/mobile` is an unmodified Expo scaffold; when it becomes real work it
needs its own platform record. ADR-0003 is explicit that web and native share
a token layer, not components and not a per-OS design language — so this is
not an `adaptive` product.

## Users

Voxi currently has two Subscriber profiles:

```
Consumer
├── Starter
└── Pro

SME
└── Business
```

- **Consumer (Starter, Pro).** An individual whose personal phone is a front
  door they cannot always answer. Starter is the basic consumer product; Pro is
  the same person wanting more (calendar, Q&A, a Voxi Card).
- **SME (Business).** A small company buying a forward-facing customer service
  / receptionist solution. The Subscriber is buying on behalf of a business,
  and the Caller is that business's customer.

Undecided, and not to be invented: Business firmographics, industry, company
size band, and geographic scope. South African English is the primary
spoken-language target (ADR-0002); the market has not been formally scoped.

**Caller** is a second audience Voxi serves without ever signing up. Voxi
speaks to the Caller; the Subscriber reads the result. `Caller` is telephony
only — the equivalent noun for an In-app Voice or Text Chat participant has not
been decided.

## Product Purpose

Voxi is an AI answering service centred on a dedicated Voxi Number.

Every Subscriber gets a Voxi Number that Voxi answers on their behalf. Calls
reach Voxi either because the Subscriber forwarded their personal phone or
because someone dialled the Voxi Number directly.

The Voxi Number is the anchor of the product, but it is not the boundary of the
Conversation model. Across supported channels, Voxi turns Conversations into
useful outcomes such as Summaries and Tasks.

The Conversation domain model includes:

- Phone Call
- In-app Voice
- Text Chat

**Phone Call is the primary first-production channel.** In-app Voice and Text
Chat belong to the domain model, but their product surfaces are not
first-production requirements unless explicitly scoped.

The first production release being phone-heavy **must not** turn `Call` back
into the universal UI or domain parent.

Success is the Subscriber not needing to have been present for the
Conversation: they can understand what happened, see what needs their
attention, and trust how Voxi handled it.

## Positioning

The Voxi Number is a core product differentiator. It is a number the Subscriber
can own, forward to, and hand out directly, so Voxi is not merely a fallback
for missed Calls (ADR-0001). The Number also supports related product surfaces
such as the Voxi Card and future Business receptionist capabilities.

Do not define the whole product as telephony-only. Conversation is the broader
domain concept and may occur through phone, In-app Voice, or text.

Voxi is not a voicemail assistant — Voicemail is one possible outcome of one
phone Call. Voxi is also not currently positioned as a general personal
assistant: do not imply broad control over the Subscriber's inbox, messaging,
devices, or unrelated automations.

## Operating Context

The Subscriber's phone and Voxi Number are the primary entry points for
telephony. The web dashboard is where the Subscriber reviews what happened and
configures the parts of Voxi exposed in the first production release.

First production scope for `apps/web`:

```
Authentication & Onboarding
  unauthenticated → account created → basic Voxi setup
  → Voxi Number provisioned → forwarding configured → ready to use

Conversations
  ├── History
  └── Detail
      ├── Summary
      ├── Transcript / Messages
      ├── Tasks
      └── Channel-specific details

Subscriber-authored guidance
  ├── Q&A   (Pro)
  └── Rules

Voxi Number
  └── Provisioning / Forwarding setup

Billing & Entitlement
  └── Plan · Payment · Upgrade / downgrade · Grace state
```

**"Subscriber-authored guidance" is a planning grouping, not an approved
navigation label.** Do not use `Knowledge` as a generic grouping for Q&A and
Rules — `Knowledge` is the existing product term for Business-tier uploaded
documents, and reusing it here destroys the distinction.

Anything outside first-production scope remains provisional until UX planning
establishes a genuine requirement. The onboarding journey must be designed from
the Subscriber's needs rather than inferred from backend operation order.

Conversation is the parent domain concept:

```
Conversation
├── Phone Call     ← the telephony subtype
├── In-app Voice
└── Text Chat
```

Ownership rule:

- **Shared downstream concepts belong to Conversation** — Summary, Transcript,
  Tasks, Conversation History.
- **Telephony-specific metadata and behaviour may belong to Call** — direction,
  caller / callee information, the Voxi Number relationship, SIP identifiers,
  carrier or provider identifiers, telephony outcome.

The invariant: **every Call is a Conversation; not every Conversation is a
Call.**

In-app Voice and Text Chat belonging to the domain model **does not**
automatically make every related creation or composer experience part of the
first web release. Those product surfaces must be explicitly scoped.

Rules and Q&A need view / add / edit / delete plus a clear statement of what
each item affects. Whether they are separate pages, tabs, or another structure
is a UX decision, not settled here.

Billing UI must expose the user-facing consequence — what you are on, what you
can use, what happens when payment fails — without making the Subscriber learn
the internal Plan/Entitlement split. Internally the two stay separate concepts;
externally the UX explains the result.

## Capabilities and Constraints

- **Vocabulary is load-bearing.** `CONTEXT.md` owns canonical product
  terminology: Subscriber not user or customer; Task not to-do; Summary not
  Transcript; Voxi Number not DID; **Call only when the Conversation is
  telephony**.
- **`Caller` is telephony-specific.** Do not call an In-app Voice or Text Chat
  participant a Caller.
- A Rule influences how Voxi handles relevant Conversations. **It cannot
  control whether the Subscriber's mobile phone rings** (ADR-0001) — by the
  time Voxi has the Call the ringing is over.
- **Exact Rule trigger combinations are not yet settled.** Do not infer product
  behaviour from provisional database constraints.
- Q&A is Subscriber-authored deterministic source material. Voxi answers from
  the pairs and does not invent beyond them. Current intended tier: Pro.
- Knowledge means Subscriber-uploaded documents used for retrieval. Current
  intended tier: Business.
- Business receptionist capability scope is not yet settled.
- Memory does not exist yet. Do not imply that Voxi deliberately retains
  selected long-term facts unless and until Memory is implemented.
- **Audio is not persisted.** The durable historical Conversation record is
  textual. Do not design historical audio playback unless this policy is
  explicitly changed through a product *and* architecture decision. This
  matches the runtime invariant: transcription happens in flight, audio is not
  stored.
- **Entitlement, not Plan**, determines which capabilities the Subscriber may
  use at runtime. The two diverge during Grace, suspension, and administrative
  override.
- **Some product operations are asynchronous.** Interfaces must account for
  pending, processing, completed and failed states wherever those states can
  genuinely occur.
- For normal tenant-owned dashboard data, `apps/web` may read and write through
  Supabase under RLS. There is no requirement for a general-purpose CRUD API
  layer between the dashboard and Postgres.
- Operations requiring secrets, provider credentials, privileged access,
  orchestration, or trusted server-side behaviour may use narrow server-side
  endpoints or functions. **Never move secrets or privileged provider
  operations into the browser merely to preserve a "no API tier" slogan.**
- Turn latency is higher than a speech-to-speech model by deliberate trade
  (ADR-0002). Nothing in the UI should promise instant response. ADR-0002
  describes the telephony pipeline only; In-app Voice and Text Chat have no
  recorded voice architecture yet.
- **Implementation may temporarily lag the approved Conversation domain
  model.** Do not infer product terminology or UX structure from legacy
  Call-rooted implementation. When implementation conflicts with the approved
  domain model, surface the conflict rather than silently reconciling it. The
  affected tables, migrations, ADR amendments and backend work are tracked in
  architecture documentation and Linear, not here.

## Brand Commitments

- **Name:** Voxi.
- **Dark only.** There is no light mode.
- **Mint `#0aef9a` means Voxi is doing or saying something.** Never generic
  emphasis — it stops meaning anything. Outlined mint = Voxi does it; flat =
  you do it.
- **Lime `#8cdd2c` means finished.** Confirmation only.
- `packages/theme/tokens.json` is the design system. Edit it and run
  `pnpm theme`; never edit the generated `theme.css`.
- Voice follows `CONTEXT.md`: plain, specific, no assistant-speak.

## Evidence on Hand

- `CONTEXT.md` — the product glossary, in the repo.
- `docs/adr/0001`–`0006` — the decisions behind the product and architecture.
- `docs/architecture/runtime.md` — provisional, explicitly not migration-ready.
- `packages/theme/tokens.json` — the token layer, extracted from the mobile
  mockup.
- **The original mockup exists**:
  `~/Downloads/Archives/Voxi Voicemail Agent Mockup.zip`, containing
  `Voxi Mobile App.dc.html` and `voxi-theme.css` / `voxi-theme.json`. A copy of
  the CSS is also at `~/Downloads/Code/voxi-theme.css`. It is a **mobile**
  mockup; no web dashboard design exists.
- ADR-0001 records that the mockup's "rings through no matter what" copy is
  **wrong**, and `CONTEXT.md` ranks old mockups last: visual reference only,
  never overriding product behaviour or architecture.

**Known drift.** Parts of the schema and the architecture documents predate the
Conversation parent concept and are still written Call-first. `README.md` has
been aligned. The remainder are recorded decisions: they need a deliberate
amend-or-supersede call in architecture documentation and Linear, never a
silent edit here.

Absences that must not be filled in by invention: no customers, no
testimonials, no usage numbers, no pricing figures, no launch date, no
benchmarks. Business-tier feature scope is undecided, not undisclosed.

## Product Principles

1. **The number is the anchor.** The Voxi Number is a defining part of the
   product: design it as something the Subscriber can confidently hand out and
   rely on, not merely somewhere missed Calls fall through to. Do not let that
   telephony anchor make non-telephony Conversations second-class in the shared
   Conversation model.
2. **Mint is a claim about authorship.** Mint indicates Voxi is doing or saying
   something; do not spend it as generic emphasis. Outlined mint = Voxi does
   it; flat = the Subscriber does it.
3. **The glossary is the interface.** Use `CONTEXT.md` terminology. If proposed
   interface copy requires a conflicting domain term, surface the conflict
   rather than silently inventing vocabulary. When sources disagree,
   `CONTEXT.md`'s priority applies: approved product decisions → ADRs →
   product context → old mockups.
4. **Say what actually happened.** Expose real outcomes and states. Do not hide
   degraded Conversations, failed operations, Grace state, unfinished
   processing, or other meaningful conditions behind reassuring copy.
5. **Do not imply capabilities Voxi lacks.** No Memory unless implemented; no
   broad personal-assistant behaviour; no promise that Voxi can control whether
   the Subscriber's personal phone rings.

## Accessibility & Inclusion

Target **WCAG 2.2 Level AA** for the production web application. This is a
product constraint, not a final QA step — it is planned for and built in, not
audited on afterwards.

At minimum, planning and implementation must account for:

- keyboard navigation
- visible and unobscured focus
- appropriate target sizes
- semantic structure and controls
- accessible authentication
- labelled forms and meaningful errors
- sufficient contrast
- screen-reader semantics
- reduced-motion preferences wherever motion is used
- responsive zoom / reflow
- destructive-action clarity

Two product facts sharpen this. The product is **dark-only**, so contrast
cannot fall back on a light-mode alternative. And mint and lime carry semantic
meaning, so **colour must never be the sole carrier of state or authorship**.

A token value does not by itself prove compliance. Tokens set the intent;
rendered components still require verification.
