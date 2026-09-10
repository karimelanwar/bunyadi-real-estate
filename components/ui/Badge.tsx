import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "solid";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  success: "bg-brand-600 text-white",
  warning: "bg-amber-100 text-amber-900 ring-1 ring-inset ring-amber-300",
  danger: "bg-red-100 text-red-800 ring-1 ring-inset ring-red-300",
  info: "bg-white/95 text-brand-800 shadow-sm",
  solid: "bg-brand-950 text-white",
};

export default function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
