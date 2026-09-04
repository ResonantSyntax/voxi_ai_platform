# Agent operating guide — voxi_ai_platform

Where truth lives, and which specialist tool to reach for. Read this before
changing anything.

## Source-of-truth hierarchy

| Source | Owns |
| --- | --- |
| `CONTEXT.md` | Canonical Voxi terminology and domain vocabulary |
| `PRODUCT.md` | Durable product context for `apps/web` |
| `docs/adr/` | Accepted architecture decisions |
| `docs/architecture/` | Architecture working documents — **check maturity/status before relying on one** |
| `packages/theme/tokens.json` | Canonical shared design tokens |
| `DESIGN.md` | Approved visual/interaction design system, when it exists |
| `docs/design/` | Shape proposals and surface maps — **check the maturity chips before relying on one** |

Old mockups are **visual references only**. They never override current product
decisions or architecture.

`docs/design/conversations-shape.html` is the source of the published Voxi
Product Surface Map. Edit the file in the repo and republish it to the existing
artifact URL — never publish a copy from elsewhere, which forks the map.

## The contradiction rule

**Do not silently reconcile conflicting sources.** When two sources disagree:

1. Identify the contradiction.
2. Determine which decision domain owns it.
3. Surface it explicitly.
4. Amend or supersede the appropriate canonical source deliberately.

Existing implementation does **not** automatically outrank approved domain
terminology. A Call-rooted table is not an argument that `Call` is the domain
parent.

## Planning versus implementation

Do not treat diagrams, Claude Artifacts, mockups, Graphify edges, or
provisional planning as approved implementation decisions.

Respect maturity states and never silently promote one to the next:

```text
DECIDED
PROVISIONAL
OPEN QUESTION
DEFERRED / FUTURE
```

## Impeccable — `apps/web` UI/UX

Impeccable is the specialist for web UI/UX work. Recommended lifecycle:

```text
product decision → UX planning → /impeccable shape → implementation
  → /impeccable critique → /impeccable adapt → /impeccable harden
  → /impeccable audit → /impeccable polish
```

**Boundary.** Impeccable does not own Voxi product scope or terminology, and
must not invent missing product requirements simply to complete a design.
`PRODUCT.md` is product context *supplied to* Impeccable — not an independent,
competing source of product truth.

## Graphify — repository analysis

A repository-analysis aid, **not** a source of product truth.

```bash
/graphify query "question"          # broad cross-repo architecture/relationship questions
/graphify path "Source" "Target"    # trace how two known concepts/components connect
/graphify explain "ComponentName"   # understand an unfamiliar or highly connected component
/graphify . --update                # only when the graph is materially stale
```

Do not rebuild or recluster the graph when a normal query is sufficient.

Read its edge confidence honestly:

| Label | Treat as |
| --- | --- |
| `EXTRACTED` | Strong evidence |
| `INFERRED` | An investigation prompt |
| `AMBIGUOUS` | A lead requiring verification |

Important conclusions must still be checked against code and canonical docs.

## Linear — issue tracker

| | |
| --- | --- |
| Team | `Ghost_ai` |
| Project | `Voxi Application` |

Reached through the `mcp__claude_ai_Linear__*` MCP tools — never `gh issue`.
Full tool mapping and wayfinding operations: `docs/agents/issue-tracker.md`.

Use Linear for scoped implementation work, bugs, documentation drift,
architecture alignment work, and follow-up decisions.

**Triage labels: apply the existing labels, never create replacements.** All
five already exist in the `Ghost_ai` team. See `docs/agents/triage-labels.md`.

## Domain docs

Single-context repo: one `CONTEXT.md` and one `docs/adr/` at the root. There is
no `CONTEXT-MAP.md`. See `docs/agents/domain.md`.

## Learned User Preferences

- Keep conversational voice and chat on LiveKit across platforms; do not use on-device QVAC for the voice/chat loop
- Scope on-device QVAC to OCR, Knowledge ingest, local SQLite/vector, and related background AI jobs; keep any on-device LLM job-shaped (ingest/classify/tag), not a second chat UI

## Learned Workspace Facts

- `apps/mobile` is Expo + React Native; `apps/web` is Next.js; neither is a production voice client today
- Telephony voice is cloud LiveKit Agents (Deepgram → Claude → Cartesia per ADR-0002); LiveKit Agents run on the agent host and cannot execute QVAC models on the subscriber phone
- QVAC (`tetherto/qvac` / `@qvac/sdk`) fits Expo for on-device OCR, embeddings, and local RAG; its voice-assistant docs are desktop-only; no browser/WASM host
- Knowledge stays backend source of truth with a synced on-device index direction; device OCR/captures feed Knowledge, not Memory
