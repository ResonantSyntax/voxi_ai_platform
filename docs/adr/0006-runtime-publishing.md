# Runtime configuration is published as an immutable artifact

Editing configuration in Supabase does not change what runs. Publishing
resolves the whole draft, validates it, materialises a single self-contained
artifact, hashes it, and activates it. Published artifacts are immutable, and
exactly one is active at a time.

## Why

Two requirements pull against each other: changing a prompt without a deploy,
and never letting invalid configuration reach a live Caller. A publish step is
the only place both are true — editing stays free, and validation gates
activation.

It also fixes a defect in the obvious design. If a published runtime version
recorded only base instructions and model aliases while skills stayed in a
mutable table, editing a skill afterwards would silently change what that
"immutable" version does. `runtime_version` and `runtime_hash` would then
describe something that never ran, and rollback would restore a version whose
behaviour had drifted.

## What publishing does

Resolve every skill reference, every tool identifier against `TOOL_REGISTRY`,
every capability name against `CAPABILITY_REGISTRY`, and every model alias.
Compile instructions. Precompute which skills each tier is eligible for.
Canonicalise the result and hash it. Activate.

## Consequences

- **The artifact is the execution contract; the editable tables are only the
  authoring model.** Bootstrap reads one published artifact and never joins a
  mutable skill table.
- **Rollback is real.** Activating an earlier version restores exactly the
  configuration that ran, independent of what the authoring tables now hold.
- **Validation is layered by proximity to a live Caller.** CI proves the code
  supports the contract. Publish proves this configuration is valid — it is
  the authority, because CI cannot see a database edit made after deploy.
  Session bootstrap is the last defensive layer and **degrades** rather than
  failing: it drops the unavailable skill, answers the Call, and emits a
  structured error carrying call_id, account_id, runtime_version,
  runtime_hash, skill_slug and the missing reference. A Caller with reduced
  capability beats a Caller hearing silence. Degradation must never become
  quiet routine.
- **The artifact is shared configuration only.** Subscriber-specific
  availability cannot be precompiled — one Pro Subscriber has Google
  connected and another does not — so a small final composition step at
  bootstrap applies entitlement, subscriber context and capability checks.
- **One active release globally**, carrying per-tier variants inside it.
  Per-tier active versions are explicitly rejected: they make "which runtime
  is live" a question with three answers. Canary rollout is deferred, not
  precluded — Calls already record the version and hash, so adding a split
  later needs no change to historical records.
