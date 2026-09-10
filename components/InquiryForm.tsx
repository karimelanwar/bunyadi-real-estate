"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import { fieldControlClass } from "@/components/ui/Field";

export default function InquiryForm({
  propertyId,
  submitLabel,
}: {
  propertyId: string;
  submitLabel?: string;
}) {
  const t = useTranslations("inquiry");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const successRef = useRef<HTMLDivElement>(null);

  // Focus was previously lost to <body> on success, leaving keyboard and
  // screen-reader users with no idea the message had been sent.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = {
      propertyId,
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Retrying a rate-limited request will just fail again, so say so
        // rather than showing the generic "please try again".
        setErrorMessage(res.status === 429 ? t("errorRateLimited") : t("error"));
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage(t("error"));
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-xl bg-brand-50 p-5 text-sm font-medium text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-600/30"
      >
        <p>{t("success")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-3 text-sm font-semibold text-brand-700 underline hover:text-brand-800"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  const labelClass = "mb-1 block text-sm font-medium text-brand-800";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label htmlFor="inquiry-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="inquiry-name"
          name="name"
          required
          autoComplete="name"
          placeholder={t("namePlaceholder")}
          className={fieldControlClass}
        />
      </div>

      <div>
        <label htmlFor="inquiry-phone" className={labelClass}>
          {t("phone")}
        </label>
        <input
          id="inquiry-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          required
          autoComplete="tel"
          placeholder={t("phonePlaceholder")}
          className={fieldControlClass}
        />
      </div>

      <div>
        <label htmlFor="inquiry-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="inquiry-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          className={fieldControlClass}
        />
      </div>

      <div>
        <label htmlFor="inquiry-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          rows={4}
          placeholder={t("messagePlaceholder")}
          className={fieldControlClass}
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {errorMessage || t("error")}
        </p>
      )}

      <Button type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
        {status === "sending" ? t("sending") : (submitLabel ?? t("send"))}
      </Button>
    </form>
  );
}
