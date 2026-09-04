export function PageHeading({
  title,
  side,
  sideClassName = "text-text-muted",
}: {
  title: string;
  side?: string;
  sideClassName?: string;
}) {
  return (
    <div className="flex items-baseline justify-between px-1 pb-3.5">
      <h1 className="text-display text-text-primary text-balance">{title}</h1>
      {side ? <div className={`text-body ${sideClassName}`}>{side}</div> : null}
    </div>
  );
}
