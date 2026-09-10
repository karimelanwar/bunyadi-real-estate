import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  getPropertyBySlug,
  getRelatedProperties,
  toDetailData,
  toCardData,
} from "@/lib/properties";
import { formatPrice, formatNumber, formatReference } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import {
  AVAILABILITY_TONE,
  isClosedAvailability,
  shouldShowAvailabilityBadge,
} from "@/lib/property-display";
import ImageGallery from "@/components/ImageGallery";
import InquiryForm from "@/components/InquiryForm";
import PropertyCard from "@/components/PropertyCard";
import { buttonClass } from "@/components/ui/Button";
import BedIcon from "@/components/icons/BedIcon";
import BathIcon from "@/components/icons/BathIcon";
import AreaIcon from "@/components/icons/AreaIcon";

// Without this every listing shared the site-wide title and had no preview
// image — the biggest SEO/social gap for a property site.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return { title: "Property not found" };

  const detail = toDetailData(property);
  const description = detail.description.slice(0, 155);

  return {
    title: `${detail.title} — ${detail.location}`,
    description,
    openGraph: {
      title: detail.title,
      description,
      type: "website",
      images: detail.coverImage ? [{ url: detail.coverImage }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) notFound();

  const detail = toDetailData(property);
  const t = await getTranslations("property");
  const tCat = await getTranslations("categories");
  const tCommon = await getTranslations("common");
  const tAvail = await getTranslations("availability");
  const tTenure = await getTranslations("tenure");
  const tFooter = await getTranslations("footer");

  const hasStats =
    detail.bedrooms !== null ||
    detail.bathrooms !== null ||
    detail.areaSqm !== null ||
    detail.yearBuilt !== null ||
    detail.tenure !== null;
  const closed = isClosedAvailability(detail.availability);

  const related = await getRelatedProperties(property, 3);
  const relatedCards = related.map((p) => toCardData(p));

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{tCat(detail.category)}</Badge>
            <Badge tone="solid">{detail.type}</Badge>
            {shouldShowAvailabilityBadge(detail.availability) && (
              <Badge tone={AVAILABILITY_TONE[detail.availability]}>
                {tAvail(detail.availability)}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold text-brand-950 sm:text-4xl">{detail.title}</h1>
          <p className="mt-2 flex items-center gap-1 text-brand-600">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
              <path
                fillRule="evenodd"
                d="M10 18s6-5.686 6-10A6 6 0 0 0 4 8c0 4.314 6 10 6 10Zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                clipRule="evenodd"
              />
            </svg>
            {detail.address}, {detail.location}
          </p>

          <div className="mt-6">
            <ImageGallery images={detail.images} alt={detail.title} />
          </div>

          {/* auto-fit grid: tiles stretch to fill the full row width evenly
              whether there are 1 or 5 stats, instead of the old flex-wrap
              clustering left and leaving dead space when a listing had few. */}
          {hasStats && (
          <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
            {detail.bedrooms !== null && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white py-5 text-center shadow-sm">
                <BedIcon className="h-6 w-6 text-brand-600" />
                <span className="text-lg font-bold text-brand-950">{detail.bedrooms}</span>
                <span className="text-xs text-brand-600">{t("bedrooms")}</span>
              </div>
            )}
            {detail.bathrooms !== null && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white py-5 text-center shadow-sm">
                <BathIcon className="h-6 w-6 text-brand-600" />
                <span className="text-lg font-bold text-brand-950">{detail.bathrooms}</span>
                <span className="text-xs text-brand-600">{t("bathrooms")}</span>
              </div>
            )}
            {detail.areaSqm !== null && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white py-5 text-center shadow-sm">
                <AreaIcon className="h-6 w-6 text-brand-600" />
                <span className="text-lg font-bold text-brand-950">
                  {formatNumber(detail.areaSqm)}
                </span>
                <span className="text-xs text-brand-600">{t("areaUnit")}</span>
              </div>
            )}
            {detail.yearBuilt !== null && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white py-5 text-center shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-brand-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3M16 7V3M4 11h16M5 21h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1Z" />
                </svg>
                <span className="text-lg font-bold text-brand-950">{detail.yearBuilt}</span>
                <span className="text-xs text-brand-600">{t("yearBuilt")}</span>
              </div>
            )}
            {detail.tenure && (
              <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-white py-5 text-center shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6 text-brand-600" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a4 4 0 1 0-3.9 4.9L8 15v2H6v2H4v-2.6l5.1-5.1A4 4 0 0 0 15 7Z" />
                </svg>
                <span className="text-lg font-bold text-brand-950">{tTenure(detail.tenure)}</span>
                <span className="text-xs text-brand-600">{t("tenure")}</span>
              </div>
            )}
          </div>
          )}

          <div className="mt-10">
            <h2 className="text-xl font-bold text-brand-950">{t("description")}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-brand-700">
              {detail.description}
            </p>
          </div>

          {detail.features.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-brand-950">{t("features")}</h2>
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {detail.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-brand-700">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-brand-600">
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.415l-7.5 7.6a1 1 0 0 1-1.42.005l-3.5-3.5a1 1 0 1 1 1.414-1.414l2.796 2.796 6.796-6.888a1 1 0 0 1 1.408-.014Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 flex flex-col gap-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                {t("price")}
              </p>
              <p className="mt-1 text-3xl font-extrabold text-brand-700">
                {formatPrice(detail.price, detail.currency)}
              </p>
              {detail.tenure && (
                <p className="mt-1 text-sm font-medium text-brand-700">
                  {t("tenure")}: {tTenure(detail.tenure)}
                </p>
              )}
              <p className="mt-1 text-xs text-brand-600">
                {t("reference")}: {formatReference(detail.reference)}
              </p>
            </div>

            <div className="border-t border-brand-100 pt-5">
              {/* A sold listing stays online, but it shouldn't still be
                  inviting offers — swap the form for a soft next step. */}
              <h3 className="font-semibold text-brand-950">
                {closed ? t("noLongerAvailable") : t("contactAgent")}
              </h3>
              <p className="mt-1 text-sm text-brand-700">
                {closed
                  ? t("noLongerAvailableBody", { state: tAvail(detail.availability).toLowerCase() })
                  : t("contactAgentSubtitle")}
              </p>
              <div className="mt-4">
                <InquiryForm
                  propertyId={detail.id}
                  submitLabel={closed ? t("registerInterest") : undefined}
                />
              </div>

              <div className="mt-4 border-t border-brand-100 pt-4 text-center">
                <p className="text-xs text-brand-600">
                  {t("orCallUs", { phone: tFooter("phone") })}
                </p>
                <a
                  href={`tel:${tFooter("phone").replace(/[^+\d]/g, "")}`}
                  className={buttonClass({ variant: "secondary", className: "mt-2 w-full" })}
                >
                  {t("callUs")}
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {relatedCards.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-brand-950">{t("relatedTitle")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedCards.map((card) => (
              <PropertyCard key={card.id} property={card} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <Link
          href={
            detail.category === "RESIDENTIAL"
              ? "/residential"
              : detail.category === "COMMERCIAL"
                ? "/commercial"
                : "/business"
          }
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M9.707 15.707a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414l5-5a1 1 0 1 1 1.414 1.414L6.414 9H16a1 1 0 1 1 0 2H6.414l3.293 3.293a1 1 0 0 1 0 1.414Z"
              clipRule="evenodd"
            />
          </svg>
          {tCommon("backToListings")}
        </Link>
      </div>
    </div>
  );
}
