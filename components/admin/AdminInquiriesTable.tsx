"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
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

const LABEL = "text-xs font-semibold uppercase tracking-wide text-brand-600";

export default function AdminInquiriesTable({ inquiries }: { inquiries: InquiryRow[] }) {
  const t = useTranslations("admin.inquiriesTable");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Derived, not stored: after router.refresh() the dialog picks up the new
  // status on its own, and a deleted inquiry simply stops resolving — which
  // closes the dialog via the effect below.
  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  // showModal() (rather than the `open` attribute) is what gets us Escape to
  // close, focus containment, and an inert background for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selected && !dialog.open) {
      dialog.showModal();
      // Without this, showModal() auto-focuses the first focusable
      // descendant — the phone number link — which then shows the site's
      // green focus ring around it and reads as an accidental selection.
      // The title is a more sensible, and more accessible, first stop.
      titleRef.current?.focus();
    }
    if (!selected && dialog.open) dialog.close();
  }, [selected]);

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

  function toggleStatus(inquiry: InquiryRow) {
    return mutate(inquiry.id, () =>
      fetch(`/api/admin/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: inquiry.status === "COMPLETED" ? "NEW" : "COMPLETED" }),
      })
    );
  }

  function handleDelete(id: string) {
    if (!window.confirm(t("confirmDelete"))) return;
    return mutate(id, () => fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" }));
  }

  function StatusBadge({ status }: { status: InquiryStatus }) {
    const completed = status === "COMPLETED";
    return (
      <span
        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
          completed ? "bg-brand-50 text-brand-700" : "bg-amber-50 text-amber-700"
        }`}
      >
        {completed ? t("completed") : t("new")}
      </span>
    );
  }

  function propertyLabel(inquiry: InquiryRow) {
    if (!inquiry.propertyTitle) return "—";
    return inquiry.propertyReference === null
      ? inquiry.propertyTitle
      : `${inquiry.propertyTitle} · ${formatReference(inquiry.propertyReference)}`;
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

      {/* A deliberately short list: phone, email, the full message and the
          mark-complete/delete actions all live in the dialog instead, so this
          stays scannable and fits a phone without sideways scrolling. Property
          and date drop away on narrower screens. */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card">
        <table className="w-full text-start text-sm">
          <thead className="bg-brand-50/60 text-xs uppercase tracking-wide text-brand-700">
            <tr>
              <th className="px-3 py-3 sm:px-4 text-start font-semibold">{t("name")}</th>
              <th className="hidden px-3 py-3 sm:px-4 text-start font-semibold lg:table-cell">
                {t("property")}
              </th>
              <th className="hidden px-3 py-3 sm:px-4 text-start font-semibold sm:table-cell">
                {t("date")}
              </th>
              <th className="px-3 py-3 sm:px-4 text-start font-semibold">{tCommon("status")}</th>
              {/* aria-label rather than an sr-only span: sr-only is
                  position:absolute and has a habit of escaping table
                  containers and widening the page. */}
              <th aria-label={tCommon("actions")} className="px-3 py-3 sm:px-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {inquiries.map((inquiry) => (
              <tr
                key={inquiry.id}
                onClick={() => setSelectedId(inquiry.id)}
                className={`cursor-pointer hover:bg-brand-50/40 ${
                  pendingId === inquiry.id ? "opacity-50" : ""
                }`}
              >
                <td className="px-3 py-3 sm:px-4">
                  <p className="line-clamp-1 font-semibold text-brand-900">{inquiry.name}</p>
                  {/* A preview so the list is triageable without opening each
                      one; the date follows here where its column is hidden. */}
                  <p className="line-clamp-1 text-brand-600">{inquiry.message}</p>
                  <p className="text-xs text-brand-500 sm:hidden">{inquiry.dateFormatted}</p>
                </td>
                <td className="hidden max-w-[18rem] px-3 py-3 sm:px-4 text-brand-600 lg:table-cell">
                  <span className="line-clamp-1">{propertyLabel(inquiry)}</span>
                </td>
                <td className="hidden whitespace-nowrap px-3 py-3 sm:px-4 text-brand-500 sm:table-cell">
                  {inquiry.dateFormatted}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  <StatusBadge status={inquiry.status} />
                </td>
                <td className="px-3 py-3 sm:px-4 text-end">
                  {/* The row is clickable too, but an explicit button makes
                      that discoverable and gives keyboard users a target. */}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedId(inquiry.id)}
                  >
                    {tCommon("view")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="inquiry-dialog-title"
        onClose={() => setSelectedId(null)}
        // A click landing on the dialog itself, rather than the panel inside
        // it, is a backdrop click.
        onClick={(e) => {
          if (e.target === dialogRef.current) setSelectedId(null);
        }}
        className="w-[min(34rem,calc(100vw-2rem))] rounded-2xl border border-brand-100 bg-white p-0 text-brand-900 shadow-cardHover backdrop:bg-brand-950/50"
      >
        {selected && (
          <div className="flex flex-col gap-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* tabIndex + ref so it can take initial focus programmatically
                    (see the effect above) without joining the tab order;
                    outline-none because a focus ring only matters here for
                    where focus lands, not as an interactive affordance. */}
                <h2
                  ref={titleRef}
                  id="inquiry-dialog-title"
                  tabIndex={-1}
                  className="text-lg font-bold text-brand-950 outline-none"
                >
                  {selected.name}
                </h2>
                <p className="mt-0.5 text-xs text-brand-500">{selected.dateFormatted}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <dl className="grid grid-cols-1 gap-3 border-y border-brand-100 py-4 text-sm sm:grid-cols-2">
              <Detail label={t("phone")}>
                <a
                  href={`tel:${selected.phone.replace(/[^+\d]/g, "")}`}
                  className="hover:underline"
                  dir="ltr"
                >
                  {selected.phone}
                </a>
              </Detail>

              <Detail label={t("email")} className="min-w-0 break-words">
                {selected.email ? (
                  <a href={`mailto:${selected.email}`} className="hover:underline">
                    {selected.email}
                  </a>
                ) : (
                  "—"
                )}
              </Detail>

              <Detail label={t("property")} className="sm:col-span-2">
                {propertyLabel(selected)}
              </Detail>
            </dl>

            <div>
              <h3 className={LABEL}>{t("message")}</h3>
              <p className="mt-1.5 max-h-64 overflow-y-auto whitespace-pre-line leading-relaxed text-brand-700">
                {selected.message}
              </p>
            </div>

            {errorBanner}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                size="sm"
                variant="danger"
                disabled={pendingId === selected.id}
                onClick={() => handleDelete(selected.id)}
              >
                {tCommon("delete")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedId(null)}>
                {tCommon("close")}
              </Button>
              <Button
                size="sm"
                disabled={pendingId === selected.id}
                onClick={() => toggleStatus(selected)}
                className="whitespace-nowrap"
              >
                {selected.status === "COMPLETED" ? t("markNew") : t("markComplete")}
              </Button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

function Detail({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <dt className={LABEL}>{label}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  );
}
