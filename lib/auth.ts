import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  type AdminSessionPayload,
} from "./session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setSessionCookie(token: string, secure: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    // Only mark the cookie Secure when the request actually came in over
    // HTTPS. A hardcoded `NODE_ENV === "production"` check breaks login on
    // a plain-HTTP local/LAN server (e.g. http://192.168.x.x:3000) because
    // browsers silently refuse to store Secure cookies on insecure origins
    // — the login would appear to "hang" as it kept bouncing back to the
    // login page with no session ever actually persisted.
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentAdmin(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { createSessionToken, verifySessionToken, SESSION_COOKIE_NAME };
export type { AdminSessionPayload };
