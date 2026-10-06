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
  "/api/review(.*)",
  "/api/businesses(.*)",
  "/api/upload(.*)",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/reply/generate",
  "/manifest.webmanifest",
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
]);

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([k, v]) => response.headers.set(k, v));

  // Legacy convenience redirects
  if (pathname === "/admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname === "/admin/login") return NextResponse.redirect(new URL("/login", request.url));
  if (pathname === "/review") return NextResponse.redirect(new URL("/b/cocova", request.url));

  // Require authentication for private routes (Clerk auth or demo admin session)
  const adminSessionCookie =
    request.cookies.get("admin_session_token") ||
    request.cookies.get(appConfig.admin.cookieName) ||
    request.cookies.get("cocova_session");

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
