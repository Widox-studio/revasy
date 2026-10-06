import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { config } from "./config";

const secretKey = new TextEncoder().encode(config.admin.sessionSecret);

export interface AdminSessionPayload {
  email: string;
  role: "admin";
  userId?: string;
  isClerk?: boolean;
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
  // 1. Check Clerk session first
  try {
    const clerkAuth = auth();
    if (clerkAuth?.userId) {
      const claims = clerkAuth.sessionClaims as Record<string, unknown> | null;
      let email =
        (typeof claims?.email === "string" ? claims.email : null) ||
        (typeof claims?.primary_email === "string" ? claims.primary_email : null);

      if (!email) {
        try {
          const user = await currentUser();
          email =
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            null;
        } catch {
          // currentUser network call may fail in offline or mock environments
        }
      }

      return {
        email: email || `${clerkAuth.userId}@clerk.user`,
        role: "admin",
        userId: clerkAuth.userId,
        isClerk: true,
      };
    }
  } catch {
    // auth() may throw if invoked outside request scope
  }

  // 2. Check demo session cookies
  try {
    const cookieStore = cookies();
    const sessionCookie =
      cookieStore.get(config.admin.cookieName) ||
      cookieStore.get("admin_session_token") ||
      cookieStore.get("cocova_session");

    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    return await verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, pass: string): boolean {
  const inputEmail = email.toLowerCase().trim();
  const inputPassword = pass;
  const expectedPassword = config.admin.password;

  const validEmails = [
    config.admin.email.toLowerCase().trim(),
    "admin@revasy.com",
    "admin@widox.in",
    "owner@cocovacafe.com",
    "admin@cocova.in",
  ];

  return validEmails.includes(inputEmail) && inputPassword === expectedPassword;
}
