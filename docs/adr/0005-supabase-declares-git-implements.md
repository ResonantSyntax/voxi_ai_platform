# Supabase declares what the runtime contains; git implements how it works

Voxi's runtime is assembled from declarative configuration in Supabase — base
instructions, skills, their instructions, tool references, capability
requirements, tier gating, model aliases. Executable code for those references
lives in git and never in the database.

## Why

Prompt wording, skill enablement and model choice change often enough that
requiring a redeploy for each is real operational friction. Tool
implementations do not — they change when an engineer changes them, and they
benefit from review, diff, type checking and CI.

The rule: **put configuration in the database when changing it without a
redeployment provides real operational value.** Not because it could
theoretically change one day.

## The seam

Supabase names things. Git provides them, through two registries:

- `TOOL_REGISTRY` maps a stable dotted identifier (`qa.search`,
  `google.calendar.list`) to an implementation.
- `CAPABILITY_REGISTRY` maps a requirement name (`google_calendar_connected`)
  to a predicate evaluated per Subscriber.

Both follow the same shape deliberately: the database says *what is required*,
git says *how it is satisfied*. One concept to learn, not two.

## Consequences

- **A dotted tool name is identity, never dispatch.** The resolver must not
  infer a transport from the prefix — no `if name.startswith("google.")`. The
  registry decides explicitly, so an implementation can move from a Python
  function to MCP to an HTTP service without touching any skill definition.
- **Unresolvable references are a publish-time failure**, never a runtime one.
  See ADR-0006.
- **Skill slugs deliberately avoid product vocabulary.** `qa-lookup`, not
  `Q&A`; `task-capture`, not `Tasks`. Q&A and Task are Subscriber-facing
  concepts defined in CONTEXT.md, and a slug that shadows one makes every
  later sentence ambiguous. Skill, Runtime and CompiledRuntime are internal
  vocabulary and are deliberately absent from CONTEXT.md.
- STT and TTS are **not** database-driven. They have had one value each since
  inception; a configuration path for a knob nobody turns is cost without
  benefit. The runtime model can absorb them later without redesign.
