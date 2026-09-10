import { prisma } from "./db";
import type { Prisma, PropertyCategory, PropertyStatus, Availability } from "@prisma/client";
import type { PropertyWithImages, PropertyCardData, PropertyDetailData } from "./types";
import { parseReference } from "./format";

// A listing is publicly visible based on `status` alone. `availability` never
// hides anything — a SOLD or LET_AGREED listing stays on the site (and keeps
// its URL working) until it is explicitly unpublished or deleted.
export const ACTIVE_AVAILABILITY: Availability[] = ["AVAILABLE", "UNDER_OFFER"];

export function isActiveAvailability(availability: Availability): boolean {
  return ACTIVE_AVAILABILITY.includes(availability);
}

// The single place that decides the persisted `availabilityRank` sort key.
// Every write path that sets `availability` must also set this.
export function availabilityRank(availability: Availability): number {
  return isActiveAvailability(availability) ? 0 : 1;
}

function coverImageOf(property: PropertyWithImages): string | null {
  if (property.images.length === 0) return null;
  const cover = property.images.find((img) => img.isCover);
  return (cover ?? property.images[0]).url;
}

function safeParseFeatures(json: string): string[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function toCardData(property: PropertyWithImages): PropertyCardData {
  return {
    id: property.id,
    slug: property.slug,
    reference: property.reference,
    category: property.category,
    type: property.type,
    status: property.status,
    availability: property.availability,
    tenure: property.tenure,
    title: property.title,
    location: property.city,
    price: property.price,
    currency: property.currency,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    areaSqm: property.areaSqm,
    coverImage: coverImageOf(property),
    featured: property.featured,
  };
}

export function toDetailData(property: PropertyWithImages): PropertyDetailData {
  const card = toCardData(property);
  const sortedImages = [...property.images].sort((a, b) => a.sortOrder - b.sortOrder);
  return {
    ...card,
    description: property.description,
    address: property.address,
    yearBuilt: property.yearBuilt,
    features: safeParseFeatures(property.features),
    images: sortedImages.map((img) => img.url),
    createdAt: property.createdAt.toISOString(),
  };
}

export interface PropertyFilters {
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
  onlyPublished?: boolean;
  status?: PropertyStatus;
  availability?: Availability;
  search?: string;
}

export async function getProperties(filters: PropertyFilters) {
  const {
    category,
    city,
    minPrice,
    maxPrice,
    bedrooms,
    sort = "newest",
    page = 1,
    pageSize = 12,
    onlyPublished = true,
    status,
    availability,
    search,
  } = filters;

  const where: Prisma.PropertyWhereInput = {
    ...(onlyPublished ? { status: "PUBLISHED" } : {}),
    ...(!onlyPublished && status ? { status } : {}),
    ...(availability ? { availability } : {}),
    ...(category ? { category } : {}),
    ...(minPrice !== undefined ? { price: { gte: minPrice } } : {}),
    ...(maxPrice !== undefined
      ? { price: { ...(minPrice !== undefined ? { gte: minPrice } : {}), lte: maxPrice } }
      : {}),
    ...(bedrooms !== undefined ? { bedrooms: { gte: bedrooms } } : {}),
  };

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (search) {
    const referenceMatch = parseReference(search);
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          ...(referenceMatch !== null ? [{ reference: referenceMatch }] : []),
        ],
      },
    ];
  }

  const sortKey: Prisma.PropertyOrderByWithRelationInput =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  // On the public site, still-available stock always leads; sold/let-agreed
  // listings remain in the results but fall to the end. Admins see a plain
  // sort so their list matches what they just changed.
  const orderBy: Prisma.PropertyOrderByWithRelationInput[] = onlyPublished
    ? [{ availabilityRank: "asc" }, sortKey]
    : [sortKey];

  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      include: { images: true },
      skip: Math.max(0, (page - 1) * pageSize),
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ]);

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

// Sold/let-agreed listings are excluded here only — the homepage shouldn't
// headline stock nobody can buy. They remain visible everywhere else.
export async function getFeaturedProperties(limit = 6) {
  return prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
      availability: { in: ACTIVE_AVAILABILITY },
    },
    orderBy: { createdAt: "desc" },
    include: { images: true },
    take: limit,
  });
}

// Note: intentionally filtered by `status` only. A sold listing must keep
// resolving at its original URL, otherwise every inbound link and search
// result for it breaks the moment it's marked sold.
export async function getPropertyBySlug(slug: string, { onlyPublished = true } = {}) {
  return prisma.property.findFirst({
    where: { slug, ...(onlyPublished ? { status: "PUBLISHED" } : {}) },
    include: { images: true },
  });
}

export async function getRelatedProperties(property: PropertyWithImages, limit = 3) {
  return prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      category: property.category,
      id: { not: property.id },
    },
    orderBy: [{ availabilityRank: "asc" }, { createdAt: "desc" }],
    include: { images: true },
    take: limit,
  });
}

export async function getDashboardStats() {
  const [
    total,
    published,
    draft,
    underOffer,
    sold,
    letAgreed,
    residential,
    commercial,
    business,
    inquiries,
    newInquiries,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "PUBLISHED" } }),
    prisma.property.count({ where: { status: "DRAFT" } }),
    prisma.property.count({ where: { availability: "UNDER_OFFER" } }),
    prisma.property.count({ where: { availability: "SOLD" } }),
    prisma.property.count({ where: { availability: "LET_AGREED" } }),
    prisma.property.count({ where: { category: "RESIDENTIAL" } }),
    prisma.property.count({ where: { category: "COMMERCIAL" } }),
    prisma.property.count({ where: { category: "BUSINESS" } }),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "NEW" } }),
  ]);

  return {
    total,
    published,
    draft,
    underOffer,
    sold,
    letAgreed,
    residential,
    commercial,
    business,
    inquiries,
    newInquiries,
  };
}
