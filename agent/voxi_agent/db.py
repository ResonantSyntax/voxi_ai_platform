"""Database access for the Voxi agent.

This connects as `postgres` through the session-mode pooler, which **bypasses
RLS entirely**. There is no safety net here: if the wrong account_id is written,
one Subscriber's Call appears in another's dashboard and nothing stops it.
So account_id is resolved once, from the Voxi Number that was dialled, and
passed explicitly into every write.

asyncpg, not psycopg2 — the agent runs on asyncio and a blocking driver stalls
the event loop, which is audible to the Caller mid-sentence.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Iterable, Literal
from uuid import UUID

import asyncpg

Arrival = Literal["direct", "forwarded"]
Outcome = Literal["in_progress", "handled", "voicemail", "abandoned", "failed"]
Urgency = Literal["normal", "high"]


@dataclass(frozen=True)
class CallContext:
    """Everything the agent needs to know at the moment it picks up."""

    account_id: UUID
    voxi_number_id: UUID
    subscriber_name: str | None


async def create_pool(dsn: str | None = None, **kw: Any) -> asyncpg.Pool:
    dsn = dsn or os.environ["DATABASE_URL"]
    # Small pool: one long-lived worker, session-mode connections are held for
    # their lifetime. Raise only if concurrent call volume demands it.
    return await asyncpg.create_pool(dsn, min_size=2, max_size=10, **kw)


async def context_for_number(pool: asyncpg.Pool, dialled_e164: str) -> CallContext | None:
    """Resolve the Subscriber from the Voxi Number that was dialled.

    This is the whole lookup (ADR-0001) — `sip.trunkPhoneNumber` tells us which
    number rang, and one DID belongs to one account.
    """
    row = await pool.fetchrow(
        """
        select n.account_id, n.id as voxi_number_id, s.display_name
        from voxi.voxi_numbers n
        left join voxi.subscribers s on s.account_id = n.account_id
        where n.e164 = $1 and n.status = 'active'
        """,
        dialled_e164,
    )
    if row is None:
        return None
    return CallContext(
        account_id=row["account_id"],
        voxi_number_id=row["voxi_number_id"],
        subscriber_name=row["display_name"],
    )


async def start_call(
    pool: asyncpg.Pool,
    ctx: CallContext,
    *,
    caller_e164: str | None,
    arrival: Arrival,
    sip_call_id: str | None = None,
    livekit_room: str | None = None,
) -> UUID:
    """Open the Call row when the agent picks up."""
    return await pool.fetchval(
        """
        insert into voxi.calls
          (account_id, voxi_number_id, caller_e164, arrival, sip_call_id, livekit_room)
        values ($1, $2, $3, $4, $5, $6)
        returning id
        """,
        ctx.account_id, ctx.voxi_number_id, caller_e164, arrival, sip_call_id, livekit_room,
    )


async def finish_call(
    pool: asyncpg.Pool,
    call_id: UUID,
    account_id: UUID,
    *,
    outcome: Outcome,
    summary: str | None = None,
    caller_name: str | None = None,
    urgency: Urgency = "normal",
    turns: Iterable[dict[str, Any]] = (),
    tasks: Iterable[dict[str, Any]] = (),
) -> None:
    """Close out a Call: outcome, Summary, Transcript and Tasks in ONE transaction.

    All four or none. A half-written Call is worse than a missing one — the
    Transcript is Voxi's long-term memory, and a Summary without its Transcript
    is a memory that cannot be checked.

    Audio is never stored; only the turns.
    """
    async with pool.acquire() as conn:
        async with conn.transaction():
            await conn.execute(
                """
                update voxi.calls
                   set outcome = $2, summary = $3, caller_name = coalesce($4, caller_name),
                       urgency = $5, ended_at = now()
                 where id = $1 and account_id = $6
                """,
                call_id, outcome, summary, caller_name, urgency, account_id,
            )
            await conn.execute(
                """
                insert into voxi.transcripts (call_id, account_id, turns)
                values ($1, $2, $3::jsonb)
                on conflict (call_id) do update set turns = excluded.turns
                """,
                call_id, account_id, json.dumps(list(turns)),
            )
            rows = [
                (account_id, call_id, t["title"], t.get("detail"), t.get("due_at"))
                for t in tasks
            ]
            if rows:
                await conn.executemany(
                    """
                    insert into voxi.tasks (account_id, call_id, title, detail, due_at)
                    values ($1, $2, $3, $4, $5)
                    """,
                    rows,
                )
