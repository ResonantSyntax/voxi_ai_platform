"use client";

import { useState } from "react";
import { PageHeading } from "@/components/page-heading";
import { useDrawer } from "@/components/drawer";
import { VoxiBars } from "@/components/voxi-bars";
import { cx } from "@/lib/cx";
import { initialKanbanTasks, type KanbanLane, type KanbanTask } from "@/lib/mock-data";

const LANES: { id: KanbanLane; label: string }[] = [
  { id: "needs_you", label: "Needs You" },
  { id: "voxi", label: "Voxi" },
  { id: "done", label: "Done" },
];

export default function TasksPage() {
  const { open } = useDrawer();
  const [tasks, setTasks] = useState(initialKanbanTasks);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overLane, setOverLane] = useState<KanbanLane | null>(null);

  const needsYouCount = tasks.filter((t) => t.lane === "needs_you").length;

  function moveTask(id: string, lane: KanbanLane) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, lane } : t)));
  }

  function openTaskDrawer(t: KanbanTask) {
    if (t.lane === "done") {
      open({ tag: "Done", tone: "lime", title: t.title, facts: [{ k: "Completed", v: t.meta }] });
      return;
    }
    open({
      tag: t.lane === "needs_you" ? "Needs you" : "Voxi is on it",
      tone: t.lane === "voxi" ? "mint" : undefined,
      title: t.title,
      facts: t.facts ?? [{ k: "Status", v: t.meta }],
      options: t.options ?? [],
    });
  }

  return (
    <>
      <PageHeading title="Tasks" side={`${needsYouCount} need you`} />
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2.5">
        {LANES.map((lane) => {
          const laneTasks = tasks.filter((t) => t.lane === lane.id);
          const isDropTarget = overLane === lane.id && draggingId !== null;
          return (
            <div
              key={lane.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverLane(lane.id);
              }}
              onDragLeave={() => setOverLane((prev) => (prev === lane.id ? null : prev))}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingId) moveTask(draggingId, lane.id);
                setOverLane(null);
                setDraggingId(null);
              }}
              className={cx(
                "flex min-h-0 flex-col rounded-panel border p-5 transition-colors",
                lane.id === "needs_you" && "bg-paper-base text-paper-ink border-transparent",
                lane.id === "voxi" && "bg-surface text-text-primary border-line-default",
                lane.id === "done" && "bg-surface text-text-primary border-line-default",
                isDropTarget && "border-mint-base"
              )}
            >
              <div className="flex items-center justify-between px-1">
                <div
                  className={cx(
                    "text-label uppercase",
                    lane.id === "needs_you" && "text-paper-ink-muted",
                    lane.id === "voxi" && "text-mint-base",
                    lane.id === "done" && "text-lime-base"
                  )}
                >
                  {lane.label}
                </div>
                {lane.id === "voxi" ? (
                  <VoxiBars heights={[6, 12, 9]} color="var(--color-mint-base)" />
                ) : (
                  <div
                    className={cx(
                      "text-body-sm",
                      lane.id === "needs_you" ? "text-paper-ink-muted" : "text-text-muted"
                    )}
                  >
                    {laneTasks.length}
                  </div>
                )}
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
                {laneTasks.length === 0 ? (
                  <div
                    className={cx(
                      "flex flex-1 items-center justify-center rounded-panel border border-dashed text-body-sm",
                      lane.id === "needs_you" ? "border-paper-ink/15 text-paper-ink-muted" : "border-line-default text-text-muted"
                    )}
                  >
                    Nothing here
                  </div>
                ) : (
                  laneTasks.map((t) => (
                    <button
                      key={t.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggingId(t.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverLane(null);
                      }}
                      onClick={() => openTaskDrawer(t)}
                      className={cx(
                        "flex cursor-grab flex-col gap-1 rounded-panel p-4 text-left transition-opacity active:cursor-grabbing",
                        draggingId === t.id && "opacity-40",
                        lane.id === "needs_you" && "bg-paper-ink/[.04] hover:bg-paper-ink/[.07]",
                        lane.id === "voxi" && "bg-mint-tint border border-mint-line hover:border-mint-line-soft",
                        lane.id === "done" && "bg-surface-2 border border-line-default"
                      )}
                    >
                      <div
                        className={cx(
                          "text-lead text-balance",
                          lane.id === "needs_you" && "text-paper-ink font-semibold",
                          lane.id === "voxi" && "text-text-primary",
                          lane.id === "done" && "text-text-secondary"
                        )}
                      >
                        {t.title}
                      </div>
                      <div
                        className={cx(
                          "flex items-center gap-1.5 text-body-sm",
                          lane.id === "needs_you" ? "text-paper-ink-muted" : "text-text-muted"
                        )}
                      >
                        {lane.id === "done" && (
                          <span className="h-1.5 w-1.5 flex-none rounded-pill bg-lime-base" aria-hidden />
                        )}
                        {t.meta}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
