"use client";

import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { Card, CardHeader, SectionLabel } from "@/components/ui/card";
import { VoxiBars } from "@/components/voxi-bars";
import { useDrawer } from "@/components/drawer";
import { CURRENT_TIER, meetsTier } from "@/lib/tier";
import { inputRequests, handledToday, liveConversation } from "@/lib/mock-data";

export default function ConversationsPage() {
  const { open } = useDrawer();
  const showLive = meetsTier(CURRENT_TIER, "business");

  return (
    <>
      <PageHeading title="Conversations" side="Voxi has answered 9 today" />
      <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1fr] grid-rows-2 gap-2.5">
        {showLive ? (
          <div className="row-span-2 flex min-h-0 flex-col rounded-panel bg-mint-base p-8 text-paper-ink">
            <CardHeader>
              <div className="text-label uppercase text-[#065a3b]">Live · {liveConversation.elapsed}</div>
              <VoxiBars heights={[8, 16, 12, 6]} color="#0b0f0d" />
            </CardHeader>
            <div className="mt-5 flex flex-col gap-1">
              <Link href={`/conversations/${liveConversation.id}`} className="text-title text-paper-ink text-balance">
                {liveConversation.who}
              </Link>
              <div className="text-body text-[#065a3b]">{liveConversation.meta}</div>
            </div>
            <div className="mt-7 flex min-h-0 flex-1 flex-col gap-4 overflow-auto">
              {liveConversation.transcript.map((m, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className={
                      "w-[52px] flex-none text-body-sm font-bold " +
                      (m.who === "Voxi" ? "text-paper-ink" : "text-[#065a3b]")
                    }
                  >
                    {m.who}
                  </div>
                  <div className="flex-1 text-body-lg text-paper-ink text-balance">{m.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <Link
                href={`/conversations/${liveConversation.id}`}
                className="rounded-panel bg-paper-ink px-4 py-3 text-body-sm font-bold text-mint-base"
              >
                Take over
              </Link>
              <Link
                href={`/conversations/${liveConversation.id}`}
                className="rounded-panel bg-paper-ink/10 px-4 py-3 text-body-sm font-semibold text-paper-ink"
              >
                Whisper to Voxi
              </Link>
            </div>
          </div>
        ) : (
          <div className="row-span-2 flex min-h-0 flex-col items-center justify-center rounded-panel border border-line-default bg-surface p-8 text-center">
            <div className="text-body-sm text-text-muted">Live call monitoring is a Business feature.</div>
          </div>
        )}

        <div className="flex min-h-0 flex-col rounded-panel bg-paper-base p-7 text-paper-ink">
          <div className="flex items-baseline justify-between">
            <div className="text-label uppercase text-paper-ink-muted">Needs a reply</div>
            <div className="text-body-sm text-paper-ink-muted">{inputRequests.length}</div>
          </div>
          <div className="mt-3.5 flex flex-col">
            {inputRequests.map((r) => (
              <button
                key={r.id}
                onClick={() => open({ tag: "Needs a reply", title: r.title, facts: r.facts, options: r.options })}
                className="flex cursor-pointer items-center justify-between gap-4 border-t border-paper-ink/10 py-4 text-left"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="text-lead text-paper-ink">{r.title}</div>
                  <div className="text-body-sm text-paper-ink-muted">{r.from}</div>
                </div>
                <span className="flex-none rounded-panel bg-paper-ink px-3.5 py-2.5 text-meta font-bold text-paper-base">
                  Listen
                </span>
              </button>
            ))}
          </div>
        </div>

        <Card className="min-h-0">
          <CardHeader>
            <SectionLabel>Handled by Voxi</SectionLabel>
            <div className="text-body-sm text-text-muted">Today · {handledToday.length}</div>
          </CardHeader>
          <div className="mt-3.5 flex min-h-0 flex-col overflow-auto">
            {handledToday.map((e) => (
              <Link
                key={e.id}
                href={`/conversations/${e.id}`}
                className="flex gap-4 border-b border-line-subtle py-3 hover:bg-surface-2"
              >
                <div className="w-[46px] flex-none text-meta text-text-faint">{e.day}</div>
                <div className="min-w-0 flex-1 text-body text-text-secondary">{e.text}</div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
