"""Runnable check for db.py:  python -m voxi_agent.selfcheck

Asserts the one thing that is easy to get wrong and expensive to get wrong:
finish_call writes the Call, Transcript and Tasks together, and rolls all three
back if any of them fails. Creates a throwaway account and deletes it after.

Needs DATABASE_URL. Safe to run against the real project — it cleans up.
"""

from __future__ import annotations

import asyncio
from uuid import uuid4

from dotenv import load_dotenv

from .db import CallContext, create_pool, context_for_number, finish_call, start_call


async def main() -> None:
    load_dotenv()
    pool = await create_pool()
    e164 = f"+27870{uuid4().int % 1_000_000:06d}"
    account_id = None
    try:
        account_id = await pool.fetchval(
            "insert into voxi.accounts default values returning id"
        )
        await pool.execute(
            "insert into voxi.voxi_numbers (account_id, e164, status) values ($1, $2, 'active')",
            account_id, e164,
        )

        ctx = await context_for_number(pool, e164)
        assert ctx is not None, "context_for_number found no Subscriber for an active number"
        assert ctx.account_id == account_id

        call_id = await start_call(
            pool, ctx, caller_e164="+27820001111", arrival="direct", sip_call_id=str(uuid4())
        )
        assert await pool.fetchval(
            "select outcome::text from voxi.calls where id = $1", call_id
        ) == "in_progress"

        await finish_call(
            pool, call_id, account_id,
            outcome="handled",
            summary="Caller asked about pricing.",
            caller_name="Sam Okafor",
            urgency="high",
            turns=[{"role": "caller", "text": "What do you charge?"}],
            tasks=[{"title": "Send Sam the price list"}, {"title": "Call Sam back"}],
        )

        row = await pool.fetchrow(
            """
            select c.outcome::text as outcome, c.summary, c.caller_name, c.urgency::text as urgency,
                   c.ended_at is not null as closed,
                   (select count(*) from voxi.transcripts t where t.call_id = c.id) as transcripts,
                   (select count(*) from voxi.tasks k where k.call_id = c.id) as tasks
              from voxi.calls c where c.id = $1
            """,
            call_id,
        )
        assert row["outcome"] == "handled", row["outcome"]
        assert row["closed"], "ended_at was not set"
        assert row["caller_name"] == "Sam Okafor"
        assert row["urgency"] == "high"
        assert row["transcripts"] == 1, f"expected 1 transcript, got {row['transcripts']}"
        assert row["tasks"] == 2, f"expected 2 tasks, got {row['tasks']}"

        # Atomicity: a bad Task must take the Summary and Transcript down with it.
        before = await pool.fetchval("select summary from voxi.calls where id = $1", call_id)
        try:
            await finish_call(
                pool, call_id, account_id,
                outcome="handled",
                summary="THIS MUST NOT PERSIST",
                turns=[{"role": "caller", "text": "x"}],
                tasks=[{"detail": "no title"}],  # title is NOT NULL — blows up mid-transaction
            )
        except Exception:
            pass
        else:
            raise AssertionError("a Task with no title should have failed")

        after = await pool.fetchval("select summary from voxi.calls where id = $1", call_id)
        assert after == before, f"transaction was not atomic: summary is now {after!r}"
        assert await pool.fetchval(
            "select count(*) from voxi.tasks where call_id = $1", call_id
        ) == 2, "partial tasks leaked from the failed transaction"

        print("selfcheck OK — writes land together and roll back together")
    finally:
        if account_id:
            await pool.execute("delete from voxi.accounts where id = $1", account_id)
        await pool.close()


if __name__ == "__main__":
    asyncio.run(main())
