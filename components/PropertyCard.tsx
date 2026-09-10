import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice, formatArea } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import {
  AVAILABILITY_TONE,
  isClosedAvailability,
  shouldShowAvailabilityBadge,
} from "@/lib/property-display";
import type { PropertyCardData } from "@/lib/types";
import BedIcon from "./icons/BedIcon";
import BathIcon from "./icons/BathIcon";
import AreaIcon from "./icons/AreaIcon";

export default function PropertyCard({ property }: { property: PropertyCardData }) {
  const t = useTranslations();
  const tAvail = useTranslations("availability");
  const tTenure = useTranslations("tenure");
  const tProperty = useTranslations("property");

  const closed = isClosedAvailability(property.availability);

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-100">
        {property.coverImage ? (
          <Image
            src={property.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover object-top transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none ${
              closed ? "opacity-75 saturate-50" : ""
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm font-medium text-brand-700">
            {tProperty("noImages")}
          </div>
        )}

        {/* Sold / let agreed get a dark wash so the state reads instantly. */}
        {closed && <span aria-hidden="true" className="absolute inset-0 bg-brand-950/35" />}

        <div className="absolute start-3 top-3 flex flex-wrap items-center gap-1.5">
          <Badge tone="info">{t(`categories.${property.category}`)}</Badge>
          {shouldShowAvailabilityBadge(property.availability) && (
            <Badge tone={AVAILABILITY_TONE[property.availability]}>
              {tAvail(property.availability)}
            </Badge>
          )}
        </div>

        {property.featured && (
          <span
            title={t("home.featuredTitle")}
            className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm ring-2 ring-white/70"
          >
            <span className="sr-only">{t("home.featuredTitle")}</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M10 1.6l2.47 5.39 5.93.63-4.45 4.02 1.26 5.83L10 14.62l-5.21 2.85 1.26-5.83L1.6 7.62l5.93-.63L10 1.6Z" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-brand-950">{property.title}</h3>

        <p className="flex items-center gap-1 text-sm text-brand-700">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18s6-5.686 6-10A6 6 0 0 0 4 8c0 4.314 6 10 6 10Zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="line-clamp-1">{property.location}</span>
        </p>

        <div className="flex items-center gap-4 text-sm text-brand-700">
          {property.bedrooms !== null && (
            <span className="flex items-center gap-1">
              <BedIcon className="h-4 w-4" />
              <span aria-hidden="true">{property.bedrooms}</span>
              <span className="sr-only">
                {property.bedrooms} {tProperty("bedrooms")}
              </span>
            </span>
          )}
          {property.bathrooms !== null && (
            <span className="flex items-center gap-1">
              <BathIcon className="h-4 w-4" />
              <span aria-hidden="true">{property.bathrooms}</span>
              <span className="sr-only">
                {property.bathrooms} {tProperty("bathrooms")}
              </span>
            </span>
          )}
          {property.areaSqm !== null && (
            <span className="flex items-center gap-1">
              <AreaIcon className="h-4 w-4" />
              <span>{formatArea(property.areaSqm)}</span>
            </span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <span>
            <span className="block text-lg font-bold text-brand-700">
              {formatPrice(property.price, property.currency)}
            </span>
            {property.tenure && (
              <span className="block text-xs font-medium text-brand-600">
                {tTenure(property.tenure)}
              </span>
            )}
          </span>
          <span className="text-sm font-semibold text-brand-600 group-hover:underline">
            {t("common.viewDetails")}
          </span>
        </div>
      </div>
    </Link>
  );
}
