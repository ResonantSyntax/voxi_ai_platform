---
name: Voxi
description: A dark switchboard where mint marks the live line — the colour is a claim about who acted.
colors:
  room-black: "#070a09"
  board-black: "#0b0f0d"
  panel: "#131916"
  well: "#1a211e"
  raised-panel: "#242d29"
  line-subtle: "#171e1b"
  line-default: "#242d29"
  line-strong: "#31403a"
  line-control: "#3a443f"
  agent-mint: "#0aef9a"
  agent-mint-hover: "#3df2ae"
  agent-mint-deep: "#08c57f"
  agent-mint-tint: "rgba(10,239,154,.07)"
  agent-mint-chip: "rgba(10,239,154,.14)"
  agent-mint-line: "rgba(10,239,154,.40)"
  agent-mint-line-soft: "rgba(10,239,154,.28)"
  agent-mint-ink-muted: "#065a3b"
  finished-lime: "#8cdd2c"
  finished-lime-tint: "rgba(140,221,44,.08)"
  finished-lime-line: "rgba(140,221,44,.35)"
  paper-base: "#e8e4d6"
  paper-ink: "#0b0f0d"
  paper-ink-muted: "#5e5a4e"
  text-primary: "#ffffff"
  text-secondary: "#a9afac"
  text-tertiary: "#8a918e"
  text-muted: "#6b7370"
  text-faint: "#4d5551"
  text-danger: "#fca5a5"
typography:
  hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: "42px"
    letterSpacing: "-0.8px"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "-0.6px"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "-0.6px"
  speech:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: "37px"
    letterSpacing: "-0.4px"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: "25px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0px"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "21px"
    letterSpacing: "0px"
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0px"
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0px"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    lineHeight: "14px"
    letterSpacing: "1.2px"
  mono:
    fontFamily: "ui-monospace, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0px"
rounded:
  chip: "8px"
  sm: "14px"
  md: "16px"
  lg: "18px"
  card: "22px"
  card-lg: "24px"
  pill: "100px"
  device: "52px"
  panel: "6px"
spacing:
  "1": "4px"
  "2": "7px"
  "3": "11px"
  "4": "14px"
  "5": "18px"
  "6": "22px"
  "7": "26px"
  "8": "34px"
  "9": "48px"
components:
  button-primary:
    backgroundColor: "{colors.agent-mint}"
    textColor: "{colors.board-black}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "17px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "17px"
  button-agent:
    backgroundColor: "{colors.agent-mint-tint}"
    textColor: "{colors.agent-mint}"
    rounded: "{rounded.md}"
    padding: "16px 18px"
  button-agent-inline:
    backgroundColor: "{colors.agent-mint-tint}"
    textColor: "{colors.agent-mint}"
    rounded: "{rounded.sm}"
    padding: "11px 15px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.panel}"
    padding: "28px 30px"
  card-live:
    backgroundColor: "{colors.agent-mint}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.panel}"
    padding: "28px 30px"
  card-paper:
    backgroundColor: "{colors.paper-base}"
    textColor: "{colors.paper-ink}"
    rounded: "{rounded.panel}"
    padding: "28px 30px"
  chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: "9px 13px"
  chip-agent-label:
    backgroundColor: "{colors.agent-mint-chip}"
    textColor: "{colors.agent-mint}"
    typography: "{typography.label}"
    rounded: "{rounded.chip}"
    padding: "4px 8px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body}"
    rounded: "{rounded.card-lg}"
    padding: "14px 18px"
  turn-agent:
    backgroundColor: "rgba(10,239,154,.08)"
    textColor: "{colors.agent-mint-hover}"
    typography: "{typography.body}"
    rounded: "18px 18px 18px 6px"
    padding: "13px 16px"
  turn-inbound:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body}"
    rounded: "18px 18px 18px 6px"
    padding: "13px 16px"
  turn-subscriber:
    backgroundColor: "{colors.agent-mint}"
    textColor: "{colors.board-black}"
    typography: "{typography.body}"
    rounded: "18px 18px 6px 18px"
    padding: "13px 16px"
  badge-finished:
    backgroundColor: "{colors.finished-lime-tint}"
    textColor: "#a3e54d"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "11px 15px"
  toggle-on:
    backgroundColor: "{colors.agent-mint}"
    rounded: "{rounded.pill}"
    padding: "3px"
    width: "50px"
    height: "30px"
  toggle-off:
    backgroundColor: "#2c3733"
    rounded: "{rounded.pill}"
    padding: "3px"
    width: "50px"
    height: "30px"
  orb:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.pill}"
    width: "62px"
    height: "62px"
---

# Design System: Voxi

## Overview

**Creative North Star: "The Quiet Switchboard"**

Voxi is the calm operator working a dark, near-silent board. The room is almost
black (`#070a09`), the board itself barely lighter (`#0b0f0d`), and the panels
you actually touch lift only two more steps out of that darkness. Nothing in
this system glows for decoration. When mint lights up, a line is live — Voxi is
speaking, acting, or asking you something. The interface is the room, not the
operator.

That metaphor is what keeps the palette honest. A conventional dark UI spends
its accent everywhere: on focus rings, on active tabs, on any control that
wants to look important. Voxi cannot afford that, because mint is load-bearing
product language. `#0aef9a` is a claim about authorship — Voxi did this, Voxi
said this, Voxi needs this from you — and the moment it also means "this button
is the important one", the claim stops being readable. The discipline is not
decorative restraint. It is that one colour is carrying a semantic the copy
alone cannot carry.

The result reads calm rather than sparse. Radii are generous (22–24px on cards,
18px on buttons), gutters are wide (26px on a 402px frame), and blocks separate
at 34px, so a screen that holds one task and two buttons feels deliberate
instead of empty. Type does the hierarchy work that colour is not allowed to
do: a five-rung grey ladder from `#ffffff` down to `#4d5551`, and a rule that
only one thing per screen is allowed to be 26px or larger. This is a dark-only
product with no light-mode fallback, so contrast and the grey ladder are the
whole accessibility budget — there is no second theme to rescue a weak pairing.

**Key Characteristics:**

- Dark-only, five surface tones, no shadows inside the app frame
- Mint means authorship, never emphasis; lime means finished, never actionable
- Soft slabs (22–24px radii, roomy padding) carrying hard semantic colour
- Voxi has no avatar and no face — four pulsing bars are its entire body
- One subject per screen; everything else drops to 17px and below
- Type and tone carry hierarchy, because colour is spoken for

## Colors

Five near-black greens stacked by depth, one mint that means Voxi, one lime
that means done, and a five-rung grey ladder for everything else.

### Primary

- **Agent Mint** (`#0aef9a`): Voxi is doing or saying something. Its three
  faces are fixed — flat mint fill for a control *the Subscriber* operates,
  mint text on a `.07` tint with a `.30`–`.40` mint border for an action
  *Voxi* performs, and mint text alone for section labels announcing Voxi's
  own state ("First up", "Needs a reply", "Voxi needs an answer"). It is never
  a focus ring, never an active-tab underline, never a link colour inside the
  app.
- **Agent Mint Hover** (`#3df2ae`): the lighter mint. Used for Voxi's own words
  inside a turn bubble and as the brightest bar in the orb — not as a hover
  state on buttons, despite the token name.
- **Agent Mint Deep** (`#08c57f`): the dimmest bar in the orb. It exists to
  give the voice bars depth, not as a pressed state.
- **Agent Mint Ink Muted** (`#065a3b`): secondary/meta text sitting on a flat
  mint fill — the "Live now" label, elapsed time, summary prose, a caller's
  transcript lines. Paired with Paper Ink for the primary text on the same
  surface, the way Paper Ink Muted pairs with Paper Ink on a paper card.

### Secondary

- **Finished Lime** (`#8cdd2c`): something is finished and there is nothing
  left for you to do. Confirmation badges ("Rule saved"), settled turn labels
  ("Sent"), and the one dashboard stat that counts things Voxi disposed of.
  Lime never appears on anything you can tap.

### Tertiary

- **Paper** (`#e8e4d6`): the surface for anything that needs the Subscriber —
  a Task or an Input Request alike ("Needs you", "Needs a reply"). It is
  deliberately the one warm, non-black surface in a dark-only system, so the
  thing waiting on you reads as a different material from everything Voxi is
  merely reporting. Paired text: **Paper Ink** (`#0b0f0d`) for the subject,
  **Paper Ink Muted** (`#5e5a4e`) for meta/secondary copy — the same ink used
  on a flat mint button, since Board Black and Paper Ink are the same value.

### Neutral

- **Room Black** (`#070a09`): the room with the lights off — the canvas behind
  the app itself. On the web dashboard this is the page background.
- **Board Black** (`#0b0f0d`): the board. The app background, the fill behind
  a metered progress track, and the text colour that sits on a flat mint button.
- **Panel** (`#131916`): cards, list rows, inputs, the orb's own face. The
  surface you actually read off.
- **Well** (`#1a211e`): chips, pressed rows, secondary buttons that sit inside
  a card, and any surface recessed below Panel.
- **Raised Panel** (`#242d29`): raised or selected surfaces, and the default
  1px border. The same value serves both because a border here is a thin slice
  of the next surface up, not a separate line colour.
- **Line Subtle** (`#171e1b`): dividers *inside* a list, where a full-strength
  border would chop the list into unrelated cards.
- **Line Strong** (`#31403a`): the border on a selected card. Selection is a
  border shift plus a fill shift to Well — never a lift.
- **Line Control** (`#3a443f`): unfilled controls — an empty checkbox, an
  unselected radio dot, the outline on a non-primary option button.
- **Text Primary** (`#ffffff`): the subject. Headings and the one piece of
  content the screen exists to show.
- **Text Secondary** (`#a9afac`): body copy and summary prose.
- **Text Tertiary** (`#8a918e`): uppercase section labels and non-Voxi turn
  labels.
- **Text Muted** (`#6b7370`): metadata, inactive nav, placeholder text.
- **Text Faint** (`#4d5551`): fact-row keys, ledger dates, chevrons, version
  strings.
- **Text Danger** (`#fca5a5`): destructive links only — "Delete account" in a
  settings list. Never a filled button, never an error background.

### Named Rules

**The Authorship Rule.** On a *control* (a button, an inline action, a
section label), mint has exactly two fills and they mean opposite things.
Flat mint (`#0aef9a` background, `#0b0f0d` text) = *the Subscriber* does it.
Outlined mint (mint text, `rgba(10,239,154,.07)` fill,
`rgba(10,239,154,.30–.40)` border) = *Voxi* does it. There is no third mint,
and neither one is available for "this is the important button".

**The Needs-You Rule.** On a *surface* (a card, a panel), the three
non-neutral fills answer three different questions, and none of them is
"who does it": Paper = something needs the Subscriber, right now, calmly
(a Task or an Input Request — the distinction is the label, not the card).
Flat mint = Voxi is live and active this instant (an in-progress call or
Conversation). Dark panel = passive information Voxi is merely reporting
(history, settings, done work). A screen may show at most one paper surface
and one live surface at a time — if nothing is live, that slot simply
doesn't render.

**The Dead Circuit Rule.** Lime marks a closed line. If an element is tappable,
it cannot be lime. A lime badge, label, or stat is a statement that the thing
is over.

**The Grey Ladder Rule.** Five greys, ranked by how much you are obliged to
read them: `#ffffff` subject → `#a9afac` body → `#8a918e` section labels →
`#6b7370` metadata → `#4d5551` keys and dates. Never skip a rung to add
emphasis. If something needs to stand out, move it up the type scale, not
sideways into colour.

**The Contrast Floor Rule.** Two rungs of the ladder do not currently meet
WCAG 2.2 AA and must be treated as known debt, not as approved values.
`#4d5551` measures 2.1–2.6:1 on every surface in the system and fails outright.
`#6b7370` measures 3.4–4.1:1 — large-text-only, yet the mockup uses it at 13px
and 14px. Both need lightening before the web dashboard ships against the AA
commitment; everything from `#8a918e` up passes comfortably (5.1:1 and better),
and mint, lime and danger all clear 7:1 on every surface.

## Typography

**Display Font:** the platform's own — `-apple-system, BlinkMacSystemFont,
"SF Pro Text", system-ui, sans-serif`
**Body Font:** the same stack. There is one family in this system.
**Label/Mono Font:** `ui-monospace, Menlo, monospace`, used only for identifiers
and tabular figures.

**Character:** A single system stack doing all eleven roles. The personality
comes from weight and tracking, not from a typeface choice — 700 with tight
negative tracking at the top of the scale, 400 at rest, and one uppercase
11px label at `+1.2px` that acts as the system's only ornament. It reads like
something native rather than something branded, which is the point: Voxi's
identity is carried by the colour semantic and the voice, not by a display face.

### Hierarchy

- **Hero** (700, 34px/42px, `-0.8px`): one-thing-at-a-time screens. The single
  task or the single Conversation the screen hands you.
- **Display** (700, 32px/38px, `-0.6px`): screen title. "Calls", "Settings",
  "This month", "All clear".
- **Title** (700, 30px/38px, `-0.6px`): the subject of a detail screen.
- **Speech** (600, 26px/37px, `-0.4px`): the orb talking, and detail-screen
  subjects that sit under a back link.
- **Lead** (600, 18px/25px): a card's subject line. In practice the mockup
  runs this at 17px/24–25px inside cards; treat 17–18px as one rung.
- **Body Large** (500, 17px/24px): summary prose that carries a whole screen.
- **Body** (400, 15px/22px): default. The reading size everywhere, on phone and
  desktop alike.
- **Body Small** (400, 14px/21px): fact-row keys, chip labels, dense secondary
  copy.
- **Meta** (400, 13px/22px): timestamps, source lines, nav labels, "Started
  from a call · Mrs Adeyemi, Oakfield Primary".
- **Button** (700, 16px/16px): primary and secondary button labels. Secondary
  buttons drop to 600.
- **Label** (700, 11px/14px, `+1.2px`, uppercase): section labels. Mint when
  the section is Voxi's ("Voxi needs an answer"), `#8a918e` when it is not
  ("Yours to do", "Payment", "Receipts").

### Named Rules

**The Subject Line Rule.** Exactly one element per screen may be 26px or
larger, and it is the thing the screen is about. Everything else lives at 18px
and below. A screen with two large headings has two subjects and needs
splitting.

**The Tracking Ladder Rule.** Tracking follows size, not emphasis. Negative
above 26px (`-0.8px` at 34, `-0.6px` at 30–32, `-0.4px` at 26), zero from 11px
to 18px, and `+1.2px` only on the uppercase 11px label. Never letterspace body
copy to make it look designed.

**The Tabular Numbers Rule.** Any figure that appears in a column or updates in
place — receipt amounts, call counts, durations, dashboard stats — sets
`font-variant-numeric: tabular-nums`. Numbers that jitter as they change read
as unreliable, which is the opposite of what this product is selling.

## Layout

The system is built on a 402px phone frame with a **26px screen gutter** and a
nine-step spacing scale: `4 · 7 · 11 · 14 · 18 · 22 · 26 · 34 · 48`. The scale
is deliberately not a doubling series — it was measured off the design rather
than idealised, and the odd steps (7, 11, 26) are the ones that do the most
work.

Two gutters coexist and the difference is intentional. **Full-bleed screens
gutter at 26px** — a hero task, a ledger, a detail screen where text meets the
edge. **Scrolling card lists inset to 20px**, because each card carries its own
16–20px padding; the tighter outer inset lands the card's text on roughly the
same optical margin as the full-bleed text, while letting the cards themselves
read as wider objects.

Vertical rhythm: 10–14px between siblings inside a group, 22px between a
section label and the next section, 26px between sections in a scroll view,
34px between major blocks. Screen headers pad `28px 24px 18–20px`.

Chrome and clearance:

- The status bar reserves 54px at the top; content starts below it.
- The bottom nav is 62px of orb centred between two 64px text labels, padded
  `14px 34px 30px`, sitting on a scrim of
  `linear-gradient(to top, #0b0f0d 62%, rgba(11,15,13,0))` so list content
  fades under it rather than colliding with it.
- Every scrolling list ends with a **150px spacer** so its last row clears the
  nav. A detail screen with no nav uses 60px.
- Hit targets are 44px minimum on phone.

**Desktop** (the web dashboard): content columns of **560–720px**. Headings
scale, body does not — hero 34→44, display 32→38, title 30→34, while body stays
15px and meta stays 13px. Body text does not want to be larger on a large
screen; only headings do. Two values are phone-only and must not travel: the
52px device radius and the 44px hit-target floor, which drops to 32px on
desktop.

### Named Rules

**The 26/20 Gutter Rule.** Text meets the screen edge at 26px. Cards meet it at
20px. Pick by what is at the boundary — glyph or container — not by what looks
tidier in isolation.

**The 150px Tail Rule.** A scrolling list under the bottom nav ends with a
150px spacer, always. The nav's gradient scrim is a fade, not a backstop, and a
list that stops short leaves its final row half-legible.

## Elevation & Depth

**This system has no shadows.** Depth is entirely tonal: five surface values
climbing out of black — Room Black `#070a09`, Board Black `#0b0f0d`, Panel
`#131916`, Well `#1a211e`, Raised Panel `#242d29` — plus 1px lines at four
weights. Nothing inside the app frame casts light or shade.

The one shadow in the source material, `0 40px 90px rgba(0,0,0,.6)` paired with
`0 0 0 1px #242d29`, belongs to the *device frame* in the design canvas. It is
how the phone is presented on a page, not a UI token, and it must not be
inherited by cards, sheets, or modals in the real app.

The single light source in the system is Voxi's own glow:
`radial-gradient(circle, rgba(10,239,154,.22), transparent 70%)` behind the orb,
and a slightly warmer `.24`–`.28` behind the voice bars when Voxi is
introducing itself. This is not an elevation token — it is the agent being
present. Nothing else in the product is allowed to emit light.

Selection and state are expressed as **tonal and border shifts, never lifts**:
a selected card moves from Panel to Well and its border from `#242d29` to
`#31403a`. A pressed row moves to Well. An agent-owned card fills to
`rgba(10,239,154,.07)` and borders at `rgba(10,239,154,.40)`.

### Named Rules

**The Flat Room Rule.** No `box-shadow` inside the app frame — not on cards,
not on the bottom sheet, not on the nav. If something needs to sit forward,
move it a surface step up and change its border. The room is lit evenly; only
Voxi glows.

**The Border-Is-A-Surface Rule.** `#242d29` is both the raised surface and the
default border, and that is not a collision. A border in this system is a
1px sliver of the next surface up. Borders are always exactly 1px — there is
no 2px anywhere.

## Shapes

**Panel (`6px`) is the default radius for every card, button, container, and
the drawer** — a flat, tight corner rather than a soft one. This is the
system as actually built (`apps/web`), superseding the wider 8–24px scale
below wherever the two disagree. Anything circular — the orb, the nav dot,
count badges, toggle knobs, radio dots — is `pill` (`100px`), full stop.

The 8–24px scale (`chip` `8px` → `sm` `14px` → `md` `16px` → `lg` `18px` →
`card` `22px` → `card-lg` `24px`) is legacy from the original mobile mockup.
Treat it as available for small mobile-only inline controls that predate
`panel` (a fact chip, a toggle knob, an input field) where a softer corner
still reads correctly next to `panel`-radius cards and buttons — never revive
it for a new card, container, or full-width button. A `52px` device radius
exists for the phone frame only and carries no other meaning.

Bottom sheets break the pattern deliberately: `36px 36px 0 0`, larger than any
card, with a 38×4px `#3a443f` grab handle centred above the content. The sheet
is the only surface allowed to exceed the card radius, and its size is what
tells you it came from outside the current screen.

Icons are essentially absent. Voxi has no icon set — actions are words, status
is colour and type, and the two glyphs that do appear (`‹` for back, `›` for
disclosure) are typographic characters, not artwork. Source marks and file
types are 34×34 rounded squares (12px radius) containing 11–13px uppercase
letterforms.

### Named Rules

**The Asymmetric Tail Rule.** A turn bubble drops one corner to 6px on its
speaker's side: `18px 18px 18px 6px` for an inbound or Voxi turn on the left,
`18px 18px 6px 18px` for the Subscriber's turn on the right. A *settled* turn —
something already sent, nothing to answer — is a uniform 18px on all four
corners. No tail means no one is waiting on you.

**The Bigger-Is-Rounder Rule.** Radius tracks the element's size, never its
importance. An 8px radius on a large card, or a 24px radius on a chip, reads as
a mistake even when nothing else changes.

## Components

### The Orb (signature component)

Voxi's entire body is **four vertical bars** — 3px wide, 2px radius, at heights
14 / 24 / 18 / 9px, coloured `#0aef9a` / `#0aef9a` / `#3df2ae` / `#08c57f` —
centred in a 62px `#131916` circle with a 1px `#0aef9a` border, over a
`radial-gradient(circle, rgba(10,239,154,.22), transparent 70%)` glow. There is
no face, no avatar, no logotype. This is deliberate: the product's claim is
that Voxi speaks, so its representation is a waveform.

When Voxi is working, the bars animate on `@keyframes voxi-bar` —
`scaleY(.35)` → `scaleY(1)` → `scaleY(.35)` over `1.4s ease-in-out infinite`,
each bar staggered `0.2s` behind the last. The whole glow breathes at `3.4s`
on the setup screen (`opacity .35→.7`, `scale 1→1.08`). The orb scales to
44px in a header, 38px inline in a sheet, and 76px on first-run, always with
the same bar ratios.

Any "Voxi is working" indicator anywhere in the product reuses these bars at a
smaller size (3 bars, 2px wide, 5/11/8px tall) beside a mint 14px status line.
**Motion must respect `prefers-reduced-motion`** — the bars hold at their rest
heights and the glow stops breathing.

### Buttons

- **Shape:** large radius (`18px`) full width, medium (`16px`) inside cards,
  small (`14px`) inline.
- **Primary:** flat Agent Mint (`#0aef9a`) with Board Black (`#0b0f0d`) text,
  700 weight, `17px` padding, full width. 12.7:1 contrast. This is the
  Subscriber's action — "Open", "Send it", "Call back", "Listen and reply".
- **Secondary:** Panel (`#131916`) fill, `#a9afac` text, 600 weight, 1px
  `#242d29` border, same `17px` padding and `18px` radius. Stacked 11px below
  the primary, never beside it at full width.
- **Agent:** mint text on `rgba(10,239,154,.07)` with a 1px
  `rgba(10,239,154,.30)` border, `16px` radius. "Hand to Voxi", "Add a
  document", "Add". This is Voxi acting on your behalf, and the outline is the
  whole tell.
- **Paired inline:** two buttons side by side inside a card use `16px` radius
  and `15px`/700 text — flat mint on the left, Well (`#1a211e`) with `#ffffff`
  text and a `#242d29` border on the right ("Send it" / "Edit").
- **Options:** a set of mutually exclusive choices renders the first as flat
  mint and the rest as transparent with a `#3a443f` border and white text.
- **Hover / Focus:** the mockup is native-mobile and defines no hover state.
  On the web dashboard, hover moves the fill one surface step (Panel → Well) and
  focus uses a visible ring — **not** a mint one, since mint is spoken for.
  A `#31403a` or white ring keeps the authorship semantic intact.

### Chips

- **Fact chip:** Panel fill, `#242d29` border, `14px` radius, `9px 13px`
  padding, `#a9afac` 14px text. Read-only facts pulled out of a Conversation.
- **Action chip:** same shape, `10px 15px` padding, 600 weight, `#ffffff` text.
  Tappable suggestions.
- **Agent label chip:** `rgba(10,239,154,.14)` fill, `#0aef9a` text, `8px`
  radius, `4px 8px` padding, 11px/700 uppercase at `+0.6px`. Channel markers
  on an agent-owned card.
- **Neutral label chip:** the same at Well fill with `#8a918e` text, for
  channel markers on cards Voxi does not own.
- **Selected state:** border moves to `#0aef9a` and text to `#0aef9a`; the fill
  does not change.

### Cards / Containers

Three surfaces, one question each — see the Needs-You Rule.

- **Dark** (default): Panel (`#131916`) fill, 1px `#242d29` border,
  `#ffffff`/`#a9afac` text. Passive/historical content — a ledger, settings, a
  handled-calls list.
- **Paper** (needs the Subscriber): `#e8e4d6` fill, no border, `#0b0f0d` text
  for the subject and `#5e5a4e` for meta. A Task ("Needs you") and an Input
  Request ("Needs a reply") render identically — the label is what tells them
  apart, never the card. Row dividers inside a paper card are `Paper Ink` at
  10% opacity, not `line-subtle`.
- **Live** (Voxi active right now): flat Agent Mint (`#0aef9a`) fill, `#0b0f0d`
  text for the subject and `#065a3b` for meta. Only ever one on screen — a
  live Call or Conversation. Its own action buttons invert: `#0b0f0d` fill
  with mint or paper-ink text.
- **Corner style:** `6px` (`panel`) on every card, uniformly. See Shapes.
- **Selected state:** border moves to `#31403a` with the fill moving to Well —
  applies to the dark card only; paper and live cards aren't selectable.
- **Shadow strategy:** none. See Elevation & Depth.
- **Internal padding:** `28px 30px` for a feature-scale card (Overview,
  Billing plan), tightening to `18px`–`22px` for a denser list card. Follow
  the surface's role, not a fixed number.
- **Grouped list container:** a single `24px` container with `overflow: hidden`
  and rows divided by a 1px `#242d29` top border — with the **first row's
  divider set to `transparent`**, not omitted, so the rows keep identical
  heights. Inside a bare list (no container), dividers drop to the subtler
  `#171e1b`.

### Inputs / Fields

- **Style:** Panel fill, 1px `#242d29` border, `24px` radius, `14px 18px`
  padding, 15px text with `#6b7370` placeholder.
- **Send affordance:** a 34px (inline) or 48px (composer) flat mint circle at
  the trailing edge. The composer's version holds three Board Black bars rather
  than an arrow — you are speaking to Voxi, not submitting a form.
- **Toggle:** 50×30px pill, 3px padding, 24px knob. On = `#0aef9a` track with a
  `#0b0f0d` knob; off = `#2c3733` track with a `#8a918e` knob. Note the off
  track is a one-off value outside the token set.
- **Checkbox:** 22×22px, `7px` radius, 1px `#3a443f` border, transparent fill.
- **Radio:** 20×20px circle, `#3a443f` border unselected; selected fills mint
  and borders mint.
- **Focus / Error / Disabled:** not defined in the source material. Focus must
  be visible and must not use mint; error copy uses `#fca5a5` as text, never as
  a fill.

### Navigation

- **Bottom bar:** two 64px 13px/600 text labels flanking the 62px orb. Inactive
  labels are `#6b7370`; the active label is `#ffffff` — or `#0aef9a` when the
  active surface is one Voxi owns. No icons, no pills, no underline.
- **Back:** a text link at 15–17px. `‹ Calls` in mint when returning to a
  Voxi-owned surface, `‹ Back` in `#6b7370` when generic.
- **Disclosure:** a `›` glyph at `#4d5551`, right-aligned.
- **Sheet:** `36px 36px 0 0`, Panel fill, `#242d29` border with
  `border-bottom: none`, `max-height: 78%`, and the parent screen dimmed to
  `opacity: .3` behind it.

### Turn bubbles

A Conversation transcript renders each Turn as a bubble, and the fill states
who spoke:

- **Inbound** (`#131916`, `#242d29` border, `#ffffff` text, left,
  `18px 18px 18px 6px`)
- **Voxi** (`rgba(10,239,154,.08)`, `rgba(10,239,154,.22)` border, `#3df2ae`
  text, left, `18px 18px 18px 6px`)
- **Subscriber** (`#0aef9a` fill, `#0b0f0d` text, right,
  `18px 18px 6px 18px`)
- **Settled** (`rgba(140,221,44,.07)`, `rgba(140,221,44,.28)` border,
  `#c6ea8e` text, left, uniform `18px`)

Each carries a `10.5–11px`/700 uppercase label above it at `+1.1px` — mint for
Voxi, lime for settled, `#8a918e` otherwise — with an `11px` `#4d5551`
timestamp beside it. Max width 82–88%.

### Data display

- **Fact row:** a `74px` `#4d5551` key column at 14px/21px, an 18px gap, then a
  `#ffffff` value at 15px/21px, `14px 0` padding, `#171e1b` bottom border. This
  is how a detail screen states facts — labels, not sentences.
- **Ledger row:** a `46px` `#4d5551` day column at 13px, 16px gap, `#a9afac`
  text at 15px/22px, `16px 0` padding, `#171e1b` bottom border.
- **Stat tile:** `24px` card, `18px 14px` padding, a 28px/800 tabular value at
  `-0.5px` over a 13px/18px `#8a918e` label. The value takes mint only when it
  counts something Voxi did, lime when it counts something Voxi closed, and
  white otherwise.
- **Bar chart:** flexed columns, `6px` radius, 8px gap, 96px tall, with 11px
  labels beneath. The current period takes mint; prior periods take `#242d29`.
- **Meter:** `6–8px` tall, `4–5px` radius, `#242d29` or `#0b0f0d` track, mint
  fill. `#6b7370` fill when the row represents something unattributed.

## Do's and Don'ts

### Do:

- **Do** treat `packages/theme/tokens.json` as the only source of truth. Edit
  it and run `pnpm theme`; `packages/theme/theme.css` is generated and must
  never be hand-edited.
- **Do** use flat mint for what the Subscriber does and outlined mint for what
  Voxi does — the fill is the sentence's subject.
- **Do** express depth tonally. Move an element up a surface step and change its
  border; never reach for a shadow.
- **Do** end every scrolling list under the bottom nav with a 150px spacer.
- **Do** set `font-variant-numeric: tabular-nums` on anything numeric that sits
  in a column or updates in place.
- **Do** pair colour with a second signal. Voxi-owned cards carry a mint label
  *and* a mint border *and* mint text — the state survives if colour does not
  land, which the dark-only, colour-semantic combination makes mandatory.
- **Do** honour `prefers-reduced-motion`: the orb bars hold at rest height and
  the glow stops breathing.
- **Do** give the first row of a grouped list container a `transparent` divider
  rather than removing it, so row heights stay identical.
- **Do** let one subject own each screen. If two things want 26px, they want
  two screens.
- **Do** use the flat `6px` `panel` radius for every new card, button, and
  container. The wider 8–24px scale is legacy — see Shapes.
- **Do** render anything needing the Subscriber (Task or Input Request) on a
  paper card, never an outlined-mint one. Outlined mint stays for inline
  Voxi-suggested actions, not card surfaces.

### Don't:

- **Don't** use mint for generic emphasis — not focus rings, not active tabs,
  not links, not "the important button". It is a claim about authorship and it
  stops meaning anything the moment it also means "look here".
- **Don't** put lime on anything tappable. Lime is a closed line.
- **Don't** add a `box-shadow` inside the app frame. The `0 40px 90px` in the
  source material is the device frame in a design canvas, not a UI token.
- **Don't** build a light mode, and don't drop light-mode component defaults
  onto the dark canvas — no white cards on `#0b0f0d`, no borrowed light-theme
  shadows. Dark-only is a brand commitment, not a default.
- **Don't** reach for voicemail metaphors. No tape decks, no play counts, no
  red unread badges, no "(3) New Messages". Voicemail is one possible outcome
  of one phone Call, not the product.
- **Don't** ship `#4d5551` or `#6b7370` as body or metadata text on the web
  dashboard without lightening them first — they measure 2.1–2.6:1 and
  3.4–4.1:1 respectively and miss WCAG 2.2 AA at the sizes the source material
  uses them.
- **Don't** letterspace body copy. Tracking follows size: negative above 26px,
  zero from 11–18px, and `+1.2px` only on the uppercase 11px label.
- **Don't** carry the 52px device radius or the 44px hit-target floor to
  desktop. Both are phone-only; desktop's target floor is 32px.
- **Don't** scale body text up on desktop. Headings grow (34→44, 32→38, 30→34);
  15px body and 13px meta stay exactly where they are.
- **Don't** give Voxi a face. Four bars are the whole avatar — no illustrated
  character, no photo, no logotype standing in for the agent.
