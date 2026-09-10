"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";

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
      <Button size="lg" onClick={reset} className="mt-2">
        {t("retry")}
      </Button>
    </div>
  );
}
