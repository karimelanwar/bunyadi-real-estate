"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { propertyFormSchema } from "@/lib/validation";
import { AVAILABILITY_VALUES, TENURE_VALUES } from "@/lib/property-display";
import { formatPrice } from "@/lib/format";
import type { PropertyWithImages } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import StagedImageUploader from "./StagedImageUploader";
import WizardSteps, { type WizardStep } from "./WizardSteps";
import Button from "@/components/ui/Button";
import Field, { controlClass, selectControlClass } from "@/components/ui/Field";

interface Props {
  mode: "create" | "edit";
  property?: PropertyWithImages;
}

// Kept as strings so inputs stay controlled and empty means "not set" rather
// than silently becoming 0. Coercion happens once, at validation time.
interface FormValues {
  category: string;
  type: string;
  status: string;
  availability: string;
  tenure: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  city: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  areaSqm: string;
  yearBuilt: string;
  features: string;
  featured: boolean;
}

type Errors = Partial<Record<keyof FormValues, string>>;

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["category", "type", "title", "city", "address"],
  ["price", "currency", "bedrooms", "bathrooms", "areaSqm", "yearBuilt", "tenure", "description", "features"],
  [],
  ["status", "availability"],
];

function parseFeatures(json: string): string {
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr.join(", ") : "";
  } catch {
    return "";
  }
}

function initialValues(property?: PropertyWithImages): FormValues {
  return {
    category: property?.category ?? "RESIDENTIAL",
    type: property?.type ?? "",
    status: property?.status ?? "DRAFT",
    availability: property?.availability ?? "AVAILABLE",
    tenure: property?.tenure ?? "",
    title: property?.title ?? "",
    description: property?.description ?? "",
    price: property ? String(property.price) : "",
    currency: property?.currency ?? "GBP",
    city: property?.city ?? "",
    address: property?.address ?? "",
    bedrooms: property?.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property?.bathrooms != null ? String(property.bathrooms) : "",
    areaSqm: property?.areaSqm != null ? String(property.areaSqm) : "",
    yearBuilt: property?.yearBuilt != null ? String(property.yearBuilt) : "",
    features: property ? parseFeatures(property.features) : "",
    featured: property?.featured ?? false,
  };
}

function toPayload(values: FormValues) {
  const optionalNumber = (raw: string) => (raw.trim() === "" ? null : Number(raw));
  return {
    category: values.category,
    type: values.type,
    status: values.status,
    availability: values.availability,
    tenure: values.tenure === "" ? null : values.tenure,
    title: values.title,
    description: values.description,
    // Empty must fail validation rather than coerce to a free property.
    price: values.price.trim() === "" ? NaN : Number(values.price),
    currency: values.currency || "GBP",
    city: values.city,
    address: values.address,
    bedrooms: optionalNumber(values.bedrooms),
    bathrooms: optionalNumber(values.bathrooms),
    areaSqm: optionalNumber(values.areaSqm),
    yearBuilt: optionalNumber(values.yearBuilt),
    features: values.features
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    featured: values.featured,
  };
}

export default function PropertyForm({ mode, property }: Props) {
  const t = useTranslations("admin.form");
  const tCommon = useTranslations("common");
  const tCat = useTranslations("categories");
  const tAvail = useTranslations("availability");
  const tTenure = useTranslations("tenure");
  const router = useRouter();

  const [values, setValues] = useState<FormValues>(() => initialValues(property));
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

  const isWizard = mode === "create";
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);

  const steps: WizardStep[] = useMemo(
    () => [
      { id: "basics", label: t("stepBasics"), hint: t("stepBasicsHint") },
      { id: "details", label: t("stepDetails"), hint: t("stepDetailsHint") },
      { id: "photos", label: t("stepPhotos"), hint: t("stepPhotosHint") },
      { id: "review", label: t("stepReview"), hint: t("stepReviewHint") },
    ],
    [t]
  );

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
    setSaved(false);
  }

  /** Validates the whole payload, then keeps only the errors for `fields`. */
  function validate(fields?: (keyof FormValues)[]): boolean {
    const result = propertyFormSchema.safeParse(toPayload(values));
    if (result.success) {
      setErrors({});
      return true;
    }

    const all: Errors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof FormValues | undefined;
      if (key && !all[key]) all[key] = issue.message;
    }

    const scoped: Errors = fields
      ? Object.fromEntries(fields.filter((f) => all[f]).map((f) => [f, all[f]]))
      : all;

    setErrors(scoped);
    if (Object.keys(scoped).length === 0) return true;

    setFormError(t("fixErrors"));
    return false;
  }

  function goNext() {
    setFormError(null);
    if (!validate(STEP_FIELDS[step])) return;
    const next = Math.min(step + 1, steps.length - 1);
    setStep(next);
    setFurthest((f) => Math.max(f, next));
  }

  function goBack() {
    setFormError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  // Routes the native submit (i.e. pressing Enter in a field) to the right
  // action: advance the wizard rather than creating a half-filled listing.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isWizard && step < steps.length - 1) {
      goNext();
      return;
    }
    void save();
  }

  async function save() {
    setFormError(null);
    setSaved(false);

    if (!validate()) {
      // Jump to the first step that has a problem so the error is visible.
      if (isWizard) {
        const bad = STEP_FIELDS.findIndex((fields) => fields.some((f) => errors[f]));
        if (bad >= 0) setStep(bad);
      }
      return;
    }

    setSaving(true);
    const payload = toPayload(values);

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          await applyServerErrors(res);
          return;
        }

        const { property: created } = await res.json();

        if (stagedFiles.length > 0) {
          const uploadData = new FormData();
          uploadData.set("propertyId", created.id);
          stagedFiles.forEach((file) => uploadData.append("files", file));
          const uploadRes = await fetch("/api/admin/upload", {
            method: "POST",
            body: uploadData,
          });
          // The listing exists either way — don't strand the admin on a dead
          // form if only the images failed.
          if (!uploadRes.ok) {
            router.push(`/admin/properties/${created.id}/edit?uploadFailed=1`);
            router.refresh();
            return;
          }
        }

        router.push(`/admin/properties/${created.id}/edit`);
        router.refresh();
      } else if (property) {
        const res = await fetch(`/api/admin/properties/${property.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          await applyServerErrors(res);
          return;
        }
        setSaved(true);
        router.refresh();
      }
    } catch {
      setFormError(t("saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  /** Surfaces the API's per-field zod errors instead of discarding them. */
  async function applyServerErrors(res: Response) {
    setFormError(t("saveFailed"));
    try {
      const body = await res.json();
      const fieldErrors = body?.error?.fieldErrors as Record<string, string[]> | undefined;
      if (fieldErrors) {
        const mapped: Errors = {};
        for (const [key, messages] of Object.entries(fieldErrors)) {
          if (messages?.[0]) mapped[key as keyof FormValues] = messages[0];
        }
        if (Object.keys(mapped).length > 0) setErrors(mapped);
      }
    } catch {
      /* response wasn't JSON — the generic message stands */
    }
  }

  const featureList = values.features
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // ---- field renderers -------------------------------------------------

  const basicsFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field htmlFor="category" label={t("category")} required error={errors.category}>
        <select
          id="category"
          value={values.category}
          onChange={(e) => set("category", e.target.value)}
          className={selectControlClass(!!errors.category)}
        >
          <option value="RESIDENTIAL">{tCat("RESIDENTIAL")}</option>
          <option value="COMMERCIAL">{tCat("COMMERCIAL")}</option>
          <option value="BUSINESS">{tCat("BUSINESS")}</option>
        </select>
      </Field>

      <Field htmlFor="type" label={t("type")} required error={errors.type}>
        <input
          id="type"
          value={values.type}
          onChange={(e) => set("type", e.target.value)}
          placeholder={t("typePlaceholder")}
          className={controlClass(!!errors.type)}
        />
      </Field>

      <Field htmlFor="title" label={t("title")} required error={errors.title} className="sm:col-span-2">
        <input
          id="title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          className={controlClass(!!errors.title)}
        />
      </Field>

      <Field htmlFor="city" label={t("city")} required error={errors.city}>
        <input
          id="city"
          value={values.city}
          onChange={(e) => set("city", e.target.value)}
          className={controlClass(!!errors.city)}
        />
      </Field>

      <Field htmlFor="address" label={t("address")} required error={errors.address}>
        <input
          id="address"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          className={controlClass(!!errors.address)}
        />
      </Field>
    </div>
  );

  const detailsFields = (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Field htmlFor="price" label={t("price")} required error={errors.price}>
        <input
          id="price"
          type="number"
          min={0}
          inputMode="numeric"
          value={values.price}
          onChange={(e) => set("price", e.target.value)}
          className={controlClass(!!errors.price)}
        />
      </Field>

      <Field htmlFor="currency" label={t("currency")} error={errors.currency}>
        <input
          id="currency"
          value={values.currency}
          onChange={(e) => set("currency", e.target.value.toUpperCase())}
          maxLength={3}
          className={controlClass(!!errors.currency)}
        />
      </Field>

      <Field htmlFor="tenure" label={t("tenure")} error={errors.tenure}>
        <select
          id="tenure"
          value={values.tenure}
          onChange={(e) => set("tenure", e.target.value)}
          className={selectControlClass(!!errors.tenure)}
        >
          <option value="">{t("tenureNone")}</option>
          {TENURE_VALUES.map((value) => (
            <option key={value} value={value}>
              {tTenure(value)}
            </option>
          ))}
        </select>
      </Field>

      <Field htmlFor="bedrooms" label={t("bedrooms")} error={errors.bedrooms}>
        <input
          id="bedrooms"
          type="number"
          min={0}
          value={values.bedrooms}
          onChange={(e) => set("bedrooms", e.target.value)}
          className={controlClass(!!errors.bedrooms)}
        />
      </Field>

      <Field htmlFor="bathrooms" label={t("bathrooms")} error={errors.bathrooms}>
        <input
          id="bathrooms"
          type="number"
          min={0}
          value={values.bathrooms}
          onChange={(e) => set("bathrooms", e.target.value)}
          className={controlClass(!!errors.bathrooms)}
        />
      </Field>

      <Field htmlFor="areaSqm" label={t("areaSqm")} error={errors.areaSqm}>
        <input
          id="areaSqm"
          type="number"
          min={0}
          value={values.areaSqm}
          onChange={(e) => set("areaSqm", e.target.value)}
          className={controlClass(!!errors.areaSqm)}
        />
      </Field>

      <Field htmlFor="yearBuilt" label={t("yearBuilt")} error={errors.yearBuilt}>
        <input
          id="yearBuilt"
          type="number"
          value={values.yearBuilt}
          onChange={(e) => set("yearBuilt", e.target.value)}
          className={controlClass(!!errors.yearBuilt)}
        />
      </Field>

      <Field
        htmlFor="description"
        label={t("description")}
        required
        error={errors.description}
        className="col-span-2 sm:col-span-3"
      >
        <textarea
          id="description"
          rows={5}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={controlClass(!!errors.description)}
        />
      </Field>

      <Field
        htmlFor="features"
        label={t("features")}
        hint={t("featuresHint")}
        error={errors.features}
        className="col-span-2 sm:col-span-3"
      >
        <input
          id="features"
          value={values.features}
          onChange={(e) => set("features", e.target.value)}
          placeholder="Balcony, Parking, Garden"
          className={controlClass(!!errors.features)}
        />
      </Field>
    </div>
  );

  const photosFields =
    mode === "edit" && property ? (
      <ImageUploader propertyId={property.id} initialImages={property.images} />
    ) : (
      <>
        <p className="mb-4 text-sm text-brand-600">{t("photosOptional")}</p>
        <StagedImageUploader onChange={setStagedFiles} />
      </>
    );

  const visibilityFields = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        htmlFor="status"
        label={t("visibility")}
        hint={t("visibilityHint")}
        error={errors.status}
      >
        <select
          id="status"
          value={values.status}
          onChange={(e) => set("status", e.target.value)}
          className={selectControlClass(!!errors.status)}
        >
          <option value="DRAFT">{tCommon("draft")}</option>
          <option value="PUBLISHED">{tCommon("published")}</option>
        </select>
      </Field>

      <Field
        htmlFor="availability"
        label={t("availability")}
        hint={t("availabilityHint")}
        error={errors.availability}
      >
        <select
          id="availability"
          value={values.availability}
          onChange={(e) => set("availability", e.target.value)}
          className={selectControlClass(!!errors.availability)}
        >
          {AVAILABILITY_VALUES.map((value) => (
            <option key={value} value={value}>
              {tAvail(value)}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 text-sm font-medium text-brand-800 sm:col-span-2">
        <input
          type="checkbox"
          checked={values.featured}
          onChange={(e) => set("featured", e.target.checked)}
          className="h-4 w-4 rounded border-brand-400 text-brand-600 focus:ring-brand-600"
        />
        {t("featured")}
      </label>
    </div>
  );

  const reviewSummary = (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {[
        [t("title"), values.title],
        [t("category"), tCat(values.category as "RESIDENTIAL" | "COMMERCIAL" | "BUSINESS")],
        [t("type"), values.type],
        [t("price"), Number.isFinite(Number(values.price)) && values.price !== ""
          ? formatPrice(Number(values.price), values.currency || "GBP")
          : "—"],
        [t("city"), values.city],
        [t("address"), values.address],
        [t("tenure"), values.tenure ? tTenure(values.tenure as "FREEHOLD" | "LEASEHOLD" | "SHARE_OF_FREEHOLD") : "—"],
        [
          t("stepPhotos"),
          stagedFiles.length > 0 ? t("reviewPhotoCount", { count: stagedFiles.length }) : t("reviewNoPhotos"),
        ],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-brand-100 pb-2">
          <dt className="text-brand-600">{label}</dt>
          <dd className="text-end font-medium text-brand-900">{value || "—"}</dd>
        </div>
      ))}
      {featureList.length > 0 && (
        <div className="sm:col-span-2">
          <dt className="mb-1 text-brand-600">{t("features")}</dt>
          <dd className="flex flex-wrap gap-1.5">
            {featureList.map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
              >
                {feature}
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  );

  const card = "rounded-2xl border border-brand-100 bg-white p-6 shadow-card";
  const heading = "mb-4 text-lg font-bold text-brand-950";

  const alerts = (
    <>
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      )}
      {saved && (
        <p role="status" className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800">
          {t("saved")}
        </p>
      )}
    </>
  );

  // ---- edit mode: single scrolling page --------------------------------

  if (!isWizard) {
    return (
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <section className={card}>
          <h2 className={heading}>{t("basicInfo")}</h2>
          {basicsFields}
        </section>
        <section className={card}>
          <h2 className={heading}>{t("pricing")}</h2>
          {detailsFields}
        </section>
        <section className={card}>
          <h2 className={heading}>{t("visibility")}</h2>
          {visibilityFields}
        </section>
        <section className={card}>
          <h2 className={heading}>{t("images")}</h2>
          {photosFields}
        </section>

        {alerts}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? tCommon("saving") : t("updateButton")}
          </Button>
        </div>
      </form>
    );
  }

  // ---- create mode: wizard ---------------------------------------------

  const isLastStep = step === steps.length - 1;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <WizardSteps steps={steps} current={step} furthest={furthest} onSelect={setStep} />

      <section className={card}>
        <h2 className={heading}>{steps[step].label}</h2>

        {step === 0 && basicsFields}
        {step === 1 && detailsFields}
        {step === 2 && photosFields}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-brand-600">{t("reviewIntro")}</p>
            {reviewSummary}
            <div className="border-t border-brand-100 pt-6">{visibilityFields}</div>
          </div>
        )}
      </section>

      {alerts}

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={goBack} disabled={step === 0 || saving}>
          {tCommon("previous")}
        </Button>

        <span className="text-xs text-brand-600">
          {tCommon("step", { current: step + 1, total: steps.length })}
        </span>

        {/* Both are type="button" on purpose. Clicking is a discrete event, so
            React re-renders synchronously inside the handler — if this slot
            swapped to type="submit", advancing to the last step would let the
            browser's default action submit the form immediately after. */}
        {isLastStep ? (
          <Button key="create" onClick={() => void save()} disabled={saving} size="lg">
            {saving ? tCommon("saving") : t("createButton")}
          </Button>
        ) : (
          <Button key="next" onClick={goNext} disabled={saving} size="lg">
            {tCommon("next")}
          </Button>
        )}
      </div>
    </form>
  );
}
