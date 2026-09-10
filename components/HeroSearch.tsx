"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Button from "@/components/ui/Button";
import { fieldControlClass, fieldSelectClass } from "@/components/ui/Field";

const CATEGORY_PATHS = {
  RESIDENTIAL: "/residential",
  COMMERCIAL: "/commercial",
  BUSINESS: "/business",
} as const;

const labelClass = "text-xs font-semibold text-brand-700";

export default function HeroSearch() {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const tFilters = useTranslations("filters");
  const router = useRouter();

  const [category, setCategory] = useState<keyof typeof CATEGORY_PATHS>("RESIDENTIAL");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const qs = params.toString();
    router.push(`${CATEGORY_PATHS[category]}${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-cardHover sm:grid-cols-2 lg:grid-cols-5 lg:p-5"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="hero-category" className={labelClass}>
          {t("searchCategory")}
        </label>
        <select
          id="hero-category"
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as keyof typeof CATEGORY_PATHS)}
          className={fieldSelectClass}
        >
          {Object.keys(CATEGORY_PATHS).map((key) => (
            <option key={key} value={key}>
              {tCat(key as "RESIDENTIAL" | "COMMERCIAL" | "BUSINESS")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1 lg:col-span-2">
        <label htmlFor="hero-city" className={labelClass}>
          {t("searchCity")}
        </label>
        <input
          id="hero-city"
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("searchCityPlaceholder")}
          className={fieldControlClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="hero-min-price" className={labelClass}>
          {t("searchMinPrice")}
        </label>
        <input
          id="hero-min-price"
          name="minPrice"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          type="number"
          min={0}
          inputMode="numeric"
          placeholder="0"
          className={fieldControlClass}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="hero-max-price" className={labelClass}>
          {t("searchMaxPrice")}
        </label>
        <input
          id="hero-max-price"
          name="maxPrice"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          type="number"
          min={0}
          inputMode="numeric"
          placeholder={tFilters("noMax")}
          className={fieldControlClass}
        />
      </div>

      <Button type="submit" size="lg" className="sm:col-span-2 lg:col-span-5">
        {t("searchButton")}
      </Button>
    </form>
  );
}
