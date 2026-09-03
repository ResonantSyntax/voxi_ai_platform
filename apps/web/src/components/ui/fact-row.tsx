import type { Fact } from "@/lib/mock-data";

export function FactRow({ k, v }: Fact) {
  return (
    <div className="flex gap-5 border-b border-line-subtle py-3.5">
      <div className="w-[74px] flex-none text-body-sm text-text-faint">{k}</div>
      <div className="min-w-0 flex-1 text-body text-text-primary">{v}</div>
    </div>
  );
}

export function FactList({ facts }: { facts: Fact[] }) {
  return (
    <div className="flex flex-col">
      {facts.map((f) => (
        <FactRow key={f.k} {...f} />
      ))}
    </div>
  );
}
