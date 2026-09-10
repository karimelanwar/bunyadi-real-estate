"use client";

import { useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

interface ImageItem {
  id: string;
  url: string;
  sortOrder: number;
  isCover: boolean;
}

export default function ImageUploader({
  propertyId,
  initialImages,
}: {
  propertyId: string;
  initialImages: ImageItem[];
}) {
  const t = useTranslations("admin.form");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("admin");
  const router = useRouter();

  const [images, setImages] = useState<ImageItem[]>(
    [...initialImages].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Previously `if (res.ok)` with no else, so a rejected or oversized upload
  // did nothing visible at all.
  function reportFailure(res?: Response) {
    setError(res?.status === 401 ? tAdmin("sessionExpired") : tAdmin("actionFailed"));
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set("propertyId", propertyId);
    list.forEach((file) => formData.append("files", file));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        reportFailure(res);
        return;
      }
      const { images: created, skipped } = await res.json();
      setImages((prev) => [...prev, ...created].sort((a, b) => a.sortOrder - b.sortOrder));
      if (skipped > 0) setError(t("uploadErrorType"));
      router.refresh();
    } catch {
      reportFailure();
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  async function handleSetCover(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/images/${id}/cover`, { method: "PATCH" });
      if (!res.ok) {
        reportFailure(res);
        return;
      }
      setImages((prev) => prev.map((img) => ({ ...img, isCover: img.id === id })));
      router.refresh();
    } catch {
      reportFailure();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    // The only destructive action that previously had no confirmation.
    if (!window.confirm(tAdmin("confirmDeleteImage"))) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
      if (!res.ok) {
        reportFailure(res);
        return;
      }
      setImages((prev) => prev.filter((img) => img.id !== id));
      router.refresh();
    } catch {
      reportFailure();
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const previous = images;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    setError(null);

    try {
      const res = await fetch("/api/admin/images/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: next.map((img) => img.id) }),
      });
      if (!res.ok) {
        setImages(previous); // roll back the optimistic swap
        reportFailure(res);
        return;
      }
      router.refresh();
    } catch {
      setImages(previous);
      reportFailure();
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-brand-500 bg-brand-50" : "border-brand-200 bg-brand-50/40"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-10 w-10 text-brand-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4M12 4 6.5 9.5M12 4l5.5 5.5" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16.5v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <p className="text-sm font-semibold text-brand-700">{t("uploadImages")}</p>
        <p className="text-xs text-brand-500">{t("dragDropHint")}</p>
        {uploading && <p className="text-xs text-brand-600">{tCommon("loading")}</p>}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`group relative overflow-hidden rounded-xl border-2 ${
                image.isCover ? "border-brand-600" : "border-brand-100"
              } ${busyId === image.id ? "opacity-50" : ""}`}
            >
              <div className="relative aspect-square">
                <Image src={image.url} alt="" fill sizes="200px" className="object-cover object-top" />
              </div>

              {image.isCover && (
                <span className="absolute start-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("cover")}
                </span>
              )}

              <div className="flex items-center justify-between gap-1 bg-white p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-brand-100 px-1.5 py-1 text-xs text-brand-600 disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === images.length - 1}
                    className="rounded border border-brand-100 px-1.5 py-1 text-xs text-brand-600 disabled:opacity-30"
                    aria-label="Move later"
                  >
                    ›
                  </button>
                </div>
                <div className="flex gap-1">
                  {!image.isCover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className="rounded border border-brand-100 px-2 py-1 text-[10px] font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      {t("setCover")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    className="rounded border border-red-100 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    {t("removeImage")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
