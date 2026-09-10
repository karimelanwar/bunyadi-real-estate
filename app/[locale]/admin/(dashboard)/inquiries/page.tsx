import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import AdminInquiriesTable, { type InquiryRow } from "@/components/admin/AdminInquiriesTable";
import { fieldSelectClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import { formatReference } from "@/lib/format";
import type { InquiryStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const t = await getTranslations("admin");
  const tCommon = await getTranslations("common");
  const tFilters = await getTranslations("filters");
  const tTable = await getTranslations("admin.inquiriesTable");

  const validStatus = ["NEW", "COMPLETED"].includes(sp.status ?? "")
    ? (sp.status as InquiryStatus)
    : undefined;

  const inquiries = await prisma.inquiry.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { property: true },
    take: 200,
  });

  const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const rows: InquiryRow[] = inquiries.map((inquiry) => ({
    id: inquiry.id,
    name: inquiry.name,
    phone: inquiry.phone,
    email: inquiry.email,
    propertyTitle: inquiry.property?.title ?? null,
    propertyReference: inquiry.property ? formatReference(inquiry.property.reference) : null,
    message: inquiry.message,
    status: inquiry.status,
    dateFormatted: dateFormatter.format(inquiry.createdAt),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-950">{t("inquiries")}</h1>
        <form method="get" className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className={`${fieldSelectClass} w-auto`}
          >
            <option value="">{tCommon("all")}</option>
            <option value="NEW">{tTable("new")}</option>
            <option value="COMPLETED">{tTable("completed")}</option>
          </select>
          <Button type="submit">{tFilters("apply")}</Button>
        </form>
      </div>

      <AdminInquiriesTable inquiries={rows} />
    </div>
  );
}
