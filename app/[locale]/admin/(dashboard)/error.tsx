"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function AdminError({
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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-xl font-bold text-brand-950">{t("somethingWentWrong")}</h1>
      <p className="max-w-md text-sm text-brand-700">{t("somethingWentWrongHint")}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
      >
        {t("retry")}
      </button>
    </div>
  );
}
