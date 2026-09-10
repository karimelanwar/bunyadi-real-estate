import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
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

// Nothing on the site displays an image wider than roughly 2500px (the widest
// is the property gallery at 66vw, which on a 1920px screen at 2x asks for
// ~2530px), so anything beyond this is bytes nobody ever sees. A phone photo
// straight off a camera is commonly 4000px+ and several MB: storing that
// as-is means the optimizer has to decode the whole thing the first time each
// size variant is requested, and it sits on the paid Render disk forever.
const MAX_STORED_EDGE = 2560;

/**
 * Shrink an uploaded photo to something reasonable before it hits disk.
 * Returns the original bytes untouched if anything goes wrong — a failed
 * resize should never cost the admin their upload.
 */
async function downscale(buffer: Buffer, ext: string): Promise<Buffer> {
  // GIFs are skipped: re-encoding one flattens it to a single frame, and a
  // property listing has no reason to need an animated image anyway.
  if (ext === "gif") return buffer;

  try {
    const pipeline = sharp(buffer)
      // Must come before metadata is dropped: phone cameras record portrait
      // shots as landscape plus an EXIF orientation flag, so baking the
      // rotation in is what stops them appearing on their side once that
      // flag is stripped.
      .rotate()
      .resize({
        width: MAX_STORED_EDGE,
        height: MAX_STORED_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });

    const out =
      ext === "png"
        ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
        : ext === "webp"
          ? await pipeline.webp({ quality: 82 }).toBuffer()
          : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    // A small, already-optimised file can come out bigger than it went in.
    return out.length < buffer.length ? out : buffer;
  } catch {
    return buffer;
  }
}

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
    await fs.writeFile(filePath, await downscale(buffer, ext));

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
