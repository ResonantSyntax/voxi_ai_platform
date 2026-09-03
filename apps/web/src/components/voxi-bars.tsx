// The small pulsing-bars indicator used inline in cards ("Live now", "Voxi is
// on it") — distinct from <VoxiOrb>, which is the circular signature
// component reserved for the nav rail. See DESIGN.md "The Orb".
export function VoxiBars({
  heights,
  color = "currentColor",
}: {
  heights: number[];
  color?: string;
}) {
  return (
    <div className="flex items-center gap-[3px]" style={{ height: Math.max(...heights) }}>
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-[3px] rounded-[2px] motion-safe:animate-[voxi-bar_1.4s_ease-in-out_infinite]"
          style={{ height: h, backgroundColor: color, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
