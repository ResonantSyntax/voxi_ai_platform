import type { ReactNode } from "react";
import { NavRail } from "@/components/nav-rail";
import { DrawerProvider, DrawerPanel } from "@/components/drawer";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DrawerProvider>
      <div className="flex min-h-screen bg-surface-bg">
        <NavRail />
        <main className="flex min-h-screen min-w-0 flex-1 flex-col gap-2.5 py-8 pr-8 pl-2.5">{children}</main>
        <DrawerPanel />
      </div>
    </DrawerProvider>
  );
}
