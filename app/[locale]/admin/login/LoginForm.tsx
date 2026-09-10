"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { fieldControlClass } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // Retrying a rate-limited login just fails again — don't mislabel it
        // as a credentials problem.
        setError(res.status === 429 ? t("tooManyAttempts") : t("invalidCredentials"));
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(t("invalidCredentials"));
    } finally {
      // Always release the button — even if navigation above redirects us
      // straight back to this same route, the UI must never stay stuck on
      // "Signing in...".
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-brand-950">{t("loginTitle")}</h1>
      <p className="mt-1 text-center text-sm text-brand-600">{t("loginSubtitle")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-800">
            {t("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className={fieldControlClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-brand-800">
            {t("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className={fieldControlClass}
          />
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? t("signingIn") : t("signIn")}
        </Button>
      </form>
    </div>
  );
}
