# LiveKit for conversation; on-device intelligence layer for Knowledge

**Status:** accepted (supersedes the earlier provisional trial of QVAC
STT/LLM/TTS inside LiveKit Agents for In-app Voice)

All conversational surfaces — Phone Call, In-app Voice, and Text Chat — use
**LiveKit** (Agents pipeline for voice; shared conversation stack across
platforms).

On the Subscriber device, QVAC powers a **device intelligence layer**: it runs
job-shaped AI (OCR, embed, extract, draft) and **manages a local SQLite/vector
database**, synced with **Supabase**. It is an **index + propose** layer — not
the conversation brain, not Memory, and not a second chat UI.

## Why

- LiveKit already owns realtime media and the ADR-0002 STT→LLM→TTS agent shape.
  One conversation stack across channels keeps one tool-calling path.
- QVAC’s Expo path fits on-device OCR, embeddings, RAG, and small LLM jobs; its
  voice-assistant example is desktop-only and does not replace LiveKit.
- LiveKit Agents cannot run QVAC on the phone. Voice stays on LiveKit; device AI
  stays on Knowledge/ops.
- A local vector index plus Supabase sync offloads cost, enables offline
  retrieve, and supports capture → Knowledge without inventing “self-learning”
  behaviour that silently changes Rules, Q&A, or Memory.

## Shape

```text
Capture / sync-down
    → QVAC jobs (OCR, chunk, embed, redact, extract, draft)
    → local SQLite + vectors   (working set, offline retrieve, job queue)
    → sync-up to Supabase      (Knowledge SoT; drafts as drafts)
    → sync-down                (authoritative Knowledge; optional Conversation
                                text mirrors for on-device search)
```

| Layer | Owns | Does not own |
| --- | --- | --- |
| **LiveKit + cloud agent** | Conversations, live voice/text, authoritative Summary/Task workers | On-device OCR/index |
| **Device intelligence layer (QVAC)** | Local SQLite/vector, ingest jobs, propose drafts/chips/labels | Live voice/chat; auto-activating Rules/Q&A/Memory |
| **Supabase** | Knowledge (and related) **source of truth**; durable drafts until accepted | Running QVAC inference |

**Conflict policy:** Supabase wins. Local-only captures stay pending until sync.
**Embeddings:** version the embedding model; do not mix incompatible vectors
across device and server without a re-index plan (decide in implementation —
device-first is fine for the spike).

**Language:** Prefer “keeps Knowledge searchable on this device” / “learns from
what you add” in product copy. Do **not** describe this layer as self-learning
Memory or as a second Voxi.

## Scope — in

### Platform

- Trimmed `@qvac/sdk` on Expo (`apps/mobile`): OCR, embeddings, optional small
  LLM plugins only
- Local SQLite + vector index + durable job queue
- Sync with Supabase for Knowledge (SoT) and accepted drafts

### Product surfaces (index + propose)

These are the intended client-facing uses of the layer. UI stays Operate /
Knowledge / review — **no free-text “ask local Voxi”**.

**Knowledge**

- Scan to Knowledge — camera → OCR → local LLM titles, tags, one-line blurb →
  confirm add
- Smart library — semantic search over synced + pending captures (incl. offline)
- What’s in this doc? — key points / entities as chips (not chat)
- Missing info — e.g. “no hours found” → deep-link to edit
- Clean before upload — redact IDs/emails; masked preview before sync

**Authoring (draft → Subscriber confirm)**

- Doc → Q&A drafts (checklist keep/edit)
- Doc → Rule drafts (never auto-active)
- Improve this answer — rewrite a Q&A draft for voice (short, no markdown)

**Conversation review (after the fact, on synced text)**

- Find in history — semantic search over mirrored Transcripts/Conversations
- Highlight reel — short “what mattered” from a closed Conversation when useful
  offline / as a cache
- Related Knowledge — matching local chunks while viewing a Conversation

**Capture workflows**

- Business card / flyer ingest — photo → contact/offering fields → Knowledge +
  optional Q&A stubs (drafts)

### Plumbing jobs (required)

Model download/update, plugin warm/unload, job queue with retry, storage budget,
chunk/embed, Knowledge sync-up/down, re-index when embedding model changes.

## Scope — out

- In-app Voice / Text Chat / Phone Call inference (LiveKit only)
- QVAC as LiveKit Agent STT/LLM/TTS plugins
- Browser / WASM QVAC on `apps/web`
- Free-form on-device chat that bypasses Conversation history
- Silent auto-activation of Rules, Q&A, or Memory
- Treating OCR / local index updates as **Memory**
- Authoritative Summary/Task creation that skips the server worker (device may
  only **suggest** drafts for review)
- Calling the local LLM “Voxi’s brain”

## Maturity for backlog

```text
NEAR-TERM     — GHO-208: OCR → embed → local SQLite/vector → Knowledge sync sketch
LATER         — smart library UX, doc chips, authoring drafts, related Knowledge
SPECULATIVE   — transcript highlight reel, Task candidates, merge suggestions
```

Promote LATER/SPECULATIVE items individually (Linear + product) after the
Near-term loop is solid.

## Considered options (rejected)

- **QVAC inside LiveKit Agents** for voice — wrong placement for this product
  split; telephony stays ADR-0002 cloud providers unless separately revisited.
- **Full on-device Expo voice loop** — dual conversation brains; mobile QVAC
  audio path undocumented.
- **Autonomous “self-learning” Memory** — undefined in domain; conflicts with
  Subscriber-owned Rules/Q&A and draft→confirm.
- **Dual placement router** (phone vs agent inference per session) — unnecessary
  once conversation is LiveKit-only.

## Consequences

- `apps/mobile` may ship LiveKit (conversation client) and trimmed QVAC
  (intelligence layer) as separate native stacks.
- In-app Voice = LiveKit client + Agents; no QVAC on that path.
- All layer outputs that change product behaviour are **drafts** until the
  Subscriber confirms; Supabase remains SoT after sync.
- Spike (GHO-208): Expo QVAC OCR + embed + local SQLite/vector + sync sketch —
  not agent plugin swap.
- Model license terms for QVAC weights need legal review before shipping.
