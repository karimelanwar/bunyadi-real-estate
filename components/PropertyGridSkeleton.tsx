export default function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      <span className="sr-only">Loading properties</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card"
          aria-hidden="true"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-brand-100" />
          <div className="flex flex-col gap-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-brand-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-brand-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-brand-100" />
            <div className="mt-2 h-5 w-1/3 animate-pulse rounded bg-brand-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
