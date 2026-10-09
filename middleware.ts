import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { securityHeaders } from "./lib/security";
import { config as appConfig } from "./lib/config";

const isPublicRoute = createRouteMatcher([
  "/",
  "/b/(.*)",
  "/b/:path*",
  "/review",
  "/login(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin/login(.*)",
  "/api/review(.*)",
  "/api/feedback(.*)",
  "/api/businesses(.*)",
  "/api/places(.*)",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/reply/generate",
  "/api/auth/google/callback(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
]);

import type { NextRequest, NextFetchEvent } from "next/server";

const clerkHandler = clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([k, v]) => response.headers.set(k, v));

  // Legacy convenience redirects
  if (pathname === "/review") return NextResponse.redirect(new URL("/b/cocova", request.url));

  // Require authentication for private routes (Clerk auth or admin session)
  const adminSessionCookie =
    request.cookies.get("revasy_admin_session") ||
    request.cookies.get("admin_session_token") ||
    request.cookies.get(appConfig.admin.cookieName) ||
    request.cookies.get("cocova_session");

  // Admin routes specifically require admin login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!adminSessionCookie?.value) {
      try {
        const clerkAuth = auth();
        if (!clerkAuth?.userId) {
          const adminLoginUrl = new URL("/admin/login", request.url);
          adminLoginUrl.searchParams.set("redirect_url", pathname);
          return NextResponse.redirect(adminLoginUrl);
        }
      } catch {
        const adminLoginUrl = new URL("/admin/login", request.url);
        adminLoginUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(adminLoginUrl);
      }
    }
  }

  if (!isPublicRoute(request) && !adminSessionCookie?.value) {
    try {
      const clerkAuth = auth();
      if (!clerkAuth?.userId) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // If handshake query param exists on public customer-facing routes, strip it immediately to prevent cross-origin Clerk handshake crashes
  if (isPublicRoute(request) && request.nextUrl.searchParams.has("__clerk_handshake")) {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("__clerk_handshake");
    return NextResponse.redirect(cleanUrl);
  }

  try {
    return await clerkHandler(request, event);
  } catch (err) {
    console.warn("Clerk middleware warning:", err);
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};
