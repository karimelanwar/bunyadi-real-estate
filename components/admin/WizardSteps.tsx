"use client";

export interface WizardStep {
  id: string;
  label: string;
  hint: string;
}

/**
 * Progress header for the create-listing wizard. Completed steps are clickable
 * so an admin can jump back without losing their place; steps ahead stay locked
 * until the current one validates.
 */
export default function WizardSteps({
  steps,
  current,
  furthest,
  onSelect,
}: {
  steps: WizardStep[];
  current: number;
  furthest: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Progress" className="rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
      <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
        {steps.map((step, index) => {
          const isCurrent = index === current;
          const isComplete = index < furthest;
          const reachable = index <= furthest;

          return (
            // min-w-0 lets the item shrink past its label's min-content width;
            // without it the row overflows and the `truncate` below never
            // engages, pushing the page sideways at tablet widths.
            <li key={step.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => reachable && onSelect(index)}
                disabled={!reachable}
                aria-current={isCurrent ? "step" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors ${
                  isCurrent
                    ? "border-brand-600 bg-brand-50"
                    : reachable
                      ? "border-brand-200 hover:bg-brand-50"
                      : "cursor-not-allowed border-brand-100 opacity-60"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-brand-600 text-white"
                      : isComplete
                        ? "bg-brand-600/15 text-brand-700"
                        : "bg-brand-100 text-brand-700"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block truncate text-sm font-semibold ${
                      isCurrent ? "text-brand-900" : "text-brand-800"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-xs text-brand-600">{step.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
