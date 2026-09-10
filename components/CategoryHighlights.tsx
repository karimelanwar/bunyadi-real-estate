import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const items = [
  {
    key: "RESIDENTIAL",
    href: "/residential",
    descKey: "residentialDesc" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    key: "COMMERCIAL",
    href: "/commercial",
    descKey: "commercialDesc" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V7a1 1 0 0 1 1-1h6v15M11 21V3h7a1 1 0 0 1 1 1v17" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 10h.01M7.5 13h.01M7.5 16h.01M14.5 7h.01M14.5 10h.01M14.5 13h.01M14.5 16h.01" />
      </svg>
    ),
  },
  {
    key: "BUSINESS",
    href: "/business",
    descKey: "businessDesc" as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v13H3V7Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
      </svg>
    ),
  },
];

export default async function CategoryHighlights() {
  const t = await getTranslations("home");
  const tCat = await getTranslations("categories");
  const tCommon = await getTranslations("common");

  return (
    <section className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-brand-950 sm:text-4xl">{t("categoriesTitle")}</h2>
        <p className="mt-3 text-brand-600">{t("categoriesSubtitle")}</p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="group flex flex-col items-start gap-4 rounded-2xl border border-brand-100 bg-white p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
              {item.icon}
            </span>
            <h3 className="text-xl font-bold text-brand-950">
              {tCat(item.key as "RESIDENTIAL" | "COMMERCIAL" | "BUSINESS")}
            </h3>
            <p className="text-sm text-brand-600">{t(item.descKey)}</p>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:underline">
              {tCommon("seeAll")}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 4.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414-1.414L13.586 11H4a1 1 0 1 1 0-2h9.586l-3.293-3.293a1 1 0 0 1 0-1.414Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
