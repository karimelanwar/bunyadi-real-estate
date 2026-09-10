import type {
  Property,
  PropertyImage,
  PropertyCategory,
  PropertyStatus,
  Availability,
  Tenure,
  InquiryStatus,
} from "@prisma/client";

export type { PropertyCategory, PropertyStatus, Availability, Tenure, InquiryStatus };

export type PropertyWithImages = Property & {
  images: PropertyImage[];
};

export interface PropertyCardData {
  id: string;
  slug: string;
  reference: number;
  category: PropertyCategory;
  type: string;
  status: PropertyStatus;
  availability: Availability;
  tenure: Tenure | null;
  title: string;
  location: string;
  price: number;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  coverImage: string | null;
  featured: boolean;
}

export interface PropertyDetailData extends PropertyCardData {
  description: string;
  address: string;
  yearBuilt: number | null;
  features: string[];
  images: string[];
  createdAt: string;
}
