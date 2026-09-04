# Voxi Product Context

## Core Product

Voxi is an AI assistant that handles conversations on behalf of a Subscriber.

Every Subscriber gets a **Voxi Number**.

People can interact with Voxi through:

```text
Phone Call
In-app Voice
Text Chat

```

The shared parent concept is:

```text
Conversation

```

A **Call** is only a telephony Conversation.

Do not use `Call` as the parent term for all Voxi activity.

---

# Core Domain Model

```text
Conversation
├── Phone Call
├── In-app Voice
└── Text Chat

```

Conversation-level features include:

```text
Summary
Transcript
Tasks
Conversation History
Runtime context
Entitlement

```

Telephony-specific information belongs to the Call, not the generic Conversation.

---

# Terminology

## Voxi

The product.

Voxi handles conversations for a Subscriber.

Do not describe Voxi as only a voicemail product.

Avoid:

```text
voicemail assistant
personal assistant
PA

```

unless explicitly discussing those narrower concepts.

---

## Subscriber

The person who owns the Voxi subscription and Voxi Number.

Prefer:

```text
Subscriber

```

instead of:

```text
user
customer
account

```

when referring to the person.

---

## Conversation

A single conversational exchange involving Voxi.

Can be:

```text
phone
in-app voice
text

```

This is the main parent concept for conversation history, summaries, transcripts and tasks.

---

## Call

A Conversation over telephony / SIP / PSTN.

Examples:

```text
forwarded phone call
direct call to Voxi Number
outbound phone call

```

Every Call is a Conversation.

Not every Conversation is a Call.

---

## Caller

The person participating in a phone Call with Voxi.

Use `Caller` only for telephony.

Do not use `Caller` for an in-app text or voice participant.

---

## Voxi Number

The phone number assigned to a Subscriber.

The Subscriber can:

```text
forward calls to it
give the number directly to other people
do both

```

Avoid:

```text
DID
extension
line

```

in user-facing language.

---

## Summary

A concise interpreted account of what happened in a Conversation.

It is not verbatim.

Do not confuse it with a Transcript.

---

## Transcript

The ordered textual record of a Conversation.

For voice:

```text
final speech-to-text output

```

For text:

```text
the original messages

```

Audio is not the long-term authoritative record.

---

## Task

An action Voxi identifies for the Subscriber from a Conversation.

Voxi creates it.

The Subscriber clears/completes it.

Prefer:

```text
Task

```

Avoid:

```text
to-do
reminder
follow-up
action item

```

unless specifically required by copy.

---

## Conversation History

The historical record of Conversations across all channels.

Includes:

```text
Phone Calls
In-app Voice
Text Chat

```

`Call History` refers only to the telephony subset.

---

## Voicemail

A possible outcome of a phone Call where Voxi collects information for the Subscriber.

Voicemail is not the product.

---

# Knowledge and Behaviour

## Rule

A standing instruction from the Subscriber that affects how Voxi handles relevant Conversations.

Exact Rule trigger behaviour is still being designed.

Do not invent trigger combinations or limitations unless they are already documented elsewhere.

A Rule may be **proposed** from Knowledge (for example from a captured document). A
proposal is a Draft until the Subscriber accepts it. Do not treat unaccepted
proposals as active Rules.

---

## Q&A

Subscriber-authored question-and-answer pairs.

Used by Voxi to answer relevant questions.

Current intended tier:

```text
Pro

```

Treat authored answers as deliberate source material.

Do not assume Voxi should invent unsupported answers beyond them.

A Q&A pair may be **proposed** from Knowledge. A proposal is a Draft until the
Subscriber accepts it. Do not treat unaccepted proposals as live Q&A.

---

## Draft

A proposed change to Subscriber-authored behaviour or Knowledge metadata that is
not yet accepted.

Applies especially to proposed Rules and Q&A derived from Knowledge.

Until the Subscriber accepts it:

```text
it must not affect how Voxi handles Conversations

```

Prefer:

```text
Draft

```

Avoid:

```text
self-learning
auto-Rule
learned memory
local Voxi decided

```

---

## Knowledge

Subscriber-uploaded documents that Voxi can retrieve from when answering.

Upload includes documents the Subscriber captures on their device (for example
from the camera) once those captures are **confirmed** and stored as Knowledge.

Pending captures that the Subscriber has not confirmed are not Knowledge yet.

The backend remains the source of truth. A device may keep a synced local index
of Knowledge for retrieval (including offline). That index is still Knowledge,
not a separate product concept and not Memory.

Knowledge retrieval and document review on a device are **not** a Conversation
channel. They do not replace Phone Call, In-app Voice, or Text Chat.

Current intended tier:

```text
Business

```

Avoid using `Knowledge` to mean generic runtime context.

Do not use `Memory` for document or image capture that is meant to be retrieved
as Knowledge.

---

## Memory

Deliberately retained facts or preferences that may influence future Conversations.

Memory does not exist yet.

Do not treat Conversation History as Memory.

Do not treat Knowledge, OCR output, local indexes, Drafts, or automatic
extraction from documents or Transcripts as Memory.

Difference:

```text
Conversation History
= what happened

Knowledge
= documents Voxi can retrieve from

Draft
= proposed authoring, not yet accepted

Memory
= selected facts deliberately carried forward

```

---

# Billing Language

## Tier

One of:

```text
Starter
Pro
Business

```

---

## Plan

The Tier the Subscriber purchased and is billed for.

---

## Entitlement

The Tier the Subscriber is allowed to use right now.

Normally:

```text
Plan == Entitlement

```

They may differ because of:

```text
payment grace
suspension
administrative override

```

The runtime uses **Entitlement**.

The runtime does not interpret billing/payment state itself.

---

## Grace

A temporary period after a billing problem where access may continue according to billing policy.

---

# Current Tier Intent

## Starter

```text
Conversation History
Summaries
Tasks
Voxi Number

```

## Pro

Starter plus:

```text
Calendar integration
Q&A
Voxi Card

```

## Business

Pro plus:

```text
Knowledge
advanced receptionist capabilities

```

Business receptionist scope is not settled yet.

Do not invent it.

---

# Voxi Card

A hosted page associated with the Subscriber.

May contain:

```text
Subscriber information
what Voxi can help with
call action
save-contact action
QR destination

```

Prefer:

```text
Voxi Card

```

Avoid:

```text
business card
profile
landing page

```

---

# UI / UX Rules

The web UI should be designed around:

```text
Conversations

```

not:

```text
Calls

```

even if early production data is mostly phone Calls.

Shared UX such as:

```text
Conversation list
Conversation detail
Summary
Transcript
Tasks

```

must remain channel-neutral.

Telephony-specific information should appear only where relevant to a phone Call.

Knowledge library, capture confirm, and Draft review are not Conversation
surfaces. Do not present them as chatting with a separate on-device assistant.

Do not expose internal architecture terminology unnecessarily.

User-facing language should remain plain and product-oriented.

Prefer:

```text
keeps your Knowledge searchable on this device
learns from what you add

```

only when describing Knowledge capture/index behaviour.

Avoid:

```text
self-learning Voxi
local Voxi brain
on-device assistant chat

```

---

# Product Boundaries

Currently in scope:

```text
Authentication
Onboarding
Conversations
Summaries
Transcripts
Tasks
Rules
Q&A
Voxi Number setup
Billing / Plan / Entitlement

```

Known but not yet fully defined:

```text
In-app Voice
Text Chat
Business receptionist capabilities
Knowledge
Knowledge capture and synced on-device index
Drafts from Knowledge (Rules, Q&A)
Memory
additional integrations

```

Do not treat deferred features as implemented product requirements.

Do not invent Memory from Knowledge capture or Conversation enrichment.

---

# Source-of-Truth Rule

When product sources disagree, use this priority:

```text
Current approved product decisions
↓
Current architecture / ADRs
↓
Current product context
↓
Old mockups

```

Old mockups are visual references only.

They must not override current product behaviour or architecture.
