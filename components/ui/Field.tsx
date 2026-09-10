import type { ReactNode } from "react";

// Shared input styling. Border is brand-300 rather than brand-100 so the
// control boundary actually meets WCAG 1.4.11 (3:1) against white.
export const fieldControlClass =
  "w-full rounded-lg border border-brand-300 bg-white px-3 py-2.5 text-sm text-brand-950 transition-colors placeholder:text-brand-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 disabled:bg-brand-50 disabled:text-brand-600";

export const fieldControlErrorClass =
  "w-full rounded-lg border border-red-500 bg-white px-3 py-2.5 text-sm text-brand-950 transition-colors placeholder:text-brand-500 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20";

export function controlClass(hasError?: boolean) {
  return hasError ? fieldControlErrorClass : fieldControlClass;
}

// For <select> only. A native select's own chrome doesn't line up with a
// plain <input> at the same padding, so this strips it (`select-arrow`,
// defined in globals.css) and draws a matching custom arrow — the box is
// then exactly as tall as an input using fieldControlClass.
export const fieldSelectClass = `${fieldControlClass} select-arrow pe-9`;
export const fieldSelectErrorClass = `${fieldControlErrorClass} select-arrow pe-9`;

export function selectControlClass(hasError?: boolean) {
  return hasError ? fieldSelectErrorClass : fieldSelectClass;
}

interface FieldProps {
  /** Must match the `id` of the control rendered as a child. */
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Field({
  htmlFor,
  label,
  error,
  hint,
  required,
  className = "",
  children,
}: FieldProps) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-brand-800">
        {label}
        {required && (
          <span className="ms-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-brand-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Wire a control to its Field's hint/error for screen readers. */
export function describedBy(htmlFor: string, hasError?: boolean, hasHint?: boolean) {
  const ids = [hasHint && !hasError ? `${htmlFor}-hint` : null, hasError ? `${htmlFor}-error` : null]
    .filter(Boolean)
    .join(" ");
  return ids || undefined;
}
