import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { propertyUpdateSchema } from "@/lib/validation";
import fs from "node:fs/promises";
import { filePathForUploadUrl, propertyUploadDir } from "@/lib/uploads";
import { availabilityRank } from "@/lib/properties";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Partial update: allow either a full form payload or a small patch (e.g.
  // { status }). Must use the default-free schema so omitted fields aren't
  // silently overwritten with defaults.
  const parsed = propertyUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existing = await prisma.property.findUnique({ where: { id }, select: { id: true } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const property = await prisma.property.update({
    where: { id },
    data: {
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      // availabilityRank is derived, so it must move in lockstep.
      ...(data.availability !== undefined
        ? {
            availability: data.availability,
            availabilityRank: availabilityRank(data.availability),
          }
        : {}),
      ...(data.tenure !== undefined ? { tenure: data.tenure } : {}),
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.currency !== undefined ? { currency: data.currency } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.address !== undefined ? { address: data.address } : {}),
      ...(data.bedrooms !== undefined ? { bedrooms: data.bedrooms } : {}),
      ...(data.bathrooms !== undefined ? { bathrooms: data.bathrooms } : {}),
      ...(data.areaSqm !== undefined ? { areaSqm: data.areaSqm } : {}),
      ...(data.yearBuilt !== undefined ? { yearBuilt: data.yearBuilt } : {}),
      ...(data.features !== undefined ? { features: JSON.stringify(data.features) } : {}),
      ...(data.featured !== undefined ? { featured: data.featured } : {}),
    },
  });

  return NextResponse.json({ property });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.property.delete({ where: { id } });

  await Promise.all(
    property.images.map(async (image) => {
      const filePath = filePathForUploadUrl(image.url);
      if (!filePath) return;
      await fs.unlink(filePath).catch(() => {});
    })
  );

  // Best-effort cleanup of the now-empty per-property upload directory.
  await fs.rmdir(propertyUploadDir(id)).catch(() => {});

  return NextResponse.json({ ok: true });
}
