import { getTranslations } from "next-intl/server";
import { fieldControlClass } from "@/components/ui/Field";
import { AVAILABILITY_VALUES } from "@/lib/property-display";

export default async function AdminPropertyFilters({
  values,
}: {
  values: { search?: string; category?: string; status?: string; availability?: string };
}) {
  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const tCat = await getTranslations("categories");
  const tAvail = await getTranslations("availability");
  const tFilters = await getTranslations("filters");

  const labelClass = "mb-1 block text-xs font-semibold text-brand-700";

  return (
    <form
      method="get"
      aria-label={tFilters("title")}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]"
    >
      <div>
        <label htmlFor="search" className={labelClass}>
          {t("searchProperties")}
        </label>
        <input
          id="search"
          name="search"
          defaultValue={values.search}
          placeholder={t("searchProperties")}
          className={fieldControlClass}
        />
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>
          {t("filterCategory")}
        </label>
        <select
          id="category"
          name="category"
          defaultValue={values.category ?? ""}
          className={fieldControlClass}
        >
          <option value="">{tCommon("all")}</option>
          <option value="RESIDENTIAL">{tCat("RESIDENTIAL")}</option>
          <option value="COMMERCIAL">{tCat("COMMERCIAL")}</option>
          <option value="BUSINESS">{tCat("BUSINESS")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className={labelClass}>
          {t("filterStatus")}
        </label>
        <select
          id="status"
          name="status"
          defaultValue={values.status ?? ""}
          className={fieldControlClass}
        >
          <option value="">{tCommon("all")}</option>
          <option value="PUBLISHED">{tCommon("published")}</option>
          <option value="DRAFT">{tCommon("draft")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="availability" className={labelClass}>
          {t("filterAvailability")}
        </label>
        <select
          id="availability"
          name="availability"
          defaultValue={values.availability ?? ""}
          className={fieldControlClass}
        >
          <option value="">{tCommon("all")}</option>
          {AVAILABILITY_VALUES.map((value) => (
            <option key={value} value={value}>
              {tAvail(value)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {tFilters("apply")}
        </button>
        <a
          href="?"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-300 px-5 py-2.5 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
        >
          {tFilters("reset")}
        </a>
      </div>
    </form>
  );
}
