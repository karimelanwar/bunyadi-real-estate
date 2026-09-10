"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatReference } from "@/lib/format";
import type { InquiryStatus } from "@/lib/types";

export interface InquiryRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  propertyTitle: string | null;
  propertyReference: number | null;
  message: string;
  status: InquiryStatus;
  dateFormatted: string;
}

export default function AdminInquiriesTable({ inquiries }: { inquiries: InquiryRow[] }) {
  const t = useTranslations("admin.inquiriesTable");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function mutate(id: string, run: () => Promise<Response>) {
    setPendingId(id);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) {
        setError(res.status === 401 ? tAdmin("sessionExpired") : tAdmin("actionFailed"));
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError(tAdmin("actionFailed"));
    } finally {
      setPendingId(null);
    }
  }

  function toggleStatus(id: string, status: InquiryStatus) {
    const nextStatus = status === "COMPLETED" ? "NEW" : "COMPLETED";
    return mutate(id, () =>
      fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    return mutate(id, () => fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" }));
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center text-brand-600">
        {t("noInquiries")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
      <table className="w-full min-w-[840px] text-start text-sm">
        <thead className="bg-brand-50/60 text-xs uppercase tracking-wide text-brand-700">
          <tr>
            <th className="px-4 py-3 text-start font-semibold">{t("name")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("phone")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("email")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("property")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("message")}</th>
            <th className="px-4 py-3 text-start font-semibold">{t("date")}</th>
            <th className="px-4 py-3 text-start font-semibold">{tCommon("status")}</th>
            <th className="px-4 py-3 text-start font-semibold">{tCommon("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-100">
          {inquiries.map((inquiry) => {
            const completed = inquiry.status === "COMPLETED";
            const busy = pendingId === inquiry.id;
            return (
              <tr key={inquiry.id} className={`align-top hover:bg-brand-50/40 ${busy ? "opacity-50" : ""}`}>
                <td className="px-4 py-3 font-semibold text-brand-900">{inquiry.name}</td>
                <td className="px-4 py-3 text-brand-600" dir="ltr">
                  {inquiry.phone}
                </td>
                <td className="px-4 py-3 text-brand-600">{inquiry.email ?? "—"}</td>
                <td className="px-4 py-3 text-brand-600">
                  {inquiry.propertyTitle ? (
                    <>
                      <p>{inquiry.propertyTitle}</p>
                      {inquiry.propertyReference !== null && (
                        <p className="text-xs text-brand-500">
                          {formatReference(inquiry.propertyReference)}
                        </p>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-xs px-4 py-3 text-brand-600">
                  <p className="line-clamp-3">{inquiry.message}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-brand-500">{inquiry.dateFormatted}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      completed ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {completed ? t("completed") : t("new")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleStatus(inquiry.id, inquiry.status)}
                      className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                    >
                      {completed ? t("markNew") : t("markComplete")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(inquiry.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {tCommon("delete")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
