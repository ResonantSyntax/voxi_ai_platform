"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import type { DrawerOption, Fact } from "@/lib/mock-data";
import { FactList } from "@/components/ui/fact-row";

export type DrawerContent = {
  tag: string;
  tone?: "mint" | "neutral";
  title: string;
  facts?: Fact[];
  options?: DrawerOption[];
};

type DrawerCtx = {
  content: DrawerContent | null;
  open: (c: DrawerContent) => void;
  close: () => void;
};

const Ctx = createContext<DrawerCtx | null>(null);

export function useDrawer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDrawer must be used within DrawerProvider");
  return ctx;
}

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<DrawerContent | null>(null);
  const close = useCallback(() => setContent(null), []);
  const open = useCallback((c: DrawerContent) => setContent(c), []);

  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content, close]);

  return <Ctx.Provider value={{ content, open, close }}>{children}</Ctx.Provider>;
}

// Rendered as its own flex item beside the page content, so its width
// transition pushes the layout rather than overlaying it — matches the mock.
export function DrawerPanel() {
  const { content, close: onClose } = useDrawer();
  const open = content !== null;
  return (
    <div
      className={cx(
        "flex-none overflow-hidden py-8 transition-[width] duration-500 ease-[cubic-bezier(.32,.72,0,1)]",
        open ? "w-[440px]" : "w-0"
      )}
      aria-hidden={!open}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={content?.title}
        className={cx(
          "h-full w-[440px] pr-8 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.32,.72,0,1)]",
          open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
        )}
      >
        <div className="flex h-full flex-col rounded-panel bg-surface p-7">
          <div className="flex items-center justify-between">
            <div
              className={cx(
                "text-label uppercase",
                content?.tone === "mint" ? "text-mint-base" : "text-text-tertiary"
              )}
            >
              {content?.tag}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-panel bg-surface-2 text-lg leading-none text-text-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
            >
              ×
            </button>
          </div>
          <div className="mt-6 text-title text-text-primary text-balance">{content?.title}</div>
          {content?.facts && content.facts.length > 0 && (
            <div className="mt-6">
              <FactList facts={content.facts} />
            </div>
          )}
          <div className="flex-1" />
          <div className="flex flex-col gap-2">
            {content?.options?.map((o) => (
              <button
                key={o.label}
                onClick={onClose}
                className={cx(
                  "cursor-pointer rounded-panel px-[18px] py-[15px] text-left text-body transition-colors",
                  o.primary
                    ? "bg-mint-base font-bold text-surface-bg hover:bg-mint-hover"
                    : "bg-surface-2 font-semibold text-text-primary hover:bg-surface-3",
                  o.self && "text-text-secondary"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
