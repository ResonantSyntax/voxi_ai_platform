import { PageHeading } from "@/components/page-heading";
import { Card, SectionLabel } from "@/components/ui/card";
import { FactList } from "@/components/ui/fact-row";
import { businessFacts, callerFaqs } from "@/lib/mock-data";

// Q&A — Subscriber-authored deterministic source material Voxi answers from.
// The mock's business-facts panel and caller FAQs both land here (GHO-207);
// "Knowledge" stays reserved for Business document uploads, not yet built.
export default function QAPage() {
  return (
    <>
      <PageHeading title="Q&A" side="Last taught Monday" />
      <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2.5">
        <div className="flex items-center justify-between gap-8 rounded-panel bg-paper-base p-7 text-paper-ink">
          <div className="flex flex-col gap-1.5">
            <div className="text-lead text-paper-ink">Tell Voxi something new</div>
            <div className="text-body text-paper-ink-muted">
              Type it like you&rsquo;d say it. &ldquo;We don&rsquo;t do weekends any more.&rdquo;
            </div>
          </div>
          <button className="flex-none cursor-pointer rounded-panel bg-paper-ink px-5 py-3.5 text-body font-bold text-paper-base">
            Teach
          </button>
        </div>

        <div className="grid min-h-0 grid-cols-2 gap-2.5">
          <Card className="min-h-0">
            <SectionLabel>The business</SectionLabel>
            <div className="mt-3.5">
              <FactList facts={businessFacts} />
            </div>
          </Card>

          <Card className="min-h-0">
            <div className="flex items-baseline justify-between">
              <SectionLabel>Things callers ask</SectionLabel>
              <div className="text-body-sm text-text-muted">Voxi&rsquo;s answers</div>
            </div>
            <div className="mt-3.5 flex min-h-0 flex-col overflow-auto">
              {callerFaqs.map((f) => (
                <div key={f.id} className="flex flex-col gap-1 border-b border-line-subtle py-3.5">
                  <div className="text-body font-semibold text-text-primary">{f.q}</div>
                  <div className="text-body text-text-secondary text-balance">{f.a}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
