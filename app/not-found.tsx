import { getLocale, getTranslations } from "next-intl/server";

// Deliberately uses a plain <a> instead of next-intl's <Link>: this file
// lives outside app/[locale]/layout.tsx (see the comment in app/layout.tsx
// for why), so there's no NextIntlClientProvider in the tree here. next-intl's
// Link needs that context to hydrate on the client and would throw a
// client-side exception without it — a plain anchor with a locale-prefixed
// href needs no such context and works everywhere.
export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations("notFound");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG doesn't need next/image's raster optimization */}
      <img src="/logo.svg" alt="Bunyadi Real Estate" width={576} height={100} className="h-8 w-auto object-contain" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-950 sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-md text-brand-600">{t("body")}</p>
      </div>
      <a
        href={`/${locale}`}
        className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t("cta")}
      </a>
    </div>
  );
}
