import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata: Metadata = { title: "Add Property" };

export default async function NewPropertyPage() {
  const t = await getTranslations("admin");

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-950">{t("addProperty")}</h1>
      <PropertyForm mode="create" />
    </div>
  );
}
