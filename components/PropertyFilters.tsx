import { getTranslations } from "next-intl/server";
import { fieldControlClass } from "@/components/ui/Field";
import type { PropertyCategory } from "@/lib/types";

export interface PropertyFiltersProps {
  category: PropertyCategory;
  values: {
    city?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    sort?: string;
  };
}

export default async function PropertyFilters({
  category,
  values,
}: PropertyFiltersProps) {
  const t = await getTranslations("filters");
  const tListing = await getTranslations("listing");

  // Bedrooms is meaningless for a warehouse or a bakery.
  const showBedrooms = category === "RESIDENTIAL";
  const labelClass = "text-xs font-semibold text-brand-800";

  return (
    <form
      method="get"
      aria-label={t("title")}
      className="rounded-2xl border border-brand-100 bg-brand-50/40 p-5"
    >
      {/* auto-fit: fields stretch to fill the row evenly whether there are
          4 or 5 of them, instead of leaving a dead trailing cell. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className={labelClass}>
            {t("city")}
          </label>
          <input
            id="city"
            name="city"
            defaultValue={values.city}
            placeholder={t("cityAny")}
            className={fieldControlClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="minPrice" className={labelClass}>
            {t("minPrice")}
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="0"
            defaultValue={values.minPrice}
            className={fieldControlClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="maxPrice" className={labelClass}>
            {t("maxPrice")}
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t("noMax")}
            defaultValue={values.maxPrice}
            className={fieldControlClass}
          />
        </div>

        {showBedrooms && (
          <div className="flex flex-col gap-1">
            <label htmlFor="bedrooms" className={labelClass}>
              {t("bedrooms")}
            </label>
            <select
              id="bedrooms"
              name="bedrooms"
              defaultValue={values.bedrooms ?? ""}
              className={fieldControlClass}
            >
              <option value="">{t("bedroomsAny")}</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {t("bedroomsMin", { count: n })}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="sort" className={labelClass}>
            {tListing("sortBy")}
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={values.sort ?? "newest"}
            className={fieldControlClass}
          >
            <option value="newest">{tListing("sortNewest")}</option>
            <option value="price_asc">{tListing("sortPriceLow")}</option>
            <option value="price_desc">{tListing("sortPriceHigh")}</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t("apply")}
        </button>
        <a
          href="?"
          className="inline-flex items-center justify-center rounded-lg border border-brand-300 bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          {t("reset")}
        </a>
      </div>
    </form>
  );
}
