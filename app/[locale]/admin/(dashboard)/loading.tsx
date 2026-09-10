export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading</span>
      <div className="h-8 w-48 animate-pulse rounded bg-brand-100" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-brand-100" aria-hidden="true" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-2xl bg-brand-100" aria-hidden="true" />
    </div>
  );
}
