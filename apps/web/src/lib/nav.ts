import type { Tier } from "./tier";

export type NavItem = {
  label: string;
  href: string;
  minTier: Tier;
};

// Order and gating from GHO-207's resolved scope table.
export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", minTier: "starter" },
  { label: "Conversations", href: "/conversations", minTier: "starter" },
  { label: "Tasks", href: "/tasks", minTier: "starter" },
  { label: "Q&A", href: "/qa", minTier: "pro" },
  { label: "Rules", href: "/rules", minTier: "starter" },
  { label: "Billing", href: "/billing", minTier: "starter" },
  { label: "Settings", href: "/settings", minTier: "starter" },
];
