import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CategoryListingPage from "@/components/CategoryListingPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("listing");
  return { title: t("residentialTitle"), description: t("residentialSubtitle") };
}

export default function ResidentialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <CategoryListingPage
      category="RESIDENTIAL"
      titleKey="residentialTitle"
      subtitleKey="residentialSubtitle"
      searchParams={searchParams}
    />
  );
}
