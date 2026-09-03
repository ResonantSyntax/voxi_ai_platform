"use client";

import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { useDrawer } from "@/components/drawer";
import { VoxiBars } from "@/components/voxi-bars";
import { openTasks, onItTasks, mineTasks } from "@/lib/mock-data";

export default function TasksPage() {
  const { open } = useDrawer();

  return (
    <>
      <PageHeading title="Tasks" side={`${openTasks.length} need you`} />
      <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1fr_1fr] gap-2.5">
        <div className="flex min-h-0 flex-col rounded-panel bg-paper-base p-8 text-paper-ink">
          <div className="flex items-baseline justify-between">
            <div className="text-label uppercase text-paper-ink-muted">Needs you</div>
            <div className="text-body-sm text-paper-ink-muted">
              {openTasks.length ? `${openTasks.length} things` : "All clear"}
            </div>
          </div>
          <div className="mt-5 flex flex-col">
            {openTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => open({ tag: "Needs you", title: t.title, facts: t.facts, options: t.options })}
                className="flex cursor-pointer items-center justify-between gap-5 border-t border-paper-ink/10 py-5 text-left"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-[20px] leading-[26px] font-semibold tracking-[-0.3px] text-paper-ink text-balance">
                    {t.title}
                  </div>
                  <div className="text-body-sm text-paper-ink-muted">{t.who}</div>
                </div>
                <span className="flex-none rounded-panel bg-paper-ink px-4 py-2.5 text-meta font-bold text-paper-base">
                  Open
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card className="min-h-0">
          <CardHeader>
            <SectionLabel agent>Voxi is on it</SectionLabel>
            <VoxiBars heights={[6, 12, 9]} color="var(--color-mint-base)" />
          </CardHeader>
          <div className="mt-3.5 flex flex-col">
            {onItTasks.map((t) => (
              <div key={t.id} className="flex flex-col gap-1 border-b border-line-subtle py-4">
                <div className="text-lead text-text-primary">{t.title}</div>
                <div className="text-body-sm text-text-muted">{t.status}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="min-h-0">
          <SectionLabel>Yours</SectionLabel>
          <div className="mt-3.5 flex flex-col">
            {mineTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-3.5 border-b border-line-subtle py-4">
                <span className="h-5 w-5 flex-none rounded-panel border-[1.5px] border-line-control" aria-hidden />
                <div className="flex-1 text-lead font-medium text-text-secondary">{t.title}</div>
                {t.handoffFacts && t.handoffOptions ? (
                  <button
                    onClick={() =>
                      open({
                        tag: "Hand to Voxi",
                        tone: "mint",
                        title: t.title,
                        facts: t.handoffFacts,
                        options: t.handoffOptions,
                      })
                    }
                    className="flex-none cursor-pointer text-body-sm font-bold text-mint-base"
                  >
                    Hand to Voxi
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
