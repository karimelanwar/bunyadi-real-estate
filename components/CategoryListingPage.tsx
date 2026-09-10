import { getTranslations } from "next-intl/server";
import { getProperties, toCardData } from "@/lib/properties";
import type { PropertyCategory } from "@/lib/types";
import { listingSearchParamsSchema } from "@/lib/validation";
import PropertyFilters from "./PropertyFilters";
import PropertyGrid from "./PropertyGrid";
import Pagination from "./Pagination";

interface Props {
  category: PropertyCategory;
  titleKey: "residentialTitle" | "commercialTitle" | "businessTitle";
  subtitleKey: "residentialSubtitle" | "commercialSubtitle" | "businessSubtitle";
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CategoryListingPage({
  category,
  titleKey,
  subtitleKey,
  searchParams,
}: Props) {
  const sp = await searchParams;
  const t = await getTranslations("listing");

  // Search params are attacker-controlled: `?page=-5` used to produce a
  // negative Prisma `skip` and `?minPrice=abc` a NaN comparison, both 500s.
  const params = listingSearchParamsSchema.parse(sp);
  const hasActiveFilters = Boolean(
    params.city || params.minPrice || params.maxPrice || params.bedrooms
  );

  const result = await getProperties({
    category,
    city: params.city,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    bedrooms: params.bedrooms,
    sort: params.sort,
    page: params.page,
    pageSize: 9,
  });

  const cards = result.items.map((p) => toCardData(p));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">{t(titleKey)}</h1>
        <p className="mt-2 text-brand-600">{t(subtitleKey)}</p>
      </div>

      <div className="mb-8">
        <PropertyFilters
          category={category}
          values={{
            city: sp.city,
            minPrice: sp.minPrice,
            maxPrice: sp.maxPrice,
            bedrooms: sp.bedrooms,
            sort: sp.sort,
          }}
        />
      </div>

      <p className="mb-4 text-sm font-medium text-brand-700">
        {t("resultsCount", { count: result.total })}
      </p>

      <PropertyGrid properties={cards} hasActiveFilters={hasActiveFilters} />

      <Pagination page={result.page} pageCount={result.pageCount} searchParams={sp} />
    </div>
  );
}
