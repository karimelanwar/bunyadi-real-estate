"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { useTranslations } from "next-intl";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_SIZE = 8 * 1024 * 1024; // 8MB, mirrors the server-side limit

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

// Lets the admin pick/drop images while CREATING a property, before it has
// an id to upload against. Files are staged locally (object URL previews,
// reorderable, removable) and handed to the parent via onChange; the parent
// uploads them to /api/admin/upload right after the property is created,
// in this same order, so the first staged image becomes the cover.
export default function StagedImageUploader({
  onChange,
}: {
  onChange: (files: File[]) => void;
}) {
  const t = useTranslations("admin.form");
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      staged.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | File[]) {
    setError(null);
    const accepted: StagedFile[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.has(file.type)) {
        setError(t("uploadErrorType"));
        continue;
      }
      if (file.size > MAX_SIZE) {
        setError(t("uploadErrorSize"));
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }
    if (accepted.length === 0) return;
    setStaged((prev) => {
      const next = [...prev, ...accepted];
      onChange(next.map((s) => s.file));
      return next;
    });
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removeAt(index: number) {
    setStaged((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      const next = prev.filter((_, i) => i !== index);
      onChange(next.map((s) => s.file));
      return next;
    });
  }

  function moveAt(index: number, direction: -1 | 1) {
    setStaged((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      onChange(next.map((s) => s.file));
      return next;
    });
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
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

      {staged.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {staged.map((s, index) => (
            <div
              key={s.id}
              className={`group relative overflow-hidden rounded-xl border-2 ${
                index === 0 ? "border-brand-600" : "border-brand-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.previewUrl} alt="" className="aspect-square w-full object-cover" />

              {index === 0 && (
                <span className="absolute start-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {t("cover")}
                </span>
              )}

              <div className="flex items-center justify-between gap-1 bg-white p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveAt(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-brand-100 px-1.5 py-1 text-xs text-brand-600 disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAt(index, 1)}
                    disabled={index === staged.length - 1}
                    className="rounded border border-brand-100 px-1.5 py-1 text-xs text-brand-600 disabled:opacity-30"
                    aria-label="Move later"
                  >
                    ›
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded border border-red-100 px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                >
                  {t("removeImage")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
