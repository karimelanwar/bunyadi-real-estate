import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CtaSection() {
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  // There is no all-categories index, so offer the three real destinations
  // rather than a "View all properties" button that only reached Residential.
  const links = [
    { href: "/residential", label: tNav("residential") },
    { href: "/commercial", label: tNav("commercial") },
    { href: "/business", label: tNav("business") },
  ] as const;

  return (
    <section className="bg-brand-600">
      <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">{t("ctaTitle")}</h2>
        <p className="max-w-xl text-brand-50">{t("ctaSubtitle")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-transform hover:scale-105 motion-reduce:transform-none"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
