import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CategoryListingPage from "@/components/CategoryListingPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("listing");
  return { title: t("businessTitle"), description: t("businessSubtitle") };
}

export default function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <CategoryListingPage
      category="BUSINESS"
      titleKey="businessTitle"
      subtitleKey="businessSubtitle"
      searchParams={searchParams}
    />
  );
}
