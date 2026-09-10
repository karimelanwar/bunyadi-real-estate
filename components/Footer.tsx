import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-50 bg-brand-950 text-brand-50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo onDark className="h-11" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-brand-100">
            {t("about")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            {t("categories")}
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/residential" className="hover:text-white">
                {tNav("residential")}
              </Link>
            </li>
            <li>
              <Link href="/commercial" className="hover:text-white">
                {tNav("commercial")}
              </Link>
            </li>
            <li>
              <Link href="/business" className="hover:text-white">
                {tNav("business")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-200">
            {t("contact")}
          </h3>
          {/* Tappable on mobile — calling is the highest-intent action on a
              property site, and these were plain text. */}
          <ul className="mt-4 space-y-2 text-sm text-brand-100">
            <li>
              <address className="not-italic">{t("address")}</address>
            </li>
            <li>
              <a
                href={`tel:${t("phone").replace(/[^+\d]/g, "")}`}
                className="rounded transition-colors hover:text-white hover:underline"
              >
                {t("phone")}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${t("email")}`}
                className="rounded transition-colors hover:text-white hover:underline"
              >
                {t("email")}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-900 py-5">
        <p className="container-page text-center text-xs text-brand-300">
          © {year} Bunyadi Real Estate. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
