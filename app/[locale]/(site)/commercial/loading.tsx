import PropertyGridSkeleton from "@/components/PropertyGridSkeleton";

export default function Loading() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <div className="h-9 w-64 animate-pulse rounded bg-brand-100" />
        <div className="mt-3 h-4 w-80 animate-pulse rounded bg-brand-100" />
      </div>
      <div className="mb-8 h-32 animate-pulse rounded-2xl bg-brand-50" />
      <PropertyGridSkeleton count={9} />
    </div>
  );
}
