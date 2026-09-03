"use client";

import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { VoxiBars } from "@/components/voxi-bars";
import { useDrawer } from "@/components/drawer";
import { CURRENT_TIER, meetsTier } from "@/lib/tier";
import { openTasks, ledger, needsAttentionCount, liveConversation } from "@/lib/mock-data";

export default function OverviewPage() {
  const { open } = useDrawer();
  const showLive = meetsTier(CURRENT_TIER, "business");

  return (
    <>
      <PageHeading title="Morning, Tom." side="Wednesday 3 September" />
      <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1fr] grid-rows-[auto_1fr] gap-2.5">
        <div className="row-span-2 flex min-h-0 flex-col rounded-panel bg-paper-base p-6 text-paper-ink">
          <div className="flex items-baseline justify-between">
            <div className="text-label uppercase text-paper-ink-muted">Needs you</div>
            <div className="text-body-sm text-paper-ink-muted">
              {openTasks.length ? `${openTasks.length} things` : "All clear"}
            </div>
          </div>
          <div className="mt-6 flex flex-col">
            {openTasks.map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  open({ tag: "Needs you", title: t.title, facts: t.facts, options: t.options })
                }
                className="flex cursor-pointer items-center justify-between gap-6 border-t border-paper-ink/10 py-5 text-left"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="text-lead text-paper-ink text-balance">{t.title}</div>
                  <div className="text-body-sm text-paper-ink-muted">{t.who}</div>
                </div>
                <span className="flex-none rounded-panel bg-paper-ink px-4 py-3 text-body-sm font-bold text-paper-base">
                  Open
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <div className="text-body-sm text-paper-ink-muted">
            {needsAttentionCount - openTasks.length} others are with Voxi or waiting on you.{" "}
            <a href="/tasks" className="font-semibold text-paper-ink">
              See all
            </a>
          </div>
        </div>

        {showLive ? (
          <Link
            href="/conversations"
            className="flex min-h-0 flex-col justify-between gap-5 rounded-panel bg-mint-base p-7 text-paper-ink"
          >
            <div className="flex items-center justify-between">
              <div className="text-label uppercase text-mint-ink-muted">Live now</div>
              <VoxiBars heights={[8, 16, 12, 6]} color="#0b0f0d" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="text-lead text-paper-ink">{liveConversation.who}</div>
              <div className="text-body text-mint-ink-muted text-balance">{liveConversation.summary}</div>
            </div>
            <div className="flex gap-2">
              <span className="rounded-panel bg-paper-ink px-4 py-2.5 text-body-sm font-bold text-mint-base">
                Listen in
              </span>
              <span className="rounded-panel bg-paper-ink/10 px-4 py-2.5 text-body-sm font-semibold text-paper-ink">
                Take over
              </span>
            </div>
          </Link>
        ) : (
          <Card className="items-center justify-center text-center">
            <div className="text-body-sm text-text-muted">Live call monitoring is a Business feature.</div>
          </Card>
        )}

        <Card className="min-h-0">
          <CardHeader>
            <SectionLabel>Last seven days</SectionLabel>
            <div className="text-body-sm text-text-muted">{ledger.length} calls</div>
          </CardHeader>
          <div className="mt-3.5 flex min-h-0 flex-col overflow-auto">
            {ledger.map((e) => (
              <div key={e.id} className="flex gap-4 border-b border-line-subtle py-3">
                <div className="w-[46px] flex-none text-meta text-text-faint">{e.day}</div>
                <div className="min-w-0 flex-1 text-body text-text-secondary text-balance">{e.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
