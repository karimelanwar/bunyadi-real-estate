import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CategoryListingPage from "@/components/CategoryListingPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("listing");
  return { title: t("commercialTitle"), description: t("commercialSubtitle") };
}

export default function CommercialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <CategoryListingPage
      category="COMMERCIAL"
      titleKey="commercialTitle"
      subtitleKey="commercialSubtitle"
      searchParams={searchParams}
    />
  );
}
