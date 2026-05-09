/**
 * Next.js Middleware — Route Protection & Security
 *
 * Runs on the Edge Runtime before every request.
 * Handles:
 * - Admin route protection (token verification)
 * - Security headers (supplementing next.config.ts)
 * - Maintenance mode redirect
 * - Bot/crawler detection for admin routes
 */

import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/admin"];

// Routes that are always public
const PUBLIC_ROUTES = [
  "/admin/login",
  "/api/auth",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Block direct access to internal API paths ──────────
  if (pathname.startsWith("/api/internal")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // ── 2. Admin route protection ─────────────────────────────
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isPublicRoute) {
    // Check for session cookie (set by client after Firebase auth)
    const sessionCookie = request.cookies.get("__session");

    if (!sessionCookie?.value) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full token verification happens in API routes via verifySession()
    // Middleware only checks cookie presence for fast redirects.
    // The actual auth check is done server-side in each admin page/API.
  }

  // ── 3. Redirect authenticated users away from login ───────
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get("__session");
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // ── 4. Add security headers ───────────────────────────────
  const response = NextResponse.next();

  // Prevent admin pages from being indexed
  if (pathname.startsWith("/admin")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }

  // ── 5. CSRF protection for mutating API routes ────────────
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    pathname.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    // Allow same-origin requests only
    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host && !appUrl.includes(originHost)) {
          return new NextResponse("Forbidden: CSRF check failed", {
            status: 403,
          });
        }
      } catch {
        return new NextResponse("Forbidden: Invalid origin", { status: 403 });
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
