import { PageHeading } from "@/components/page-heading";
import { Card, SectionLabel } from "@/components/ui/card";
import { rules } from "@/lib/mock-data";

// Rules — how Voxi should handle relevant Conversations. Split out of the
// mock's "Knowledge" tab per GHO-207 ("Never say: prices over the phone" →
// a Rule). Cannot control whether the Subscriber's phone rings (ADR-0001).
export default function RulesPage() {
  return (
    <>
      <PageHeading title="Rules" side={`${rules.length} active`} />
      <div className="flex min-h-0 flex-1 flex-col gap-2.5">
        <Card className="min-h-0">
          <div className="flex items-baseline justify-between">
            <SectionLabel>What Voxi won&rsquo;t do</SectionLabel>
            <button className="cursor-pointer rounded-panel bg-mint-tint px-4 py-2.5 text-body-sm font-bold text-mint-base">
              Add a rule
            </button>
          </div>
          <div className="mt-3.5 flex flex-col">
            {rules.map((r) => (
              <div key={r.id} className="flex flex-col gap-1 border-b border-line-subtle py-4">
                <div className="text-lead text-text-primary text-balance">{r.label}</div>
                <div className="text-body-sm text-text-muted">{r.detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
