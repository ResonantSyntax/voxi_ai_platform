import json
import logging
import os
import textwrap
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    ChatContext,
    JobContext,
    RunContext,
    cli,
    function_tool,
    room_io,
)
from livekit.agents.beta.workflows import (
    GetEmailTask,
    GetNameTask,
    GetPhoneNumberTask,
    TaskCompletedEvent,
    TaskGroup,
)
from livekit.plugins import ai_coustics, phonic

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# .resolve() is required, not cosmetic: when run as `python src/agent.py`
# (rather than imported as a module), __file__ can be the relative string
# "src/agent.py", which would otherwise make these paths follow whatever cwd the
# process happens to have rather than always anchoring to this file's location.
_ROOT = Path(__file__).resolve().parent
KNOWLEDGE_PATH = _ROOT / "data" / "my_doctor.json"
LEADS_PATH = _ROOT.parent / "leads.jsonl"


def load_knowledge() -> dict:
    return json.loads(KNOWLEDGE_PATH.read_text())


def append_lead(lead: dict) -> None:
    LEADS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LEADS_PATH.open("a") as f:
        f.write(json.dumps(lead) + "\n")
    logger.info("Lead written to %s", LEADS_PATH)


@dataclass
class Userdata:
    member_type: Literal["new", "existing"] | None = None
    knowledge: dict = field(default_factory=load_knowledge)


def build_llm() -> phonic.realtime.RealtimeModel:
    """The Phonic realtime model, shared at the session level so it persists across
    the handoff to ContactCollectionAgent (a realtime model's provider session can't
    move to a different model once an agent is active — see agents-handoffs docs)."""
    knowledge = load_knowledge()
    plan = knowledge["plan"]
    return phonic.realtime.RealtimeModel(
        voice=os.environ.get("PHONIC_VOICE", "karin"),
        audio_speed=float(os.environ.get("PHONIC_AUDIO_SPEED", "1.2")),
        default_language="en",
        intelligence_level="standard",
        min_words_to_interrupt=2,
        enable_assistant_backchannel=True,
        welcome_message=(
            f"Hi there! I'm calling on behalf of {plan['provider'].split(',')[0]} "
            f"about the {plan['name']} — do you have a quick minute?"
        ),
    )


class SalesAgent(Agent):
    def __init__(self) -> None:
        knowledge = load_knowledge()
        plan = knowledge["plan"]
        super().__init__(
            instructions=textwrap.dedent(
                f"""\
                You are a warm, confident, persuasive sales representative for
                {plan["name"]} ({plan["price"]}), a telephonic medical-advisory plan
                from {plan["provider"]}. Your job is to sell the plan — make the
                caller feel what having it means for them, not just recite what it
                includes.

                # Output rules

                You are interacting with the caller via voice:

                - Respond in plain text only. Never use JSON, markdown, lists, tables, code, emojis, or other complex formatting.
                - Keep replies brief: one to three sentences. Ask one question at a time.
                - Spell out numbers, phone numbers, or email addresses.
                - Avoid acronyms and words with unclear pronunciation.

                # Call flow

                1. Pitch: after your opening greeting, sell the plan — don't just list
                   what it includes, translate each point into what it means for the
                   caller. Lead with the outcome, then the feature. For example, say
                   "You'll never be left guessing what to do in a medical emergency —
                   a qualified nurse is on the phone for you, day or night, in your own
                   language" rather than "You get 24/7 telephonic advisory in 11
                   languages." Cover 3-4 of the strongest points this way: the always-on
                   nurse line, the land and air emergency evacuation, and
                   over-the-counter medication support. Close the pitch by framing the
                   price as a bargain for that peace of mind — R122 a month. Keep
                   sentences short for voice, but this is a pitch, not a disclaimer —
                   sound like you believe it's worth having.
                2. Right after the pitch, before answering detailed questions, ask whether
                   the caller already has other Medicall Healthcare cover. Call
                   `record_member_type` with their answer ("new" if they have no existing
                   Medicall Healthcare cover, "existing" if they do). This matters because
                   the Virtual Doctor and Network GP benefits are fully inclusive only for
                   existing members; new members pay those two out of pocket.
                3. Q&A: answer questions about pricing, benefits, eligibility, or access
                   using the `lookup_product_info` tool — call it before answering any
                   factual question about the plan so you don't guess. Don't just read
                   the tool's data back verbatim — keep selling: tie each answer back to
                   why it matters for the caller. Tailor benefit answers to the caller's
                   member type once you know it.
                4. Before the call ends — regardless of how interested the caller sounds —
                   call `collect_contact_info` once to capture their name, phone number,
                   and email. Do this near the natural end of the conversation, not before
                   the pitch and Q&A are done. If they decline, don't call it again or
                   push further.

                Never mention tool names, JSON, or internal reasoning to the caller.
                For anything outside the plan's stated benefits, pricing, or eligibility,
                say you're not sure and offer the general queries line instead of guessing.
                """
            ),
        )

    @function_tool()
    async def lookup_product_info(self, context: RunContext) -> str:
        """Look up MY DOCTOR plan details: benefits, pricing, eligibility, FAQs, and
        contact info. Call this before answering any factual question about the plan.
        """
        return json.dumps(context.session.userdata.knowledge)

    @function_tool()
    async def record_member_type(
        self, context: RunContext, member_type: Literal["new", "existing"]
    ) -> str:
        """Record whether the caller is a new or existing Medicall Healthcare member.

        Args:
            member_type: "new" if the caller has no existing Medicall Healthcare cover,
                "existing" if they're already a Medicall Healthcare member.
        """
        context.session.userdata.member_type = member_type
        return f"Recorded caller as a {member_type} member."

    @function_tool()
    async def collect_contact_info(self, context: RunContext) -> Agent:
        """Wrap up the call by collecting the caller's name, phone number, and email
        address for follow-up. Call this once, near the end of the call. If the
        caller already declined earlier, don't call this again.
        """
        return ContactCollectionAgent(
            chat_ctx=self.chat_ctx.copy(exclude_instructions=True)
        )


class ContactCollectionAgent(Agent):
    """Handoff target for the end-of-call lead capture. A TaskGroup can only be
    awaited from on_enter/on_exit or a tool body, and Phonic's realtime model can't
    resume a function call after a task runs inside one — so this runs from on_enter
    of a dedicated agent instead of directly inside SalesAgent.collect_contact_info.
    """

    def __init__(self, chat_ctx: ChatContext) -> None:
        super().__init__(
            instructions="You are wrapping up a sales call by collecting the caller's contact details.",
            chat_ctx=chat_ctx,
        )

    async def on_enter(self) -> None:
        # Collected via on_task_completed (not just the final task_results) so a
        # dropped call mid-collection — the caller hangs up, or here in testing the
        # console session ends — still saves whatever fields were captured, instead
        # of losing a name/phone the caller already gave because the last field
        # never finished.
        collected: dict = {}

        async def _record_completed(event: TaskCompletedEvent) -> None:
            collected[event.task_id] = event.result

        chat_ctx = self.chat_ctx.copy(exclude_instructions=True)
        task_group = TaskGroup(chat_ctx=chat_ctx, on_task_completed=_record_completed)
        task_group.add(
            lambda: GetNameTask(
                first_name=True,
                last_name=True,
                chat_ctx=chat_ctx,
                extra_instructions=(
                    "If the caller is reluctant, ask once more. If they still decline, "
                    "acknowledge politely and move on without their name."
                ),
            ),
            id="get_name",
            description="Collects the caller's first and last name",
        )
        task_group.add(
            lambda: GetPhoneNumberTask(
                chat_ctx=chat_ctx,
                extra_instructions=(
                    "If the caller is reluctant, ask once more. If they still decline, "
                    "acknowledge politely and move on without their number."
                ),
            ),
            id="get_phone",
            description="Collects the caller's phone number",
        )
        task_group.add(
            lambda: GetEmailTask(
                chat_ctx=chat_ctx,
                extra_instructions=(
                    "If the caller is reluctant, ask once more before falling back to "
                    "decline_email_capture."
                ),
            ),
            id="get_email",
            description="Collects the caller's email address",
        )

        interrupted = False
        try:
            await task_group
        except Exception:
            logger.warning(
                "collect_contact_info: call ended before data collection finished; "
                "saving whatever was captured (%s)",
                list(collected),
            )
            interrupted = True

        name_result = collected.get("get_name")
        phone_result = collected.get("get_phone")
        email_result = collected.get("get_email")

        lead = {
            "collected_at": datetime.now(UTC).isoformat(),
            "name": (
                f"{name_result.first_name or ''} {name_result.last_name or ''}".strip()
                if name_result
                else None
            ),
            "phone_number": getattr(phone_result, "phone_number", None),
            "email_address": getattr(email_result, "email_address", None),
            "member_type": self.session.userdata.member_type,
        }
        if any([lead["name"], lead["phone_number"], lead["email_address"]]):
            append_lead(lead)

        if interrupted:
            # The session that would carry a goodbye is itself what ended — nothing
            # left to say it to.
            return

        await self.session.generate_reply(
            instructions=(
                "Thank the caller warmly for their time and say a brief goodbye. "
                "If any contact details were collected, mention someone will follow "
                "up soon; if not, just thank them for their time either way. Don't "
                "offer to keep helping — this is the end of the call."
            )
        )
        # ponytail: the call ends when the caller hangs up, same as a real phone
        # call — not by this code force-ending the room. generate_reply() only
        # fires one turn and doesn't wait for it to finish playing or for any
        # follow-up exchange, so calling delete_room() right after it raced the
        # goodbye and cut it off mid-flight. Revisit with a proper "wait for full
        # playout + a real close signal" if outbound telephony needs an explicit
        # hangup later.


server = AgentServer()


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Phonic (a speech-to-speech realtime model) is set at the session level so it
    # persists across the handoff to ContactCollectionAgent — no separate STT/TTS/
    # turn-detection config is needed, Phonic handles audio directly. Same
    # conversation logic regardless of transport (console, web, inbound, or
    # outbound telephony) — this entrypoint doesn't distinguish.
    session = AgentSession(userdata=Userdata(), llm=build_llm())

    await session.start(
        agent=SalesAgent(),
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=ai_coustics.audio_enhancement(
                    model=ai_coustics.EnhancerModel.QUAIL_VF_S
                ),
            ),
        ),
    )

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
