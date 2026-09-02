# Separate UI libraries for web and native, one shared token layer

`apps/web` uses shadcn/ui on Next.js; `apps/mobile` uses gluestack-ui on Expo.
They share a single Tailwind token config in `packages/theme`, not components.

## Why

A reasonable reader will assume that an Expo monorepo should use one universal
UI library — Expo renders web, and gluestack-ui targets both. We deliberately
did not. The dashboard is dense data UI (sortable tables, filters, keyboard
navigation), which is the case universal-RN component sets handle worst, and it
is also the surface shipping first.

## Consequences

- "One repo, everything in sync" is delivered by the shared Supabase project
  and `packages/`, not by shared buttons. Sharing UI between a phone and a
  dashboard is the least valuable thing to share.
- Both libraries are Tailwind-based and copy-in, so `packages/theme` is the
  real design system and either library can be replaced without touching it.
- This replaces Tamagui, used in the superseded `voxi_mobile_app`.
- The mint/lime semantics from the mockup are load-bearing: mint marks what
  Voxi does or says, lime marks something finished. Never use mint for generic
  emphasis — it stops meaning anything.
