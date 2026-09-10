import { getTranslations } from "next-intl/server";
import { getFeaturedProperties, toCardData } from "@/lib/properties";
import PropertyCard from "./PropertyCard";

export default async function FeaturedProperties() {
  const t = await getTranslations("home");
  const properties = await getFeaturedProperties(6);

  if (properties.length === 0) return null;

  const cards = properties.map((p) => toCardData(p));

  return (
    <section className="bg-brand-50/40 py-14 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-brand-950 sm:text-4xl">{t("featuredTitle")}</h2>
          <p className="mt-3 text-brand-600">{t("featuredSubtitle")}</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
