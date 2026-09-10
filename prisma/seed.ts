import {
  PrismaClient,
  PropertyCategory,
  PropertyStatus,
  Availability,
  Tenure,
} from "@prisma/client";
import { slugify, randomSuffix } from "../lib/slug";
import { availabilityRank } from "../lib/properties";

const prisma = new PrismaClient();

function uniqueSlug(title: string, used: Set<string>): string {
  const base = slugify(title) || "property";
  let slug = base;
  while (used.has(slug)) {
    slug = `${base}-${randomSuffix(4)}`;
  }
  used.add(slug);
  return slug;
}

interface SeedProperty {
  category: PropertyCategory;
  type: string;
  status: PropertyStatus;
  availability?: Availability;
  tenure?: Tenure;
  title: string;
  description: string;
  price: number;
  city: string;
  address: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaSqm: number | null;
  yearBuilt: number | null;
  features: string[];
  featured: boolean;
  images: string[];
}

const residential: SeedProperty[] = [
  {
    category: "RESIDENTIAL",
    type: "Villa",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Modern Family Villa with Private Garden",
    description:
      "A spacious modern villa featuring an open-plan living area, private garden, and high-end finishes throughout. Perfect for families looking for comfort and privacy in a quiet neighbourhood.",
    price: 950000,
    city: "London",
    address: "15 Kensington Grove, Chelsea",
    bedrooms: 5,
    bathrooms: 4,
    areaSqm: 420,
    yearBuilt: 2019,
    features: ["Private garden", "Garage", "Central heating", "Security system", "Balcony"],
    featured: true,
    images: ["residential-1.jpg", "residential-2.jpg", "residential-3.jpg"],
  },
  {
    category: "RESIDENTIAL",
    type: "Apartment",
    status: "PUBLISHED",
    availability: "UNDER_OFFER",
    tenure: "LEASEHOLD",
    title: "Bright 3-Bedroom Apartment Near City Centre",
    description:
      "This bright and airy apartment offers three generously sized bedrooms, a modern kitchen, and stunning city views. Walking distance to shops, restaurants, and public transport.",
    price: 275000,
    city: "Manchester",
    address: "Flat 4, Oxford Road",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 165,
    yearBuilt: 2021,
    features: ["Lift", "City view", "Parking", "Fitted kitchen"],
    featured: true,
    images: ["residential-2.jpg", "residential-4.jpg"],
  },
  {
    category: "RESIDENTIAL",
    type: "House",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Cosy Two-Storey House with Courtyard Garden",
    description:
      "A charming two-storey house with a private courtyard garden, ideal for a growing family. Includes four bedrooms, a large kitchen, and ample storage space.",
    price: 340000,
    city: "Birmingham",
    address: "Unit 2, Broad Street",
    bedrooms: 4,
    bathrooms: 3,
    areaSqm: 280,
    yearBuilt: 2015,
    features: ["Courtyard garden", "Storage room", "Double glazing", "Solar panels"],
    featured: false,
    images: ["residential-3.jpg", "residential-5.jpg"],
  },
  {
    category: "RESIDENTIAL",
    type: "Apartment",
    status: "PUBLISHED",
    availability: "SOLD",
    tenure: "LEASEHOLD",
    title: "Compact 2-Bedroom Apartment for First-Time Buyers",
    description:
      "An affordable and well-maintained apartment, perfect for first-time buyers or small families. Close to schools, parks, and public services.",
    price: 220000,
    city: "London",
    address: "Flat 3, Camden High Street",
    bedrooms: 2,
    bathrooms: 1,
    areaSqm: 95,
    yearBuilt: 2017,
    features: ["Balcony", "Shared parking", "Near school"],
    featured: false,
    images: ["residential-4.jpg", "residential-6.jpg"],
  },
  {
    category: "RESIDENTIAL",
    type: "Villa",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Luxury Hampstead Villa with Panoramic Views",
    description:
      "An exclusive villa overlooking Hampstead Heath, offering panoramic views, a private pool, and premium finishes. A rare opportunity for luxury living.",
    price: 2450000,
    city: "London",
    address: "Hampstead Heath Lane",
    bedrooms: 6,
    bathrooms: 5,
    areaSqm: 610,
    yearBuilt: 2022,
    features: ["Private pool", "Panoramic view", "Home theatre", "Guest house", "Smart home"],
    featured: true,
    images: ["residential-5.jpg", "residential-1.jpg", "residential-6.jpg"],
  },
  {
    category: "RESIDENTIAL",
    type: "Townhouse",
    status: "DRAFT",
    title: "New Townhouse Development – Coming Soon",
    description:
      "A brand-new townhouse development currently under final preparations. Modern design with shared community amenities.",
    price: 310000,
    city: "Leeds",
    address: "Kirkstall Road, Phase 2",
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 190,
    yearBuilt: 2026,
    features: ["Community park", "Shared playground"],
    featured: false,
    images: ["residential-6.jpg"],
  },
];

const commercial: SeedProperty[] = [
  {
    category: "COMMERCIAL",
    type: "Office",
    status: "PUBLISHED",
    tenure: "LEASEHOLD",
    title: "Prime Office Space in Business District",
    description:
      "A modern office space located in the heart of the business district, offering excellent visibility and easy access for clients and staff.",
    price: 650000,
    city: "London",
    address: "Oxford Street, Main Boulevard",
    bedrooms: null,
    bathrooms: 2,
    areaSqm: 320,
    yearBuilt: 2018,
    features: ["Reception area", "Meeting rooms", "High-speed internet", "24/7 access"],
    featured: true,
    images: ["commercial-1.jpg", "commercial-2.jpg"],
  },
  {
    category: "COMMERCIAL",
    type: "Retail Shop",
    status: "PUBLISHED",
    availability: "LET_AGREED",
    tenure: "LEASEHOLD",
    title: "High-Traffic Retail Shop on Main Street",
    description:
      "A retail shop situated on a high-traffic main street, ideal for a storefront business looking for maximum visibility.",
    price: 185000,
    city: "Manchester",
    address: "Deansgate, Shop 12",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 85,
    yearBuilt: 2016,
    features: ["Storefront window", "Storage room", "Signage space"],
    featured: false,
    images: ["commercial-2.jpg", "commercial-3.jpg"],
  },
  {
    category: "COMMERCIAL",
    type: "Warehouse",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Large Industrial Warehouse with Loading Dock",
    description:
      "A large warehouse with high ceilings, multiple loading docks, and easy lorry access. Suitable for logistics or manufacturing operations.",
    price: 890000,
    city: "Birmingham",
    address: "Aston Industrial Estate, Block C",
    bedrooms: null,
    bathrooms: 2,
    areaSqm: 1400,
    yearBuilt: 2014,
    features: ["Loading dock", "High ceiling", "Lorry access", "Office annex"],
    featured: true,
    images: ["commercial-3.jpg", "commercial-4.jpg"],
  },
  {
    category: "COMMERCIAL",
    type: "Land",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Commercial Land Plot Ready for Development",
    description:
      "A prime commercial land plot with all necessary permits in place, ready for immediate development.",
    price: 420000,
    city: "Bristol",
    address: "Avonmouth Ring Road, Plot 45",
    bedrooms: null,
    bathrooms: null,
    areaSqm: 2000,
    yearBuilt: null,
    features: ["Corner plot", "Road access", "Utilities available"],
    featured: false,
    images: ["commercial-4.jpg", "commercial-5.jpg"],
  },
  {
    category: "COMMERCIAL",
    type: "Office",
    status: "PUBLISHED",
    availability: "UNDER_OFFER",
    tenure: "LEASEHOLD",
    title: "Boutique Office Suite for Small Teams",
    description:
      "A stylish boutique office suite designed for small teams, featuring an open workspace and private meeting room.",
    price: 210000,
    city: "London",
    address: "Shoreditch High Street, Unit 7",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 110,
    yearBuilt: 2020,
    features: ["Open workspace", "Private meeting room", "Kitchenette"],
    featured: false,
    images: ["commercial-5.jpg", "commercial-6.jpg"],
  },
  {
    category: "COMMERCIAL",
    type: "Retail Shop",
    status: "DRAFT",
    title: "Shopping Centre Unit – Listing in Progress",
    description:
      "A retail unit inside a busy shopping centre. Listing details are being finalised before publishing.",
    price: 245000,
    city: "Leeds",
    address: "Trinity Leeds Mall, Unit 8",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 70,
    yearBuilt: 2023,
    features: ["Mall foot traffic", "Shared parking"],
    featured: false,
    images: ["commercial-6.jpg"],
  },
];

const business: SeedProperty[] = [
  {
    category: "BUSINESS",
    type: "Restaurant",
    status: "PUBLISHED",
    tenure: "LEASEHOLD",
    title: "Established Restaurant with Loyal Customer Base",
    description:
      "A well-established restaurant business with a loyal customer base, fully equipped kitchen, and prime location. Turnkey opportunity.",
    price: 275000,
    city: "London",
    address: "Borough Market, Food Street",
    bedrooms: null,
    bathrooms: 2,
    areaSqm: 260,
    yearBuilt: 2012,
    features: ["Fully equipped kitchen", "Dining hall for 80", "Outdoor seating", "Staff included"],
    featured: true,
    images: ["business-1.jpg", "business-2.jpg"],
  },
  {
    category: "BUSINESS",
    type: "Grocery Store",
    status: "PUBLISHED",
    availability: "SOLD",
    tenure: "LEASEHOLD",
    title: "Profitable Grocery Store in Residential Area",
    description:
      "A profitable grocery store serving a dense residential neighbourhood, with consistent daily foot traffic and steady revenue.",
    price: 95000,
    city: "Manchester",
    address: "Northern Quarter, Market Row",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 90,
    yearBuilt: 2015,
    features: ["Refrigeration units", "Storage basement", "Existing supplier contracts"],
    featured: false,
    images: ["business-2.jpg", "business-3.jpg"],
  },
  {
    category: "BUSINESS",
    type: "Bakery",
    status: "PUBLISHED",
    tenure: "LEASEHOLD",
    title: "Popular Bakery & Pastry Shop for Sale",
    description:
      "A popular bakery known for its fresh bread and pastries, complete with modern ovens and a dedicated customer base.",
    price: 120000,
    city: "Birmingham",
    address: "Bullring Market, Row 3",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 120,
    yearBuilt: 2017,
    features: ["Commercial ovens", "Display counters", "Delivery vehicle included"],
    featured: true,
    images: ["business-3.jpg", "business-4.jpg"],
  },
  {
    category: "BUSINESS",
    type: "Retail Franchise",
    status: "PUBLISHED",
    tenure: "LEASEHOLD",
    title: "Retail Franchise Opportunity – Electronics Store",
    description:
      "An established electronics retail franchise with strong brand recognition and an experienced sales team already in place.",
    price: 380000,
    city: "London",
    address: "Tottenham Court Road, Electronics Market",
    bedrooms: null,
    bathrooms: 2,
    areaSqm: 200,
    yearBuilt: 2019,
    features: ["Brand recognition", "Trained staff", "Inventory included", "Security cameras"],
    featured: false,
    images: ["business-4.jpg", "business-5.jpg"],
  },
  {
    category: "BUSINESS",
    type: "Manufacturing Business",
    status: "PUBLISHED",
    tenure: "FREEHOLD",
    title: "Small-Scale Textile Manufacturing Business",
    description:
      "A small-scale textile manufacturing operation with modern machinery, trained workforce, and existing export contracts.",
    price: 520000,
    city: "Leeds",
    address: "Leeds Industrial Park, Unit 9",
    bedrooms: null,
    bathrooms: 2,
    areaSqm: 850,
    yearBuilt: 2013,
    features: ["Modern machinery", "Trained workforce", "Export contracts", "Warehouse included"],
    featured: false,
    images: ["business-5.jpg", "business-6.jpg"],
  },
  {
    category: "BUSINESS",
    type: "Restaurant",
    status: "DRAFT",
    title: "New Cafe Concept – Details Coming Soon",
    description:
      "A new cafe business opportunity currently being prepared for listing. Check back soon for full details.",
    price: 85000,
    city: "Bristol",
    address: "University Road, Clifton",
    bedrooms: null,
    bathrooms: 1,
    areaSqm: 75,
    yearBuilt: 2024,
    features: ["Espresso equipment", "Outdoor seating"],
    featured: false,
    images: ["business-6.jpg"],
  },
];

async function main() {
  const force = process.argv.includes("--force");
  const existingCount = await prisma.property.count();

  // Demo content is opt-in on a database that already holds data. Wiping
  // properties also wipes every customer enquiry, which has no other copy —
  // so re-seeding must never be an accident.
  if (existingCount > 0 && !force) {
    console.log(
      `Skipping seed: ${existingCount} propert${existingCount === 1 ? "y" : "ies"} already exist.\n` +
        `Run "npm run db:seed -- --force" to REPLACE all properties, images and enquiries.`
    );
    return;
  }

  if (existingCount > 0 && force) {
    console.warn(
      `--force: deleting ${existingCount} existing propert${existingCount === 1 ? "y" : "ies"}, their images, and ALL enquiries.`
    );
  }

  const all = [...residential, ...commercial, ...business];
  const usedSlugs = new Set<string>();

  await prisma.propertyImage.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.property.deleteMany();

  for (const item of all) {
    const slug = uniqueSlug(item.title, usedSlugs);
    await prisma.property.create({
      data: {
        slug,
        category: item.category,
        type: item.type,
        status: item.status,
        availability: item.availability ?? "AVAILABLE",
        availabilityRank: availabilityRank(item.availability ?? "AVAILABLE"),
        tenure: item.tenure ?? null,
        title: item.title,
        description: item.description,
        price: item.price,
        currency: "GBP",
        city: item.city,
        address: item.address,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        areaSqm: item.areaSqm,
        yearBuilt: item.yearBuilt,
        features: JSON.stringify(item.features),
        featured: item.featured,
        images: {
          create: item.images.map((filename, index) => ({
            url: `/uploads/seed/${filename}`,
            sortOrder: index,
            isCover: index === 0,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${all.length} properties.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
