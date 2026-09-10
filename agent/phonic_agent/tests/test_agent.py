import json

from agent import (
    KNOWLEDGE_PATH,
    Userdata,
    append_lead,
    load_knowledge,
    normalize_phone_for_whatsapp,
    save_lead_snapshot,
)


def test_load_knowledge_has_expected_shape() -> None:
    knowledge = load_knowledge()

    assert knowledge["plan"]["name"] == "MY DOCTOR – Life Living Plan"  # noqa: RUF001
    assert knowledge["plan"]["price"] == "R122 per month"
    assert set(knowledge["member_types"]) == {"new", "existing"}
    assert len(knowledge["benefits"]) > 0
    for benefit in knowledge["benefits"]:
        assert benefit["inclusive_for"] or benefit.get("own_account_for")


def test_load_knowledge_matches_file_on_disk() -> None:
    assert load_knowledge() == json.loads(KNOWLEDGE_PATH.read_text())


def test_append_lead_writes_one_json_line(tmp_path, monkeypatch) -> None:
    leads_path = tmp_path / "leads.jsonl"
    monkeypatch.setattr("agent.LEADS_PATH", leads_path)

    append_lead({"name": "Jane Doe", "phone_number": "+27821234567"})
    append_lead({"name": "John Smith", "phone_number": "+27827654321"})

    lines = leads_path.read_text().splitlines()
    assert len(lines) == 2
    assert json.loads(lines[0])["name"] == "Jane Doe"
    assert json.loads(lines[1])["name"] == "John Smith"


def test_save_lead_snapshot_reflects_partial_progress(tmp_path, monkeypatch) -> None:
    leads_path = tmp_path / "leads.jsonl"
    monkeypatch.setattr("agent.LEADS_PATH", leads_path)

    userdata = Userdata(knowledge={})
    save_lead_snapshot(userdata)  # nothing collected yet

    userdata.first_name, userdata.last_name = "Jane", "Doe"
    save_lead_snapshot(userdata)  # name only

    userdata.phone_number = "27662117829"
    save_lead_snapshot(userdata)  # name + phone, if the call dropped here we'd keep it

    lines = [json.loads(line) for line in leads_path.read_text().splitlines()]
    assert len(lines) == 3
    assert lines[0]["name"] is None
    assert lines[1]["name"] == "Jane Doe"
    assert lines[1]["phone_number"] is None
    assert lines[2]["phone_number"] == "27662117829"


def test_normalize_phone_for_whatsapp() -> None:
    expected = "27662117829"
    assert normalize_phone_for_whatsapp("0662 117 829") == expected
    assert normalize_phone_for_whatsapp("+27662117829") == expected
    assert normalize_phone_for_whatsapp("27662117829") == expected
    assert normalize_phone_for_whatsapp("066-211-7829") == expected


# Conversational behavior (the pitch, member-type qualification, FAQ answers, and the
# data-collection flow) is covered by the simulations in scenarios.yaml, which run full
# conversations against the agent on LiveKit Cloud (see README.md). The eval below is
# kept as an example of the in-process testing framework
# (https://docs.livekit.io/agents/start/testing/) for turn-level checks that don't need
# a live session. Uncomment it and run `uv run pytest` to use it.
#
# import textwrap
#
# import pytest
# from livekit.agents import AgentSession, inference, llm
#
# from agent import SalesAgent
#
#
# def _judge_llm() -> llm.LLM:
#     return inference.LLM(model="openai/gpt-4.1-mini")
#
#
# @pytest.mark.asyncio
# async def test_offers_assistance() -> None:
#     """Evaluation of the agent's friendly nature."""
#     async with (
#         _judge_llm() as judge_llm,
#         AgentSession() as session,
#     ):
#         await session.start(SalesAgent())
#
#         # Run an agent turn following the user's greeting
#         result = await session.run(user_input="Hello")
#
#         # Evaluate the agent's response for friendliness
#         await (
#             result.expect.next_event()
#             .is_message(role="assistant")
#             .judge(
#                 judge_llm,
#                 intent=textwrap.dedent(
#                     """\
#                     Greets the user in a friendly manner.
#
#                     Optional context that may or may not be included:
#                     - Offer of assistance with any request the user may have
#                     - Other small talk or chit chat is acceptable, so long as it is friendly and not too intrusive
#                     """
#                 ),
#             )
#         )
#
#         # Ensures there are no function calls or other unexpected events
#         result.expect.no_more_events()
