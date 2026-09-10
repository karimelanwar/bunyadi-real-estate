import { getLocale, getTranslations } from "next-intl/server";
import Logo from "@/components/ui/Logo";
import { buttonClass } from "@/components/ui/Button";

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
      <Logo className="h-8" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-950 sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 max-w-md text-brand-600">{t("body")}</p>
      </div>
      <a href={`/${locale}`} className={buttonClass({ size: "lg" })}>
        {t("cta")}
      </a>
    </div>
  );
}
