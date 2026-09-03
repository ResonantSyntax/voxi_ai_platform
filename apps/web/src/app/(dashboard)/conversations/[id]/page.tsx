"use client";

import Link from "next/link";
import { use } from "react";
import { cx } from "@/lib/cx";
import { liveConversation } from "@/lib/mock-data";

// Not shaped by the Desktop mockup — GHO-207 flags Conversation Detail as
// needing its own layout pass. This is a functional placeholder wired to the
// approved token set, not the final design.
export default function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col gap-6 py-2">
      <Link href="/conversations" className="text-body font-semibold text-mint-base">
        ‹ Conversations
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="text-title text-text-primary text-balance">{liveConversation.who}</h1>
        <div className="text-meta text-text-muted">
          Conversation {id} · {liveConversation.meta}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-panel border border-line-default bg-surface p-6">
        <div className="text-label uppercase text-text-tertiary">Transcript</div>
        <div className="flex flex-col gap-3">
          {liveConversation.transcript.map((m, i) => (
            <TurnBubble key={i} speaker={m.who} text={m.text} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TurnBubble({ speaker, text }: { speaker: "Caller" | "Voxi"; text: string }) {
  const isVoxi = speaker === "Voxi";
  return (
    <div className={cx("flex flex-col gap-1", isVoxi ? "items-start" : "items-start")}>
      <div className={cx("text-[10.5px] font-bold uppercase tracking-[1.1px]", isVoxi ? "text-mint-base" : "text-text-tertiary")}>
        {speaker}
      </div>
      <div
        className={cx(
          "max-w-[85%] rounded-tl-[18px] rounded-tr-[18px] rounded-bl-[6px] rounded-br-[18px] px-4 py-3.5 text-body text-balance",
          isVoxi ? "bg-mint-tint text-mint-hover" : "border border-line-default bg-surface-2 text-text-primary"
        )}
      >
        {text}
      </div>
    </div>
  );
}
