import { SignJWT, jwtVerify } from "jose";
import { env } from "./env";

export const SESSION_COOKIE_NAME = "bunyadi_admin_session";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

function getSecretKey() {
  return secretKey;
}

export interface AdminSessionPayload {
  adminId: string;
  email: string;
}

export async function createSessionToken(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.adminId === "string" && typeof payload.email === "string") {
      return { adminId: payload.adminId, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}
