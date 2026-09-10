import { useTranslations } from "next-intl";
import Badge from "@/components/ui/Badge";
import { STATUS_TONE, STATUS_LABEL_KEY, AVAILABILITY_TONE } from "@/lib/property-display";
import type { Availability, PropertyStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: PropertyStatus }) {
  const t = useTranslations("common");
  return <Badge tone={STATUS_TONE[status]}>{t(STATUS_LABEL_KEY[status])}</Badge>;
}

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  const t = useTranslations("availability");
  return <Badge tone={AVAILABILITY_TONE[availability]}>{t(availability)}</Badge>;
}

export default StatusBadge;
