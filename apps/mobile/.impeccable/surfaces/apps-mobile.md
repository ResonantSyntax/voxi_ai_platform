---
version: 1
slug: "apps-mobile"
primary_target: "apps/mobile"
related_targets: []
---

## Scope and mode

`apps/mobile` v1, Operate mode. Consumer + Business Subscribers, one neutral UI. Job: answer "does anything need me?" instantly, resolve in as few taps as possible. Constraints per GHO-206: no read/unread state, no chat/orb free-text surface, no multi-app-mode. Full brief: Linear GHO-206.

## Direction contract

THESIS: attention-first, single-card queue — refuses a scrollable task-list; Home resolves exactly one open item at a time, next-most-urgent replacing it on resolve.

OWN-WORLD: DESIGN.md's Quiet Switchboard, unmodified — Room/Board/Panel/Well/Raised-Panel tonal depth, no shadows, outlined mint for what Voxi asks, flat mint for what the Subscriber does, lime only as the Dead Circuit "done" confirmation, four-bar orb, 22–24px card radii, one 26px+ subject per screen.

STORY: Subscriber opens the app, immediately sees the one thing that needs them (or "Nothing needs you"), resolves it, gets a lime confirmation, the next card turns in — or the empty state lands.

FIRST VIEWPORT: 402px frame, 54px status clearance, header greeting, single queue card centred in the body labelled by type ("Voxi needs an answer" mint label / "Yours to do" grey label), primary resolve action, "N more waiting" count beneath, bottom nav (Home / Settings, 62px orb between two labels).

FORM: locked by the Linear GHO-206 shape brief (already run through `/impeccable shape`) — brief-pinned decision, no concept-seed roll.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions

None — GHO-206 §7 open decisions resolved 2026-09-03 (no chat/orb, tabs confirmed, Knowledge view+add+delete, expo-router + Zustand).
