"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatReference } from "@/lib/format";
import Button from "@/components/ui/Button";
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
  const [selected, setSelected] = useState<InquiryRow | null>(null);
  const [, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // showModal() (rather than the `open` attribute) is what gets us Escape to
  // close, focus containment, and an inert background for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) dialog.showModal();
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

  async function mutate(id: string, run: () => Promise<Response>): Promise<boolean> {
    setPendingId(id);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) {
        setError(res.status === 401 ? tAdmin("sessionExpired") : tAdmin("actionFailed"));
        return false;
      }
      startTransition(() => router.refresh());
      return true;
    } catch {
      setError(tAdmin("actionFailed"));
      return false;
    } finally {
      setPendingId(null);
    }
  }

  async function toggleStatus(inquiry: InquiryRow) {
    const nextStatus: InquiryStatus = inquiry.status === "COMPLETED" ? "NEW" : "COMPLETED";
    const ok = await mutate(inquiry.id, () =>
      fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
    );
    // Keep the open dialog in step with the row behind it.
    if (ok) {
      setSelected((prev) => (prev && prev.id === inquiry.id ? { ...prev, status: nextStatus } : prev));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    const ok = await mutate(id, () => fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" }));
    if (ok) setSelected((prev) => (prev?.id === id ? null : prev));
  }

  function statusBadge(status: InquiryStatus) {
    const completed = status === "COMPLETED";
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
          completed ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {completed ? t("completed") : t("new")}
      </span>
    );
  }

  const errorBanner = error && (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {error}
    </p>
  );

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center text-brand-600">
        {t("noInquiries")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {errorBanner}

      {/* See AdminPropertiesTable: `relative` keeps absolutely positioned
          descendants inside the scroll container. */}
      <div className="relative overflow-x-auto rounded-2xl border border-brand-100 bg-white shadow-card">
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
              const busy = pendingId === inquiry.id;
              return (
                <tr
                  key={inquiry.id}
                  onClick={() => setSelected(inquiry)}
                  className={`cursor-pointer hover:bg-brand-50/40 ${busy ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    {/* The row is clickable for convenience, but the name is a
                        real button so the dialog is reachable by keyboard. */}
                    <button
                      type="button"
                      className="whitespace-nowrap rounded text-start font-semibold text-brand-900 hover:underline"
                    >
                      {inquiry.name}
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-600" dir="ltr">
                    {inquiry.phone}
                  </td>
                  <td className="px-4 py-3 text-brand-600">
                    <span className="line-clamp-1 break-all">{inquiry.email ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-brand-600">
                    {inquiry.propertyTitle ? (
                      <span className="line-clamp-1">
                        {inquiry.propertyTitle}
                        {inquiry.propertyReference !== null && (
                          <span className="text-brand-500">
                            {" · "}
                            {formatReference(inquiry.propertyReference)}
                          </span>
                        )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="max-w-[16rem] px-4 py-3 text-brand-600">
                    {/* One line only — the full text lives in the dialog, so
                        every row keeps the same height. */}
                    <span className="line-clamp-1">{inquiry.message}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-500">
                    {inquiry.dateFormatted}
                  </td>
                  <td className="px-4 py-3">{statusBadge(inquiry.status)}</td>
                  <td className="px-4 py-3">
                    {/* stopPropagation so the row's open-dialog click doesn't
                        also fire when acting on a row. */}
                    <div
                      className="flex flex-nowrap items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => toggleStatus(inquiry)}
                        className="whitespace-nowrap"
                      >
                        {inquiry.status === "COMPLETED" ? t("markNew") : t("markComplete")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => handleDelete(inquiry.id)}
                      >
                        {tCommon("delete")}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="inquiry-dialog-title"
        onClose={() => setSelected(null)}
        // A click landing on the dialog itself (rather than the panel inside
        // it) is a backdrop click.
        onClick={(e) => {
          if (e.target === dialogRef.current) setSelected(null);
        }}
        className="w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-brand-100 bg-white p-0 text-brand-900 shadow-cardHover backdrop:bg-brand-950/50"
      >
        {selected && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="inquiry-dialog-title" className="text-lg font-bold text-brand-950">
                  {selected.name}
                </h2>
                <p className="mt-0.5 text-xs text-brand-500">{selected.dateFormatted}</p>
              </div>
              {statusBadge(selected.status)}
            </div>

            <dl className="grid grid-cols-1 gap-3 border-y border-brand-100 py-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t("phone")}
                </dt>
                <dd className="mt-0.5">
                  <a href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`} className="hover:underline" dir="ltr">
                    {selected.phone}
                  </a>
                </dd>
              </div>

              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t("email")}
                </dt>
                <dd className="mt-0.5 break-words">
                  {selected.email ? (
                    <a href={`mailto:${selected.email}`} className="hover:underline">
                      {selected.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  {t("property")}
                </dt>
                <dd className="mt-0.5">
                  {selected.propertyTitle ? (
                    <>
                      {selected.propertyTitle}
                      {selected.propertyReference !== null && (
                        <span className="text-brand-500">
                          {" · "}
                          {formatReference(selected.propertyReference)}
                        </span>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {t("message")}
              </h3>
              <p className="mt-1.5 max-h-64 overflow-y-auto whitespace-pre-line leading-relaxed text-brand-700">
                {selected.message}
              </p>
            </div>

            {errorBanner}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={pendingId === selected.id}
                onClick={() => toggleStatus(selected)}
              >
                {selected.status === "COMPLETED" ? t("markNew") : t("markComplete")}
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={pendingId === selected.id}
                onClick={() => handleDelete(selected.id)}
              >
                {tCommon("delete")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                {tCommon("close")}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
