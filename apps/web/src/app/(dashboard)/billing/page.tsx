import { PageHeading } from "@/components/page-heading";
import { Card, SectionLabel } from "@/components/ui/card";
import { plan, usage, invoices } from "@/lib/mock-data";

export default function BillingPage() {
  return (
    <>
      <PageHeading title="Billing" side="Sole trader plan" />
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-[auto_1fr] gap-2.5">
        <div className="flex flex-col gap-5 rounded-panel bg-mint-base p-8 text-paper-ink">
          <div className="text-label uppercase text-[#065a3b]">Your plan</div>
          <div className="flex items-baseline gap-2.5">
            <div className="text-[44px] leading-[48px] font-bold tracking-[-1px] text-paper-ink">{plan.price}</div>
            <div className="text-body text-[#065a3b]">{plan.cadence}</div>
          </div>
          <div className="text-body text-[#065a3b] text-balance">{plan.renews}</div>
          <button className="self-start rounded-panel bg-paper-ink/10 px-4 py-2.5 text-body-sm font-semibold text-paper-ink">
            Change plan
          </button>
        </div>

        <Card className="gap-5">
          <SectionLabel>This month</SectionLabel>
          <div className="flex items-baseline gap-2.5">
            <div className="text-[44px] leading-[48px] font-bold tracking-[-1px] text-text-primary">{usage.used}</div>
            <div className="text-body text-text-muted">of {usage.of} hand-offs</div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-panel bg-surface-2">
            <div className="h-full bg-mint-base" style={{ width: `${usage.percent}%` }} />
          </div>
          <div className="text-body text-text-muted">{usage.note}</div>
        </Card>

        <Card className="col-span-2 min-h-0">
          <SectionLabel>Invoices</SectionLabel>
          <div className="mt-3.5 flex min-h-0 flex-col overflow-auto">
            {invoices.map((i) => (
              <div key={i.id} className="flex items-center gap-6 border-b border-line-subtle py-3.5">
                <div className="w-[140px] flex-none text-body text-text-primary">{i.date}</div>
                <div className="flex-1 text-body text-text-secondary">{i.desc}</div>
                <div className="text-body tabular-nums text-text-primary">{i.amount}</div>
                <div className="w-[50px] flex-none text-right text-body-sm font-bold text-lime-base">Paid</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
