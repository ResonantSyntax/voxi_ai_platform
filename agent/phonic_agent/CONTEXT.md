# MY DOCTOR Sales Agent

A Phonic realtime voice agent that pitches the MY DOCTOR – Life Living Plan, answers caller questions about it, and captures lead details. Transport-agnostic: the same agent logic runs whether the call arrives via console, web, inbound telephony, or outbound telephony (dialing/routing is handled outside this project).

## Language

**Plan**:
The single product this agent sells: "MY DOCTOR – Life Living Plan," R122/month.
_Avoid_: Product, package, tier (there is only one plan; it is not tiered)

**Member Type**:
Whether the caller already holds other Medicall Healthcare cover. Two values: **New Member** (no existing Medicall Healthcare cover; pays GP/pharmacy out of pocket for Virtual/Network GP benefits) and **Existing Member** (already a Medicall Healthcare member; Virtual/Network GP benefits are inclusive). Determines which benefits are inclusive vs. "own account" — the agent must know this before answering benefit-coverage questions accurately.
_Avoid_: Customer type, tier, plan type

**Benefit**:
One discrete service covered by the Plan (e.g. Nurse Assistance, OTC Medication, Virtual Doctor Consultation, Network GP Referral, Emergency Evacuation, Trauma Counselling). Some benefits are inclusive for both Member Types; others are inclusive only for Existing Members.

**Pitch**:
The agent's opening, unprompted summary of the Plan and its key selling points, delivered before Q&A begins.

**Lead**:
The name, phone number, email address, and Member Type captured from a caller at the end of a call. Collection is attempted on every call regardless of interest level; if the caller declines, the agent asks once more, then ends the Data Collection Task gracefully with no further pressure. Stored locally only (MVP, `leads.jsonl`) — no CRM integration yet.
_Avoid_: Contact, prospect, customer record

**Data Collection Task**:
The Task/TaskGroup that captures the Lead at the end of a call. Member Type is asked separately, right after the Pitch and before open Q&A (needed to answer coverage questions accurately) — its answer is carried forward and included as a field on the Lead.

## Resolved gap

The brochure never prints the "086" call-centre number it repeatedly references. The agent directs callers who need it to the general queries line, 010 443 8777, instead.
