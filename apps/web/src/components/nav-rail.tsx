"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";
import { NAV_ITEMS } from "@/lib/nav";
import { CURRENT_TIER, meetsTier } from "@/lib/tier";
import { VoxiOrb } from "@/components/voxi-orb";
import { openTasks, inputRequests } from "@/lib/mock-data";

const NAV_COUNTS: Record<string, number> = {
  Tasks: openTasks.length,
  Conversations: inputRequests.length,
};

export function NavRail() {
  const pathname = usePathname();
  const visible = NAV_ITEMS.filter((item) => meetsTier(CURRENT_TIER, item.minTier));

  return (
    <nav className="flex w-[232px] flex-none flex-col bg-surface-bg px-6 py-8">
      <Link href="/" className="flex items-center gap-2.5 text-lg font-bold tracking-[-0.4px] text-text-primary">
        <span className="h-2.5 w-2.5 rounded-pill bg-mint-base" aria-hidden />
        Voxi
      </Link>

      <ul className="mt-9 flex flex-col gap-0.5">
        {visible.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const count = NAV_COUNTS[item.label] ?? null;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex items-center justify-between rounded-panel px-3.5 py-2.5 text-body-sm font-semibold transition-colors",
                  active ? "bg-surface text-text-primary" : "text-text-tertiary hover:text-text-primary"
                )}
              >
                <span>{item.label}</span>
                {count ? (
                  <span className="rounded-pill bg-surface-3 px-2 py-0.5 text-[12px] font-bold text-text-primary">
                    {count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex-1" />

      <Link href="/conversations" className="flex items-center gap-3.5">
        <VoxiOrb size={44} />
        <div className="flex flex-col gap-0.5">
          <div className="text-body-sm font-semibold text-text-primary">On a call</div>
          <div className="text-meta text-text-muted">Northgate Dental</div>
        </div>
      </Link>
    </nav>
  );
}
