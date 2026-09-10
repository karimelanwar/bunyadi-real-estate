import type { Availability, PropertyStatus, Tenure } from "./types";
import type { BadgeTone } from "@/components/ui/Badge";

// Single source of truth for how each enum value is presented, so the admin
// table, the public card and the detail page can never disagree.

export const STATUS_TONE: Record<PropertyStatus, BadgeTone> = {
  PUBLISHED: "neutral",
  DRAFT: "warning",
};

export const STATUS_LABEL_KEY: Record<PropertyStatus, string> = {
  PUBLISHED: "published",
  DRAFT: "draft",
};

export const AVAILABILITY_TONE: Record<Availability, BadgeTone> = {
  AVAILABLE: "success",
  UNDER_OFFER: "warning",
  SOLD: "danger",
  LET_AGREED: "danger",
};

/**
 * AVAILABLE is the default state and adds no information on a public card —
 * showing "Available" on every listing is noise. The other three are the
 * whole point of the badge.
 */
export function shouldShowAvailabilityBadge(availability: Availability): boolean {
  return availability !== "AVAILABLE";
}

/** Sold / let agreed listings are dimmed so the state reads at a glance. */
export function isClosedAvailability(availability: Availability): boolean {
  return availability === "SOLD" || availability === "LET_AGREED";
}

export const AVAILABILITY_VALUES: Availability[] = [
  "AVAILABLE",
  "UNDER_OFFER",
  "SOLD",
  "LET_AGREED",
];

export const TENURE_VALUES: Tenure[] = ["FREEHOLD", "LEASEHOLD", "SHARE_OF_FREEHOLD"];
