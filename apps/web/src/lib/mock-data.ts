// Placeholder content for the IA/route build (GHO-207). Shapes follow the
// approved Conversation-rooted domain model in PRODUCT.md — channel is
// generic even though every entry today is a Phone Call — and stand in for
// real Supabase reads until the data layer lands.

export type Fact = { k: string; v: string };
export type DrawerOption = { label: string; primary?: boolean; self?: boolean };

export type Task = {
  id: string;
  title: string;
  who: string;
  facts: Fact[];
  options: DrawerOption[];
};

// The Tasks board: three lanes a card can be dragged between. "done" is a
// real resolved-task history, not the earlier "yours to do" grouping — an
// unresolved task belongs in needs_you regardless of who's expected to act.
export type KanbanLane = "needs_you" | "voxi" | "done";
export type KanbanTask = {
  id: string;
  title: string;
  meta: string;
  lane: KanbanLane;
  facts?: Fact[];
  options?: DrawerOption[];
};

export type InputRequest = {
  id: string;
  title: string;
  from: string;
  facts: Fact[];
  options: DrawerOption[];
};

// Call outcome is domain vocabulary, never a UI status pill — it renders as
// Voxi's-voice prose in the ledger. See PRODUCT.md.
export type CallOutcome = "handled" | "voicemail" | "unresolved" | "abandoned";
export type LedgerEntry = { id: string; day: string; outcome: CallOutcome; text: string };

export const openTasks: Task[] = [
  {
    id: "t1",
    title: "Reschedule Thursday's site visit",
    who: "Dan Whitmore · asked this morning",
    facts: [
      { k: "Who", v: "Dan Whitmore" },
      { k: "Was", v: "Thursday 10:00" },
      { k: "Reason", v: "Van in for its MOT" },
    ],
    options: [
      { label: "Offer Friday 10am", primary: true },
      { label: "Offer Monday 2pm" },
      { label: "I'll call him myself", self: true },
    ],
  },
  {
    id: "t2",
    title: "Quote for the Kembrey Park job",
    who: "Sarah Ellis · full rewire, 3-bed",
    facts: [
      { k: "Who", v: "Sarah Ellis" },
      { k: "Wants", v: "Full rewire, 3-bed" },
      { k: "Asked", v: "Monday 9:12" },
    ],
    options: [
      { label: "Send the rate card", primary: true },
      { label: "Book a site visit" },
      { label: "I'll price it myself", self: true },
    ],
  },
  {
    id: "t3",
    title: "Confirm parts order with Howden",
    who: "Howden Trade · chased twice, no answer",
    facts: [
      { k: "Who", v: "Howden Trade" },
      { k: "Order", v: "2 × consumer unit" },
      { k: "Chased", v: "Twice, no answer" },
    ],
    options: [
      { label: "Chase again tomorrow", primary: true },
      { label: "Try the branch line" },
      { label: "Leave it with me", self: true },
    ],
  },
];

export const initialKanbanTasks: KanbanTask[] = [
  ...openTasks.map((t) => ({
    id: t.id,
    title: t.title,
    meta: t.who,
    lane: "needs_you" as const,
    facts: t.facts,
    options: t.options,
  })),
  {
    id: "m1",
    title: "Invoice 2481 — Ashcroft",
    meta: "£340, due Friday",
    lane: "needs_you",
    facts: [
      { k: "Amount", v: "£340, due Friday" },
      { k: "Contact", v: "Accounts, Ashcroft Ltd" },
    ],
    options: [
      { label: "Voxi chases by phone Friday", primary: true },
      { label: "Voxi sends a reminder text" },
      { label: "I'll handle it myself", self: true },
    ],
  },
  {
    id: "m2",
    title: "Chase HMRC on the VAT letter",
    meta: "Letter received Monday",
    lane: "needs_you",
    facts: [{ k: "From", v: "HMRC" }],
    options: [
      { label: "Voxi drafts a reply", primary: true },
      { label: "I'll handle it myself", self: true },
    ],
  },
  {
    id: "m3",
    title: "Renew van insurance",
    meta: "Expires 30 September",
    lane: "needs_you",
    facts: [
      { k: "Expires", v: "30 September" },
      { k: "Insurer", v: "Admiral, 0333 220 2000" },
    ],
    options: [
      { label: "Voxi gets three quotes", primary: true },
      { label: "Voxi calls Admiral to renew" },
      { label: "I'll handle it myself", self: true },
    ],
  },
  { id: "o1", title: "Chasing Howden for the parts", meta: "Called twice · trying again at 2pm", lane: "voxi" },
  { id: "o2", title: "Moving Northgate to Friday", meta: "On the call now", lane: "voxi" },
  { id: "d1", title: "Sent the boiler service quote", meta: "Mrs Patel · yesterday", lane: "done" },
  { id: "d2", title: "Paid the Howden Trade invoice", meta: "Monday", lane: "done" },
  { id: "d3", title: "Booked the annual van MOT", meta: "Last week", lane: "done" },
];

// "Needs a reply" — unresolved Input Requests. A Task is something the
// Subscriber must do; an Input Request is something Voxi needs from them.
export const inputRequests: InputRequest[] = [
  {
    id: "r1",
    title: "Wants a price for a full rewire",
    from: "Kembrey Park · 9:12",
    facts: [
      { k: "Caller", v: "Sarah Ellis" },
      { k: "Said", v: "\"Three-bed, whole house, ideally October.\"" },
      { k: "Voxi said", v: "Tom will call back today" },
    ],
    options: [
      { label: "Voxi books a site visit", primary: true },
      { label: "Voxi sends the rate card" },
      { label: "Call her back myself", self: true },
    ],
  },
  {
    id: "r2",
    title: "Asking about a boiler service",
    from: "Mrs Patel · Yesterday",
    facts: [
      { k: "Caller", v: "Mrs Patel" },
      { k: "Said", v: "\"Annual service, same as last year.\"" },
      { k: "Last job", v: "12 Sep 2025, £85" },
    ],
    options: [
      { label: "Voxi offers the next free slot", primary: true },
      { label: "Call her back myself", self: true },
    ],
  },
];

// Attention is derived, never stored: open Tasks > 0 OR unresolved Input
// Requests > 0. See PRODUCT.md.
export const needsAttentionCount = openTasks.length + inputRequests.length;

export const ledger: LedgerEntry[] = [
  { id: "l1", day: "Today", outcome: "handled", text: "Booked Dan Whitmore in for Thursday at 10." },
  { id: "l2", day: "Today", outcome: "handled", text: "Told Ashcroft the invoice is on its way." },
  { id: "l3", day: "Mon", outcome: "unresolved", text: "Took a price enquiry from Kembrey Park, passed it to you." },
  { id: "l4", day: "Mon", outcome: "abandoned", text: "Turned away two cold callers." },
  { id: "l5", day: "Sun", outcome: "handled", text: "Confirmed the boiler service for the 14th." },
];

export const handledToday: LedgerEntry[] = [
  { id: "h1", day: "10:48", outcome: "handled", text: "Booked Dan Whitmore, Thursday 10am" },
  { id: "h2", day: "10:12", outcome: "unresolved", text: "Told a supplier you'll call back" },
  { id: "h3", day: "9:31", outcome: "abandoned", text: "Turned away a cold caller" },
  { id: "h4", day: "8:55", outcome: "handled", text: "Confirmed Ashcroft invoice is sent" },
];

export const liveConversation = {
  id: "live-1",
  who: "Northgate Dental",
  meta: "01793 · called twice before",
  elapsed: "1:42",
  summary: "Asking to move Thursday. Voxi is offering Friday 10am.",
  transcript: [
    { who: "Caller" as const, text: "Hi, it's Jo from Northgate Dental. We've got Tom booked for Thursday but we've had to close that day." },
    { who: "Voxi" as const, text: "No problem. Tom has Friday at 10 or Monday at 2. Would either of those work?" },
    { who: "Caller" as const, text: "Friday at 10 would be great, if that's definitely free." },
    { who: "Voxi" as const, text: "It is. I'll move it now and Tom will get a note. Same address on Cricklade Road?" },
  ],
};

// Q&A — Subscriber-authored deterministic source material Voxi answers from.
// The mock's business facts panel and caller FAQs both land here per GHO-207;
// "Knowledge" stays reserved for Business document uploads, not yet built.
export const businessFacts: Fact[] = [
  { k: "Trading as", v: "Ellis Gas & Electrical" },
  { k: "Hours", v: "Mon–Fri, 8 to 5" },
  { k: "Covers", v: "Swindon and 20 miles round it" },
  { k: "Call-out", v: "£65, waived if the job goes ahead" },
];

export const callerFaqs: { id: string; q: string; a: string }[] = [
  { id: "f1", q: "Do you do emergencies?", a: "Not out of hours. Voxi gives the Gas Emergency number for smells." },
  { id: "f2", q: "Are you Gas Safe registered?", a: "Yes, number 512994. Voxi offers to text it." },
  { id: "f3", q: "How soon can Tom come out?", a: "Voxi checks the diary and offers the next two free slots." },
  { id: "f4", q: "Can I pay by card?", a: "Yes, or bank transfer. Never cash." },
];

// Rules — how Voxi should handle relevant Conversations. Cannot control
// whether the Subscriber's phone rings (ADR-0001).
export const rules: { id: string; label: string; detail: string }[] = [
  { id: "rule1", label: "Never say prices for rewires over the phone", detail: "Applies to every inbound Phone Call" },
];

export const plan = {
  price: "£29",
  cadence: "a month · Sole trader",
  renews: "Renews 14 September. Unlimited calls, 60 hand-offs.",
};

export const usage = {
  used: 23,
  of: 60,
  percent: 38,
  note: "On track. 187 calls answered so far.",
};

export const invoices: { id: string; date: string; desc: string; amount: string }[] = [
  { id: "i1", date: "14 Aug 2026", desc: "Sole trader · monthly", amount: "£29.00" },
  { id: "i2", date: "14 Jul 2026", desc: "Sole trader · monthly", amount: "£29.00" },
  { id: "i3", date: "14 Jun 2026", desc: "Sole trader · monthly", amount: "£29.00" },
  { id: "i4", date: "14 May 2026", desc: "Sole trader · monthly", amount: "£29.00" },
];

export const settingsGroups: { title: string; rows: { k: string; v: string }[] }[] = [
  {
    title: "Number",
    rows: [
      { k: "Voxi answers on", v: "01793 440 212" },
      { k: "Rings first", v: "Your mobile, 4 rings" },
      { k: "Out of hours", v: "Voxi always answers" },
    ],
  },
  {
    title: "Voice",
    rows: [
      { k: "Voxi sounds", v: "Warm · British" },
      { k: "Introduces as", v: "Tom's assistant" },
      { k: "Pace", v: "Unhurried" },
    ],
  },
  {
    title: "Notifications",
    rows: [
      { k: "Needs you", v: "Push, straight away" },
      { k: "Handled conversations", v: "Daily summary, 6pm" },
      { k: "Quiet hours", v: "9pm to 7am" },
    ],
  },
  {
    title: "Account",
    rows: [
      { k: "Email", v: "tom@ellisgas.co.uk" },
      { k: "Calendar", v: "Google, connected" },
      { k: "Sign out", v: "" },
    ],
  },
];
