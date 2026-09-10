import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getDashboardStats, getProperties, toCardData } from "@/lib/properties";
import { formatPrice } from "@/lib/format";
import { Link } from "@/i18n/navigation";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import { buttonClass } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin");
  const tCat = await getTranslations("categories");

  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    getProperties({ onlyPublished: false, page: 1, pageSize: 6 }),
  ]);

  const recentCards = recent.items.map((p) => ({ raw: p, card: toCardData(p) }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950">{t("overview")}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label={t("totalProperties")} value={stats.total} accent />
        <StatCard label={t("publishedProperties")} value={stats.published} />
        <StatCard label={t("draftProperties")} value={stats.draft} />
        <StatCard label={t("newInquiries")} value={stats.newInquiries} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label={t("underOfferProperties")} value={stats.underOffer} />
        <StatCard label={t("soldProperties")} value={stats.sold} />
        <StatCard label={t("letAgreedProperties")} value={stats.letAgreed} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={tCat("RESIDENTIAL")} value={stats.residential} />
        <StatCard label={tCat("COMMERCIAL")} value={stats.commercial} />
        <StatCard label={tCat("BUSINESS")} value={stats.business} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-950">{t("recentProperties")}</h2>
          <Link href="/admin/properties/new" className={buttonClass()}>
            + {t("addProperty")}
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
          <table className="w-full text-start text-sm">
            <thead className="bg-brand-50/60 text-xs uppercase tracking-wide text-brand-600">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("form.title")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("form.category")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("form.price")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("form.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {recentCards.map(({ raw, card }) => (
                <tr key={raw.id} className="hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/properties/${raw.id}/edit`}
                      className="font-semibold text-brand-800 hover:underline"
                    >
                      {card.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brand-600">{tCat(card.category)}</td>
                  <td className="px-4 py-3 text-brand-600">
                    {formatPrice(card.price, card.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={card.status} />
                  </td>
                </tr>
              ))}
              {recentCards.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-brand-500">
                    {t("noProperties")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
