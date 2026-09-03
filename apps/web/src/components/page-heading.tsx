export function PageHeading({ title, side }: { title: string; side?: string }) {
  return (
    <div className="flex items-baseline justify-between px-1 pb-3.5">
      <h1 className="text-display text-text-primary text-balance">{title}</h1>
      {side ? <div className="text-body text-text-muted">{side}</div> : null}
    </div>
  );
}
