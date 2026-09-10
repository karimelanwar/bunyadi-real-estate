import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { PropertyImage } from "@prisma/client";
import { propertyUploadDir, propertyImageUrl } from "@/lib/uploads";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const formData = await request.formData();
  const propertyId = formData.get("propertyId");
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (typeof propertyId !== "string" || !propertyId) {
    return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { images: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  const uploadDir = propertyUploadDir(propertyId);
  await fs.mkdir(uploadDir, { recursive: true });

  let nextSortOrder = property.images.length
    ? Math.max(...property.images.map((img) => img.sortOrder)) + 1
    : 0;
  const hasCover = property.images.some((img) => img.isCover);

  const created: PropertyImage[] = [];
  let skipped = 0;

  for (const file of files) {
    // Rejected files are reported back rather than silently dropped.
    if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_SIZE) {
      skipped += 1;
      continue;
    }

    const ext = EXT_BY_TYPE[file.type] ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const url = propertyImageUrl(propertyId, filename);
    const image = await prisma.propertyImage.create({
      data: {
        propertyId,
        url,
        sortOrder: nextSortOrder,
        isCover: !hasCover && created.length === 0,
      },
    });
    created.push(image);
    nextSortOrder += 1;
  }

  if (created.length === 0) {
    return NextResponse.json({ error: "No valid image files uploaded" }, { status: 400 });
  }

  return NextResponse.json({ images: created, skipped }, { status: 201 });
}
