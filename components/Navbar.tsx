"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";

const links = [
  { href: "/residential", key: "residential" },
  { href: "/commercial", key: "commercial" },
  { href: "/business", key: "business" },
] as const;

export default function Navbar() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change and on Escape.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/95 shadow-sm backdrop-blur">
      <nav
        aria-label={t("primary")}
        className="container-page flex h-20 items-center justify-between gap-4"
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo priority className="h-10 sm:h-11" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.key}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-brand-600 text-white"
                    : "text-brand-800 hover:bg-brand-50"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? tCommon("close") : t("openMenu")}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-brand-300 text-brand-800 md:hidden"
        >
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-brand-100 bg-white px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-4 py-3 text-base font-semibold ${
                    active
                      ? "bg-brand-600 text-white"
                      : "text-brand-800 hover:bg-brand-50"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
