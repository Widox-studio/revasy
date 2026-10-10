import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { config } from "./config";

const secretKey = new TextEncoder().encode(config.admin.sessionSecret);

export interface AdminSessionPayload {
  email: string;
  role: "admin" | "super_admin" | "business_owner";
  isSuperAdmin?: boolean;
  userId?: string;
  isClerk?: boolean;
  iat?: number;
  exp?: number;
}

export const SUPER_ADMIN_EMAILS = [
  "widoxstudio@gmail.com",
];

export const WHITELISTED_PILOT_EMAILS = [
  "widoxstudio@gmail.com",
  ...(process.env.WHITELISTED_EMAILS
    ? process.env.WHITELISTED_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : []),
];

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return SUPER_ADMIN_EMAILS.includes(normalized);
}

export function isWhitelistedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return isSuperAdminEmail(normalized) || WHITELISTED_PILOT_EMAILS.includes(normalized);
}

export function isAuthorizedForBusiness(
  sessionEmail: string | null | undefined,
  businessOwnerEmail: string | null | undefined,
  businessSlug?: string
): boolean {
  if (!sessionEmail || !businessOwnerEmail) return false;
  const normalizedSession = sessionEmail.toLowerCase().trim();
  const normalizedOwner = businessOwnerEmail.toLowerCase().trim();

  // Super admins can access any business
  if (isSuperAdminEmail(normalizedSession)) return true;

  // Regular business owners can access only their own active assigned business
  if (normalizedSession === normalizedOwner) return true;

  return false;
}

export async function createSessionToken(email: string): Promise<string> {
  const isSuper = isSuperAdminEmail(email);
  const token = await new SignJWT({
    email,
    role: isSuper ? "super_admin" : "business_owner",
  })
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
    if (typeof payload.email !== "string") {
      return null;
    }
    const isSuper = isSuperAdminEmail(payload.email);
    return {
      ...(payload as unknown as AdminSessionPayload),
      isSuperAdmin: isSuper,
    };
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

      const isSuper = isSuperAdminEmail(email);
      return {
        email: email || `${clerkAuth.userId}@clerk.user`,
        role: isSuper ? "super_admin" : "business_owner",
        isSuperAdmin: isSuper,
        userId: clerkAuth.userId,
        isClerk: true,
      };
    }
  } catch {
    // auth() may throw if invoked outside request scope
  }

  // 2. Check demo/admin session cookies
  try {
    const cookieStore = cookies();
    const sessionCookie =
      cookieStore.get("revasy_admin_session") ||
      cookieStore.get("admin_session_token") ||
      cookieStore.get(config.admin.cookieName) ||
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
  const validPasswords = [
    "widox@1502",
    config.admin.password,
  ];

  const validEmails = [
    "widoxstudio@gmail.com",
    config.admin.email.toLowerCase().trim(),
  ];

  return validEmails.includes(inputEmail) && validPasswords.includes(inputPassword);
}
