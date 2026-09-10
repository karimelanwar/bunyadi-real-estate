import { getTranslations } from "next-intl/server";
import PropertyCard from "./PropertyCard";
import type { PropertyCardData } from "@/lib/types";

export default async function PropertyGrid({
  properties,
  hasActiveFilters = false,
}: {
  properties: PropertyCardData[];
  hasActiveFilters?: boolean;
}) {
  const t = await getTranslations("common");

  if (properties.length === 0) {
    // "No properties match your filters" is wrong when the visitor hasn't set
    // any — that's an empty catalogue, not a failed search.
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 px-6 py-14 text-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-10 w-10 text-brand-500"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"
          />
        </svg>
        <p className="text-base font-semibold text-brand-900">
          {hasActiveFilters ? t("noResults") : t("noListingsYet")}
        </p>
        <p className="max-w-sm text-sm text-brand-700">
          {hasActiveFilters ? t("noResultsHint") : t("noListingsYetHint")}
        </p>
        {hasActiveFilters && (
          <a
            href="?"
            className="mt-1 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {t("clearFilters")}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
