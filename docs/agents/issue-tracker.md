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

## PRs as a request surface

**Off.** Open pull requests are not part of the triage queue. Flip this section to "on" if you want
`triage` to treat external PRs as incoming requests alongside Linear issues.
