"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { formatPrice, formatReference } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import Button from "@/components/ui/Button";
import { fieldSelectClass } from "@/components/ui/Field";
import { AVAILABILITY_VALUES } from "@/lib/property-display";
import type { Availability, PropertyCardData } from "@/lib/types";

export default function AdminPropertiesTable({ properties }: { properties: PropertyCardData[] }) {
  const t = useTranslations("admin");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tAvail = useTranslations("availability");
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Every mutation goes through here so a 401 after session expiry can never
  // look like success — previously none of these checked res.ok.
  async function mutate(id: string, run: () => Promise<Response>) {
    setPendingId(id);
    setError(null);
    try {
      const res = await run();
      if (res.status === 401) {
        setError(t("sessionExpired"));
        return;
      }
      if (!res.ok) {
        setError(t("actionFailed"));
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError(t("actionFailed"));
    } finally {
      setPendingId(null);
    }
  }

  function togglePublish(property: PropertyCardData) {
    const nextStatus = property.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    return mutate(property.id, () =>
      fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      })
    );
  }

  function changeAvailability(property: PropertyCardData, availability: Availability) {
    return mutate(property.id, () =>
      fetch(`/api/admin/properties/${property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      })
    );
  }

  function handleDelete(property: PropertyCardData) {
    if (!window.confirm(t("confirmDeleteBody"))) return;
    return mutate(property.id, () =>
      fetch(`/api/admin/properties/${property.id}`, { method: "DELETE" })
    );
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center text-brand-600">
        {t("noProperties")}
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
        <table className="w-full min-w-[1000px] text-start text-sm">
          <thead className="bg-brand-50/60 text-xs uppercase tracking-wide text-brand-700">
            <tr>
              <th className="px-4 py-3 text-start font-semibold">{t("form.title")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("form.category")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("form.price")}</th>
              <th className="px-4 py-3 text-start font-semibold">{tCommon("status")}</th>
              <th className="px-4 py-3 text-start font-semibold">{t("filterAvailability")}</th>
              <th className="px-4 py-3 text-start font-semibold">{tCommon("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {properties.map((property) => {
              const busy = pendingId === property.id;
              return (
                <tr key={property.id} className={busy ? "opacity-50" : undefined}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-100">
                        {property.coverImage && (
                          <Image
                            src={property.coverImage}
                            alt=""
                            fill
                            className="object-cover object-bottom"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="line-clamp-1 font-semibold text-brand-900">{property.title}</p>
                        <p className="text-xs text-brand-600">
                          {property.location} · {formatReference(property.reference)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-brand-700">{tCat(property.category)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-brand-700">
                    {formatPrice(property.price, property.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={property.status} />
                  </td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`availability-${property.id}`}>
                      {t("filterAvailability")}
                    </label>
                    <select
                      id={`availability-${property.id}`}
                      value={property.availability}
                      disabled={busy}
                      onChange={(e) =>
                        changeAvailability(property, e.target.value as Availability)
                      }
                      className={`${fieldSelectClass} min-w-[9.5rem] py-1.5 text-xs`}
                    >
                      {AVAILABILITY_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {tAvail(value)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-nowrap items-center gap-2">
                      <Link
                        href={`/admin/properties/${property.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-800 transition-colors hover:bg-brand-50"
                      >
                        {tCommon("edit")}
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() => togglePublish(property)}
                      >
                        {property.status === "PUBLISHED"
                          ? tCommon("unpublish")
                          : tCommon("publish")}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busy}
                        onClick={() => handleDelete(property)}
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
    </div>
  );
}
