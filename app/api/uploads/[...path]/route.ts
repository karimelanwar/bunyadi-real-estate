import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import { UPLOADS_STORAGE_ROOT } from "@/lib/uploads";

export const runtime = "nodejs";

// Property images are uploaded at runtime, but `next start` snapshots the
// `public/` directory's file list at boot and never re-scans it — any file
// written to `public/` after the server starts 404s until the process is
// restarted. Storing uploads outside `public/` and serving them through this
// route handler sidesteps that entirely: every request reads straight from
// disk, so newly uploaded images are servable immediately.
const STORAGE_ROOT = UPLOADS_STORAGE_ROOT;

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments || segments.length === 0 || segments.some((s) => s.includes("..") || s.includes("/"))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(STORAGE_ROOT, ...segments);

  // Defense in depth: confirm the resolved path is still inside STORAGE_ROOT
  // even though the segment check above already rejects "..".
  if (!filePath.startsWith(STORAGE_ROOT + path.sep)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext];
  if (!contentType) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        // Filenames are server-generated UUIDs and never reused, so a
        // successfully-fetched image never changes underneath its URL.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
