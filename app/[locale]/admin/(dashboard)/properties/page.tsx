import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProperties, toCardData } from "@/lib/properties";
import { Link } from "@/i18n/navigation";
import AdminPropertyFilters from "@/components/admin/AdminPropertyFilters";
import AdminPropertiesTable from "@/components/admin/AdminPropertiesTable";
import Pagination from "@/components/Pagination";
import type { Availability, PropertyCategory, PropertyStatus } from "@/lib/types";
import { AVAILABILITY_VALUES } from "@/lib/property-display";

export const metadata: Metadata = { title: "Properties" };

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("admin");
  const page = Number(sp.page ?? "1") || 1;

  const validCategory = ["RESIDENTIAL", "COMMERCIAL", "BUSINESS"].includes(sp.category ?? "")
    ? (sp.category as PropertyCategory)
    : undefined;
  const validStatus = ["PUBLISHED", "DRAFT"].includes(sp.status ?? "")
    ? (sp.status as PropertyStatus)
    : undefined;
  const validAvailability = AVAILABILITY_VALUES.includes(sp.availability as Availability)
    ? (sp.availability as Availability)
    : undefined;

  const result = await getProperties({
    onlyPublished: false,
    category: validCategory,
    status: validStatus,
    availability: validAvailability,
    search: sp.search,
    page,
    pageSize: 10,
  });

  const cards = result.items.map((p) => toCardData(p));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-950">{t("manageProperties")}</h1>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + {t("addProperty")}
        </Link>
      </div>

      <div className="mb-6">
        <AdminPropertyFilters
          values={{
            search: sp.search,
            category: sp.category,
            status: sp.status,
            availability: sp.availability,
          }}
        />
      </div>

      <AdminPropertiesTable properties={cards} />

      <Pagination page={result.page} pageCount={result.pageCount} searchParams={sp} />
    </div>
  );
}
