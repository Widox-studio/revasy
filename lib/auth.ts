import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { config } from "./config";

const secretKey = new TextEncoder().encode(config.admin.sessionSecret);

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

export async function createSessionToken(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${config.admin.sessionMaxAgeSeconds}s`)
    .sign(secretKey);

  return token;
}

export async function verifySessionToken(token: string): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin" || typeof payload.email !== "string") {
      return null;
    }
    return payload as unknown as AdminSessionPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(config.admin.cookieName);
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }
  return verifySessionToken(sessionCookie.value);
}

export function validateAdminCredentials(email: string, pass: string): boolean {
  const expectedEmail = config.admin.email.toLowerCase().trim();
  const expectedPassword = config.admin.password;

  const inputEmail = email.toLowerCase().trim();
  const inputPassword = pass;

  return inputEmail === expectedEmail && inputPassword === expectedPassword;
}
