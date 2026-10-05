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

  // Guard for protected admin pages: /admin, /admin/... (except /admin/login)
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const isAdminApi = pathname.startsWith("/api/admin/reply");

  if (isAdminPage || isAdminApi) {
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
      if (isAdminApi) {
        return NextResponse.json(
          { error: "Unauthorized. Please log in as admin." },
          { status: 401, headers: response.headers }
        );
      }

      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /admin/login, redirect to /admin
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get(config.admin.cookieName);
    if (sessionCookie?.value) {
      try {
        const { payload } = await jwtVerify(sessionCookie.value, secretKey);
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {
        // Invalid cookie, let them see login page
      }
    }
  }

  return response;
}

export const configMiddleware = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
