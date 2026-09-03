// Subscriber tier gates nav-level access. See GHO-207: Starter is the floor,
// Business adds Q&A, live monitoring, and (future) Knowledge uploads.
export type Tier = "starter" | "pro" | "business";

const RANK: Record<Tier, number> = { starter: 0, pro: 1, business: 2 };

export function meetsTier(tier: Tier, minTier: Tier): boolean {
  return RANK[tier] >= RANK[minTier];
}

// ponytail: no auth/entitlement backend yet — hardcode Business so every gated
// surface is reachable during IA build-out. Swap for the real Subscriber
// entitlement once auth lands.
export const CURRENT_TIER: Tier = "business";
