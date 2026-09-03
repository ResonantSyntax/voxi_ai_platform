import { cx } from "@/lib/cx";

const BAR_HEIGHTS = [10, 18, 14];
const BAR_COLORS = ["mint-base", "mint-base", "mint-hover"];

// Voxi has no face — four... in this frame, three pulsing bars are its whole
// body. See DESIGN.md "The Orb". Respects prefers-reduced-motion via the
// motion-safe: variant.
export function VoxiOrb({ size = 44, active = true }: { size?: number; active?: boolean }) {
  return (
    <div
      className="relative flex flex-none items-center justify-center gap-[3px] rounded-pill border border-mint-base bg-surface"
      style={{ width: size, height: size }}
    >
      {active && (
        <div
          aria-hidden
          className="absolute inset-[-40%] rounded-pill motion-safe:animate-[voxi-glow_3.4s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, rgba(10,239,154,.22), transparent 70%)" }}
        />
      )}
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={cx(
            "relative w-[3px] rounded-[2px]",
            BAR_COLORS[i] === "mint-hover" ? "bg-mint-hover" : "bg-mint-base",
            active && "motion-safe:animate-[voxi-bar_1.4s_ease-in-out_infinite]"
          )}
          style={{ height: h, animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}
