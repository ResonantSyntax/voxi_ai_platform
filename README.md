# Voxi

Voxi is an AI assistant that handles Conversations on a Subscriber's behalf and
turns each one into a Summary and Tasks. A Conversation reaches Voxi as a phone
Call, In-app Voice, or Text Chat; telephony is the channel that ships first.

Every Subscriber gets a Voxi Number. Calls arrive on it either because the
Subscriber forwarded their phone or because someone dialled the Voxi Number
directly.

Read [CONTEXT.md](./CONTEXT.md) before writing code — it is the glossary, and
the words in it are load-bearing. **Conversation is the parent concept; a Call
is a telephony Conversation.** Summary, Transcript, Tasks and Conversation
History belong to the Conversation, not the Call. The decisions behind the
architecture are in [docs/adr/](./docs/adr); product truth is in
[PRODUCT.md](./PRODUCT.md).

The schema, [docs/architecture/runtime.md](./docs/architecture/runtime.md) and
ADR-0004/0006 predate this and are still written Call-first. Where they
disagree with `CONTEXT.md` on the domain model, `CONTEXT.md` is the intent and
the older text is unmigrated.

## Layout

```
apps/web        Next.js dashboard — the first production surface
apps/mobile     Expo client
packages/theme  tokens.json is the design system; emits Tailwind v4 CSS + a
                NativeWind preset so web and native share tokens, not components
packages/types  generated Supabase types
agent/          Python LiveKit agent — the voice loop
supabase/       schema, RLS, and the isolation test
```

## Stack

| | |
|---|---|
| Data + auth | Supabase, `voxi` schema, browser queries Postgres directly under RLS |
| Voice | LiveKit Cloud agent — Deepgram Nova-3 → Claude Haiku 4.5 → Cartesia, each swappable by config |
| Telephony | Twilio trunk, one DID per Subscriber |
| Billing | Paystack on web; RevenueCat when mobile ships. `voxi.subscriptions` is the source of truth either way |
| Web UI | shadcn/ui | 
| Native UI | gluestack-ui (NativeWind) |

## Working on the database

```bash
supabase start
pnpm db:reset      # apply migrations
pnpm db:test       # assert RLS isolates accounts — must pass before shipping schema changes
pnpm db:types      # regenerate packages/types/database.ts
```

## Working on the agent

```bash
cd agent && pip install -e '.[dev]'
cp .env.example .env          # DATABASE_URL uses the session-mode pooler (5432)
python -m voxi_agent.selfcheck  # asserts a Call's writes land and roll back together
```

`DATABASE_URL` connects as `postgres` and **bypasses RLS**. It never goes near
`apps/web` or `apps/mobile` — those use the publishable key, where RLS is the
guard. asyncpg, not psycopg2: a blocking driver stalls the agent's event loop
and the Caller hears it.

## Design

Dark only. **Mint (`#0aef9a`) means Voxi is doing or saying something** — never
use it for generic emphasis, it stops meaning anything. Lime means finished.
Edit `packages/theme/tokens.json` and run `pnpm theme`; never edit `theme.css`.
