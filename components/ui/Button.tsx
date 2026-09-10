import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:hover:bg-brand-600",
  secondary:
    "border border-brand-300 bg-white text-brand-800 hover:bg-brand-50 disabled:hover:bg-white",
  danger: "border border-red-300 bg-white text-red-700 hover:bg-red-50 disabled:hover:bg-white",
  ghost: "text-brand-700 hover:bg-brand-50 disabled:hover:bg-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

// One button shape for the whole app. Previously five files each defined their
// own padding/radius, so the primary CTA was a pill on some pages and a
// rounded rect on others.
//
// Exported because a CTA is often a link, not a <button> — `Button` can't
// render an <a>/next-intl <Link>, so those call sites take the class instead
// of hand-copying the recipe (which is how the shapes drifted apart before).
export function buttonClass({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className = "", type = "button", ...props },
  ref
) {
  return (
    <button ref={ref} type={type} className={buttonClass({ variant, size, className })} {...props} />
  );
});

export default Button;
