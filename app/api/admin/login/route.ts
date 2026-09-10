import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 30;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// A real bcrypt hash (of a value nobody can log in with) used purely to keep
// the timing of a failed lookup indistinguishable from a wrong password.
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8e./ZQZ8kO4mYqZ0oGGzL7hRVJ0aFi";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`login:${ip}`, MAX_ATTEMPTS, WINDOW_MS);
  if (!success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });

  // Always run a bcrypt comparison, even for an unknown email, so response
  // time doesn't reveal which addresses exist.
  const valid = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH);

  if (!admin || !valid) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken({ adminId: admin.id, email: admin.email });
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const isHttps = (forwardedProto ?? request.nextUrl.protocol).startsWith("https");
  await setSessionCookie(token, isHttps);

  return NextResponse.json({ ok: true });
}
