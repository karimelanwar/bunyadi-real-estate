"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import Logo from "@/components/ui/Logo";

const navItems = [
  { href: "/admin", key: "dashboard", exact: true },
  { href: "/admin/properties", key: "properties", exact: false },
  { href: "/admin/inquiries", key: "inquiries", exact: false },
] as const;

export default function AdminSidebar() {
  const t = useTranslations("admin");
  const tAuth = useTranslations("auth");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const linksMarkup = (
    <>
      {navItems.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? "bg-brand-600 text-white" : "text-brand-100 hover:bg-brand-800"
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold text-brand-200 hover:bg-brand-800"
      >
        {t("viewSite")}
      </Link>
    </>
  );

  return (
    <>
      <header className="flex items-center justify-between border-b border-brand-800 bg-brand-950 px-4 py-3 lg:hidden">
        <Logo priority onDark className="h-10 shrink-0" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-brand-700 p-2 text-brand-100"
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
        </button>
      </header>

      {open && (
        <div className="flex flex-col gap-1 border-b border-brand-800 bg-brand-950 p-3 lg:hidden">
          {linksMarkup}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 flex items-center rounded-lg px-4 py-2.5 text-start text-sm font-semibold text-brand-200 hover:bg-brand-800"
          >
            {tAuth("logout")}
          </button>
        </div>
      )}

      <aside className="hidden w-72 shrink-0 flex-col bg-brand-950 lg:flex">
        <div className="flex h-20 items-center justify-center border-b border-brand-800 px-3">
          <Logo priority onDark className="h-10 shrink-0" />
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">{linksMarkup}</nav>

        <div className="border-t border-brand-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-lg border border-brand-700 px-4 py-2.5 text-sm font-semibold text-brand-100 transition-colors hover:bg-brand-800"
          >
            {tAuth("logout")}
          </button>
        </div>
      </aside>
    </>
  );
}
