"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-brand-950 sm:text-3xl">{t("somethingWentWrong")}</h1>
      <p className="max-w-md text-brand-700">{t("somethingWentWrongHint")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t("retry")}
      </button>
    </div>
  );
}
