import json
import logging
import os
import re
import textwrap
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Literal

import aiohttp
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    RunContext,
    cli,
    function_tool,
    room_io,
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

WA_SEND_URL = (
    os.environ.get("WA_BASE_URL", "https://whatsapp.evra-ai.com").rstrip("/") + "/send"
)
WA_FROM_NUMBER = os.environ.get("WA_PHONE_NUMBER_ID", "1162633403610703")
WA_TEMPLATE = os.environ.get("WA_TEMPLATE", "roxy_avatar_tile_v1")
WA_MEDIA_ID = os.environ.get("WA_MEDIA_ID", "1328758235800235")
WA_DEFAULT_COUNTRY_CODE = "27"  # South Africa


def normalize_phone_for_whatsapp(
    phone: str, country_code: str = WA_DEFAULT_COUNTRY_CODE
) -> str:
    """WhatsApp wants digits only, country code, no leading 0 or +
    (e.g. "0662117829" -> "27662117829"). GetPhoneNumberTask's output isn't
    guaranteed to already be in that shape."""
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("0"):
        digits = country_code + digits[1:]
    elif not digits.startswith(country_code):
        digits = country_code + digits
    return digits


async def send_whatsapp_template(to_phone: str) -> None:
    token = os.environ.get("WA_WEBHOOK_TOKEN")
    if not token:
        raise RuntimeError("WA_WEBHOOK_TOKEN is not set")

    async with (
        aiohttp.ClientSession() as session,
        session.post(
            WA_SEND_URL,
            headers={"Authorization": f"Bearer {token}"},
            json={
                "from": WA_FROM_NUMBER,
                "to": normalize_phone_for_whatsapp(to_phone),
                "message": {
                    "type": "template",
                    "template": WA_TEMPLATE,
                    "language": "en",
                    "media_id": WA_MEDIA_ID,
                    "media_type": "image",
                },
            },
        ) as resp,
    ):
        resp.raise_for_status()


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
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    email_address: str | None = None
    knowledge: dict = field(default_factory=load_knowledge)


def save_lead_snapshot(userdata: Userdata) -> None:
    """Append the current state of the lead. Called after each field is recorded
    (not just once at the end) so a call dropped mid-collection still leaves
    whatever was captured on disk — the last line per call has the fullest data."""
    name = f"{userdata.first_name or ''} {userdata.last_name or ''}".strip()
    lead = {
        "collected_at": datetime.now(UTC).isoformat(),
        "name": name or None,
        "phone_number": userdata.phone_number,
        "email_address": userdata.email_address,
        "member_type": userdata.member_type,
    }
    append_lead(lead)


def build_llm() -> phonic.realtime.RealtimeModel:
    """The Phonic realtime model, set at the session level. Phonic doesn't support
    updating tool definitions mid-session ("update_tools called after config was
    already sent"), so there's deliberately only ever one Agent (SalesAgent) with
    one fixed tool set for the whole call — no handoffs, no Tasks/TaskGroups, whose
    value relies on swapping in a different tool set per step."""
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

                # Delivery

                You have no markup or emotion tags — energy comes only from how you
                phrase things, so watch for these flattening patterns:

                - Don't string together several same-length, same-structure sentences
                  in a row — that's what reads as a monotone recitation. Mix a short
                  punchy sentence with a longer one.
                - When covering multiple points (the pitch, or a longer answer), don't
                  dump them as one unbroken paragraph. Land one point, then pivot with
                  a natural beat — "And here's the one people love —", "Honestly, the
                  big one for most people is —" — before the next, rather than reciting
                  a flat list.
                - Vary your openers. Don't start every reply the same way (e.g. always
                  "So," or always "Great question").
                - Sound like you mean it, especially on the strongest points — a little
                  genuine enthusiasm goes further than more words.

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
                   price as a bargain for that peace of mind — R122 a month. Follow the
                   Delivery guidance above closely here — this is the part most likely
                   to sound like a flat recitation if you're not deliberate about
                   varying pace and rhythm between points.
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
                   collect their name, phone number, and email, one at a time, near the
                   natural end of the conversation (not before the pitch and Q&A are
                   done):
                   - Ask for their first and last name. Read it back to confirm, then
                     call `record_name`.
                   - Ask for the best phone number to reach them. Read the digits back
                     grouped (not as one long number) to confirm, then call
                     `record_phone`.
                   - Ask for their email address. Read it back to confirm — spell out
                     unclear parts if needed — then call `record_email`.
                   For each field: if the caller is reluctant, ask once more; if they
                   still decline, acknowledge politely and move on to the next field
                   without that one. Don't loop back or re-ask a field once you've
                   moved past it.
                5. Once you have a phone number (whether or not you got the name or
                   email), ask if they'd like more info about the plan sent to them on
                   WhatsApp. If they say yes, call `send_whatsapp_info`. If they say no,
                   don't ask again. Either way, say a brief goodbye — don't offer to
                   keep helping beyond this, this is the end of the call.

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
    async def record_name(
        self, context: RunContext, first_name: str, last_name: str
    ) -> str:
        """Record the caller's first and last name, once confirmed."""
        context.session.userdata.first_name = first_name
        context.session.userdata.last_name = last_name
        save_lead_snapshot(context.session.userdata)
        return "Name recorded."

    @function_tool()
    async def record_phone(self, context: RunContext, phone_number: str) -> str:
        """Record the caller's phone number, once confirmed."""
        context.session.userdata.phone_number = phone_number
        save_lead_snapshot(context.session.userdata)
        return "Phone number recorded."

    @function_tool()
    async def record_email(self, context: RunContext, email_address: str) -> str:
        """Record the caller's email address, once confirmed."""
        context.session.userdata.email_address = email_address
        save_lead_snapshot(context.session.userdata)
        return "Email address recorded."

    @function_tool()
    async def send_whatsapp_info(self, context: RunContext) -> str:
        """Send the caller a WhatsApp message with more info about the plan. Only
        call this if the caller has explicitly agreed to receive it, and only after
        their phone number has been recorded.
        """
        phone = context.session.userdata.phone_number
        if not phone:
            return "No phone number on file yet — can't send WhatsApp info."
        try:
            await send_whatsapp_template(phone)
        except Exception:
            logger.exception("send_whatsapp_info: failed to send WhatsApp template")
            return "The WhatsApp message failed to send."
        return "WhatsApp message sent."


server = AgentServer()


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Phonic (a speech-to-speech realtime model) is set at the session level — no
    # separate STT/TTS/turn-detection config is needed, Phonic handles audio
    # directly. Same conversation logic regardless of transport (console, web,
    # inbound, or outbound telephony) — this entrypoint doesn't distinguish.
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
