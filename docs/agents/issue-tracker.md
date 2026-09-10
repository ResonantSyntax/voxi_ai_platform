# Issue tracker: Linear (via MCP)

Issues for this repo live in **Linear**, not in GitHub Issues. Agents reach them through the
`mcp__claude_ai_Linear__*` MCP tools. Never use `gh issue` for this repo.

## Scope

| What         | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| Workspace    | the connected `claude.ai Linear` MCP server                |
| Team         | `Ghost_ai` — id `c57b93ed-8484-4c34-842d-ca5676d6013d`     |
| Project      | `Voxi Application` — id `4f26acc4-9888-47c5-b0f7-71ee9cb063d6` |

The `Ghost_ai` team serves several repos. **Project is what scopes an issue to this repo.**
Every issue an agent creates for `voxi_ai_platform` must set the `Voxi Application` project, and
every read must filter by it. An issue with no project is not a `voxi_ai_platform` issue.

## Tools

| Need                        | Tool                                                     |
| --------------------------- | -------------------------------------------------------- |
| List / search issues        | `list_issues` (pass `project: "Voxi Application"`)        |
| Read one issue              | `get_issue`                                               |
| Create **or** update issue  | `save_issue` — omit `id` to create, pass `id` to update   |
| Read conversation           | `list_comments`                                           |
| Add a comment               | `save_comment`                                            |
| Resolve label names → ids   | `list_issue_labels` (`team: "Ghost_ai"`)                  |
| Workflow states             | `list_issue_statuses`                                     |

`save_issue` is one tool for both create and update; the presence of `id` is the only difference.
Don't look for a separate `create_issue`.

## When a skill says "publish to the issue tracker"

Call `save_issue` with no `id`, setting `team`, `project: "Voxi Application"`, `title`,
`description` (markdown — send real newlines, not `\n` escapes), and the triage label from
`triage-labels.md`.

## When a skill says "fetch the relevant ticket"

`get_issue` with the identifier the user gave (e.g. `GHO-123`) or the issue id. If they gave a
description instead, `list_issues` with `query` scoped to the project.

## Triage state is a label, not a workflow state

Linear has its own workflow states (Backlog / In Progress / Done). The five triage roles in
`triage-labels.md` are **labels**, applied and removed independently of the workflow state.
Don't map one onto the other.

## Wayfinding operations

Used by `/wayfinder`. Linear's native parent/child issues carry the structure; the workspace's
existing `wayfinder:*` labels carry the type.

- **Map**: an issue labelled `wayfinder:map`. Notes / Decisions-so-far / Fog live in its description.
- **Child ticket**: a sub-issue created with `parentId` set to the map issue, labelled with one of
  `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling`, `wayfinder:task`.
- **Blocking**: use Linear's issue relations (blocks / blocked-by), not a text line.
- **Frontier**: `list_issues` with `parentId` = the map, filtered to open, unblocked, unassigned;
  lowest identifier wins.
- **Claim**: assign the issue to yourself (`assignee: "me"`) before any work.
- **Resolve**: `save_comment` with the answer, move the issue to a completed state, then append a
  context pointer (gist + issue URL) to the map issue's Decisions-so-far via `save_issue`.

## ADR → Spec → Tickets pipeline

This is the required path from an architecture decision to agent-buildable work. Follow it in
order — never create tickets straight from an ADR, and never invent a spec that isn't backed by
an ADR in `docs/adr/`.

1. **Grill with docs** — produces an ADR in `docs/adr/000X-*.md`. Git only, no Linear issue at
   this stage.
2. **ADR → spec** — create exactly one Linear parent issue per ADR (or one shared parent for a
   tightly coupled pair, e.g. ADR-0005 + ADR-0006). Title it `Spec: ADR-000X — <decision>`, put
   the ADR's decision + consequences in the description, link back to the `docs/adr/` file, and
   label it `wayfinder:map` — the same label the workspace already uses for master specs
   (see Mathuba's GHO-176, EVRA's GHO-7). This is the only correct meaning of "spec" here; Linear
   has no separate Spec object for agents to use.
3. **Spec → tickets** — break the parent down into sub-issues (`parentId` set to the spec issue),
   scoped small enough for one agentic coding session. Use Linear's `blocks`/`blocked-by`
   relations to sequence them, not prose. A spec issue with zero children is not done — it's a
   spec waiting to be broken down, not a stopping point.

A ticket that implements an ADR's consequence but isn't parented under that ADR's spec issue is a
process gap — reparent it, don't just cite the ADR in the description.

## PRs as a request surface

**Off.** Open pull requests are not part of the triage queue. Flip this section to "on" if you want
`triage` to treat external PRs as incoming requests alongside Linear issues.
