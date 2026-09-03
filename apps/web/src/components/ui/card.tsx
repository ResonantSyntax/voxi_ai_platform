import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

export function Card({
  children,
  agent = false,
  className,
}: {
  children: ReactNode;
  agent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex min-h-0 flex-col rounded-panel border p-6",
        agent ? "border-mint-line bg-mint-tint rounded-panel" : "border-line-default bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, agent = false }: { children: ReactNode; agent?: boolean }) {
  return (
    <div className={cx("text-label uppercase", agent ? "text-mint-base" : "text-text-tertiary")}>
      {children}
    </div>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <div className="flex items-baseline justify-between gap-4">{children}</div>;
}
