import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { propertyFormSchema } from "@/lib/validation";
import { slugify, randomSuffix } from "@/lib/slug";
import { availabilityRank } from "@/lib/properties";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { images: true },
  });

  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  const body = await request.json().catch(() => null);
  const parsed = propertyFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Retry until the unique constraint is satisfied rather than assuming one
  // random suffix is enough — a second collision would surface as a raw 500.
  const base = slugify(data.title) || "property";
  let slug = base;
  for (let attempt = 0; attempt < 10; attempt++) {
    const clash = await prisma.property.findUnique({ where: { slug }, select: { id: true } });
    if (!clash) break;
    slug = `${base}-${randomSuffix()}`;
  }

  const property = await prisma.property.create({
    data: {
      slug,
      category: data.category,
      type: data.type,
      status: data.status,
      availability: data.availability,
      availabilityRank: availabilityRank(data.availability),
      tenure: data.tenure ?? null,
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency,
      city: data.city,
      address: data.address,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      areaSqm: data.areaSqm ?? null,
      yearBuilt: data.yearBuilt ?? null,
      features: JSON.stringify(data.features ?? []),
      featured: data.featured,
    },
  });

  return NextResponse.json({ property }, { status: 201 });
}
