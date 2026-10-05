import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { config } from "./lib/config";
import { securityHeaders } from "./lib/security";

const secretKey = new TextEncoder().encode(config.admin.sessionSecret);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Apply production security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Legacy redirects
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/review") {
    return NextResponse.redirect(new URL("/b/cocova", request.url));
  }

  // Guard protected SaaS dashboard routes: /dashboard, /dashboard/...
  const isDashboardPage = pathname.startsWith("/dashboard");
  const isProtectedApi = pathname.startsWith("/api/admin/reply");

  if (isDashboardPage || isProtectedApi) {
    const sessionCookie = request.cookies.get(config.admin.cookieName);

    let isAuthenticated = false;
    if (sessionCookie?.value) {
      try {
        const { payload } = await jwtVerify(sessionCookie.value, secretKey);
        if (payload.role === "admin") {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    if (!isAuthenticated) {
      if (isProtectedApi) {
        return NextResponse.json(
          { error: "Unauthorized. Please log in." },
          { status: 401, headers: response.headers }
        );
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /login, redirect to /dashboard
  if (pathname === "/login") {
    const sessionCookie = request.cookies.get(config.admin.cookieName);
    if (sessionCookie?.value) {
      try {
        const { payload } = await jwtVerify(sessionCookie.value, secretKey);
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      } catch {
        // Continue to login
      }
    }
  }

  return response;
}

export const configMiddleware = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
