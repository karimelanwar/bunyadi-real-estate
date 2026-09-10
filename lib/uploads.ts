import path from "node:path";

// Uploaded property images live outside `public/` and are served through
// app/api/uploads/[...path]/route.ts — see the comment there for why
// (public/ is snapshotted at `next start` boot and never re-scanned, so
// runtime uploads would 404 until the process restarts).
//
// UPLOADS_DIR lets this point at a mounted persistent disk in production
// (Render's default filesystem is ephemeral — anything written outside a
// mounted Disk is lost on redeploy/restart). Defaults to a local folder for
// development, where that limitation doesn't matter.
export const UPLOADS_STORAGE_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "storage", "uploads");
export const UPLOADS_URL_PREFIX = "/api/uploads";

export function propertyUploadDir(propertyId: string): string {
  return path.join(UPLOADS_STORAGE_ROOT, "properties", propertyId);
}

export function propertyImageUrl(propertyId: string, filename: string): string {
  return `${UPLOADS_URL_PREFIX}/properties/${propertyId}/${filename}`;
}

// Resolves a stored image URL back to its absolute path on disk, or null if
// it isn't one of our uploaded (as opposed to seeded/static) images.
export function filePathForUploadUrl(url: string): string | null {
  if (!url.startsWith(`${UPLOADS_URL_PREFIX}/`)) return null;
  const relative = url.slice(UPLOADS_URL_PREFIX.length + 1);
  return path.join(UPLOADS_STORAGE_ROOT, relative);
}
