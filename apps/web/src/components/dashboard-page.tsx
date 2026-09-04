import type { ReactNode } from "react";
import { DrawerPanel } from "@/components/drawer";

// The drawer sits beside the page content only — not beside the heading —
// so its height matches the card grid instead of the whole column.
export function DashboardPage({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  return (
    <>
      {heading}
      <div className="flex min-h-0 flex-1 gap-2.5">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <DrawerPanel />
      </div>
    </>
  );
}
