import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata: Metadata = { title: "Edit Property" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("admin");

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!property) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-brand-950">{t("editProperty")}</h1>
      <PropertyForm mode="edit" property={property} />
    </div>
  );
}
