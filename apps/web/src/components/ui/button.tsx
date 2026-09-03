"use client";

import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/lib/cx";

type Variant = "primary" | "secondary" | "agent" | "chip";

const VARIANT_CLASS: Record<Variant, string> = {
  // Flat mint = the Subscriber does it.
  primary: "bg-mint-base text-surface-bg font-bold hover:bg-mint-hover",
  secondary: "bg-surface text-text-secondary border border-line-default font-semibold hover:bg-surface-2",
  // Outlined mint = Voxi does it.
  agent: "bg-mint-tint text-mint-base border border-mint-line font-bold hover:border-mint-line-soft",
  chip: "bg-surface-bg text-text-primary font-bold",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cx(
        "cursor-pointer rounded-panel px-5 py-3 text-body-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg",
        "disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASS[variant],
        className
      )}
      {...props}
    />
  );
}
