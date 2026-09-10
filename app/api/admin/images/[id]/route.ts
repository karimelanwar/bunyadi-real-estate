import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import fs from "node:fs/promises";
import { filePathForUploadUrl } from "@/lib/uploads";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const image = await prisma.propertyImage.findUnique({ where: { id } });

  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.propertyImage.delete({ where: { id } });

  if (image.isCover) {
    const nextCover = await prisma.propertyImage.findFirst({
      where: { propertyId: image.propertyId },
      orderBy: { sortOrder: "asc" },
    });
    if (nextCover) {
      await prisma.propertyImage.update({
        where: { id: nextCover.id },
        data: { isCover: true },
      });
    }
  }

  const filePath = filePathForUploadUrl(image.url);
  if (filePath) {
    await fs.unlink(filePath).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
