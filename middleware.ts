import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { securityHeaders } from "./lib/security";

const isPublicRoute = createRouteMatcher([
  "/",
  "/b/(.*)",
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
]);

export default clerkMiddleware((auth, request) => {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([k, v]) => response.headers.set(k, v));

  // Legacy convenience redirects
  if (pathname === "/admin") return NextResponse.redirect(new URL("/dashboard", request.url));
  if (pathname === "/admin/login") return NextResponse.redirect(new URL("/login", request.url));
  if (pathname === "/review") return NextResponse.redirect(new URL("/b/cocova", request.url));

  if (!isPublicRoute(request)) {
    auth().protect();
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
