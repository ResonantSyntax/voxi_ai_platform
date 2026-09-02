# Product-language issues raised during database design — all resolved

> Raised from the database worktree, resolved by the UI/product worktree in
> commit `4f0ce5d` *"Make Conversation the parent concept and record product
> truth"* on `feature/web_ui_build`. Kept as a record of what was found and how
> it landed. `CONTEXT.md` was never edited from this worktree.

| Raised | Status |
| --- | --- |
| **Call: "the unit everything else hangs off"** — false once a channel-neutral root exists, and false in product terms the moment Chat, SMS, Email or WhatsApp ship. | **Resolved.** `Conversation` is now the parent concept; Call is *"A Conversation over telephony / SIP / PSTN. Every Call is a Conversation. Not every Conversation is a Call."* |
| **Transcript described as Voxi's "long-term memory"** — contradicted `Memory` ("what Voxi chose to keep") and `Call History` ("history is everything, Memory is the deliberate subset"). | **Resolved.** Transcript is now *"the ordered textual record of a Conversation"*, and Call History became Conversation History. |
| **No words for non-Call communication** — Summary, Transcript and Task all derived "from a Call", and Caller was defined as anyone who reached Voxi. | **Resolved.** All three now derive from a Conversation, and Caller is explicitly telephony-only: *"Do not use Caller for an in-app text or voice participant."* |

## Consequence for the database worktree

`Exchange` was invented here to name a concept the product did not yet have.
The product now has it, and it is called **Conversation**. `Exchange` is retired
— see [database.md](./database.md). Keeping both would have bought permanent
translation debt between UI, API and schema for no architectural benefit.

## Coordination hazard worth naming

Both worktrees can edit `CONTEXT.md`. This one deliberately does not, but the
version on `main` was two commits stale while the database design was reasoning
against it. **Read `CONTEXT.md` from the branch that owns it, not from the
worktree you happen to be in.**
