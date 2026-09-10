import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { inquirySchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`inquiry:${ip}`, MAX_SUBMISSIONS, WINDOW_MS);
  if (!success) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { propertyId, name, phone, email, message } = parsed.data;

  if (propertyId) {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: propertyId || null,
      name,
      phone,
      email: email || null,
      message,
    },
  });

  return NextResponse.json({ inquiry }, { status: 201 });
}
