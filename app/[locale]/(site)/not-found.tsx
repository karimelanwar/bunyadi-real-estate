import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Sits inside the (site) layout so a bad property slug keeps the Navbar and
// Footer instead of dropping the visitor onto a bare page.
export default async function SiteNotFound() {
  const t = await getTranslations("notFound");
  const tNav = await getTranslations("nav");

  const links = [
    { href: "/residential", label: tNav("residential") },
    { href: "/commercial", label: tNav("commercial") },
    { href: "/business", label: tNav("business") },
  ] as const;

  return (
    <div className="container-page flex min-h-[55vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">{t("title")}</h1>
      <p className="max-w-md text-brand-700">{t("body")}</p>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {t("cta")}
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center justify-center rounded-lg border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
