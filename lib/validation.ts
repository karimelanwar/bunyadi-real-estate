import { z } from "zod";
import {
  PropertyCategory,
  PropertyStatus,
  Availability,
  Tenure,
} from "@prisma/client";

// Derived from the Prisma enums so the form, the API and the database can
// never drift apart when a value is added.
export const propertyCategories = Object.values(PropertyCategory);
export const propertyStatuses = Object.values(PropertyStatus);
export const availabilities = Object.values(Availability);
export const tenures = Object.values(Tenure);

const MAX_PRICE = 1_000_000_000;
const MIN_YEAR = 1000;
const MAX_YEAR = new Date().getFullYear() + 10;

// Field shapes WITHOUT defaults. Kept separate because zod's `.partial()` does
// not suppress `.default()` — a PATCH of `{ availability: "SOLD" }` against a
// defaulted schema also yields status:"DRAFT", features:[] and featured:false,
// which silently unpublished the listing and wiped its features.
const propertyFields = {
  category: z.nativeEnum(PropertyCategory),
  type: z.string().trim().min(1, "Property type is required").max(60, "Property type is too long"),
  status: z.nativeEnum(PropertyStatus),
  availability: z.nativeEnum(Availability),
  tenure: z.nativeEnum(Tenure).nullable(),

  title: z.string().trim().min(1, "Title is required").max(150, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(5000, "Description is too long"),

  price: z.coerce
    .number({ message: "Price must be a number" })
    .nonnegative("Price cannot be negative")
    .max(MAX_PRICE, "Price is unrealistically high"),
  currency: z.string().trim().min(1).max(3),

  city: z.string().trim().min(1, "City is required").max(80, "City is too long"),
  address: z.string().trim().min(1, "Address is required").max(200, "Address is too long"),

  bedrooms: z.coerce.number().int().nonnegative().max(100).nullable(),
  bathrooms: z.coerce.number().int().nonnegative().max(100).nullable(),
  areaSqm: z.coerce.number().nonnegative().max(10_000_000).nullable(),
  yearBuilt: z.coerce
    .number()
    .int()
    .min(MIN_YEAR, `Year must be ${MIN_YEAR} or later`)
    .max(MAX_YEAR, `Year cannot be later than ${MAX_YEAR}`)
    .nullable(),

  features: z.array(z.string().trim().min(1)).max(50),

  featured: z.boolean(),
};

/** Full payload — used when creating, and by the admin form's own validation. */
export const propertyFormSchema = z.object({
  ...propertyFields,
  status: propertyFields.status.default(PropertyStatus.DRAFT),
  availability: propertyFields.availability.default(Availability.AVAILABLE),
  tenure: propertyFields.tenure.optional(),
  currency: propertyFields.currency.default("GBP"),
  bedrooms: propertyFields.bedrooms.optional(),
  bathrooms: propertyFields.bathrooms.optional(),
  areaSqm: propertyFields.areaSqm.optional(),
  yearBuilt: propertyFields.yearBuilt.optional(),
  features: propertyFields.features.default([]),
  featured: propertyFields.featured.default(false),
});

/**
 * Partial payload for PATCH. Built from the default-free field shapes so an
 * omitted key stays omitted and the API only writes what was actually sent.
 */
export const propertyUpdateSchema = z.object(propertyFields).partial();

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
export type PropertyUpdateValues = z.infer<typeof propertyUpdateSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inquirySchema = z.object({
  propertyId: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().min(1, "Phone is required").max(40),
  email: z.string().trim().email().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

// Public listing URLs are attacker-controlled. Anything unparseable is dropped
// rather than passed through to Prisma, where `NaN` or a negative `skip` throws
// and turns a bad query string into a 500.
const positiveIntParam = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
  });

export const listingSearchParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
    }),
  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => v || undefined),
  minPrice: positiveIntParam,
  maxPrice: positiveIntParam,
  bedrooms: positiveIntParam,
  sort: z.enum(["newest", "price_asc", "price_desc"]).catch("newest"),
});

export type ListingSearchParams = z.infer<typeof listingSearchParamsSchema>;
