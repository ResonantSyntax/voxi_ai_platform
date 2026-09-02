# Voxi

Voxi is a phone line that answers on your behalf. Every Subscriber gets a Voxi
Number; Voxi picks up, talks to the Caller, and turns the conversation into a
Summary and Tasks. Calls reach it either because the Subscriber forwarded their
phone or because someone dialled the Voxi Number directly.

## Language

**Voxi**:
The product: a phone line that answers on a Subscriber's behalf.
_Avoid_: Voicemail assistant — Voxi answers calls that were never missed, so
"voicemail" describes the smaller half. Also avoid personal assistant, PA:
Voxi does not act across a Subscriber's messaging, inbox, or automations.

**Voxi Number**:
The phone number assigned to a Subscriber that Voxi answers. Every tier gets
one. The Subscriber may forward their personal phone to it, hand it out
directly, or both.
_Avoid_: DID, line, extension.

**Call**:
One conversation between Voxi and a Caller. The unit everything else hangs off.
_Avoid_: Voicemail, message, interaction.

**Voicemail**:
The outcome of a Call where the Caller left a message for the Subscriber rather
than getting what they needed from Voxi. One kind of Call, not the product.

**Summary**:
The readable account of one Call: who rang, what they wanted, what it means for
the Subscriber.
_Avoid_: Transcript — a Transcript is verbatim, a Summary is not.

**Transcript**:
The verbatim text of a Call. Retained as Voxi's long-term memory of a Caller.
Audio is never kept.

**Task**:
An action the Subscriber needs to take, derived by Voxi from a Call. Voxi
raises it; the Subscriber clears it.
_Avoid_: To-do, reminder, follow-up, action item.

**Rule**:
A standing instruction from the Subscriber about how Voxi should handle certain
Calls. A Rule triggers on either a Caller or a topic — never both at once.
A Rule changes how loudly Voxi tells the Subscriber; it cannot change whether
their phone rings.
_Avoid_: Priority, preference, setting.

**Subscriber**:
The person whose Voxi Number this is, and who holds the subscription.
_Avoid_: User, customer, account.

**Caller**:
The person who reached Voxi, whether by dialling the Voxi Number or by being
forwarded to it.

**Voxi Card**:
The hosted page a Subscriber's QR code resolves to — who they are, what Voxi
can help with, and a way to call or save the contact.
_Avoid_: Business card, profile, landing page.

**Memory**:
Facts and preferences Voxi deliberately retains about a Caller or the
Subscriber's world, carried forward into future Calls. Does not exist yet.
_Avoid_: History, context — Memory is what Voxi chose to keep, not everything
it has heard.

**Call History**:
The searchable record of what was said in past Calls. Distinct from Memory:
history is everything, Memory is the deliberate subset.

## Knowledge

**Q&A**:
Question-and-answer pairs the Subscriber writes by hand for Voxi to answer
Callers from. Pro tier. Deterministic — Voxi does not infer beyond them.

**Knowledge**:
Documents the Subscriber uploads, which Voxi ingests and retrieves from to
answer Callers. Business tier.
_Avoid_: Docs, knowledge base, context.

## Billing

**Tier**:
One of the three named levels: Starter, Pro, Business.

**Plan**:
The Tier a Subscriber bought and is billed for.

**Entitlement**:
The Tier a Subscriber can actually use right now. Normally the same as Plan,
but diverges during a payment grace period or a suspension. Voxi's runtime
reads Entitlement and never interprets payment state.
_Avoid_: Using "tier" unqualified where the two could differ.

**Grace**:
The window after a failed payment during which Entitlement still matches Plan.

## Tiers

**Starter**:
Summaries and Tasks.

**Pro**:
Starter plus calendar integration, Q&A, and a Voxi Card.

**Business**:
Pro plus Knowledge and receptionist skills — Voxi handles the Caller further
rather than taking a message. Scope not yet settled.
