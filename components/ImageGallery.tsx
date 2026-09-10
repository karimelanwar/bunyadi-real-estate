"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function ImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("property");
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-brand-100 px-4 text-center text-sm font-medium text-brand-700">
        {t("noImages")}
      </div>
    );
  }

  const total = images.length;
  const go = (next: number) => setActive((next + total) % total);

  const arrowClass =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-800 shadow-md transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

  return (
    <div>
      <div
        className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-100"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(active + 1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(active - 1);
          }
        }}
      >
        <Image
          src={images[active]}
          alt={total > 1 ? `${alt} — ${active + 1}/${total}` : alt}
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover object-top"
          priority
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label={t("previousPhoto")}
              className={`${arrowClass} start-3`}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label={t("nextPhoto")}
              className={`${arrowClass} end-3`}
            >
              <span aria-hidden="true">›</span>
            </button>

            <p
              aria-live="polite"
              className="absolute bottom-3 end-3 rounded-full bg-brand-950/75 px-3 py-1 text-xs font-semibold text-white"
            >
              {t("photoCounter", { current: active + 1, total })}
            </p>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("viewPhoto", { index: i + 1 })}
              aria-current={i === active ? "true" : undefined}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-brand-600" : "border-transparent hover:border-brand-300"
              }`}
            >
              <Image src={src} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
