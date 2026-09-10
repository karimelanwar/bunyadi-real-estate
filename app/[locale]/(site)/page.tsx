import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HeroSearch from "@/components/HeroSearch";
import CategoryHighlights from "@/components/CategoryHighlights";
import FeaturedProperties from "@/components/FeaturedProperties";
import AboutStats from "@/components/AboutStats";
import CtaSection from "@/components/CtaSection";
import ShieldIcon from "@/components/icons/ShieldIcon";
import KeyIcon from "@/components/icons/KeyIcon";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white">
        <div className="container-page grid gap-14 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight text-brand-950 sm:text-5xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-700">{t("heroSubtitle")}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white/80 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <ShieldIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-950">{t("heroLandlordTitle")}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brand-600">
                    {t("heroLandlordBody")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white/80 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <KeyIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-brand-950">{t("heroTenantTitle")}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-brand-600">
                    {t("heroTenantBody")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-brand-100/60 blur-2xl" />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] shadow-cardHover">
              <Image
                src="/images/hero-agent.png"
                alt="Bunyadi Real Estate agent"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-6 start-6 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-cardHover sm:start-8">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-extrabold leading-tight text-brand-950">
                  {t("heroBadgeTitle")}
                </p>
                <p className="text-xs font-medium text-brand-600">{t("heroBadgeSubtitle")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container-page pb-16 sm:pb-24">
          <HeroSearch />
        </div>
      </section>

      <CategoryHighlights />
      <FeaturedProperties />
      <AboutStats />
      <CtaSection />
    </div>
  );
}
